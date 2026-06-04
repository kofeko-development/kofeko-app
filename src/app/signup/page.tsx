
"use client"

import Link from "next/link"
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth";
import { apiRequest, ApiError } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { useApiErrorToast } from "@/hooks/use-api-error-toast";
import { hasFieldErrors, mapFieldErrors, resolveSignupFieldError } from "@/lib/validation-errors";
import { ensureHttpsUrl } from "@/lib/url-utils";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2, Upload, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { COMPANY_SIZE_OPTIONS, type CompanySizeValue } from "@/lib/company-size";
import { buildE164Phone } from "@/lib/phone-e164";
import { cn } from "@/lib/utils";
import { companyApi } from "@/lib/stage1-2-api";

const LocationAddressFields = dynamic(
  () => import("@/components/location-address-fields").then((m) => m.LocationAddressFields),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
        Loading country & region lists…
      </div>
    ),
  },
);

const PhoneInternationalField = dynamic(
  () => import("@/components/phone-international-field").then((m) => m.PhoneInternationalField),
  {
    ssr: false,
    loading: () => (
      <div className="h-24 animate-pulse rounded-md bg-muted" aria-hidden />
    ),
  },
);

const normalizeEmail = (value: string) => value.trim().toLowerCase();

/** Stricter than basic regex; aligned with backend z.email() expectations */
const isValidSignupEmail = (value: string) => {
  const email = normalizeEmail(value);
  if (!email || email.length > 254 || email.includes('..')) return false;
  const parts = email.split('@');
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  if (!local || !domain || !domain.includes('.')) return false;
  const tld = domain.split('.').pop();
  if (!tld || tld.length < 2) return false;
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/.test(email);
};

const STEP1_ERROR_FIELDS = new Set([
  'adminEmail',
  'email',
  'password',
  'code',
  'emailVerificationToken',
]);

function mapOtpApiFieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError)) return {};
  const mapped = mapFieldErrors(error.details);
  if (Object.keys(mapped).length > 0) return mapped;
  const code = error.errorCode;
  if (code === 'OTP_INVALID' || code === 'OTP_EXPIRED' || code === 'OTP_MAX_ATTEMPTS') {
    return { code: error.message };
  }
  if (code === 'OTP_RATE_LIMITED') {
    return { adminEmail: error.message };
  }
  if (code === 'VALIDATION_ERROR') {
    return { adminEmail: error.message };
  }
  return {};
}

