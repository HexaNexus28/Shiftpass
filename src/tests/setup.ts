import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.subtle) {
  globalThis.crypto = (await import('node:crypto')).webcrypto as unknown as Crypto;
}

afterEach(() => {
  cleanup();
});
