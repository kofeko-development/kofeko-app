
"use client"

import Link from "next/link"
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

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
  const [officialCompanyAddress, setOfficialCompanyAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await registerAdmin({
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
        officialCompanyAddress,
        phoneNumber: phoneNumber || undefined,
        companyLogo,
        shortDescription,
        linkedinUrl: linkedinUrl || undefined,
        twitterUrl: twitterUrl || undefined,
        termsAccepted: termsAccepted as true,
        contactName,
        contactEmail,
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
    <Card className="mx-auto max-w-4xl w-full">
      <CardHeader>
        <CardTitle className="text-xl">Company Registration</CardTitle>
        <CardDescription>
          Submit your company details for super admin approval.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignup} className="grid gap-4">
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

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" value={country} onChange={e => setCountry(e.target.value)} required disabled={isLoading} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" value={state} onChange={e => setState(e.target.value)} required disabled={isLoading} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={city} onChange={e => setCity(e.target.value)} required disabled={isLoading} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="zip-code">ZIP Code</Label>
              <Input id="zip-code" value={zipCode} onChange={e => setZipCode(e.target.value)} required disabled={isLoading} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="full-address">Company Address (Full Address)</Label>
            <Textarea id="full-address" value={fullAddress} onChange={e => setFullAddress(e.target.value)} required disabled={isLoading} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="company-size">Company Size</Label>
              <Input id="company-size" value={companySize} onChange={e => setCompanySize(e.target.value)} required disabled={isLoading} placeholder="e.g. 50-100" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company-type">Company Type</Label>
              <select
                id="company-type"
                value={companyType}
                onChange={(e) => setCompanyType(e.target.value as 'startup' | 'enterprise' | 'agency' | 'non_profit')}
                className="h-10 rounded-md border bg-background px-3 text-sm"
                required
                disabled={isLoading}
              >
                <option value="startup">Startup</option>
                <option value="enterprise">Enterprise</option>
                <option value="agency">Agency</option>
                <option value="non_profit">Non-profit</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="founded-year">Founded Year</Label>
              <Input id="founded-year" type="number" value={foundedYear} onChange={e => setFoundedYear(e.target.value)} required disabled={isLoading} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone-number">Phone Number (Optional)</Label>
              <Input id="phone-number" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} disabled={isLoading} />
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
            <Label htmlFor="official-company-address">Official Company Address</Label>
            <Textarea id="official-company-address" value={officialCompanyAddress} onChange={e => setOfficialCompanyAddress(e.target.value)} required disabled={isLoading} />
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

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="contact-name">Contact Person Name</Label>
              <Input id="contact-name" value={contactName} onChange={e => setContactName(e.target.value)} required disabled={isLoading} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contact-email">Contact Email</Label>
              <Input id="contact-email" type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} required disabled={isLoading} />
            </div>
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
