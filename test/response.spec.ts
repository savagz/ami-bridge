import { describe, it, expect } from 'vitest';
import Response from '../src/response.js';
import { EOL } from '../src/constants.js';

describe('Response', () => {
  it('parses raw Response and initializes events', () => {
    const raw = `Response: Success${EOL}ActionID: 1${EOL}`;
    const res = new Response(raw);
    expect((res as any).response).to.equal('Success');
    expect(Array.isArray(res.events)).to.equal(true);
  });
  it('tryFormat detects queue message', async () => {
    const rawHeader = 'support has 1 call in \'ringall\' strategy';
    const raw = `${rawHeader}${EOL}Members: agent1 (In use)${EOL}Callers: ...${EOL}`;
    await new Promise<void>((resolve, reject) => {
      (Response as any).tryFormat({ raw }, (err: any, data: any) => {
      expect(err).to.equal(null);
      expect(data.type).to.equal('queues');
      expect(Array.isArray(data.res)).to.equal(true);
        resolve();
      });
    });
  });
  it('tryFormat returns error for undefined format', async () => {
    const raw = `Some other header${EOL}`;
    await new Promise<void>((resolve) => {
      (Response as any).tryFormat({ raw }, (err: any) => {
        expect(err).to.be.instanceOf(Error);
        resolve();
      });
    });
  });
});
