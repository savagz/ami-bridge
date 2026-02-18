export default class Logger {
    minimalLogLevel: string;
    constructor(minimalLogLevel?: string);
    shouldSkip(level: string): boolean;
    setMinimalLogLevel(minimalLogLevel: string): void;
    fatal(...rest: any[]): void;
    error(...rest: any[]): void;
    warn(...rest: any[]): void;
    info(...rest: any[]): void;
    debug(...rest: any[]): void;
    trace(...rest: any[]): void;
}
//# sourceMappingURL=logger.d.ts.map