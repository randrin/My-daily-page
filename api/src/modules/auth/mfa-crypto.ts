import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'crypto';
import * as OTPAuth from 'otpauth';
export function encryptMfa(secret: string, key: Buffer) {
  const iv = randomBytes(12),
    cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([
    cipher.update(secret, 'utf8'),
    cipher.final(),
  ]);
  return [
    'v1',
    iv.toString('base64'),
    encrypted.toString('base64'),
    cipher.getAuthTag().toString('base64'),
  ].join(':');
}
export function decryptMfa(value: string, key: Buffer) {
  const [version, iv, encrypted, tag] = value.split(':');
  if (version !== 'v1') throw new Error('Invalid encryption version');
  const cipher = createDecipheriv(
    'aes-256-gcm',
    key,
    Buffer.from(iv, 'base64'),
  );
  cipher.setAuthTag(Buffer.from(tag, 'base64'));
  return Buffer.concat([
    cipher.update(Buffer.from(encrypted, 'base64')),
    cipher.final(),
  ]).toString('utf8');
}
export function recoveryHash(value: string) {
  return createHash('sha256')
    .update(value.replace(/[\s-]/g, '').toLowerCase())
    .digest('hex');
}
export function makeRecoveryCodes() {
  return Array.from({ length: 10 }, () =>
    randomBytes(16).toString('hex').match(/.{8}/g).join('-'),
  );
}
export function totp(secret: string, label = 'My Daily Page') {
  return new OTPAuth.TOTP({
    issuer: 'My Daily Page',
    label,
    secret,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
  });
}
export function totpStep(
  secret: string,
  code: string,
  now = Date.now(),
): number | null {
  if (!/^\d{6}$/.test(code)) return null;
  const delta = totp(secret).validate({
    token: code,
    window: 1,
    timestamp: now,
  });
  return delta === null ? null : Math.floor(now / 30000) + delta;
}
export function newMfaSecret() {
  return new OTPAuth.Secret({ size: 20 }).base32;
}
