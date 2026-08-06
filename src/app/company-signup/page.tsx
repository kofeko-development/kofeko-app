
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
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/api-client";
import { useAppToast } from '@/lib/toast-helpers';

import { useApiErrorToast } from "@/hooks/use-api-error-toast";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2, Upload, X, CheckCircle2 } from "lucide-react";
import { AuthInput } from '@/components/auth/AuthInput';
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
  const { toastSuccess, toastWarning, toastError, toastInfo } = useAppToast();
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
      toastWarning({
        title: 'Invalid email',
        description: 'Enter a valid email address, then tap Verify.',
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
      toastInfo({
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
      toastError({
        title: 'Code expired',
        description: 'Your verification code has expired. Tap Resend to get a new one.',
      });
      return;
    }
    if (!isValidEmailShape(raw) || !/^\d{6}$/.test(code)) {
      toastWarning({
        title: 'Invalid code',
        description: 'Enter the 6-digit code from your email.',
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
      toastSuccess({ title: 'Email verified', description: 'You can continue to company details.' });
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
      toastWarning({
        title: 'Invalid email',
        description: 'Enter a valid email you will use to log in after approval.',
      });
      return false;
    }
    if (!emailLooksVerified) {
      toastWarning({
        title: 'Verify your email',
        description: 'Use Verify to get a code, then confirm it before continuing.',
      });
      return false;
    }
    if (password.length < 8) {
      toastWarning({
        title: 'Password too short',
        description: 'Use at least 8 characters.',
      });
      return false;
    }
    if (confirmPassword.length < 8) {
      toastError({
        title: 'Confirm your password',
        description: 'Enter the same password in both fields (at least 8 characters).',
      });
      return false;
    }
    if (!passwordsMatch) {
      toastWarning({
        title: 'Passwords do not match',
        description: 'Re-enter the same password in both fields.',
      });
      return false;
    }
    if (!termsAccepted) {
      toastWarning({
        title: 'Terms and conditions',
        description: 'You must agree to the Terms and Conditions to continue.',
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
      toastError({
        title: 'Email not verified',
        description: 'Go back to step 1 and verify your email with the code we sent.',
      });
      setStep(1);
      return;
    }

    const verificationToken = getEmailVerificationTokenForSubmit(adminEmail.trim()) ?? emailVerificationToken ?? undefined;

    if (password !== confirmPassword) {
      toastWarning({
        title: 'Passwords do not match',
        description: 'Go back to the account step and make sure both passwords match.',
      });
      setStep(1);
      return;
    }

    setIsLoading(true);
    setFieldErrors({});

    try {
      const phoneCheck = validateNationalPhone(phoneCountryIso, phoneNationalDigits);
      if (!phoneCheck.ok) {
        toastWarning({
          title: "Invalid phone number",
          description: phoneCheck.error,
        });
        setIsLoading(false);
        return;
      }
      const phoneNumber = phoneCheck.e164;

      if (!termsAccepted) {
        toastWarning({
          title: "Terms and conditions",
          description: "You must agree to the Terms and Conditions to register.",
        });
        setIsLoading(false);
        return;
      }

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

      toastSuccess({
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
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">

      {/* Account Type Switcher */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between mb-8 w-full">
        <span className="text-sm text-slate-600">Are you a candidate?</span>
        <Link href="/candidate-auth?mode=signup" className="text-sm font-bold text-primary hover:text-primary/80 transition-colors">
          Candidate Sign Up →
        </Link>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-10 w-full max-w-[200px] mx-auto md:mx-0">
        <div className={`flex items-center justify-center h-8 w-8 rounded-full text-sm font-bold transition-colors ${step >= 1 ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
          {step > 1 ? <CheckCircle2 className="h-4 w-4" /> : '1'}
        </div>
        <div className={`h-1 flex-1 mx-2 rounded-full transition-colors ${step >= 2 ? 'bg-primary' : 'bg-slate-100'}`} />
        <div className={`flex items-center justify-center h-8 w-8 rounded-full text-sm font-bold transition-colors ${step >= 2 ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
          2
        </div>
      </div>

      <div className="mb-8 text-center md:text-left">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Company Sign Up</h2>
        <p className="text-slate-500 text-sm">
          {step === 1 ? 'Create your administrator account.' : 'Tell us about your company.'}
        </p>
      </div>

      <form onSubmit={handleSignup} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
        {step === 1 && (
          <div className="space-y-5">
            <div className="grid gap-2">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                <div className="flex-1">
                  <AuthInput
                    id="admin-email"
                    label="Company Admin Email *"
                    type="email"
                    autoComplete="email"
                    value={adminEmail}
                    onChange={(e) => handleAdminEmailChange(e.target.value)}
                    required
                    readOnly={emailLooksVerified}
                    disabled={isLoading || sendOtpLoading || confirmOtpLoading || emailLooksVerified}
                    className={cn(
                      emailLooksVerified && "bg-muted/50",
                      (fieldErrors.adminEmail || fieldErrors.email) && "border-destructive"
                    )}
                    placeholder="you@company.com"
                  />
                </div>
                {emailLooksVerified ? (
                  <div
                    className="flex h-11 mt-7 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold text-emerald-700 sm:w-36"
                    role="status"
                    aria-label="Email verified"
                  >
                    Verified
                    <CheckCircle2 className="h-4 w-4" aria-hidden />
                  </div>
                ) : (
                  <Button
                    type="button"
                    className="h-[46px] mt-7 shrink-0 sm:w-36 rounded-xl"
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
                <div className="mt-1 grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[1fr_auto] sm:items-start sm:gap-3">
                  <div className="grid gap-2">
                    <AuthInput
                      id="email-otp"
                      label="Email Code *"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      pattern="\d{6}"
                      placeholder="000000"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      disabled={isLoading || confirmOtpLoading || emailLooksVerified || otpExpired}
                      className="font-mono tracking-widest text-lg"
                    />
                    {otpPending ? (
                      <p className="text-xs text-slate-500" aria-live="polite" role="timer">
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
                      variant="outline"
                      className="h-[46px] sm:mt-7 rounded-xl"
                      disabled={isLoading || sendOtpLoading || confirmOtpLoading}
                      onClick={() => void handleSendEmailOtp()}
                    >
                      {sendOtpLoading && otpSent ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : 'Resend'}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      className="h-[46px] sm:mt-7 rounded-xl"
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

            <AuthInput
              label="Password *"
              id="admin-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              disabled={isLoading || sendOtpLoading || confirmOtpLoading}
              className={cn((showPasswordMismatch || fieldErrors.password) && "border-destructive")}
            />
            {fieldErrors.password ? (
              <p className="text-sm text-destructive" role="alert">{fieldErrors.password}</p>
            ) : null}

            <AuthInput
              label="Confirm Password *"
              id="admin-password-confirm"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              disabled={isLoading || sendOtpLoading || confirmOtpLoading}
              className={cn(showPasswordMismatch && "border-destructive")}
            />
            {showPasswordMismatch ? (
              <p className="text-sm text-destructive" role="alert">
                Passwords must match.
              </p>
            ) : null}

            <div className="flex items-start space-x-2 pt-2">
              <Checkbox 
                id="terms" 
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                disabled={isLoading || sendOtpLoading || confirmOtpLoading}
              />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I agree to the <Link href="/terms" className="text-primary hover:underline" target="_blank">Terms and Conditions</Link> and <Link href="/privacy" className="text-primary hover:underline" target="_blank">Privacy Policy</Link>. *
              </label>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold"
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
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            {hasFieldErrors(fieldErrors) ? (
              <div
                className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive"
                role="alert"
              >
                <p className="font-semibold">Please fix the following:</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {Object.entries(fieldErrors).map(([field, message]) => (
                    <li key={field}>{message}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <AuthInput
                  id="company-name"
                  label="Company Name *"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  required
                  disabled={isLoading}
                  className={fieldErrors.companyName ? "border-destructive" : undefined}
                />
                {fieldErrors.companyName ? <p className="text-sm text-destructive mt-1" role="alert">{fieldErrors.companyName}</p> : null}
              </div>
              <AuthInput
                id="industry"
                label="Industry *"
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
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
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="full-address" className="text-sm font-semibold text-slate-700 ml-1">Company Address (Full Address) *</Label>
              <Textarea
                id="full-address"
                value={fullAddress}
                onChange={e => setFullAddress(e.target.value)}
                required
                disabled={isLoading}
                className="rounded-xl border-slate-200 focus-visible:ring-primary/20"
              />
            </div>

            <div className="grid gap-1.5">
              <Label className="text-sm font-semibold text-slate-700 ml-1">Phone Number *</Label>
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

            <div className="pt-4 flex gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Back
              </button>
              <Button type="submit" className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isLoading ? "Submitting..." : "Submit Company Registration"}
              </Button>
            </div>
          </div>
        )}
      </form>

      <div className="mt-10 text-center text-sm text-slate-500">
        Already approved and have credentials?{' '}
        <Link href="/company-login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
          Log In
        </Link>
      </div>
    </div>
  );
}
