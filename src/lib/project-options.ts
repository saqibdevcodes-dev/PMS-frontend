// Match the API's 2–20 character uppercase project-code format.
export function projectCode(name: string) {
  const slug = name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 20)
    .replace(/-+$/g, '');
  return slug.length === 1 ? `PRJ-${slug}` : slug;
}

const commonCurrencies = ['PKR', 'USD', 'AED', 'SAR', 'EUR', 'GBP'];
export const currencies = [
  ...commonCurrencies,
  ...Intl.supportedValuesOf('currency').filter((code) => !commonCurrencies.includes(code)),
];
export const timezones = [
  'Asia/Karachi',
  'UTC',
  ...Intl.supportedValuesOf('timeZone').filter((zone) => zone !== 'Asia/Karachi'),
];
