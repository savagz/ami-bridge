import { describe, it, expect } from 'vitest';
import AmiEvent from '../src/event.js';
import { EOL } from '../src/constants.js';

describe('Event', () => {
  it('parses event fields from raw data', () => {
    const raw = `Event: Foo${EOL}Channel: SIP/abc${EOL}`;
    const ev = new AmiEvent(raw);
    expect((ev as any).event).to.equal('Foo');
    expect((ev as any).channel).to.equal('SIP/abc');
  });
  it('Event.from returns parsed message', () => {
    const raw = `Event: Bar${EOL}CallerID: 123${EOL}`;
    const ev = AmiEvent.from(raw);
    expect((ev as any).event).to.equal('Bar');
    expect((ev as any).callerid).to.equal('123');
  });
});
