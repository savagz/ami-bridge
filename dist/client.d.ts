import * as net from 'node:net';
import { EventEmitter } from 'node:events';
export default class Client extends EventEmitter {
    connected: boolean;
    reconnectable: boolean;
    config: any;
    logger: any;
    tailInput: string;
    responses: any;
    originateResponses: any;
    callbacks: any;
    unformatWait: any;
    follows: any;
    version: string;
    reconnectTimeout: number | undefined;
    socket: net.Socket | undefined;
    messagesQueue: any[];
    unrefed: boolean | undefined;
    constructor(config?: any);
    addListeners(): void;
    connect(reconnectable?: boolean, reconnectTimeout?: number): void;
    initSocket(): void;
    auth(message: any): void;
    splitMessages(data: string): void;
    parseMessage(raw: string): any;
    _parseUnformatMessage(raw: string): any;
    parseEvent(eObj: any): void;
    parseResponse(res: any): any;
    reconnect(reconnectable?: boolean): void;
    disconnect(): void;
    useLogger(loggerToUse: any): void;
    send(action: any, callback: any): any;
    unref(): void;
    ref(): void;
    _setVersion(version: string): void;
    getVersion(): string;
}
export declare function createClient(config?: any): Client;
//# sourceMappingURL=client.d.ts.map