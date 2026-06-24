
'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  Save,
  Pencil,
  Globe,
  Building2,
  Users,
  MapPin,
  Phone,
  Linkedin,
  Twitter,
  Building,
  Info,
  AlignLeft,
  Calendar
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { companyApi, CompanyProfilePayload } from '@/lib/stage1-2-api';
import { CompanyProfileSkeleton } from '@/components/loading/company-profile-skeleton';
import { resolveUploadUrl } from '@/lib/storage-url';
import { COMPANY_SIZE_OPTIONS } from '@/lib/company-size';
import { useCompanyProfile, useInvalidateCompanyProfile } from '@/hooks/use-company';

const COMPANY_TYPE_OPTIONS = [
  { value: 'startup', label: 'Startup' },
  { value: 'enterprise', label: 'Enterprise' },
  { value: 'agency', label: 'Agency' },
  { value: 'non_profit', label: 'Non-profit' },
];

type FormState = CompanyProfilePayload;

const defaultFormState: FormState = {
  companyName: '',
  industry: '',
  companySize: '11-50',
  companyType: 'startup',
  foundedYear: new Date().getFullYear(),
  companyWebsite: '',
  officialCompanyAddress: '',
  phoneNumber: '',
  companyLogo: '',
  shortDescription: '',
  linkedinUrl: '',
  twitterUrl: '',
  termsAccepted: true,
};

const fieldInputClass =
  'h-12 rounded-xl border border-input bg-background px-4 font-medium shadow-sm focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60';

const fieldTextareaClass =
  'min-h-[120px] rounded-xl border border-input bg-background p-4 text-base shadow-sm focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 resize-none disabled:cursor-not-allowed disabled:opacity-60';

const sidebarFieldClass =
  'rounded-lg border border-input bg-background px-3 text-sm shadow-sm focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60';

const selectTriggerClass =
  'h-12 rounded-xl border border-input bg-background px-4 font-medium shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60';

