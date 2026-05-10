import { describe, it, expect } from 'vitest';
import { sha256 } from './hash';

describe('sha256', () => {
  it('produces a 64-char hex string', async () => {
    const hash = await sha256({ foo: 'bar' });
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('is deterministic for identical inputs', async () => {
    const a = await sha256({ skill: 'Caisse', level: 'Certifié' });
    const b = await sha256({ skill: 'Caisse', level: 'Certifié' });
    expect(a).toBe(b);
  });

  it('is order-independent (sorts keys)', async () => {
    const a = await sha256({ a: 1, b: 2 });
    const b = await sha256({ b: 2, a: 1 });
    expect(a).toBe(b);
  });

  it('produces different hashes for different inputs', async () => {
    const a = await sha256({ skill: 'Caisse' });
    const b = await sha256({ skill: 'Cuisine' });
    expect(a).not.toBe(b);
  });
});
