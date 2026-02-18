import { describe, it, expect } from 'vitest';
import { EOL } from '../src/constants.js';
import Message from '../src/message.js';

describe('Message', () => {
  it('formats fields and variables', () => {
    const m = new Message();
    (m as any).Action = 'Ping';
    m.setVariable('foo', 'bar');
    const formatted = m.format();
    expect(formatted).to.include(`Action: Ping${EOL}`);
    expect(formatted).to.include(`Variable: foo=bar${EOL}`);
  });

  it('parses raw message with variables and fields', () => {
    const raw = `Action: Ping${EOL}Variable: baz${EOL}Value: qux${EOL}`;
    const m = Message.parse(raw);
    expect((m as any).action).to.equal('Ping');
    expect(m.variables.baz).to.equal('qux');
  });
});
