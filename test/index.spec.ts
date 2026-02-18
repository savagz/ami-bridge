import { describe, it, expect } from 'vitest';
import * as api from '../src/index.js';

describe('Index exports', () => {
  it('exposes Client and createClient', () => {
    expect(api.Client).to.be.a('function');
    expect(api.createClient).to.be.a('function');
  });
  it('exposes Actions and Action', () => {
    expect(api.Actions).to.be.an('object');
    expect(api.Action).to.be.ok;
  });
  it('exposes Event, Response, Logger, SilentLogger', () => {
    expect(api.Event).to.be.a('function');
    expect(api.Response).to.be.a('function');
    expect(api.Logger).to.be.a('function');
    expect(api.SilentLogger).to.be.a('function');
  });
});
