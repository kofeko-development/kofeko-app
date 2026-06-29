
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
import { apiRequest } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { useApiErrorToast } from "@/hooks/use-api-error-toast";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2, Upload, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { COMPANY_SIZE_OPTIONS, type CompanySizeValue } from "@/lib/company-size";
import { validateNationalPhone } from "@/lib/phone-e164";
import { cn } from "@/lib/utils";
import { hasFieldErrors } from "@/lib/validation-errors";
import { companyApi } from "@/lib/stage1-2-api";
import { resolveUploadUrl } from "@/lib/storage-url";
import { isValidWebsiteUrl, normalizeWebsiteUrl } from "@/lib/website-url";
import {
  applyCompanySignupDraft,
  clearCompanySignupDraft,
  clearEmailVerification,
  COMPANY_SIGNUP_OTP_TTL_SECONDS,
  formatOtpCountdown,
  getEmailVerificationTokenForSubmit,
  isEmailVerifiedFor,
  mergeCompanySignupDraft,
  readCompanySignupDraft,
  readEmailVerification,
  saveEmailVerification,
  writeCompanySignupDraft,
} from "@/lib/company-signup-draft";

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

const isValidEmailShape = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));

export default function SignupPage() {
  const { registerAdmin, login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { showError } = useApiErrorToast();

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [draftReady, setDraftReady] = useState(false);

  const [companyName, setCompanyName] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState<CompanySizeValue | ''>('');
  const [companyType, setCompanyType] = useState<'startup' | 'enterprise' | 'agency' | 'non_profit'>('startup');
  const [foundedYear, setFoundedYear] = useState(String(new Date().getFullYear()));
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [phoneCountryIso, setPhoneCountryIso] = useState('IN');
  const [phoneNationalDigits, setPhoneNationalDigits] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');
  const [logoFileName, setLogoFileName] = useState('');
  const [logoUploading, setLogoUploading] = useState(false);
  const logoFileInputRef = useRef<HTMLInputElement>(null);
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
  const [otpExpiresAt, setOtpExpiresAt] = useState<number | null>(null);
  const [otpSecondsLeft, setOtpSecondsLeft] = useState(0);
  const [emailVerificationToken, setEmailVerificationToken] = useState<string | null>(null);
  const [verifiedAtEmail, setVerifiedAtEmail] = useState<string | null>(null);
  const [sendOtpLoading, setSendOtpLoading] = useState(false);
  const [confirmOtpLoading, setConfirmOtpLoading] = useState(false);
  const skipNextPersistRef = useRef(true);

  useEffect(() => {
    const draft = readCompanySignupDraft();
    const verification = readEmailVerification();
    if (draft) {
      applyCompanySignupDraft(draft, {
        setStep,
        setAdminEmail,
        setPassword,
        setConfirmPassword,
        setOtpSent,
        setOtpExpiresAt,
        setEmailVerificationToken,
        setVerifiedAtEmail,
        setCompanyName,
        setCountry,
        setState,
        setCity,
        setZipCode,
        setFullAddress,
        setIndustry,
        setCompanySize,
        setCompanyType,
        setFoundedYear,
        setCompanyWebsite,
        setPhoneCountryIso,
        setPhoneNationalDigits,
        setCompanyLogo,
        setShortDescription,
        setLinkedinUrl,
        setTwitterUrl,
        setTermsAccepted,
      });
    }
    if (verification) {
      setAdminEmail((current) => current || verification.adminEmail);
      setEmailVerificationToken(verification.emailVerificationToken);
      setVerifiedAtEmail(verification.verifiedAtEmail);
      setOtpSent(false);
      setOtpExpiresAt(null);
      setOtpSecondsLeft(0);
      setOtpCode('');
    } else if (draft?.otpExpiresAt) {
      const left = Math.max(0, Math.ceil((draft.otpExpiresAt - Date.now()) / 1000));
      setOtpSecondsLeft(left);
    }

    const restoredEmail = verification?.adminEmail ?? draft?.adminEmail ?? '';
    const restoredVerified =
      isEmailVerifiedFor(restoredEmail) ||
      (Boolean(draft?.emailVerificationToken) &&
        Boolean(draft?.verifiedAtEmail) &&
        draft.verifiedAtEmail === normalizeEmail(restoredEmail));
    if (restoredVerified) {
      setOtpSent(false);
      setOtpExpiresAt(null);
      setOtpSecondsLeft(0);
      setOtpCode('');
    }

    setDraftReady(true);
  }, []);

  useEffect(() => {
    if (!draftReady) return;
    if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false;
      return;
    }

    writeCompanySignupDraft({
      step,
      adminEmail,
      password,
      confirmPassword,
      otpSent,
      otpExpiresAt,
      emailVerificationToken,
      verifiedAtEmail,
      companyName,
      country,
      state,
      city,
      zipCode,
      fullAddress,
      industry,
      companySize,
      companyType,
      foundedYear,
      companyWebsite,
      phoneCountryIso,
      phoneNationalDigits,
      companyLogo,
      shortDescription,
      linkedinUrl,
      twitterUrl,
      termsAccepted,
    });
  }, [
    draftReady,
    step,
    adminEmail,
    password,
    confirmPassword,
    otpSent,
    otpExpiresAt,
    emailVerificationToken,
    verifiedAtEmail,
    companyName,
    country,
    state,
    city,
    zipCode,
    fullAddress,
    industry,
    companySize,
    companyType,
    foundedYear,
    companyWebsite,
    phoneCountryIso,
    phoneNationalDigits,
    companyLogo,
    shortDescription,
    linkedinUrl,
    twitterUrl,
    termsAccepted,
  ]);

  const passwordsMatch = password === confirmPassword;
  const showPasswordMismatch =
    confirmPassword.length > 0 && password.length > 0 && !passwordsMatch;

  const emailLooksVerified =
    isEmailVerifiedFor(adminEmail) ||
    (Boolean(emailVerificationToken) &&
      verifiedAtEmail !== null &&
      verifiedAtEmail === normalizeEmail(adminEmail));

  const otpExpired = otpSent && !emailLooksVerified && otpSecondsLeft <= 0;
  const otpPending = otpSent && !emailLooksVerified && !otpExpired;

  useEffect(() => {
    if (!otpExpiresAt || emailLooksVerified) return;

    const tick = () => {
      const left = Math.max(0, Math.ceil((otpExpiresAt - Date.now()) / 1000));
      setOtpSecondsLeft(left);
    };

    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [otpExpiresAt, emailLooksVerified]);

  const handleAdminEmailChange = (value: string) => {
    const prevNorm = normalizeEmail(adminEmail);
    setAdminEmail(value);
    const nextNorm = normalizeEmail(value);
    if (prevNorm !== nextNorm) {
      setVerifiedAtEmail(null);
      setEmailVerificationToken(null);
      setOtpCode('');
      setOtpSent(false);
      setOtpExpiresAt(null);
      setOtpSecondsLeft(0);
      clearEmailVerification();
      mergeCompanySignupDraft({
        adminEmail: value,
        otpSent: false,
        otpExpiresAt: null,
        emailVerificationToken: null,
        verifiedAtEmail: null,
      });
    }
  };

  const handleSendEmailOtp = async () => {
    const raw = adminEmail.trim();
    if (!isValidEmailShape(raw)) {
      toast({
        title: 'Invalid email',
        description: 'Enter a valid email address, then tap Verify.',
        variant: 'destructive',
      });
      return;
    }
    setSendOtpLoading(true);
    try {
      await apiRequest<{ sent: true }>('/auth/register-company-email-otp/send', {
        method: 'POST',
        body: { email: raw },
      });
      const expiresAt = Date.now() + COMPANY_SIGNUP_OTP_TTL_SECONDS * 1000;
      setOtpSent(true);
      setOtpCode('');
      setOtpExpiresAt(expiresAt);
      setOtpSecondsLeft(COMPANY_SIGNUP_OTP_TTL_SECONDS);
      setVerifiedAtEmail(null);
      setEmailVerificationToken(null);
      clearEmailVerification();
      mergeCompanySignupDraft({
        adminEmail: raw,
        otpSent: true,
        otpExpiresAt: expiresAt,
        emailVerificationToken: null,
        verifiedAtEmail: null,
      });
      toast({
        title: 'Code sent',
        description: `Enter the 6-digit code within ${formatOtpCountdown(COMPANY_SIGNUP_OTP_TTL_SECONDS)}.`,
      });
    } catch (error) {
      const { fieldErrors: mapped } = showError(error);
      setFieldErrors((prev) => ({ ...prev, ...mapped }));
    } finally {
      setSendOtpLoading(false);
    }
  };

  const handleConfirmEmailOtp = async () => {
    const raw = adminEmail.trim();
    const code = otpCode.trim();
    if (otpExpired) {
      toast({
        title: 'Code expired',
        description: 'Your verification code has expired. Tap Resend to get a new one.',
        variant: 'destructive',
      });
      return;
    }
    if (!isValidEmailShape(raw) || !/^\d{6}$/.test(code)) {
      toast({
        title: 'Invalid code',
        description: 'Enter the 6-digit code from your email.',
        variant: 'destructive',
      });
      return;
    }
    setConfirmOtpLoading(true);
    try {
      const { emailVerificationToken: token } = await apiRequest<{ emailVerificationToken: string }>(
        '/auth/register-company-email-otp/verify',
        { method: 'POST', body: { email: raw, code } },
      );
      const normalized = normalizeEmail(raw);
      setEmailVerificationToken(token);
      setVerifiedAtEmail(normalized);
      setOtpSent(false);
      setOtpExpiresAt(null);
      setOtpSecondsLeft(0);
      setOtpCode('');
      saveEmailVerification({
        adminEmail: raw,
        emailVerificationToken: token,
        verifiedAtEmail: normalized,
      });
      mergeCompanySignupDraft({
        adminEmail: raw,
        otpSent: false,
        otpExpiresAt: null,
        emailVerificationToken: token,
        verifiedAtEmail: normalized,
      });
      toast({ title: 'Email verified', description: 'You can continue to company details.' });
    } catch (error) {
      const { fieldErrors: mapped } = showError(error);
      setFieldErrors((prev) => ({ ...prev, ...mapped }));
    } finally {
      setConfirmOtpLoading(false);
    }
  };

  const validateStep1 = (): boolean => {
    const norm = normalizeEmail(adminEmail);
    if (!norm || !isValidEmailShape(adminEmail)) {
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

    if (!isEmailVerifiedFor(adminEmail)) {
      toast({
        title: 'Email not verified',
        description: 'Go back to step 1 and verify your email with the code we sent.',
        variant: 'destructive',
      });
      setStep(1);
      return;
    }

    const verificationToken = getEmailVerificationTokenForSubmit(adminEmail.trim()) ?? emailVerificationToken ?? undefined;

    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Go back to the account step and make sure both passwords match.',
        variant: 'destructive',
      });
      setStep(1);
      return;
    }

    setIsLoading(true);
    setFieldErrors({});

    try {
      const phoneCheck = validateNationalPhone(phoneCountryIso, phoneNationalDigits);
      if (!phoneCheck.ok) {
        toast({
          title: "Invalid phone number",
          description: phoneCheck.error,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      const phoneNumber = phoneCheck.e164;

      const res = await registerAdmin({
        adminEmail: adminEmail.trim(),
        password,
        emailVerificationToken: verificationToken,
        companyName,
        companyAddress: {
          country,
          state,
          city,
          zipCode,
          fullAddress,
        },
        industry,
        companySize: '1-10',
        companyType: 'startup',
        foundedYear: new Date().getFullYear(),
        companyWebsite: 'https://example.com',
        officialCompanyAddress: fullAddress.trim(),
        phoneNumber,
        companyLogo: undefined,
        shortDescription: 'Company profile details will be updated soon.',
        linkedinUrl: undefined,
        twitterUrl: undefined,
        termsAccepted: true,
      });

      const isApproved = res?.status === 'approved';

      toast({
        title: isApproved ? "Registration Approved!" : "Registration Submitted",
        description: isApproved
          ? "Your company has been auto-approved! Welcome to Kofeko."
          : "Your company registration is pending super admin approval.",
      });

      clearCompanySignupDraft();

      if (isApproved && res?.tenantSlug) {
        try {
          const u = await login({
            email: adminEmail.trim(),
            password,
            tenantSlug: res.tenantSlug,
          });
          if (u.companyRole === 'Company Admin' || u.companyRole === 'Hiring Manager' || u.companyRole === 'Recruiter') {
            router.push('/admin/dashboard');
          } else {
            router.push('/dashboard');
          }
        } catch (loginErr) {
          console.error("Auto-login failed:", loginErr);
          router.push(`/company-login?slug=${res.tenantSlug}`);
        }
      } else {
        router.push(`/signup-success?status=${res?.status || 'pending'}&slug=${res?.tenantSlug || ''}`);
      }
    } catch (error) {
      const { fieldErrors: mapped } = showError(error);
      setFieldErrors(mapped);
      if (mapped.adminEmail || mapped.email || mapped.password) {
        setStep(1);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      {step === 2 ? (
        <Button
          type="button"
          variant="ghost"
          className="mb-3 -ml-2 gap-1.5 px-2 text-foreground hover:bg-white/70 hover:text-foreground"
          onClick={() => setStep(1)}
          disabled={isLoading}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back
        </Button>
      ) : null}
      <Card className="w-full overflow-hidden rounded-2xl border bg-card shadow-md">
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
            {step === 1 ? (
              <div className="grid gap-5">

                <div className="grid gap-2">
                  <Label htmlFor="admin-email">Company admin email *</Label>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                    <Input
                      id="admin-email"
                      type="email"
                      autoComplete="email"
                      value={adminEmail}
                      onChange={(e) => handleAdminEmailChange(e.target.value)}
                      required
                      readOnly={emailLooksVerified}
                      disabled={isLoading || sendOtpLoading || confirmOtpLoading || emailLooksVerified}
                      className={cn(
                        "h-11 min-w-0 flex-1",
                        emailLooksVerified && "bg-muted/50",
                        (fieldErrors.adminEmail || fieldErrors.email) && "border-destructive",
                      )}
                      placeholder="you@company.com"
                    />
                    {emailLooksVerified ? (
                      <div
                        className="flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold text-emerald-700 sm:w-36 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                        role="status"
                        aria-label="Email verified"
                      >
                        Verified
                        <ArrowRight className="h-4 w-4" aria-hidden />
                      </div>
                    ) : (
                      <Button
                        type="button"
                        className="h-11 shrink-0 sm:w-36"
                        disabled={
                          isLoading ||
                          sendOtpLoading ||
                          confirmOtpLoading ||
                          !isValidEmailShape(adminEmail) ||
                          (otpSent && !emailLooksVerified)
                        }
                        onClick={() => void handleSendEmailOtp()}
                      >
                        {sendOtpLoading && !otpSent ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : 'Verify'}
                      </Button>
                    )}
                  </div>
                  {(fieldErrors.adminEmail || fieldErrors.email) ? (
                    <p className="text-sm text-destructive" role="alert">
                      {fieldErrors.adminEmail ?? fieldErrors.email}
                    </p>
                  ) : null}
                  {otpSent && !emailLooksVerified ? (
                    <div className="mt-1 grid gap-2 rounded-lg border bg-muted/30 p-3 sm:grid-cols-[1fr_auto] sm:items-start sm:gap-3">
                      <div className="grid gap-2">
                        <Label htmlFor="email-otp">Email code *</Label>
                        <Input
                          id="email-otp"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          maxLength={6}
                          pattern="\d{6}"
                          placeholder="000000"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          disabled={isLoading || confirmOtpLoading || emailLooksVerified || otpExpired}
                          className="h-11 font-mono tracking-widest"
                        />
                        {otpPending ? (
                          <p className="text-xs text-muted-foreground" aria-live="polite" role="timer">
                            Enter the 6-digit code from your email.{' '}
                            <span className="font-semibold tabular-nums text-primary">
                              Time remaining: {formatOtpCountdown(otpSecondsLeft)}
                            </span>
                          </p>
                        ) : (
                          <p className="text-xs text-destructive" role="status">
                            Your verification code has expired. Tap Resend to get a new code.
                          </p>
                        )}
                      </div>
                      {otpExpired ? (
                        <Button
                          type="button"
                          className="h-11 sm:mt-7"
                          disabled={isLoading || sendOtpLoading || confirmOtpLoading}
                          onClick={() => void handleSendEmailOtp()}
                        >
                          {sendOtpLoading && otpSent ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : 'Resend'}
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          className="h-11 sm:mt-7"
                          disabled={
                            isLoading ||
                            confirmOtpLoading ||
                            otpCode.trim().length !== 6 ||
                            emailLooksVerified ||
                            otpExpired
                          }
                          onClick={() => void handleConfirmEmailOtp()}
                        >
                          {confirmOtpLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : 'Confirm'}
                        </Button>
                      )}
                    </div>
                  ) : null}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="admin-password">Password *</Label>
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
                        className={cn("h-11 pr-10", (showPasswordMismatch || fieldErrors.password) && "border-destructive focus-visible:ring-destructive")}
                      />
                      <button
                        type="button"
                        className="absolute right-0 top-0 flex h-11 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        aria-pressed={showPassword}
                        disabled={isLoading || sendOtpLoading || confirmOtpLoading}
                      >
                        {showPassword ? <Eye className="h-4 w-4" aria-hidden /> : <EyeOff className="h-4 w-4" aria-hidden />}
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="admin-password-confirm">Confirm password *</Label>
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
                        {showConfirmPassword ? <Eye className="h-4 w-4" aria-hidden /> : <EyeOff className="h-4 w-4" aria-hidden />}
                      </button>
                    </div>
                  </div>
                </div>
                {showPasswordMismatch ? (
                  <p className="text-sm text-destructive" role="alert">
                    Passwords must match.
                  </p>
                ) : null}
                {fieldErrors.password ? (
                  <p className="text-sm text-destructive" role="alert">{fieldErrors.password}</p>
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
                {hasFieldErrors(fieldErrors) ? (
                  <div
                    className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
                    role="alert"
                  >
                    <p className="font-medium">Please fix the following:</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      {Object.entries(fieldErrors).map(([field, message]) => (
                        <li key={field}>{message}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}


                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="company-name">Company Name *</Label>
                    <Input id="company-name" value={companyName} onChange={e => setCompanyName(e.target.value)} required disabled={isLoading} className={fieldErrors.companyName ? "border-destructive" : undefined} />
                    {fieldErrors.companyName ? <p className="text-sm text-destructive" role="alert">{fieldErrors.companyName}</p> : null}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="industry">Industry *</Label>
                    <Input id="industry" value={industry} onChange={e => setIndustry(e.target.value)} required disabled={isLoading} />
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
                  showRequiredIndicator
                />

                <div className="grid gap-2">
                  <Label htmlFor="full-address">Company Address (Full Address) *</Label>
                  <Textarea id="full-address" value={fullAddress} onChange={e => setFullAddress(e.target.value)} required disabled={isLoading} />
                </div>

                <div className="grid gap-2">
                  <PhoneInternationalField
                    className="min-w-0"
                    phoneCountryIso={phoneCountryIso}
                    phoneNationalDigits={phoneNationalDigits}
                    setPhoneCountryIso={setPhoneCountryIso}
                    setPhoneNationalDigits={setPhoneNationalDigits}
                    addressCountryName={country}
                    disabled={isLoading}
                    showRequiredIndicator
                    hideHint
                  />
                  {fieldErrors.phoneNumber ? (
                    <p className="text-sm text-destructive" role="alert">{fieldErrors.phoneNumber}</p>
                  ) : null}
                </div>

                <Button type="submit" className="w-full h-11" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isLoading ? "Submitting..." : "Submit Company Registration"}
                </Button>
              </>
            ) : null}
          </form>
          <div className="mt-4 text-center text-sm">
            Already approved and have credentials?{" "}
            <Link href="/company-login" className="underline">
              Company Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
