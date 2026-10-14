import { randomBytes } from 'crypto';
import {
  decryptMfa,
  encryptMfa,
  makeRecoveryCodes,
  recoveryHash,
  totpStep,
} from './mfa-crypto';
describe('MFA cryptography', () => {
  it('validates the RFC 6238 SHA1 vector truncated to six digits', () => {
    expect(totpStep('GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ', '287082', 59000)).toBe(
      1,
    );
    expect(
      totpStep('GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ', '287082', 300000),
    ).toBeNull();
  });
  it('authenticates encryption and uses a fresh nonce', () => {
    const key = randomBytes(32),
      a = encryptMfa('secret', key);
    expect(decryptMfa(a, key)).toBe('secret');
    expect(encryptMfa('secret', key)).not.toBe(a);
    expect(() => decryptMfa(a, randomBytes(32))).toThrow();
    const parts = a.split(':');
    parts[2] = Buffer.from('tampered').toString('base64');
    expect(() => decryptMfa(parts.join(':'), key)).toThrow();
  });
  it('generates unique recovery codes and normalizes their hashes', () => {
    const codes = makeRecoveryCodes();
    expect(new Set(codes).size).toBe(10);
    expect(codes.every((c) => /^[a-f0-9]{8}(-[a-f0-9]{8}){3}$/.test(c))).toBe(
      true,
    );
    expect(recoveryHash(codes[0].toUpperCase().replaceAll('-', ' '))).toBe(
      recoveryHash(codes[0]),
    );
  });
});
