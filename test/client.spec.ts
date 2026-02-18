import { describe, it, expect, vi } from 'vitest';
import { EventEmitter } from 'node:events';
import Client, { createClient } from '../src/client.js';

describe('Client', () => {
  it('creates instance of Client', () => {
    expect(new Client()).to.be.instanceOf(Client);
  });
  it('has EventEmitter as prototype', () => {
    expect(new Client()).to.be.instanceOf(EventEmitter);
  });
  it('uses default config values', () => {
    const c = new Client();
    expect((c as any).config.host).to.equal('127.0.0.1');
    expect((c as any).config.port).to.equal(5038);
    expect((c as any).config.login).to.equal('admin');
    expect((c as any).config.password).to.equal('admin');
  });
  it('version initializes as <unknown>', () => {
    const c = new Client();
    expect(c.getVersion()).to.equal('<unknown>');
  });
  it('createClient builds Client instance', () => {
    expect(createClient()).to.be.instanceOf(Client);
  });
  it('connected event toggles state', () => {
    const c = new Client();
    c.emit('connected');
    expect(c.connected).to.equal(true);
    c.emit('disconnected');
    expect(c.connected).to.equal(false);
  });
  it('sets logger with useLogger', () => {
    const c = new Client();
    const logger = { debug: vi.fn() };
    c.useLogger(logger);
    expect((c as any).logger).to.equal(logger);
  });
  it('sets version from AMI welcome message', () => {
    const c = new Client();
    (c as any)._setVersion('Asterisk Call Manager/1.2.3-custom');
    expect(c.getVersion()).to.equal('1.2.3-custom');
  });
  it('parseMessage routes responses to needParseResponse', () => {
    const c = new Client();
    const spy = vi.fn();
    c.on('needParseResponse', spy);
    (c as any).parseMessage('Response: Success\r\nActionID: 42\r\n');
    expect(spy.mock.calls.length).to.equal(1);
    const res = spy.mock.calls[0]?.[0];
    expect((res as any).response).to.equal('Success');
  });
  it('parseMessage routes events to needParseEvent', () => {
    const c = new Client();
    const spy = vi.fn();
    c.on('needParseEvent', spy);
    (c as any).parseMessage('Event: Foo\r\nActionID: 10\r\n');
    expect(spy.mock.calls.length).to.equal(1);
    const ev = spy.mock.calls[0]?.[0];
    expect((ev as any).event).to.equal('Foo');
  });
  it('parseMessage delegates unknown messages to _parseUnformatMessage', () => {
    const c = new Client();
    const spy = vi.spyOn(c as any, '_parseUnformatMessage');
    (c as any).parseMessage('Something else');
    expect(spy.mock.calls.length).to.equal(1);
  });
  it('send returns error when not connected and not Login', () => {
    const c = new Client();
    c.connected = false;
    const action = { Action: 'Ping', ActionID: '1', format: () => 'Action: Ping\r\n' };
    const cb = vi.fn();
    c.send(action, cb);
    expect(cb.mock.calls.length).to.equal(1);
    const err = cb.mock.calls[0]?.[0];
    expect(err).to.be.instanceOf(Error);
    expect((err as Error).message).to.equal('Server is disconnected');
  });
  it('connect sets reconnect flags and calls initSocket when reconnectable', () => {
    const c = new Client();
    const initSpy = vi.spyOn(c as any, 'initSocket').mockImplementation(() => {});
    c.connect(true, 1000);
    expect(c.reconnectable).to.equal(true);
    expect((c as any).reconnectTimeout).to.equal(1000);
    expect(initSpy.mock.calls.length).to.equal(1);
  });
  it('reconnect toggles reconnectable and calls initSocket', () => {
    const c = new Client();
    const initSpy = vi.spyOn(c as any, 'initSocket').mockImplementation(() => {});
    c.reconnect(true);
    expect(c.reconnectable).to.equal(true);
    expect(initSpy.mock.calls.length).to.equal(1);
  });
  it('unref and ref toggle unrefed state', () => {
    const c = new Client();
    c.unref();
    expect((c as any).unrefed).to.equal(true);
    c.ref();
    expect((c as any).unrefed).to.equal(undefined);
  });
  it('splitMessages splits buffer and emits needParseMessage', () => {
    const c = new Client();
    const spy = vi.fn();
    c.on('needParseMessage', spy);
    const payload = 'Response: Success\r\n\r\nEvent: Foo\r\n\r\n';
    (c as any).splitMessages(payload);
    expect(spy.mock.calls.length).to.equal(2);
    expect(spy.mock.calls[0]?.[0]).to.equal('Response: Success');
    expect(spy.mock.calls[1]?.[0]).to.equal('Event: Foo');
  });
  it('parseEvent pushes events and triggers callback for complete list', () => {
    const c = new Client();
    const id = '123';
    (c as any).responses[id] = { response: 'Success', events: [] };
    const cb = vi.fn();
    (c as any).callbacks[id] = cb;
    const eObj = {
      event: 'QueueStatusComplete',
      actionid: id,
      eventlist: 'Complete'
    };
    (c as any).parseEvent(eObj);
    expect((c as any).responses[id].events.length).to.equal(1);
    expect(cb.mock.calls.length).to.equal(1);
    expect(cb.mock.calls[0]?.[0]).to.equal(null);
  });
  it('parseResponse stores follow messages and triggers callbacks', () => {
    const c = new Client();
    const id = '55';
    const resFollow = { actionid: id, message: 'follow this' };
    const stored = (c as any).parseResponse(resFollow);
    expect((c as any).responses[id]).to.equal(resFollow);
    expect(stored).to.equal(resFollow);

    const cb = vi.fn();
    (c as any).callbacks[id] = cb;
    const resSuccess = { actionid: id, response: 'Success' };
    (c as any).parseResponse(resSuccess);
    expect(cb.mock.calls.length).to.equal(1);
    expect(cb.mock.calls[0]?.[0]).to.equal(null);
    expect(cb.mock.calls[0]?.[1]).to.equal(resSuccess);
  });
});
