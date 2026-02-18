import { describe, it, expect } from 'vitest';
import { createAction as createActionSubClass } from '../src/action.js';

describe('create-action-sub-class', () => {
  it('throws when defaults include optional field', () => {
    expect(() =>
      createActionSubClass({
        name: 'Test',
        params: ['A'],
        optional: ['A'],
        defaults: { A: 'x' }
      } as any)
    ).to.throw('Unexpected default value for field A.');
  });

  it('throws when optional not present in params', () => {
    expect(() =>
      createActionSubClass({
        name: 'Test',
        params: ['A'],
        optional: ['B']
      } as any)
    ).to.throw('Did not found optional field B in params.');
  });

  it('applies defaults with empty args and supports named args', () => {
    const Custom = createActionSubClass({
      name: 'Monitor',
      params: ['format', 'mix'],
      defaults: { format: 'wav', mix: true }
    } as any);
    const a = new (Custom as any)();
    expect((a as any).format).to.equal('wav');
    expect((a as any).mix).to.equal(true);

    const b = new (Custom as any)({ format: 'gsm' });
    expect((b as any).format).to.equal('gsm');
    expect((b as any).mix).to.equal(true);
  });
});
