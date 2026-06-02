import type { ApiErrorDetails } from '@/lib/api-client';

/** Zod flatten() shape returned by the backend on VALIDATION_ERROR */
type ZodFlattenDetails = {
  formErrors?: string[];
  fieldErrors?: Record<string, string[] | undefined>;
};

function stripFieldPrefix(key: string): string {
  const prefixes = ['body.', 'query.', 'params.'];
  for (const prefix of prefixes) {
    if (key.startsWith(prefix)) {
      return key.slice(prefix.length);
    }
  }
  return key;
}

/**
 * Flattens backend validation `details` (Zod flatten or nested fieldErrors)
 * into `{ email: "msg", password: "msg" }` for inline form display.
 */
export function mapFieldErrors(details: unknown): Record<string, string> {
  if (!details || typeof details !== 'object') {
    return {};
  }

  const out: Record<string, string> = {};
  const record = details as Record<string, unknown>;

  const nested = record.fieldErrors;
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    for (const [key, value] of Object.entries(nested as Record<string, unknown>)) {
      const message = firstMessage(value);
      if (message) {
        out[stripFieldPrefix(key)] = message;
      }
    }
    return out;
  }

  const flat = details as ZodFlattenDetails;
  if (flat.fieldErrors) {
    for (const [key, messages] of Object.entries(flat.fieldErrors)) {
      const message = firstMessage(messages);
      if (message) {
        out[stripFieldPrefix(key)] = message;
      }
    }
  }

  return out;
}

function firstMessage(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) {
    return value;
  }
  if (Array.isArray(value)) {
    const first = value.find((v) => typeof v === 'string' && v.trim());
    return typeof first === 'string' ? first : undefined;
  }
  return undefined;
}

export function fieldErrorFor(
  fieldErrors: Record<string, string>,
  field: string,
): string | undefined {
  return fieldErrors[field];
}

export function hasFieldErrors(fieldErrors: Record<string, string>): boolean {
  return Object.keys(fieldErrors).length > 0;
}

export function mergeFieldErrors(
  ...sources: Array<Record<string, string> | undefined>
): Record<string, string> {
  return Object.assign({}, ...sources.filter(Boolean));
}

export function fieldErrorsFromApiDetails(details?: ApiErrorDetails): Record<string, string> {
  if (!details) return {};
  return mapFieldErrors(details);
}
