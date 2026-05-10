import { describe, it, expect } from 'vitest';
import { checkMinimumTenure } from './antifraud';

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

describe('checkMinimumTenure', () => {
  it('blocks employment started today', () => {
    const result = checkMinimumTenure(daysAgo(0));
    expect(result.allowed).toBe(false);
    expect(result.daysRemaining).toBe(14);
  });

  it('blocks employment started 13 days ago', () => {
    const result = checkMinimumTenure(daysAgo(13));
    expect(result.allowed).toBe(false);
    expect(result.daysRemaining).toBe(1);
  });

  it('allows employment started exactly 14 days ago', () => {
    const result = checkMinimumTenure(daysAgo(14));
    expect(result.allowed).toBe(true);
    expect(result.daysRemaining).toBe(0);
  });

  it('allows employment started 30 days ago', () => {
    const result = checkMinimumTenure(daysAgo(30));
    expect(result.allowed).toBe(true);
    expect(result.daysRemaining).toBe(0);
  });

  it('respects custom minDays threshold', () => {
    expect(checkMinimumTenure(daysAgo(5), 7).allowed).toBe(false);
    expect(checkMinimumTenure(daysAgo(7), 7).allowed).toBe(true);
  });
});
