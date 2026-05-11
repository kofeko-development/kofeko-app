import { Country } from "country-state-city";

/** Combine ISO country (for dial) and national digits into E.164-style `+<country><national>`. */
export function buildE164Phone(countryIso: string, nationalDigits: string): string | null {
  const trimmed = nationalDigits.replace(/\D/g, "");
  if (!countryIso || !trimmed) return null;
  const c = Country.getCountryByCode(countryIso);
  if (!c?.phonecode) return null;
  return `+${c.phonecode}${trimmed}`;
}

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}
