import type { CompanySizeValue } from '@/lib/company-size';

export const COMPANY_SIGNUP_OTP_TTL_SECONDS = 60;

export function formatOtpCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export type CompanySignupDraft = {
  step?: 1 | 2;
  adminEmail?: string;
  password?: string;
  confirmPassword?: string;
  otpSent?: boolean;
  otpExpiresAt?: number | null;
  emailVerificationToken?: string | null;
  verifiedAtEmail?: string | null;
  companyName?: string;
  country?: string;
  state?: string;
  city?: string;
  zipCode?: string;
  fullAddress?: string;
  industry?: string;
  companySize?: CompanySizeValue | '';
  companyType?: 'startup' | 'enterprise' | 'agency' | 'non_profit';
  foundedYear?: string;
  companyWebsite?: string;
  phoneCountryIso?: string;
  phoneNationalDigits?: string;
  companyLogo?: string;
  shortDescription?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  termsAccepted?: boolean;
};

const STORAGE_KEY = 'kofeko_company_signup_draft';
const VERIFICATION_STORAGE_KEY = 'kofeko_company_signup_email_verification';
const LEGACY_SESSION_KEY = STORAGE_KEY;

export type StoredEmailVerification = {
  adminEmail: string;
  emailVerificationToken: string;
  verifiedAtEmail: string;
  savedAt: number;
};

function readStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

function migrateSessionDraftToLocal(): void {
  if (typeof window === 'undefined') return;

  try {
    if (localStorage.getItem(STORAGE_KEY)) return;
    const legacy = sessionStorage.getItem(LEGACY_SESSION_KEY);
    if (legacy) {
      localStorage.setItem(STORAGE_KEY, legacy);
      sessionStorage.removeItem(LEGACY_SESSION_KEY);
    }
  } catch {
    // Ignore storage errors in private mode.
  }
}

export function readCompanySignupDraft(): CompanySignupDraft | null {
  const storage = readStorage();
  if (!storage) return null;

  migrateSessionDraftToLocal();

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CompanySignupDraft;
  } catch {
    return null;
  }
}

export function writeCompanySignupDraft(draft: CompanySignupDraft): void {
  const storage = readStorage();
  if (!storage) return;

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(draft));
    sessionStorage.removeItem(LEGACY_SESSION_KEY);
  } catch {
    // Ignore quota / private mode errors.
  }
}

export function mergeCompanySignupDraft(patch: CompanySignupDraft): void {
  writeCompanySignupDraft({
    ...(readCompanySignupDraft() ?? {}),
    ...patch,
  });
}

export function clearCompanySignupDraft(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(LEGACY_SESSION_KEY);
  clearEmailVerification();
}

export function saveEmailVerification(data: Omit<StoredEmailVerification, 'savedAt'>): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(
      VERIFICATION_STORAGE_KEY,
      JSON.stringify({ ...data, savedAt: Date.now() } satisfies StoredEmailVerification),
    );
  } catch {
    // Ignore storage errors.
  }
}

export function readEmailVerification(): StoredEmailVerification | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(VERIFICATION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredEmailVerification;
  } catch {
    return null;
  }
}

export function clearEmailVerification(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(VERIFICATION_STORAGE_KEY);
}

export function isEmailVerifiedFor(adminEmail: string): boolean {
  const verification = readEmailVerification();
  if (!verification) return false;
  return verification.verifiedAtEmail === adminEmail.trim().toLowerCase();
}

export function getEmailVerificationTokenForSubmit(adminEmail: string): string | undefined {
  const verification = readEmailVerification();
  if (!verification) return undefined;
  if (verification.verifiedAtEmail !== adminEmail.trim().toLowerCase()) return undefined;
  return verification.emailVerificationToken || undefined;
}

export function getInitialSignupStep(draft: CompanySignupDraft | null): 1 | 2 {
  const verification = readEmailVerification();
  const verified =
    isEmailVerifiedFor(draft?.adminEmail ?? verification?.adminEmail ?? '') ||
    (Boolean(draft?.emailVerificationToken) &&
      Boolean(draft?.verifiedAtEmail) &&
      draft?.verifiedAtEmail === (draft?.adminEmail?.trim().toLowerCase() ?? ''));

  if (draft?.step === 2 && verified) return 2;
  return 1;
}

