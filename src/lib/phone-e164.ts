import { Country } from "country-state-city";
import {
  getExampleNumber,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";
import mobileExamples from "libphonenumber-js/mobile/examples";

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export type PhoneValidationResult =
  | { ok: true; e164: string }
  | { ok: false; error: string };

/** Combine ISO country and national digits without validating length or format. */
export function composeE164Phone(countryIso: string, nationalDigits: string): string | null {
  const trimmed = digitsOnly(nationalDigits);
  if (!countryIso || !trimmed) return null;
  const c = Country.getCountryByCode(countryIso);
  if (!c?.phonecode) return null;
  return `+${c.phonecode}${trimmed}`;
}

/** Combine ISO country and national digits when they form a valid phone number. */
export function buildE164Phone(countryIso: string, nationalDigits: string): string | null {
  const result = validateNationalPhone(countryIso, nationalDigits);
  return result.ok ? result.e164 : null;
}

export function validateNationalPhone(
  countryIso: string,
  nationalDigits: string,
): PhoneValidationResult {
  const digits = digitsOnly(nationalDigits);

  if (!countryIso) {
    return { ok: false, error: "Select a country code." };
  }

  if (!digits) {
    return { ok: false, error: "Enter your phone number." };
  }

  let parsed;
  try {
    parsed = parsePhoneNumberFromString(digits, countryIso as CountryCode);
  } catch {
    parsed = undefined;
  }

  if (!parsed?.isValid()) {
    return { ok: false, error: getPhoneValidationMessage(countryIso) };
  }

  return { ok: true, e164: parsed.format("E.164") };
}

export function getPhoneValidationMessage(countryIso: string): string {
  return `Enter a valid ${getNationalNumberHint(countryIso)}.`;
}

export function getNationalNumberHint(countryIso: string): string {
  const country = Country.getCountryByCode(countryIso);
  const countryName = country?.name ?? "selected country";

  try {
    const example = getExampleNumber(countryIso as CountryCode, mobileExamples);
    if (example) {
      const digits = example.nationalNumber.length;
      return `${digits}-digit phone number for ${countryName}`;
    }
  } catch {
    // fall through
  }

  return `phone number for ${countryName}`;
}

export function getNationalNumberPlaceholder(countryIso: string): string {
  try {
    const example = getExampleNumber(countryIso as CountryCode, mobileExamples);
    if (example) {
      return example.formatNational();
    }
  } catch {
    // fall through
  }

  return "Phone number";
}

export function getMaxNationalPhoneDigits(countryIso: string): number {
  try {
    const example = getExampleNumber(countryIso as CountryCode, mobileExamples);
    if (example) {
      return Math.min(15, Math.max(example.nationalNumber.length + 2, example.nationalNumber.length));
    }
  } catch {
    // fall through
  }

  return 15;
}
