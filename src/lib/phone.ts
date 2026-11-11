/** Format Pakistani mobile numbers consistently across registration and quick-add forms. */
export function formatPhone(raw: string): string {
  const hasPlus = raw.trim().startsWith('+');
  const digits = raw.replace(/\D/g, '');

  if (hasPlus || digits.startsWith('92')) {
    const national = digits.startsWith('92') ? digits.slice(2) : digits;
    const clean = national.slice(0, 10);
    if (!clean) return '+92-';
    if (clean.length <= 3) return `+92-${clean}`;
    return `+92-${clean.slice(0, 3)}-${clean.slice(3, 10)}`;
  }

  const clean = digits.slice(0, 11);
  if (clean.length <= 4) return clean;
  return `${clean.slice(0, 4)}-${clean.slice(4, 11)}`;
}

export function isValidPhone(value: unknown): boolean {
  return String(value ?? '').replace(/\D/g, '').length >= 10;
}
