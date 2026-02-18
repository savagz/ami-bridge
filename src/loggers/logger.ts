const LEVELS = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'] as const;
const priority = LEVELS.reduce(
  (accumulator, level, index) => Object.assign(accumulator, { [level]: index }),
  {} as Record<string, number>
);
export default class Logger {
  minimalLogLevel: string;
  constructor(minimalLogLevel = 'warn') {
    this.minimalLogLevel = minimalLogLevel;
  }
  shouldSkip(level: string) {
    const pl = priority[level] ?? 0;
    const pm = priority[this.minimalLogLevel] ?? 0;
    return pl < pm;
  }
  setMinimalLogLevel(minimalLogLevel: string) {
    this.minimalLogLevel = minimalLogLevel;
  }
  fatal(...rest: any[]) {
    if (this.shouldSkip('fatal')) return;
    console.error(...rest);
  }
  error(...rest: any[]) {
    if (this.shouldSkip('error')) return;
    console.error(...rest);
  }
  warn(...rest: any[]) {
    if (this.shouldSkip('warn')) return;
    console.warn(...rest);
  }
  info(...rest: any[]) {
    if (this.shouldSkip('info')) return;
    console.info(...rest);
  }
  debug(...rest: any[]) {
    if (this.shouldSkip('debug')) return;
    console.log(...rest);
  }
  trace(...rest: any[]) {
    if (this.shouldSkip('trace')) return;
    console.log(...rest);
  }
}
