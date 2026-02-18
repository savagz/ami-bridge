export default class Message {
    static parse(rawData: string): Message;
    variables: Record<string, any>;
    incomingData: string[] | undefined;
    constructor();
    format(): string;
    formatFields(): string;
    formatVariables(): string;
    parse(rawData: string): void;
    set(name: string, value: any): void;
    setVariable(name: string, value: any): void;
}
//# sourceMappingURL=message.d.ts.map