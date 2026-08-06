const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

export const siteUrl = (configuredSiteUrl || 'https://kofeko.com').replace(/\/$/, '');

export const siteUrlObject = new URL(siteUrl);

export function absoluteUrl(path = '/') {
  return new URL(path, siteUrlObject).toString();
}
