/**
 * Utility to sanitize sensitive personal data (PII) before persisting to
 * audit tables like verification_logs, ensuring NDPA / NDPR compliance and
 * preventing database bloat from base64 images.
 */

export function maskPii(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => maskPii(item));
  }

  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();

    // 1. Redact binary/base64 image fields
    if (
      lowerKey.includes('photo') ||
      lowerKey.includes('portrait') ||
      lowerKey.includes('signature') ||
      lowerKey.includes('image') ||
      lowerKey.includes('fingerprint') ||
      lowerKey.includes('avatar')
    ) {
      if (typeof value === 'string' && value.length > 50) {
        result[key] = '[REDACTED_IMAGE_DATA]';
        continue;
      }
    }

    // 2. Check for base64 data URLs
    if (typeof value === 'string' && value.startsWith('data:image/')) {
      result[key] = '[REDACTED_IMAGE_DATA]';
      continue;
    }

    // 3. Mask National Identity Numbers (NIN)
    if (lowerKey === 'nin' || lowerKey === 'ninnumber') {
      if (typeof value === 'string' && value.length >= 7) {
        result[key] = `${value.slice(0, 3)}*****${value.slice(-3)}`;
        continue;
      }
    }

    // 4. Mask Bank Verification Numbers (BVN)
    if (lowerKey === 'bvn' || lowerKey === 'bvnnumber') {
      if (typeof value === 'string' && value.length >= 7) {
        result[key] = `${value.slice(0, 3)}*****${value.slice(-3)}`;
        continue;
      }
    }

    // 5. Mask Bank Account Numbers
    if (lowerKey === 'accountnumber' || lowerKey === 'account_number' || lowerKey === 'nuban') {
      if (typeof value === 'string' && value.length >= 6) {
        result[key] = `${value.slice(0, 3)}****${value.slice(-3)}`;
        continue;
      }
    }

    // 6. Mask Phone Numbers
    if (lowerKey === 'phone' || lowerKey === 'phonenumber' || lowerKey === 'telephone') {
      if (typeof value === 'string' && value.length >= 7) {
        result[key] = `${value.slice(0, 4)}****${value.slice(-3)}`;
        continue;
      }
    }

    // 7. Recurse nested objects
    if (typeof value === 'object' && value !== null) {
      result[key] = maskPii(value);
    } else {
      result[key] = value;
    }
  }

  return result;
}
