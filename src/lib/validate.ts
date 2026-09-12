/**
 * Shared input limits so every form caps what a person can type, and so the
 * same caps can be re-applied before anything is saved or sent anywhere.
 */
export const LIMITS = {
  name: 60,
  contact: 60,
  location: 60,
  craft: 60,
  age: 3,
  org: 80,
  title: 80,
  shortText: 40,
  tag: 24,
  search: 60,
  message: 500,
  description: 800,
  price: 7, // digits -> max 9,999,999
  quantity: 5, // digits -> max 99,999
} as const;

/** Strip control characters, collapse runaway whitespace and cap the length. */
export function cleanText(value: string, max: number): string {
  return value
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/[ \t]{3,}/g, "  ")
    .slice(0, max);
}

/** Keep only digits, capped to `maxDigits`. */
export function digitsOnly(value: string, maxDigits: number): string {
  return value.replace(/[^0-9]/g, "").slice(0, maxDigits);
}

/** A whole number from a possibly messy string, clamped to a safe range. */
export function toAmount(value: string, maxDigits = LIMITS.price): number {
  const n = Number(digitsOnly(value, maxDigits));
  return Number.isFinite(n) ? n : 0;
}

/** Very light check that a phone or email was actually filled in. */
export function isContact(value: string): boolean {
  const v = value.trim();
  if (v.length < 6 || v.length > LIMITS.contact) return false;
  const phone = /^[+0-9][0-9\s-]{5,}$/.test(v);
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  return phone || email;
}

/** Age must be a plausible human age when provided. */
export function isAge(value: string): boolean {
  if (!value.trim()) return true;
  const n = Number(digitsOnly(value, LIMITS.age));
  return n >= 10 && n <= 120;
}
