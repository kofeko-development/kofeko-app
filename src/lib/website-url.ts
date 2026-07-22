/** Normalize user-entered website URLs: fix scheme typos and prepend https:// when missing. */
export function normalizeWebsiteUrl(value: string): string {
  let trimmed = value.trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('https:/') && !trimmed.startsWith('https://')) {
    trimmed = trimmed.replace('https:/', 'https://');
  }
  if (trimmed.startsWith('http:/') && !trimmed.startsWith('http://')) {
    trimmed = trimmed.replace('http:/', 'http://');
  }

  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }

  return trimmed;
}

export function isValidWebsiteUrl(value: string): boolean {
  const normalized = normalizeWebsiteUrl(value);
  if (!normalized) return false;

  try {
    const url = new URL(normalized);
    return Boolean(url.hostname.includes('.'));
  } catch {
    return false;
  }
}
