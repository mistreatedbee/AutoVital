export function isRequiredString(value: string | null | undefined): boolean {
  return Boolean(value && value.trim().length > 0);
}

export function parseNonNegativeNumber(raw: string): number | null {
  if (!raw.trim()) return null;
  const normalized = raw.replace(/,/g, '');
  const n = Number(normalized);
  if (Number.isNaN(n) || n < 0) return null;
  return n;
}

export function parsePositiveNumber(raw: string): number | null {
  if (!raw.trim()) return null;
  const normalized = raw.replace(/,/g, '');
  const n = Number(normalized);
  if (Number.isNaN(n) || n <= 0) return null;
  return n;
}

export function validateYear(raw: string): string | null {
  if (!raw.trim()) return null;
  const yearNumber = Number(raw);
  const currentYear = new Date().getFullYear();
  if (Number.isNaN(yearNumber) || yearNumber < 1900 || yearNumber > currentYear + 1) {
    return `Year must be between 1900 and ${currentYear + 1}.`;
  }
  return null;
}

export function validateOdometerKm(raw: string): string | null {
  if (!raw.trim()) return null;
  const value = parseNonNegativeNumber(raw);
  if (value == null) {
    return 'Odometer must be a non-negative number in km.';
  }
  return null;
}

export function validateZarAmount(raw: string): string | null {
  if (!raw.trim()) return null;
  const value = parsePositiveNumber(raw);
  if (value == null) {
    return 'Amount must be a positive number in ZAR.';
  }
  return null;
}

/**
 * Light-touch phone validation with SA-centric guidance.
 * Allows any international number but encourages +27 format.
 */
export function validatePhoneWithSaHint(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;

  // Strip spaces, dashes, parentheses for basic checks
  const digitsOnly = value.replace(/[^\d]/g, '');

  if (digitsOnly.length < 7) {
    return 'Phone number looks too short. Use full number, e.g. +27 82 123 4567.';
  }

  // Basic sanity check for SA mobile: +27 followed by 9 digits (optional)
  if (value.startsWith('+27') && digitsOnly.length !== 11) {
    return 'SA numbers should look like +27 82 123 4567.';
  }

  return null;
}

