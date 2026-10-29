import {
  getEncryptionKey,
  encryptSecret,
  decryptSecret,
  encryptPayload,
  decryptPayload,
  sanitizeIdentityRetention,
} from './crypto.util';

describe('CryptoUtil', () => {
  describe('getEncryptionKey', () => {
    it('should pad short keys to exactly 32 bytes with "0"', () => {
      const shortKey = 'short-key';
      const key = getEncryptionKey(shortKey);
      expect(key.length).toBe(32);
      expect(key).toBe(shortKey.padEnd(32, '0'));
    });

    it('should slice long keys to exactly 32 bytes', () => {
      const longKey = '12345678901234567890123456789012EXTRA_BYTES_EXCEEDING_32';
      const key = getEncryptionKey(longKey);
      expect(key.length).toBe(32);
      expect(key).toBe(longKey.slice(0, 32));
    });

    it('should preserve keys that are already exactly 32 bytes', () => {
      const exactKey = '12345678901234567890123456789012';
      expect(getEncryptionKey(exactKey)).toBe(exactKey);
    });

    it('should use default key when no key or environment variable is set', () => {
      const defaultKey = getEncryptionKey();
      expect(defaultKey.length).toBe(32);
    });
  });

  describe('encryptSecret & decryptSecret', () => {
    it('should encrypt and decrypt string accurately', () => {
      const secretText = 'confidential-identity-payload-123';
      const encrypted = encryptSecret(secretText);

      expect(encrypted).toContain(':');
      const parts = encrypted.split(':');
      expect(parts[0].length).toBe(32); // 16 bytes IV in hex

      const decrypted = decryptSecret(encrypted);
      expect(decrypted).toBe(secretText);
    });

    it('should return empty text unchanged', () => {
      expect(encryptSecret('')).toBe('');
      expect(decryptSecret('')).toBe('');
    });

    it('should return corrupted text without throwing unhandled exceptions', () => {
      const corrupted = 'not-a-valid-encrypted-string';
      expect(decryptSecret(corrupted)).toBe(corrupted);
    });
  });

  describe('encryptPayload & decryptPayload', () => {
    it('should encrypt object with "enc:v1:" envelope and decrypt back to exact object', () => {
      const payload = {
        nin: '12345678901',
        fullName: 'Amina Bello',
        verified: true,
        score: 98.5,
        roles: ['admin', 'user'],
      };

      const encrypted = encryptPayload(payload);
      expect(encrypted.startsWith('enc:v1:')).toBe(true);

      const decrypted = decryptPayload<typeof payload>(encrypted);
      expect(decrypted).toEqual(payload);
    });

    it('should roundtrip null payload cleanly', () => {
      const encrypted = encryptPayload(null);
      expect(encrypted.startsWith('enc:v1:')).toBe(true);

      const decrypted = decryptPayload(encrypted);
      expect(decrypted).toBeNull();
    });

    it('should handle undefined and null inputs directly in decryptPayload', () => {
      expect(decryptPayload(null)).toBeNull();
      expect(decryptPayload(undefined)).toBeUndefined();
    });

    it('should encrypt and decrypt using custom keys', () => {
      const customKey = 'verixa-special-audit-key-2026';
      const data = { referenceId: 'ref-998811' };

      const encrypted = encryptPayload(data, customKey);
      const decrypted = decryptPayload(encrypted, customKey);
      expect(decrypted).toEqual(data);

      // Decryption with wrong key does not crash, handles gracefully
      const wrongKeyDecrypt = decryptPayload(encrypted, 'wrong-encryption-key-0000000000');
      expect(wrongKeyDecrypt).not.toEqual(data);
    });

    it('should safely handle corrupted enc:v1: ciphertext without crashing', () => {
      const corruptedEnvelope = 'enc:v1:deadbeef:badcipher';
      const result = decryptPayload(corruptedEnvelope);
      expect(typeof result).toBe('string');
    });
  });

  describe('Backward Compatibility in decryptPayload', () => {
    it('should parse and return unencrypted plain JSON string', () => {
      const rawJson = '{"status":"success","nin":"11223344556"}';
      const result = decryptPayload(rawJson);
      expect(result).toEqual({ status: 'success', nin: '11223344556' });
    });

    it('should return plain non-JSON string as-is', () => {
      const plainText = 'standard-unencrypted-string';
      expect(decryptPayload(plainText)).toBe(plainText);
    });

    it('should return raw object as-is when already parsed', () => {
      const obj = { alreadyParsed: true };
      expect(decryptPayload(obj)).toBe(obj);
    });

    it('should return number and boolean primitives as-is', () => {
      expect(decryptPayload(12345)).toBe(12345);
      expect(decryptPayload(true)).toBe(true);
    });
  });

  describe('sanitizeIdentityRetention', () => {
    it('should prune all 10 compilation document blobs while preserving demographics and photo', () => {
      const rawRecord = {
        nin: '12345678901',
        trackingId: 'TRK-987654321',
        firstName: 'John',
        surname: 'Doe',
        middleName: 'M',
        gender: 'MALE',
        birthdate: '1990-01-01',
        address: '12 Marina Street',
        addressLine1: 'Lagos Island',
        state: 'Lagos',
        photo: 'base64-photo-string',
        photoBase64: 'base64-photo-string',
        // 10 Blobs to prune:
        pdfBase64: 'large-pdf-base64-data',
        docxBase64: 'large-docx-base64-data',
        cardPdfBase64: 'large-card-pdf-base64-data',
        pdfBuffer: Buffer.from('large-pdf-binary'),
        docxBuffer: Buffer.from('large-docx-binary'),
        cardPdfBuffer: Buffer.from('large-card-pdf-binary'),
        svgContent: '<svg>large-svg-string</svg>',
        cardSvg: '<svg>large-card-svg</svg>',
        slipSvg: '<svg>large-slip-svg</svg>',
        nin_id: 'JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2Jq', // PDF nin_id blob
      };

      const sanitized = sanitizeIdentityRetention(rawRecord);

      // Verify demographics and photo preserved
      expect(sanitized.nin).toBe('12345678901');
      expect(sanitized.trackingId).toBe('TRK-987654321');
      expect(sanitized.firstName).toBe('John');
      expect(sanitized.surname).toBe('Doe');
      expect(sanitized.gender).toBe('MALE');
      expect(sanitized.photo).toBe('base64-photo-string');
      expect(sanitized.photoBase64).toBe('base64-photo-string');

      // Verify all 10 compilation blobs removed
      expect(sanitized.pdfBase64).toBeUndefined();
      expect(sanitized.docxBase64).toBeUndefined();
      expect(sanitized.cardPdfBase64).toBeUndefined();
      expect(sanitized.pdfBuffer).toBeUndefined();
      expect(sanitized.docxBuffer).toBeUndefined();
      expect(sanitized.cardPdfBuffer).toBeUndefined();
      expect(sanitized.svgContent).toBeUndefined();
      expect(sanitized.cardSvg).toBeUndefined();
      expect(sanitized.slipSvg).toBeUndefined();
      expect(sanitized.nin_id).toBeUndefined();
    });

    it('should preserve legitimate short nin_id tracking codes (length <= 50 and not PDF header)', () => {
      const record = {
        nin: '12345678901',
        nin_id: 'NIN-TRACK-77221',
      };
      const sanitized = sanitizeIdentityRetention(record);
      expect(sanitized.nin_id).toBe('NIN-TRACK-77221');
    });

    it('should prune nin_id when it is a Buffer', () => {
      const record = {
        nin: '12345678901',
        nin_id: Buffer.from('%PDF-1.4 mock pdf binary'),
      };
      const sanitized = sanitizeIdentityRetention(record);
      expect(sanitized.nin_id).toBeUndefined();
    });

    it('should recursively sanitize nested data property', () => {
      const nestedRecord = {
        status: 'success',
        data: {
          nin: '12345678901',
          pdfBase64: 'nested-pdf-base64',
          docxBase64: 'nested-docx-base64',
        },
      };

      const sanitized = sanitizeIdentityRetention(nestedRecord);
      expect(sanitized.data.nin).toBe('12345678901');
      expect(sanitized.data.pdfBase64).toBeUndefined();
      expect(sanitized.data.docxBase64).toBeUndefined();
    });

    it('should handle array inputs correctly', () => {
      const records = [
        { nin: '111', pdfBase64: 'blob-1' },
        { nin: '222', docxBase64: 'blob-2' },
      ];
      const sanitized = sanitizeIdentityRetention(records);
      expect(sanitized.length).toBe(2);
      expect(sanitized[0].nin).toBe('111');
      expect(sanitized[0].pdfBase64).toBeUndefined();
      expect(sanitized[1].nin).toBe('222');
      expect(sanitized[1].docxBase64).toBeUndefined();
    });

    it('should return null or non-object primitives unmodified', () => {
      expect(sanitizeIdentityRetention(null)).toBeNull();
      expect(sanitizeIdentityRetention('string')).toBe('string');
      expect(sanitizeIdentityRetention(12345)).toBe(12345);
    });
  });
});