export type CompanySignupDraftSetters = {
  setStep: (step: 1 | 2) => void;
  setAdminEmail: (value: string) => void;
  setPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  setOtpSent: (value: boolean) => void;
  setOtpExpiresAt?: (value: number | null) => void;
  setEmailVerificationToken: (value: string | null) => void;
  setVerifiedAtEmail: (value: string | null) => void;
  setCompanyName: (value: string) => void;
  setCountry: (value: string) => void;
  setState: (value: string) => void;
  setCity: (value: string) => void;
  setZipCode: (value: string) => void;
  setFullAddress: (value: string) => void;
  setIndustry: (value: string) => void;
  setCompanySize: (value: CompanySizeValue | '') => void;
  setCompanyType: (value: 'startup' | 'enterprise' | 'agency' | 'non_profit') => void;
  setFoundedYear: (value: string) => void;
  setCompanyWebsite: (value: string) => void;
  setPhoneCountryIso: (value: string) => void;
  setPhoneNationalDigits: (value: string) => void;
  setCompanyLogo: (value: string) => void;
  setShortDescription: (value: string) => void;
  setLinkedinUrl: (value: string) => void;
  setTwitterUrl: (value: string) => void;
  setTermsAccepted: (value: boolean) => void;
};

export function applyCompanySignupDraft(
  draft: CompanySignupDraft,
  setters: CompanySignupDraftSetters,
): void {
  if (draft.adminEmail !== undefined) setters.setAdminEmail(draft.adminEmail);
  if (draft.password !== undefined) setters.setPassword(draft.password);
  if (draft.confirmPassword !== undefined) setters.setConfirmPassword(draft.confirmPassword);
  if (draft.otpSent !== undefined) setters.setOtpSent(draft.otpSent);
  if (draft.otpExpiresAt !== undefined && setters.setOtpExpiresAt) {
    setters.setOtpExpiresAt(draft.otpExpiresAt);
  }
  if (draft.emailVerificationToken !== undefined) {
    setters.setEmailVerificationToken(draft.emailVerificationToken);
  }
  if (draft.verifiedAtEmail !== undefined) setters.setVerifiedAtEmail(draft.verifiedAtEmail);
  if (draft.companyName !== undefined) setters.setCompanyName(draft.companyName);
  if (draft.country !== undefined) setters.setCountry(draft.country);
  if (draft.state !== undefined) setters.setState(draft.state);
  if (draft.city !== undefined) setters.setCity(draft.city);
  if (draft.zipCode !== undefined) setters.setZipCode(draft.zipCode);
  if (draft.fullAddress !== undefined) setters.setFullAddress(draft.fullAddress);
  if (draft.industry !== undefined) setters.setIndustry(draft.industry);
  if (draft.companySize !== undefined) setters.setCompanySize(draft.companySize);
  if (draft.companyType !== undefined) setters.setCompanyType(draft.companyType);
  if (draft.foundedYear !== undefined) setters.setFoundedYear(draft.foundedYear);
  if (draft.companyWebsite !== undefined) setters.setCompanyWebsite(draft.companyWebsite);
  if (draft.phoneCountryIso !== undefined) setters.setPhoneCountryIso(draft.phoneCountryIso);
  if (draft.phoneNationalDigits !== undefined) {
    setters.setPhoneNationalDigits(draft.phoneNationalDigits);
  }
  if (draft.companyLogo !== undefined) setters.setCompanyLogo(draft.companyLogo);
  if (draft.shortDescription !== undefined) setters.setShortDescription(draft.shortDescription);
  if (draft.linkedinUrl !== undefined) setters.setLinkedinUrl(draft.linkedinUrl);
  if (draft.twitterUrl !== undefined) setters.setTwitterUrl(draft.twitterUrl);
  if (draft.termsAccepted !== undefined) setters.setTermsAccepted(draft.termsAccepted);
  setters.setStep(getInitialSignupStep(draft));
}
