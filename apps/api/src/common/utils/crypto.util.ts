import * as crypto from 'crypto';

export function getEncryptionKey(customKey?: string): string {
  const key = customKey || process.env.SYSTEM_ENCRYPTION_KEY || 'default-32-char-encryption-key!';
  return key.padEnd(32, '0').slice(0, 32);
}

const IV_LENGTH = 16;

export function encryptSecret(text: string, customKey?: string): string {
  if (!text) return text;
  const key = getEncryptionKey(customKey);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decryptSecret(text: string, customKey?: string): string {
  if (!text) return text;
  try {
    const textParts = text.split(':');
    if (textParts.length < 2) return text;
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const key = getEncryptionKey(customKey);
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch {
    return text;
  }
}

/**
 * Encrypts an arbitrary data payload with AES-256-CBC, outputting an "enc:v1:" envelope.
 */
export function encryptPayload(data: any, customKey?: string): string {
  const serialized = JSON.stringify(data ?? null);
  const encrypted = encryptSecret(serialized, customKey);
  return `enc:v1:${encrypted}`;
}

/**
 * Decrypts a payload. If prefixed with "enc:v1:", decrypts and parses JSON.
 * If already an object or unencrypted string, safely passes through.
 */
export function decryptPayload<T = any>(payload: any, customKey?: string): T {
  if (payload === null || payload === undefined) {
    return payload;
  }

  if (typeof payload === 'string' && payload.startsWith('enc:v1:')) {
    const ciphertext = payload.slice(7);
    const decrypted = decryptSecret(ciphertext, customKey);
    try {
      return JSON.parse(decrypted) as T;
    } catch {
      return decrypted as unknown as T;
    }
  }

  if (typeof payload === 'string') {
    try {
      return JSON.parse(payload) as T;
    } catch {
      return payload as unknown as T;
    }
  }

  return payload as T;
}

/**
 * Sanitizes identity retention data before long-term storage by removing
 * document compilation blobs (pdfBase64, docxBase64, cardPdfBase64, pdfBuffer, docxBuffer, cardPdfBuffer, svgContent, raw PDF nin_id),
 * while preserving demographic fields and citizen photo.
 */
export function sanitizeIdentityRetention(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeIdentityRetention);
  }

  const pruned: Record<string, any> = { ...data };
  const keysToRemove = [
    'pdfBase64',
    'docxBase64',
    'cardPdfBase64',
    'pdfBuffer',
    'docxBuffer',
    'cardPdfBuffer',
    'svgContent',
    'cardSvg',
    'slipSvg',
  ];

  for (const key of keysToRemove) {
    delete pruned[key];
  }

  // Remove raw PDF nin_id if it is a compilation document blob
  if (typeof pruned.nin_id === 'string' && (pruned.nin_id.startsWith('JVBERi') || pruned.nin_id.length > 50)) {
    delete pruned.nin_id;
  } else if (Buffer.isBuffer(pruned.nin_id)) {
    delete pruned.nin_id;
  }

  if (pruned.data && typeof pruned.data === 'object') {
    pruned.data = sanitizeIdentityRetention(pruned.data);
  }

  return pruned;
}

