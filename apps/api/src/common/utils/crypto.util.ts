import * as crypto from 'crypto';

function getEncryptionKey(): string {
  const key = process.env.SYSTEM_ENCRYPTION_KEY;
  if (!key) {
    return 'verixa_aes_encryption_key_default_32ch';
  }
  return key.padEnd(32, '0').slice(0, 32);
}

const ENCRYPTION_KEY = getEncryptionKey();
const IV_LENGTH = 16;

export function encryptSecret(text: string): string {
  if (!text) return text;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decryptSecret(text: string): string {
  if (!text) return text;
  try {
    const textParts = text.split(':');
    if (textParts.length < 2) return text;
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch {
    return text;
  }
}
