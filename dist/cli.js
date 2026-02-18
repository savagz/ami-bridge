/* eslint-disable no-console */
import { Actions, Client } from './index.js';
import * as fs from 'node:fs';
export function parseArgs(argv, env) {
    const config = {
        host: env.AMI_HOST,
        port: env.AMI_PORT ? Number(env.AMI_PORT) : undefined,
        login: env.AMI_LOGIN,
        password: env.AMI_PASSWORD,
        encoding: env.AMI_ENCODING,
    };
    let file;
    const args = argv.slice(2);
    const syntax = 'Use: node ami-bridge user password [host[:port]] [-h host] [-p port]\n' +
        ' -h host - AMI host (default 127.0.0.1)\n' +
        ' -p port - AMI port (default 5038)\n';
    if (args.includes('?') || args.includes('help') || args.includes('--help')) {
        console.info(syntax);
        process.exit(0);
    }
    if (args.includes('-f')) {
        file = args[args.indexOf('-f') + 1];
    }
    if (args.length < 3) {
        console.error(syntax);
        process.exit(1);
    }
    if (args[2] && !args[2].startsWith('-') && args[2].match(/[\w\d.-]+:?\d*/)) {
        if (args[2].includes(':')) {
            config.host = config.host ?? args[2].slice(0, args[2].indexOf(':'));
            const p = args[2].slice(args[2].indexOf(':') + 1);
            config.port = config.port ?? Number(p);
        }
        else {
            config.host = config.host ?? args[2];
        }
    }
    else if (args.includes('-h')) {
        const h = args[args.indexOf('-h') + 1];
        if (h)
            config.host = config.host ?? h;
    }
    if (args.includes('-p')) {
        const p = args[args.indexOf('-p') + 1];
        if (p)
            config.port = config.port ?? Number(p);
    }
    config.host = config.host ?? '127.0.0.1';
    config.port = config.port ?? 5038;
    config.login = config.login ?? args[0] ?? 'admin';
    config.password = config.password ?? args[1] ?? 'password';
    return { config, file };
}
export function runCli() {
    const parsed = parseArgs(process.argv, process.env);
    const config = parsed.config;
    const file = parsed.file;
    const amiClient = new Client(config);
    let count = 0;
    const time = Date.now();
    const eventsArray = [];
    if (file) {
        amiClient.on('event', (event) => {
            eventsArray.push(event);
        });
    }
    amiClient.on('incorrectServer', () => {
        amiClient.logger.error('Invalid AMI welcome message. Are you sure if this is AMI?');
        process.exit(1);
    });
    amiClient.on('connectionRefused', () => {
        amiClient.logger.error('Connection refused.');
        process.exit(1);
    });
    amiClient.on('incorrectLogin', () => {
        amiClient.logger.error('Incorrect login or password.');
        process.exit(1);
    });
    amiClient.on('event', () => {
        count++;
    });
    amiClient.on('responseEvent', () => { });
    amiClient.on('rawEvent', () => { });
    amiClient.on('connected', () => {
        amiClient.send(new Actions.Ping(), (err, data) => {
            if (err)
                return amiClient.logger.error('PING', err);
            return amiClient.logger.info('PING', data);
        });
        amiClient.send(new Actions.CoreStatus(), (err, data) => {
            if (err)
                return amiClient.logger.error(err);
            return amiClient.logger.info(data);
        });
        amiClient.send(new Actions.CoreSettings(), (err, data) => {
            if (err)
                return amiClient.logger.error(err);
            return amiClient.logger.info(data);
        });
        amiClient.send(new Actions.Status(), (err, data) => {
            if (err)
                return amiClient.logger.error(err);
            return amiClient.logger.info(data);
        });
        amiClient.send(new Actions.ListCommands(), (err, data) => {
            if (err)
                return amiClient.logger.error(err);
            return amiClient.logger.info(data);
        });
        amiClient.send(new Actions.QueueStatus(), (err, data) => {
            if (err)
                return amiClient.logger.error(err);
            return amiClient.logger.info(data);
        });
        amiClient.send(new Actions.QueueSummary(), (err, data) => {
            if (err)
                return amiClient.logger.error(err);
            return amiClient.logger.info(data);
        });
        amiClient.send(new Actions.GetConfig('sip.conf'), (err, data) => {
            if (err)
                return amiClient.logger.error(err);
            return amiClient.logger.info(data);
        });
        amiClient.send(new Actions.GetConfigJson('sip.conf'), (err, data) => {
            if (err)
                return amiClient.logger.error(err);
            return amiClient.logger.info(data);
        });
    });
    function writeEventsAndExit() {
        amiClient.disconnect();
        if (file) {
            const cleaned = eventsArray.map((v) => {
                delete v.incomingData;
                return v;
            });
            fs.writeFileSync(file, JSON.stringify(cleaned, null, 2), { encoding: 'utf8' });
        }
        process.exit(0);
    }
    process.on('SIGINT', writeEventsAndExit);
    process.on('SIGTERM', writeEventsAndExit);
    setInterval(() => {
        console.log(`Count of events: ${count}`);
        console.log(`Events in second: ${count / (Date.now() - time)}`);
        console.log(`Mem: ${Math.floor(process.memoryUsage().rss / (1024 * 1024))}`);
        console.log(`Heap: ${Math.floor((process.memoryUsage().heapUsed * 10000) / process.memoryUsage().heapTotal) / 100}% (${Math.floor(process.memoryUsage().heapTotal / (1024 * 1024))})`);
    }, 300000).unref();
    amiClient.connect();
}
if (import.meta.url === `file://${process.argv[1]}`) {
    runCli();
}
//# sourceMappingURL=cli.js.map