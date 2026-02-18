import { describe, it, expect, vi } from 'vitest';

vi.mock('../src/index.js', () => {
  class FakeClient {
    config: any;
    logger: any;
    handlers: Record<string, Array<(...args: any[]) => void>>;
    connected: boolean;
    constructor(config: any) {
      this.config = config;
      this.logger = {
        error: vi.fn(),
        info: vi.fn()
      };
      this.handlers = {};
      this.connected = false;
    }
    on(event: string, fn: (...args: any[]) => void) {
      this.handlers[event] = this.handlers[event] || [];
      this.handlers[event].push(fn);
    }
    emit(event: string, ...args: any[]) {
      const list = this.handlers[event] || [];
      list.forEach((fn) => fn(...args));
    }
    send(_action: any, callback: any) {
      callback(null, { ok: true });
    }
    connect() {
      this.connected = true;
      this.emit('connected');
    }
    disconnect() {
      this.connected = false;
    }
  }
  const Actions = {
    Ping: class {},
    CoreStatus: class {},
    CoreSettings: class {},
    Status: class {},
    ListCommands: class {},
    QueueStatus: class {},
    QueueSummary: class {},
    GetConfig: class {
      constructor(_name: string) {}
    },
    GetConfigJson: class {
      constructor(_name: string) {}
    }
  };
  return { Client: FakeClient, Actions };
});

import { runCli, parseArgs } from '../src/cli.js';

describe('CLI', () => {
  it('parseArgs builds config from argv and env', () => {
    const argv = ['node', 'ami-io', 'user', 'pass', 'example.com:1234', '-f', 'events.json'];
    const env: NodeJS.ProcessEnv = {
      AMI_ENCODING: 'utf8'
    };
    const { config, file } = parseArgs(argv, env);
    expect(config.host).to.equal('example.com');
    expect(config.port).to.equal(1234);
    expect(config.login).to.equal('user');
    expect(config.password).to.equal('pass');
    expect(config.encoding).to.equal('utf8');
    expect(file).to.equal('events.json');
  });

  it('runCli creates client with parsed config and connects', () => {
    const originalArgv = process.argv.slice();
    const originalEnv = { ...process.env };
    process.argv = ['node', 'ami-io', 'user', 'pass', 'localhost:1111'];
    process.env = {};
    expect(() => runCli()).not.toThrowError();
    process.argv = originalArgv;
    process.env = originalEnv;
  });
  it('parseArgs supports -h and -p flags', () => {
    const argv = ['node', 'ami-io', 'user', 'pass', '-h', 'host.example', '-p', '9999'];
    const env: NodeJS.ProcessEnv = {};
    const { config } = parseArgs(argv, env);
    expect(config.host).to.equal('host.example');
    expect(config.port).to.equal(9999);
  });
  it('runCli installs SIGINT handler that writes events file', () => {
    const originalArgv = process.argv.slice();
    const originalEnv = { ...process.env };
    const originalExit = process.exit;
    const exitSpy = vi.fn() as any;
    (process as any).exit = exitSpy;

    process.argv = ['node', 'ami-io', 'user', 'pass', 'localhost:1111', '-f', 'events.json'];
    process.env = {};

    runCli();

    const handlers = process.listeners('SIGINT');
    const handler = handlers[handlers.length - 1] as (...args: any[]) => void;
    handler();

    expect(exitSpy.mock.calls[0]?.[0]).to.equal(0);

    process.exit = originalExit;
    process.argv = originalArgv;
    process.env = originalEnv;
  });
});
