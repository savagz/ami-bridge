import * as net from 'node:net';
import { EventEmitter } from 'node:events';
import Logger from './loggers/logger.js';
import { EOM, REGEXP_EOM } from './constants.js';
import Actions from './action.js';
import Response from './response.js';
import AmiEvent from './event.js';
const logger = new Logger();
const CONFIG_DEFAULTS = {
    logger,
    host: '127.0.0.1',
    port: 5038,
    login: 'admin',
    password: 'admin',
    encoding: 'ascii',
};
export default class Client extends EventEmitter {
    connected = false;
    reconnectable = false;
    config;
    logger;
    tailInput = '';
    responses = {};
    originateResponses = {};
    callbacks = {};
    unformatWait = {};
    follows = {};
    version = '<unknown>';
    reconnectTimeout;
    socket;
    messagesQueue = [];
    unrefed;
    constructor(config = {}) {
        super();
        this.config = Object.freeze(Object.assign({}, CONFIG_DEFAULTS, config));
        this.logger = this.config.logger;
        this.addListeners();
    }
    addListeners() {
        this.on('connected', () => {
            this.connected = true;
        });
        this.on('needAuth', (data) => this.auth(data));
        this.on('needParseMessage', (raw) => this.parseMessage(raw));
        this.on('needParseEvent', (eObj) => this.parseEvent(eObj));
        this.on('needParseResponse', (response) => this.parseResponse(response));
        this.on('disconnected', () => {
            this.connected = false;
            if (this.reconnectable) {
                setTimeout(() => {
                    this.reconnect(this.reconnectable);
                }, this.reconnectTimeout);
            }
        });
        this.on('incorrectLogin', () => {
            this.reconnectable = false;
        });
        this.on('incorrectServer', () => {
            this.reconnectable = false;
        });
    }
    connect(reconnectable, reconnectTimeout) {
        if (reconnectable) {
            this.reconnectable = Boolean(reconnectable);
            this.reconnectTimeout = Number(reconnectTimeout) || this.reconnectTimeout || 5000;
        }
        else
            this.reconnectable = false;
        this.logger.debug('Opening connection');
        this.messagesQueue = [];
        this.initSocket();
    }
    initSocket() {
        this.logger.trace('Initializing socket');
        if (this.socket) {
            if (!this.socket.destroyed) {
                this.socket.end();
            }
            this.socket.removeAllListeners();
        }
        this.socket = new net.Socket();
        this.socket.setEncoding(this.config.encoding);
        if (this.unrefed)
            this.socket.unref();
        this.socket.on('connect', () => {
            this.emit('socketConnected');
        });
        this.socket.on('error', (error) => {
            this.logger.debug('Socket error:', error);
            if (error.code === 'ECONNREFUSED')
                this.emit('connectionRefused');
            this.emit('socketError', error);
        });
        this.socket.on('close', (hadError) => {
            this.emit('disconnected', hadError);
        });
        this.socket.on('timeout', () => {
            this.emit('connectTimeout');
        });
        this.socket.on('end', () => {
            this.emit('connectEnd');
        });
        this.socket.once('data', (data) => {
            this.emit('needAuth', data);
        });
        this.socket.connect(this.config.port, this.config.host);
    }
    auth(message) {
        this.logger.debug('First message:', message);
        if (String(message).match(/Asterisk Call Manager/)) {
            this._setVersion(String(message));
            this.socket.on('data', (data) => {
                this.splitMessages(String(data));
            });
            this.send(new Actions.Login(this.config.login, this.config.password), (error, response) => {
                if (error) {
                    if (error instanceof Response)
                        this.emit('incorrectLogin');
                    else
                        this.emit('error', error);
                }
                else if (response && response.response === 'Success')
                    this.emit('connected');
                else
                    this.emit('incorrectLogin');
            });
        }
        else {
            this.emit('incorrectServer', message);
        }
    }
    splitMessages(data) {
        this.logger.trace('Data:', data);
        const buffer = this.tailInput.concat(data.replace(REGEXP_EOM, EOM));
        const messages = buffer.split(EOM);
        this.tailInput = messages.pop() || '';
        for (let i = 0; i < messages.length; i++) {
            ((message) => {
                this.emit('needParseMessage', message);
            })(messages[i]);
        }
    }
    parseMessage(raw) {
        this.logger.trace('Message:', raw);
        if (raw.match(/^Response: /)) {
            const response = new Response(raw);
            if (response.actionid)
                this.responses[response.actionid] = response;
            return this.emit('needParseResponse', response);
        }
        if (raw.match(/^Event: /))
            return this.emit('needParseEvent', new AmiEvent(raw));
        return this._parseUnformatMessage(raw);
    }
    _parseUnformatMessage(raw) {
        const keys = Object.keys(this.unformatWait);
        if (keys.length === 0)
            return this.logger.warn('Unexpected: \n<< %s >>', raw);
        Response.tryFormat({ raw }, (err, data) => {
            if (err)
                return this.logger.warn('Fail fromat:', err);
            if (!this.unformatWait[data.type])
                return this.logger.warn("Doesn't wait:", data.type);
            if (!this.unformatWait[data.type].res || this.unformatWait[data.type].res.length === 0) {
                if (data.res.length === 1)
                    this.unformatWait[data.type].res = data.res;
                else {
                    this.unformatWait[data.type].res = [
                        data.res[1].replace('%REPLACE_ACTION_ID%', this.unformatWait[data.type].id),
                        data.res[0].replace('%REPLACE_ACTION_ID%', this.unformatWait[data.type].id)
                    ];
                }
            }
            else
                this.unformatWait[data.type].res.push(data.res[0].replace('%REPLACE_ACTION_ID%', this.unformatWait[data.type].id));
            clearTimeout(this.unformatWait.queues.timeout);
            if (this.unformatWait[data.type].res.length === 1)
                return this.emit('needParseMessage', this.unformatWait[data.type].res[0]);
            (this.unformatWait[data.type].timeout = setTimeout(() => {
                this.unformatWait[data.type].res.push(data.res[2].replace('%REPLACE_ACTION_ID%', this.unformatWait[data.type].id));
                this.unformatWait[data.type].res.forEach((mes) => {
                    this.emit('needParseMessage', mes);
                });
            }, 100)).unref();
        });
    }
    parseEvent(eObj) {
        this.logger.debug('AmiEvent:', eObj);
        const id = eObj.actionid;
        if (id !== undefined && this.responses[id] !== undefined && this.callbacks[id] !== undefined) {
            this.emit('responseEvent', eObj);
            if (!this.responses[id].events) {
                this.logger.fatal('No events in this.responses.');
                this.logger.fatal(this.responses[id]);
                this.responses[id].events = [];
            }
            this.responses[id].events.push(eObj);
            if (this.originateResponses[id]) {
                if (eObj.event === 'OriginateResponse') {
                    if (eObj.response && eObj.response.match(/Success/i)) {
                        this.callbacks[id](null, eObj);
                    }
                    else
                        this.callbacks[id](eObj);
                }
            }
            else if (eObj.event.indexOf('Complete') !== -1 || eObj.event.indexOf('DBGetResponse') !== -1 || (eObj.eventlist && eObj.eventlist.indexOf('Complete') !== -1)) {
                if (this.responses[id].response && this.responses[id].response.match(/Success/i)) {
                    this.callbacks[id](null, this.responses[id]);
                }
                else
                    this.callbacks[id](this.responses[id]);
            }
        }
        else {
            this.emit('event', eObj);
        }
        this.emit('rawEvent', eObj);
        this.emit(`rawEvent.${eObj.event}`, eObj);
    }
    parseResponse(res) {
        this.logger.debug('Response:', res);
        const id = res.actionid;
        if (res.message !== undefined && res.message.indexOf('follow') !== -1) {
            this.responses[id] = res;
            return res;
        }
        if (this.callbacks[id]) {
            if (!this.originateResponses[id]) {
                if (res.response && res.response.match(/success/i))
                    this.callbacks[id](null, res);
                else
                    this.callbacks[id](res);
            }
        }
    }
    reconnect(reconnectable) {
        this.reconnectable = reconnectable || false;
        this.initSocket();
    }
    disconnect() {
        this.reconnectable = false;
        this.send(new Actions.Logoff(), () => {
            this.logger.info('Logged out');
        });
        this.logger.info('Closing connection');
        this.removeAllListeners();
        this.socket.removeAllListeners();
        this.socket.end();
        this.emit('disconnected');
    }
    useLogger(loggerToUse) {
        this.logger = loggerToUse;
    }
    send(action, callback) {
        this.logger.debug('Send:', action);
        if (!this.connected) {
            if (action.Action !== 'Login') {
                return callback(new Error('Server is disconnected'));
            }
        }
        this.socket.write(action.format(), (err) => {
            if (err) {
                return callback(err);
            }
            let timeout;
            (timeout = setTimeout(() => {
                if (this.callbacks[action.ActionID])
                    this.callbacks[action.ActionID](new Error('ERRTIMEDOUT'));
            }, 300000)).unref();
            this.callbacks[action.ActionID] = (err2, data) => {
                clearTimeout(timeout);
                delete this.callbacks[action.ActionID];
                delete this.responses[action.ActionID];
                delete this.originateResponses[action.ActionID];
                delete this.unformatWait[action.ActionID];
                return callback(err2, data);
            };
            if (action.Action && action.Action.toLowerCase() === 'queues') {
                this.unformatWait[action.Action.toLowerCase()] = {
                    id: action.ActionID,
                    timeout: null,
                    res: [],
                };
            }
            else if (action.Action && action.Action.toLowerCase() === 'originate' && action.WaitEvent) {
                this.originateResponses[action.ActionID] = {};
            }
            this.responses[action.ActionID] = '';
        });
    }
    unref() {
        this.unrefed = true;
        if (this.socket)
            this.socket.unref();
    }
    ref() {
        this.unrefed = undefined;
        if (this.socket)
            this.socket.ref();
    }
    _setVersion(version) {
        const v = version.match(/Asterisk call manager\/([\d.]*[-\w\d.]*)/i);
        if (v) {
            this.version = v[1] ?? this.version;
        }
    }
    getVersion() {
        return this.version;
    }
}
export function createClient(config) {
    return new Client(config);
}
//# sourceMappingURL=client.js.map