
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
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { COMPANY_SIZE_OPTIONS } from "@/lib/company-size";
import { buildE164Phone } from "@/lib/phone-e164";
import { cn } from "@/lib/utils";

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

const normalizeUrlInput = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('https:/') && !trimmed.startsWith('https://')) {
    return trimmed.replace('https:/', 'https://');
  }
  if (trimmed.startsWith('http:/') && !trimmed.startsWith('http://')) {
    return trimmed.replace('http:/', 'http://');
  }
  return trimmed;
};

export default function SignupPage() {
  const { registerAdmin } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

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

  const passwordsMatch = password === confirmPassword;
  const showPasswordMismatch =
    confirmPassword.length > 0 && password.length > 0 && !passwordsMatch;

  const validateStep1 = (): boolean => {
    const emailOk = adminEmail.trim().length > 0;
    if (!emailOk) {
      toast({ title: 'Email required', description: 'Enter the email you will use to log in.', variant: 'destructive' });
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

    try {
      const phoneNumber = buildE164Phone(phoneCountryIso, phoneNationalDigits);
      if (!phoneNumber) {
        toast({
          title: "Phone required",
          description: "Select a country code and enter your phone number (digits only).",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      await registerAdmin({
        adminEmail: adminEmail.trim(),
        password,
        companyName,
        companyAddress: {
          country,
          state,
          city,
          zipCode,
          fullAddress,
        },
        industry,
        companySize,
        companyType,
        foundedYear: Number(foundedYear),
        companyWebsite,
        officialCompanyAddress: fullAddress.trim(),
        phoneNumber,
        companyLogo,
        shortDescription,
        linkedinUrl: linkedinUrl || undefined,
        twitterUrl: twitterUrl || undefined,
        termsAccepted: termsAccepted as true,
      });

      toast({
        title: "Registration Submitted",
        description: "Your company registration is pending super admin approval.",
      });

      router.push('/signup-success');
    } catch (error) {
      toast({
        title: 'Signup Failed',
        description: error instanceof Error ? error.message : 'Failed to submit registration request',
        variant: 'destructive',
      });
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
          {step === 1 ? (
            <div className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="admin-email">Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11"
                />
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
                      disabled={isLoading}
                      className={cn("h-11 pr-10", showPasswordMismatch && "border-destructive focus-visible:ring-destructive")}
                    />
                    <button
                      type="button"
                      className="absolute right-0 top-0 flex h-11 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                      disabled={isLoading}
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
                      disabled={isLoading}
                      className={cn("h-11 pr-10", showPasswordMismatch && "border-destructive focus-visible:ring-destructive")}
                    />
                    <button
                      type="button"
                      className="absolute right-0 top-0 flex h-11 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                      aria-pressed={showConfirmPassword}
                      disabled={isLoading}
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
              <Button
                type="submit"
                className="h-11 w-full"
                disabled={isLoading || showPasswordMismatch}
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
              <Input id="company-name" value={companyName} onChange={e => setCompanyName(e.target.value)} required disabled={isLoading} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="industry">Industry</Label>
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
          />

          <div className="grid gap-2">
            <Label htmlFor="full-address">Company Address (Full Address)</Label>
            <Textarea id="full-address" value={fullAddress} onChange={e => setFullAddress(e.target.value)} required disabled={isLoading} />
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
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="company-type" className="mb-0">
                Company Type
              </Label>
              <select
                id="company-type"
                value={companyType}
                onChange={(e) => setCompanyType(e.target.value as 'startup' | 'enterprise' | 'agency' | 'non_profit')}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
                disabled={isLoading}
              >
                <option value="startup">Startup</option>
                <option value="enterprise">Enterprise</option>
                <option value="agency">Agency</option>
                <option value="non_profit">Non-profit</option>
              </select>
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
              />
            </div>
            <PhoneInternationalField
              className="min-w-0"
              phoneCountryIso={phoneCountryIso}
              phoneNationalDigits={phoneNationalDigits}
              setPhoneCountryIso={setPhoneCountryIso}
              setPhoneNationalDigits={setPhoneNationalDigits}
              addressCountryName={country}
              disabled={isLoading}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="company-website">Company Website</Label>
              <Input
                id="company-website"
                type="url"
                value={companyWebsite}
                onChange={e => setCompanyWebsite(e.target.value)}
                onBlur={() => setCompanyWebsite((prev) => normalizeUrlInput(prev))}
                placeholder="https://example.com"
                required
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company-logo">Company Logo URL</Label>
              <Input
                id="company-logo"
                type="url"
                value={companyLogo}
                onChange={e => setCompanyLogo(e.target.value)}
                onBlur={() => setCompanyLogo((prev) => normalizeUrlInput(prev))}
                placeholder="https://example.com/logo.png"
                required
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="linkedin-url">LinkedIn URL (Optional)</Label>
              <Input
                id="linkedin-url"
                type="url"
                value={linkedinUrl}
                onChange={e => setLinkedinUrl(e.target.value)}
                onBlur={() => setLinkedinUrl((prev) => normalizeUrlInput(prev))}
                placeholder="https://linkedin.com/company/..."
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="twitter-url">Twitter/X URL (Optional)</Label>
              <Input
                id="twitter-url"
                type="url"
                value={twitterUrl}
                onChange={e => setTwitterUrl(e.target.value)}
                onBlur={() => setTwitterUrl((prev) => normalizeUrlInput(prev))}
                placeholder="https://x.com/..."
                disabled={isLoading}
              />
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
            />
            <p className="text-xs text-muted-foreground">
              Minimum 20 characters ({shortDescription.trim().length}/20)
            </p>
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
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
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
