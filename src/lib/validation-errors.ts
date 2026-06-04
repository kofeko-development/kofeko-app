import type { ApiErrorDetails } from '@/lib/api-client';

/** Zod flatten() shape returned by the backend on VALIDATION_ERROR */
type ZodFlattenDetails = {
  formErrors?: string[];
  fieldErrors?: Record<string, string[] | undefined>;
};

const MESSAGE_FIELD_HINTS: Array<{ pattern: RegExp; field: string }> = [
  { pattern: /logo/i, field: 'companyLogo' },
  { pattern: /website/i, field: 'companyWebsite' },
  { pattern: /phone/i, field: 'phoneNumber' },
  { pattern: /founded year/i, field: 'foundedYear' },
  { pattern: /description/i, field: 'shortDescription' },
  { pattern: /industry/i, field: 'industry' },
  { pattern: /country/i, field: 'country' },
  { pattern: /state/i, field: 'state' },
  { pattern: /city/i, field: 'city' },
  { pattern: /zip/i, field: 'zipCode' },
  { pattern: /address/i, field: 'fullAddress' },
  { pattern: /password/i, field: 'password' },
  { pattern: /email/i, field: 'adminEmail' },
  { pattern: /verification code|6-digit|otp/i, field: 'code' },
  { pattern: /linkedin/i, field: 'linkedinUrl' },
  { pattern: /twitter/i, field: 'twitterUrl' },
];

function stripFieldPrefix(key: string): string {
  const prefixes = ['body.', 'query.', 'params.'];
  for (const prefix of prefixes) {
    if (key.startsWith(prefix)) {
      return key.slice(prefix.length);
    }
  }
  return key;
}

function hintFieldFromMessage(message: string): string | undefined {
  for (const { pattern, field } of MESSAGE_FIELD_HINTS) {
    if (pattern.test(message)) {
      return field;
    }
  }
  return undefined;
}

function assignError(out: Record<string, string>, key: string, message: string) {
  const field = stripFieldPrefix(key);
  if (!out[field]) {
    out[field] = message;
  }
}

function mapLegacyBodyArray(messages: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (!Array.isArray(messages)) {
    return out;
  }

  for (const raw of messages) {
    if (typeof raw !== 'string' || !raw.trim()) continue;
    const hinted = hintFieldFromMessage(raw);
    const field = hinted ?? 'body';
    if (!out[field]) {
      out[field] = raw;
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

/**
 * Flattens backend validation `details` (Zod issues or legacy flatten)
 * into `{ email: "msg", companyLogo: "msg" }` for inline form display.
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
      if (key === 'body' && Array.isArray(value)) {
        Object.assign(out, mapLegacyBodyArray(value));
        continue;
      }

      const message = firstMessage(value);
      if (message) {
        assignError(out, key, message);
      }
    }
    return out;
  }

  const flat = details as ZodFlattenDetails;
  if (flat.fieldErrors) {
    for (const [key, messages] of Object.entries(flat.fieldErrors)) {
      if (key === 'body' && Array.isArray(messages)) {
        Object.assign(out, mapLegacyBodyArray(messages));
        continue;
      }
      const message = firstMessage(messages);
      if (message) {
        assignError(out, key, message);
      }
    }
  }

  return out;
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

/** Map adminEmail API key to signup email field id */
export function resolveSignupFieldError(
  fieldErrors: Record<string, string>,
  field: string,
): string | undefined {
  if (field === 'adminEmail') {
    return fieldErrors.adminEmail ?? fieldErrors.email;
  }
  if (field === 'email') {
    return fieldErrors.email ?? fieldErrors.adminEmail;
  }
  if (field.startsWith('companyAddress.')) {
    const sub = field.slice('companyAddress.'.length);
    return fieldErrors[sub] ?? fieldErrors[field];
  }
  return fieldErrors[field];
}
