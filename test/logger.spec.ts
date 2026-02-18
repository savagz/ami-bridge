import { describe, it, expect } from 'vitest';
import Logger from '../src/loggers/logger.js';

describe('Logger', () => {
  it('respects minimal log level', () => {
    const l = new Logger('info');
    expect(l.shouldSkip('debug')).to.equal(false);
    expect(l.shouldSkip('warn')).to.equal(true);
  });
  it('setMinimalLogLevel updates threshold', () => {
    const l = new Logger('warn');
    l.setMinimalLogLevel('trace');
    expect(l.shouldSkip('debug')).to.equal(true);
  });
});
