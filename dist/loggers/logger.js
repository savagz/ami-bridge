"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LEVELS = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'];
const priority = LEVELS.reduce((accumulator, level, index) => Object.assign(accumulator, { [level]: index }), {});
class Logger {
    minimalLogLevel;
    constructor(minimalLogLevel = 'warn') {
        this.minimalLogLevel = minimalLogLevel;
    }
    shouldSkip(level) {
        const pl = priority[level] ?? 0;
        const pm = priority[this.minimalLogLevel] ?? 0;
        return pl < pm;
    }
    setMinimalLogLevel(minimalLogLevel) {
        this.minimalLogLevel = minimalLogLevel;
    }
    fatal(...rest) {
        if (this.shouldSkip('fatal'))
            return;
        console.error(...rest);
    }
    error(...rest) {
        if (this.shouldSkip('error'))
            return;
        console.error(...rest);
    }
    warn(...rest) {
        if (this.shouldSkip('warn'))
            return;
        console.warn(...rest);
    }
    info(...rest) {
        if (this.shouldSkip('info'))
            return;
        console.info(...rest);
    }
    debug(...rest) {
        if (this.shouldSkip('debug'))
            return;
        console.log(...rest);
    }
    trace(...rest) {
        if (this.shouldSkip('trace'))
            return;
        console.log(...rest);
    }
}
exports.default = Logger;
//# sourceMappingURL=logger.js.map