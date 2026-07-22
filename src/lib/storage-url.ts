import { API_BASE_URL } from './api-client';

const SUPABASE_PUBLIC_OBJECT_RE = /\/storage\/v1\/object\/public\/[^/]+\/(.+)$/i;
const API_FILES_RE = /\/api\/v1\/files\/(.+)$/i;

function apiOrigin(): string {
  return API_BASE_URL.replace(/\/api\/v1\/?$/, '');
}

/** Turn stored upload URLs into browser-loadable URLs (handles private Supabase buckets). */
export function resolveUploadUrl(url: string | null | undefined): string {
  if (!url?.trim()) return '';

  const trimmed = url.trim();

  const supabaseMatch = trimmed.match(SUPABASE_PUBLIC_OBJECT_RE);
  if (supabaseMatch?.[1]) {
    return `${apiOrigin()}/api/v1/files/${supabaseMatch[1]}`;
  }

  if (trimmed.startsWith('/api/v1/files/')) {
    return `${apiOrigin()}${trimmed}`;
  }

  if (API_FILES_RE.test(trimmed)) {
    return trimmed;
  }

  return trimmed;
}