export default function CompanyProfilePage() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const invalidateCompanyProfile = useInvalidateCompanyProfile();

  const [form, setForm] = useState<FormState>(defaultFormState);
  const [savedForm, setSavedForm] = useState<FormState | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasCompanyProfile, setHasCompanyProfile] = useState(false);
  const [hasHydratedForm, setHasHydratedForm] = useState(false);

  const isStaffUser = user?.role === 'recruiter' || user?.role === 'operator';
  const {
    data: companyProfile,
    isLoading: isLoadingProfile,
    isError: profileError,
    error: profileLoadError,
  } = useCompanyProfile({ enabled: !loading && isStaffUser });

  const canEdit = useMemo(
    () => Boolean(user?.permissions?.includes('company:update')),
    [user?.permissions],
  );

  useEffect(() => {
    if (!isStaffUser) {
      setHasHydratedForm(true);
      return;
    }
    if (isLoadingProfile) return;

    if (companyProfile) {
      const loaded: FormState = {
        companyName: companyProfile.company.companyName ?? '',
        industry: companyProfile.company.industry ?? '',
        companySize: companyProfile.company.companySize,
        companyType: companyProfile.company.companyType,
        foundedYear: companyProfile.company.foundedYear ?? new Date().getFullYear(),
        companyWebsite: companyProfile.company.companyWebsite ?? '',
        officialCompanyAddress: companyProfile.company.officialCompanyAddress ?? '',
        phoneNumber: companyProfile.company.phoneNumber ?? '',
        companyLogo: companyProfile.company.companyLogo ?? '',
        shortDescription: companyProfile.company.shortDescription ?? '',
        linkedinUrl: companyProfile.company.linkedinUrl ?? '',
        twitterUrl: companyProfile.company.twitterUrl ?? '',
        termsAccepted: true,
      };
      setForm(loaded);
      setSavedForm(loaded);
      setHasCompanyProfile(true);
    } else {
      setHasCompanyProfile(false);
    }
    setHasHydratedForm(true);
  }, [companyProfile, isLoadingProfile, isStaffUser]);

  useEffect(() => {
    if (!profileError) return;
    toast({
      title: 'Unable to load company profile',
      description: profileLoadError instanceof Error ? profileLoadError.message : 'Please refresh and try again.',
      variant: 'destructive',
    });
  }, [profileError, profileLoadError, toast]);

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const hasChanges = useMemo(() => {
    if (!savedForm) return !hasCompanyProfile;
    return JSON.stringify(form) !== JSON.stringify(savedForm);
  }, [form, savedForm, hasCompanyProfile]);

  const handleSaveChanges = async (e: FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    if (form.shortDescription.trim().length < 20) {
      toast({
        title: 'Description too short',
        description: 'Short description must be at least 20 characters.',
        variant: 'destructive',
      });
      return;
    }
    if (!form.termsAccepted) {
      toast({
        title: 'Terms required',
        description: 'Please accept the terms before saving.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const payload: CompanyProfilePayload = {
        ...form,
        phoneNumber: form.phoneNumber || undefined,
        linkedinUrl: form.linkedinUrl || undefined,
        twitterUrl: form.twitterUrl || undefined,
      };

      if (hasCompanyProfile) {
        await companyApi.update(payload);
      } else {
        await companyApi.create(payload);
        setHasCompanyProfile(true);
      }
      setSavedForm({ ...form });
      await invalidateCompanyProfile();
      toast({
        title: 'Company Profile Updated',
        description: 'Your changes have been saved successfully.',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save profile.';
      if (message.toLowerCase().includes('already exists')) {
        setHasCompanyProfile(true);
        toast({
          title: 'Profile already exists',
          description: 'Switched to update mode. Please click save again.',
        });
      } else {
        toast({ title: 'Save failed', description: message, variant: 'destructive' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !hasHydratedForm || !user) {
    return <CompanyProfileSkeleton />;
  }
  if (user.role !== 'recruiter' && user.role !== 'operator') {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-24">
      {/* Profile Header */}
      <div className="relative group">
        <div className="h-32 w-full bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl border border-primary/10" />
        <div className="absolute -bottom-6 left-8 flex items-end gap-6">
          <div className="relative h-24 w-24 rounded-2xl border-4 border-background bg-white shadow-xl overflow-hidden group/logo">
            {form.companyLogo ? (
              <img src={resolveUploadUrl(form.companyLogo)} alt="Logo" className="h-full w-full object-contain p-2" />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-muted">
                <Building2 className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
            {canEdit && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/logo:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <Pencil className="h-6 w-6 text-white" />
              </div>
            )}
          </div>
          <div className="pb-2">
            <h1 className="text-3xl font-bold font-headline">{form.companyName || 'Your Company'}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {form.companyWebsite && (
                <a href={form.companyWebsite} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
                  <Globe className="h-3.5 w-3.5" /> {form.companyWebsite.replace(/^https?:\/\//, '')}
                </a>
              )}
              {form.industry && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" /> {form.industry}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveChanges} className="mt-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-none bg-transparent">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" /> About Company
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0 space-y-6">
                <div className="space-y-2 group">
                  <Label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <AlignLeft className="h-3.5 w-3.5" /> Short Description
                    <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Label>
                  <Textarea
                    value={form.shortDescription}
                    onChange={e => updateField('shortDescription', e.target.value)}
                    className={fieldTextareaClass}
                    placeholder="Describe your company culture, mission, and what you do..."
                    disabled={!canEdit}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-8 pt-4">
                  <div className="space-y-4">
                    <div className="space-y-2 group">
                      <Label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <Building className="h-3.5 w-3.5" /> Company Name
                        <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Label>
                      <Input
                        value={form.companyName}
                        onChange={(e) => updateField('companyName', e.target.value)}
                        className={fieldInputClass}
                        disabled={!canEdit}
                      />
                    </div>
                    <div className="space-y-2 group">
                      <Label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <Building2 className="h-3.5 w-3.5" /> Industry
                        <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Label>
                      <Input
                        value={form.industry}
                        onChange={(e) => updateField('industry', e.target.value)}
                        className={fieldInputClass}
                        disabled={!canEdit}
                      />
                    </div>
                    <div className="space-y-2 group">
                      <Label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <Calendar className="h-3.5 w-3.5" /> Founded Year
                        <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Label>
                      <Input
                        type="number"
                        value={form.foundedYear}
                        onChange={(e) => updateField('foundedYear', Number(e.target.value))}
                        className={fieldInputClass}
                        disabled={!canEdit}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2 group">
                      <Label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <Users className="h-3.5 w-3.5" /> Company Size
                        <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Label>
                      <Select
                        value={form.companySize}
                        onValueChange={(v) => updateField('companySize', v as FormState['companySize'])}
                        disabled={!canEdit}
                      >
                        <SelectTrigger className={selectTriggerClass}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COMPANY_SIZE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 group">
                      <Label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <Building className="h-3.5 w-3.5" /> Company Type
                        <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Label>
                      <Select
                        value={form.companyType}
                        onValueChange={(v) => updateField('companyType', v as FormState['companyType'])}
                        disabled={!canEdit}
                      >
                        <SelectTrigger className={selectTriggerClass}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COMPANY_TYPE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 group">
                      <Label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <Phone className="h-3.5 w-3.5" /> Phone Number
                        <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Label>
                      <Input
                        value={form.phoneNumber ?? ''}
                        onChange={(e) => updateField('phoneNumber', e.target.value)}
                        className={fieldInputClass}
                        placeholder="+1 (555) 000-0000"
                        disabled={!canEdit}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card className="rounded-2xl border bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="h-4 w-4" /> Online presence
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2 group">
                  <Label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <Globe className="h-3.5 w-3.5" /> Website
                    <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Label>
                  <Input
                    value={form.companyWebsite}
                    onChange={(e) => updateField('companyWebsite', e.target.value)}
                    className={`${sidebarFieldClass} h-10`}
                    disabled={!canEdit}
                  />
                </div>
                <div className="space-y-2 group">
                  <Label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <MapPin className="h-3.5 w-3.5" /> Address
                    <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Label>
                  <Textarea
                    value={form.officialCompanyAddress}
                    onChange={(e) => updateField('officialCompanyAddress', e.target.value)}
                    className={`${sidebarFieldClass} min-h-[80px] resize-none`}
                    disabled={!canEdit}
                  />
                </div>
                <div className="pt-4 space-y-4">
                  <div className="space-y-2 group">
                    <Label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                    </Label>
                    <Input
                      value={form.linkedinUrl ?? ''}
                      onChange={(e) => updateField('linkedinUrl', e.target.value)}
                      className={`${sidebarFieldClass} h-10`}
                      disabled={!canEdit}
                    />
                  </div>
                  <div className="space-y-2 group">
                    <Label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <Twitter className="h-3.5 w-3.5" /> Twitter
                    </Label>
                    <Input
                      value={form.twitterUrl ?? ''}
                      onChange={(e) => updateField('twitterUrl', e.target.value)}
                      className={`${sidebarFieldClass} h-10`}
                      disabled={!canEdit}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {canEdit && hasChanges && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <Button type="submit" disabled={isSaving} size="lg" className="shadow-2xl shadow-primary/40 rounded-full px-12 h-16 bg-primary hover:bg-primary/90 text-primary-foreground border-4 border-background text-lg font-bold">
              {isSaving ? (
                <>
                  <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                  Saving changes...
                </>
              ) : (
                <>
                  <Save className="mr-3 h-6 w-6" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
