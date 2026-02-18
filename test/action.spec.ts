import { describe, it, expect } from 'vitest';
import Actions, { createAction } from '../src/action.js';

describe('Action', () => {
  it('creates Ping action with Action and ActionID', () => {
    const ping = new (Actions as any).Ping();
    const formatted = ping.format();
    expect(formatted).to.include('Action: Ping');
    expect(formatted).to.match(/ActionID: \d+/);
  });

  it('createAction builds a custom action class', () => {
    const Custom = createAction({ name: 'Custom', params: [] } as any);
    const c = new (Custom as any)();
    const formatted = c.format();
    expect(formatted).to.include('Action: Custom');
    expect(formatted).to.match(/ActionID: \d+/);
  });
});