export default function SignupPage() {
  const { registerAdmin } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { showError } = useApiErrorToast();

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [companyName, setCompanyName] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [companyType, setCompanyType] = useState<'startup' | 'enterprise' | 'agency' | 'non_profit'>('startup');
  const [foundedYear, setFoundedYear] = useState(String(new Date().getFullYear()));
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [phoneCountryIso, setPhoneCountryIso] = useState('IN');
  const [phoneNationalDigits, setPhoneNationalDigits] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [step, setStep] = useState<1 | 2>(1);
  const [adminEmail, setAdminEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerificationToken, setEmailVerificationToken] = useState<string | null>(null);
  const [verifiedAtEmail, setVerifiedAtEmail] = useState<string | null>(null);
  const [sendOtpLoading, setSendOtpLoading] = useState(false);
  const [confirmOtpLoading, setConfirmOtpLoading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoPreviewBlob, setLogoPreviewBlob] = useState<string | null>(null);
  const [logoPreviewFailed, setLogoPreviewFailed] = useState(false);

  const passwordsMatch = password === confirmPassword;

  const fieldErr = (field: string) => resolveSignupFieldError(fieldErrors, field);

  useEffect(() => {
    return () => {
      if (logoPreviewBlob) URL.revokeObjectURL(logoPreviewBlob);
    };
  }, [logoPreviewBlob]);

  const clearLogoPreview = () => {
    if (logoPreviewBlob) URL.revokeObjectURL(logoPreviewBlob);
    setLogoPreviewBlob(null);
    setCompanyLogo('');
    setLogoPreviewFailed(false);
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.companyLogo;
      return next;
    });
  };

  const logoDisplaySrc = logoPreviewBlob || companyLogo || null;
  const showPasswordMismatch =
    confirmPassword.length > 0 && password.length > 0 && !passwordsMatch;

  const emailLooksVerified =
    Boolean(emailVerificationToken) &&
    verifiedAtEmail !== null &&
    verifiedAtEmail === normalizeEmail(adminEmail);

  const handleAdminEmailChange = (value: string) => {
    const prevNorm = normalizeEmail(adminEmail);
    setAdminEmail(value);
    const nextNorm = normalizeEmail(value);
    if (prevNorm !== nextNorm) {
      setVerifiedAtEmail(null);
      setEmailVerificationToken(null);
      setOtpCode('');
      setOtpSent(false);
    }
  };

  const handleSendEmailOtp = async () => {
    const raw = adminEmail.trim();
    if (!isValidSignupEmail(raw)) {
      setFieldErrors((prev) => ({
        ...prev,
        adminEmail: 'Enter a valid email address, then tap Verify.',
      }));
      return;
    }
    setSendOtpLoading(true);
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.adminEmail;
      delete next.email;
      delete next.code;
      return next;
    });
    try {
      await apiRequest<{ sent: true }>('/auth/register-company-email-otp/send', {
        method: 'POST',
        body: { email: raw },
      });
      setOtpSent(true);
      setOtpCode('');
      setVerifiedAtEmail(null);
      setEmailVerificationToken(null);
      toast({
        title: 'Code sent',
        description: 'Check your inbox for a 6-digit verification code.',
      });
    } catch (error) {
      showError(error);
      setFieldErrors((prev) => ({ ...prev, ...mapOtpApiFieldErrors(error) }));
    } finally {
      setSendOtpLoading(false);
    }
  };

  const handleConfirmEmailOtp = async () => {
    const raw = adminEmail.trim();
    const code = otpCode.trim();
    if (!isValidSignupEmail(raw)) {
      setFieldErrors((prev) => ({
        ...prev,
        adminEmail: 'Enter a valid email address.',
      }));
      return;
    }
    if (!/^\d{6}$/.test(code)) {
      setFieldErrors((prev) => ({
        ...prev,
        code: 'Enter the 6-digit code from your email.',
      }));
      return;
    }
    setConfirmOtpLoading(true);
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.code;
      return next;
    });
    try {
      const { emailVerificationToken: token } = await apiRequest<{ emailVerificationToken: string }>(
        '/auth/register-company-email-otp/verify',
        { method: 'POST', body: { email: raw, code } },
      );
      setEmailVerificationToken(token);
      setVerifiedAtEmail(normalizeEmail(raw));
      toast({ title: 'Email verified', description: 'You can continue to company details.' });
    } catch (error) {
      showError(error);
      setFieldErrors((prev) => ({ ...prev, ...mapOtpApiFieldErrors(error) }));
    } finally {
      setConfirmOtpLoading(false);
    }
  };

  const validateStep1 = (): boolean => {
    const norm = normalizeEmail(adminEmail);
    if (!norm || !isValidSignupEmail(adminEmail)) {
      toast({
        title: 'Invalid email',
        description: 'Enter a valid email you will use to log in after approval.',
        variant: 'destructive',
      });
      return false;
    }
    if (!emailLooksVerified) {
      toast({
        title: 'Verify your email',
        description: 'Use Verify to get a code, then confirm it before continuing.',
        variant: 'destructive',
      });
      return false;
    }
    if (password.length < 8) {
      toast({
        title: 'Password too short',
        description: 'Use at least 8 characters.',
        variant: 'destructive',
      });
      return false;
    }
    if (confirmPassword.length < 8) {
      toast({
        title: 'Confirm your password',
        description: 'Enter the same password in both fields (at least 8 characters).',
        variant: 'destructive',
      });
      return false;
    }
    if (!passwordsMatch) {
      toast({
        title: 'Passwords do not match',
        description: 'Re-enter the same password in both fields.',
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (step === 1) {
      if (validateStep1()) setStep(2);
      return;
    }

    if (!emailVerificationToken || verifiedAtEmail !== normalizeEmail(adminEmail)) {
      toast({
        title: 'Email not verified',
        description: 'Go back to step 1 and verify your email with the code we sent.',
        variant: 'destructive',
      });
      setStep(1);
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Go back to the account step and make sure both passwords match.',
        variant: 'destructive',
      });
      setStep(1);
      return;
    }

    const website = ensureHttpsUrl(companyWebsite);
    const linkedin = linkedinUrl.trim() ? ensureHttpsUrl(linkedinUrl) : '';
    const twitter = twitterUrl.trim() ? ensureHttpsUrl(twitterUrl) : '';

    if (!companyLogo.trim()) {
      setFieldErrors({ companyLogo: 'Upload a company logo before submitting.' });
      return;
    }

    if (logoUploading) {
      setFieldErrors({ companyLogo: 'Please wait for the logo upload to finish.' });
      return;
    }

    setIsLoading(true);
    setFieldErrors({});

    try {
      const phoneNumber = buildE164Phone(phoneCountryIso, phoneNationalDigits);
      if (!phoneNumber) {
        setFieldErrors({ phoneNumber: 'Select a country code and enter your phone number (digits only).' });
        setIsLoading(false);
        return;
      }

      await registerAdmin({
        adminEmail: adminEmail.trim(),
        password,
        emailVerificationToken: emailVerificationToken as string,
        companyName,
        companyAddress: {
          country,
          state,
          city,
          zipCode,
          fullAddress,
        },
        industry,
        companySize: companySize as CompanySizeValue,
        companyType,
        foundedYear: Number(foundedYear),
        companyWebsite: website,
        officialCompanyAddress: fullAddress.trim(),
        phoneNumber,
        companyLogo,
        shortDescription,
        linkedinUrl: linkedin || undefined,
        twitterUrl: twitter || undefined,
        termsAccepted: termsAccepted as true,
      });

      toast({
        title: "Registration Submitted",
        description: "Your company registration is pending super admin approval.",
      });

      router.push('/signup-success');
    } catch (error) {
      const { fieldErrors: mapped } = showError(error);
      setFieldErrors(mapped);
      if (Object.keys(mapped).some((key) => STEP1_ERROR_FIELDS.has(key))) {
        setStep(1);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border bg-card shadow-md">
      <CardHeader className="border-b bg-card px-6 pb-6 pt-6">
        <span className="sr-only">{step === 1 ? "Step 1 of 2" : "Step 2 of 2"}</span>
        <div className="mb-5 flex gap-2" aria-hidden>
          <div
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              step >= 1 ? "bg-primary" : "bg-muted",
            )}
          />
          <div
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              step >= 2 ? "bg-primary" : "bg-muted",
            )}
          />
        </div>
        <CardTitle className="text-xl font-semibold tracking-tight">Company registration</CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">
          {step === 1 ? "Account" : "Company details"}
        </p>
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-6">
        <form onSubmit={handleSignup} className="grid gap-6">
          {hasFieldErrors(fieldErrors) && (
            <div
              className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
              role="alert"
            >
              <p className="font-medium">Please fix the following:</p>
              <ul className="mt-1 list-inside list-disc">
                {Object.entries(fieldErrors).map(([key, msg]) => (
                  <li key={key}>{msg}</li>
                ))}
              </ul>
            </div>
          )}
          {step === 1 ? (
            <div className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="admin-email">Company admin email</Label>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                  <Input
                    id="admin-email"
                    type="email"
                    autoComplete="email"
                    value={adminEmail}
                    onChange={(e) => handleAdminEmailChange(e.target.value)}
                    required
                    disabled={isLoading || sendOtpLoading || confirmOtpLoading}
                    className={cn("h-11 min-w-0 flex-1", fieldErr('adminEmail') && "border-destructive")}
                    placeholder="you@company.com"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-11 shrink-0 sm:w-36"
                    disabled={
                      isLoading ||
                      sendOtpLoading ||
                      confirmOtpLoading ||
                      !isValidSignupEmail(adminEmail) ||
                      emailLooksVerified
                    }
                    onClick={() => void handleSendEmailOtp()}
                  >
                    {sendOtpLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : 'Verify'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Tap Verify to receive a one-time code. You must confirm it before continuing.
                </p>
                {fieldErr('adminEmail') ? (
                  <p className="text-sm text-destructive" role="alert">
                    {fieldErr('adminEmail')}
                  </p>
                ) : null}
                {otpSent ? (
                  <div className="mt-1 grid gap-2 rounded-lg border bg-muted/30 p-3 sm:grid-cols-[1fr_auto] sm:items-end sm:gap-3">
                    <div className="grid gap-2">
                      <Label htmlFor="email-otp">Email code</Label>
                      <Input
                        id="email-otp"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        pattern="\d{6}"
                        placeholder="000000"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        disabled={isLoading || confirmOtpLoading || emailLooksVerified}
                        className={cn("h-11 font-mono tracking-widest", fieldErr('code') && "border-destructive")}
                      />
                      {fieldErr('code') ? (
                        <p className="text-sm text-destructive" role="alert">{fieldErr('code')}</p>
                      ) : null}
                    </div>
                    <Button
                      type="button"
                      className="h-11"
                      disabled={
                        isLoading ||
                        confirmOtpLoading ||
                        otpCode.trim().length !== 6 ||
                        emailLooksVerified ||
                        !isValidSignupEmail(adminEmail)
                      }
                      onClick={() => void handleConfirmEmailOtp()}
                    >
                      {confirmOtpLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : 'Confirm'}
                    </Button>
                  </div>
                ) : null}
                {emailLooksVerified ? (
                  <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400" role="status">
                    This email is verified.
                  </p>
                ) : null}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="admin-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="admin-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      disabled={isLoading || sendOtpLoading || confirmOtpLoading}
                      className={cn("h-11 pr-10", (showPasswordMismatch || fieldErr('password')) && "border-destructive focus-visible:ring-destructive")}
                    />
                    <button
                      type="button"
                      className="absolute right-0 top-0 flex h-11 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                      disabled={isLoading || sendOtpLoading || confirmOtpLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
                    </button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="admin-password-confirm">Confirm password</Label>
                  <div className="relative">
                    <Input
                      id="admin-password-confirm"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      disabled={isLoading || sendOtpLoading || confirmOtpLoading}
                      className={cn("h-11 pr-10", showPasswordMismatch && "border-destructive focus-visible:ring-destructive")}
                    />
                    <button
                      type="button"
                      className="absolute right-0 top-0 flex h-11 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                      aria-pressed={showConfirmPassword}
                      disabled={isLoading || sendOtpLoading || confirmOtpLoading}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
                    </button>
                  </div>
                </div>
              </div>
              {showPasswordMismatch ? (
                <p className="text-sm text-destructive" role="alert">
                  Passwords must match.
                </p>
              ) : null}
              {fieldErr('password') ? (
                <p className="text-sm text-destructive" role="alert">{fieldErr('password')}</p>
              ) : null}
              <Button
                type="submit"
                className="h-11 w-full"
                disabled={
                  isLoading ||
                  sendOtpLoading ||
                  confirmOtpLoading ||
                  showPasswordMismatch ||
                  !emailLooksVerified
                }
              >
                Continue
              </Button>
            </div>
          ) : null}

          {step === 2 ? (
            <>
              <div className="flex items-center gap-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setStep(1)} disabled={isLoading}>
                  Back
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input id="company-name" value={companyName} onChange={e => setCompanyName(e.target.value)} required disabled={isLoading} className={fieldErr('companyName') ? "border-destructive" : undefined} />
                  {fieldErr('companyName') ? <p className="text-sm text-destructive" role="alert">{fieldErr('companyName')}</p> : null}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input id="industry" value={industry} onChange={e => setIndustry(e.target.value)} required disabled={isLoading} className={fieldErr('industry') ? "border-destructive" : undefined} />
                  {fieldErr('industry') ? <p className="text-sm text-destructive" role="alert">{fieldErr('industry')}</p> : null}
                </div>
              </div>

              <LocationAddressFields
                country={country}
                state={state}
                city={city}
                zipCode={zipCode}
                setCountry={setCountry}
                setState={setState}
                setCity={setCity}
                setZipCode={setZipCode}
                disabled={isLoading}
                fieldErrors={fieldErrors}
              />

              <div className="grid gap-2">
                <Label htmlFor="full-address">Company Address (Full Address)</Label>
                <Textarea id="full-address" value={fullAddress} onChange={e => setFullAddress(e.target.value)} required disabled={isLoading} className={fieldErr('fullAddress') ? "border-destructive" : undefined} />
                {fieldErr('fullAddress') ? <p className="text-sm text-destructive" role="alert">{fieldErr('fullAddress')}</p> : null}
              </div>

              <div className="grid gap-x-4 gap-y-3 md:grid-cols-2 md:items-start">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="company-size" className="mb-0">
                    Company size (employees)
                  </Label>
                  <select
                    id="company-size"
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                    className={cn("h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", fieldErr('companySize') && "border-destructive")}
                    required
                    disabled={isLoading}
                  >
                    <option value="">Select range</option>
                    {COMPANY_SIZE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {fieldErr('companySize') ? <p className="text-sm text-destructive" role="alert">{fieldErr('companySize')}</p> : null}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="company-type" className="mb-0">
                    Company Type
                  </Label>
                  <select
                    id="company-type"
                    value={companyType}
                    onChange={(e) => setCompanyType(e.target.value as 'startup' | 'enterprise' | 'agency' | 'non_profit')}
                    className={cn("h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", fieldErr('companyType') && "border-destructive")}
                    required
                    disabled={isLoading}
                  >
                    <option value="startup">Startup</option>
                    <option value="enterprise">Enterprise</option>
                    <option value="agency">Agency</option>
                    <option value="non_profit">Non-profit</option>
                  </select>
                  {fieldErr('companyType') ? <p className="text-sm text-destructive" role="alert">{fieldErr('companyType')}</p> : null}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="founded-year" className="mb-0">
                    Founded Year
                  </Label>
                  <Input
                    id="founded-year"
                    type="number"
                    value={foundedYear}
                    onChange={(e) => setFoundedYear(e.target.value)}
                    required
                    disabled={isLoading}
                    className={fieldErr('foundedYear') ? "border-destructive" : undefined}
                  />
                  {fieldErr('foundedYear') ? <p className="text-sm text-destructive" role="alert">{fieldErr('foundedYear')}</p> : null}
                </div>
                <div className="flex flex-col gap-1.5">
                  <PhoneInternationalField
                    className="min-w-0"
                    phoneCountryIso={phoneCountryIso}
                    phoneNationalDigits={phoneNationalDigits}
                    setPhoneCountryIso={setPhoneCountryIso}
                    setPhoneNationalDigits={setPhoneNationalDigits}
                    addressCountryName={country}
                    disabled={isLoading}
                  />
                  {fieldErr('phoneNumber') ? (
                    <p className="text-sm text-destructive" role="alert">{fieldErr('phoneNumber')}</p>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="company-website">Company Website</Label>
                  <Input
                    id="company-website"
                    type="url"
                    value={companyWebsite}
                    onChange={e => setCompanyWebsite(e.target.value)}
                    onBlur={() => setCompanyWebsite((prev) => ensureHttpsUrl(prev))}
                    placeholder="www.example.com"
                    required
                    disabled={isLoading}
                    className={fieldErr('companyWebsite') ? "border-destructive" : undefined}
                  />
                  {fieldErr('companyWebsite') ? <p className="text-sm text-destructive" role="alert">{fieldErr('companyWebsite')}</p> : null}
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="company-logo">Company Logo (Image or SVG)</Label>
                  <div className="flex items-center gap-4">
                    {logoDisplaySrc ? (
                      <div className="relative h-16 w-16 overflow-hidden rounded-md border bg-muted">
                        <img
                          src={logoDisplaySrc}
                          alt="Logo preview"
                          className="h-full w-full object-contain"
                          onError={() => setLogoPreviewFailed(true)}
                        />
                        {logoUploading ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                          </div>
                        ) : null}
                        <button
                          type="button"
                          onClick={clearLogoPreview}
                          className="absolute right-0 top-0 rounded-bl-md bg-destructive p-1 text-white hover:bg-destructive/90"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="h-16 w-16 rounded-md border border-dashed flex items-center justify-center text-muted-foreground bg-muted/30">
                        {logoUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6 opacity-20" />}
                      </div>
                    )}
                    <div className="flex-1">
                      <Input
                        id="company-logo"
                        type="file"
                        accept="image/*,.svg"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (logoPreviewBlob) URL.revokeObjectURL(logoPreviewBlob);
                          const blobUrl = URL.createObjectURL(file);
                          setLogoPreviewBlob(blobUrl);
                          setLogoPreviewFailed(false);
                          setCompanyLogo('');
                          setFieldErrors((prev) => {
                            const next = { ...prev };
                            delete next.companyLogo;
                            return next;
                          });
                          setLogoUploading(true);
                          try {
                            const res = await companyApi.uploadPublicLogo(file);
                            setCompanyLogo(res.url);
                            setLogoPreviewFailed(false);
                          } catch (err) {
                            showError(err);
                            const mapped = err instanceof ApiError ? mapFieldErrors(err.details) : {};
                            setFieldErrors((prev) => ({
                              ...prev,
                              companyLogo: mapped.companyLogo ?? (err instanceof Error ? err.message : 'Upload failed'),
                            }));
                          } finally {
                            setLogoUploading(false);
                          }
                        }}
                        disabled={isLoading || logoUploading}
                        className="cursor-pointer h-auto file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                      />
                      <p className="mt-1 text-xs text-muted-foreground">JPG, PNG or SVG. Max 5MB.</p>
                      {logoPreviewFailed && companyLogo ? (
                        <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                          Saved logo URL could not be previewed (check storage access). You can still submit if upload succeeded.
                        </p>
                      ) : null}
                      {fieldErr('companyLogo') ? (
                        <p className="mt-1 text-sm text-destructive" role="alert">{fieldErr('companyLogo')}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="linkedin-url">LinkedIn URL (Optional)</Label>
                  <Input
                    id="linkedin-url"
                    type="url"
                    value={linkedinUrl}
                    onChange={e => setLinkedinUrl(e.target.value)}
                    onBlur={() => setLinkedinUrl((prev) => ensureHttpsUrl(prev))}
                    placeholder="www.linkedin.com/company/..."
                    disabled={isLoading}
                    className={fieldErr('linkedinUrl') ? "border-destructive" : undefined}
                  />
                  {fieldErr('linkedinUrl') ? <p className="text-sm text-destructive" role="alert">{fieldErr('linkedinUrl')}</p> : null}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="twitter-url">Twitter/X URL (Optional)</Label>
                  <Input
                    id="twitter-url"
                    type="url"
                    value={twitterUrl}
                    onChange={e => setTwitterUrl(e.target.value)}
                    onBlur={() => setTwitterUrl((prev) => ensureHttpsUrl(prev))}
                    placeholder="x.com/..."
                    disabled={isLoading}
                    className={fieldErr('twitterUrl') ? "border-destructive" : undefined}
                  />
                  {fieldErr('twitterUrl') ? <p className="text-sm text-destructive" role="alert">{fieldErr('twitterUrl')}</p> : null}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="short-description">Short Company Description</Label>
                <Textarea
                  id="short-description"
                  value={shortDescription}
                  onChange={e => setShortDescription(e.target.value)}
                  minLength={20}
                  required
                  disabled={isLoading}
                  className={fieldErr('shortDescription') ? "border-destructive" : undefined}
                />
                <p className="text-xs text-muted-foreground">
                  Minimum 20 characters ({shortDescription.trim().length}/20)
                </p>
                {fieldErr('shortDescription') ? (
                  <p className="text-sm text-destructive" role="alert">{fieldErr('shortDescription')}</p>
                ) : null}
              </div>

              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  disabled={isLoading}
                  required
                  className="mt-1"
                />
                <span>I agree to the terms and conditions.</span>
              </label>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isLoading ? "Submitting..." : "Submit Company Registration"}
              </Button>
            </>
          ) : null}
        </form>
        <div className="mt-4 text-center text-sm">
          Already approved and have credentials?{" "}
          <Link href="/login" className="underline">
            Company Login
          </Link>
        </div>
        <div className="mt-2 text-center text-sm">
          Looking for candidate access? <Link href="/candidate-auth?mode=signup" className="underline">Candidate Sign Up</Link>
        </div>
      </CardContent>
    </Card>
  );
}
