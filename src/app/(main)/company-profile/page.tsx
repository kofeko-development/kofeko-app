
'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { companyApi, CompanyProfilePayload } from '@/lib/stage1-2-api';

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

export default function CompanyProfilePage() {
    const { user, loading } = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    const [form, setForm] = useState<FormState>(defaultFormState);
    const [isHydrating, setIsHydrating] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [hasCompanyProfile, setHasCompanyProfile] = useState(false);

    const canEdit = useMemo(
      () => Boolean(user?.permissions?.includes('company:update')),
      [user?.permissions],
    );

    useEffect(() => {
        if (!user) return;
        if (user.role !== 'recruiter') {
          setIsHydrating(false);
          return;
        }

        const loadCompany = async () => {
          try {
            const profile = await companyApi.get();
            setForm({
              companyName: profile.company.companyName ?? '',
              industry: profile.company.industry ?? '',
              companySize: profile.company.companySize,
              companyType: profile.company.companyType,
              foundedYear: profile.company.foundedYear ?? new Date().getFullYear(),
              companyWebsite: profile.company.companyWebsite ?? '',
              officialCompanyAddress: profile.company.officialCompanyAddress ?? '',
              phoneNumber: profile.company.phoneNumber ?? '',
              companyLogo: profile.company.companyLogo ?? '',
              shortDescription: profile.company.shortDescription ?? '',
              linkedinUrl: profile.company.linkedinUrl ?? '',
              twitterUrl: profile.company.twitterUrl ?? '',
              termsAccepted: true,
            });
            setHasCompanyProfile(true);
          } catch (error) {
            if (error instanceof Error && error.message.toLowerCase().includes('not found')) {
              setHasCompanyProfile(false);
              return;
            }
            toast({
              title: 'Unable to load company profile',
              description: error instanceof Error ? error.message : 'Please refresh and try again.',
              variant: 'destructive',
            });
          } finally {
            setIsHydrating(false);
          }
        };

        void loadCompany();
    }, [user, toast]);

    const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    };

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

    if (loading || isHydrating || !user) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
     if (user.role !== 'recruiter') {
        router.push('/dashboard');
        return null;
    }
    
    return (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold font-headline">Company Profile</h1>
                <p className="text-muted-foreground">
                    {canEdit ? "Manage your company's public information." : "Viewing your company's public profile."}
                </p>
            </div>

            <form onSubmit={handleSaveChanges}>
                <Card>
                    <CardHeader>
                        <CardTitle>Company Details</CardTitle>
                        <CardDescription>
                          {hasCompanyProfile ? 'Update your saved company profile details.' : 'Create your company profile for your tenant.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="companyName">Company Name</Label>
                              <Input id="companyName" value={form.companyName} onChange={(e) => updateField('companyName', e.target.value)} disabled={!canEdit} required />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="industry">Industry</Label>
                              <Input id="industry" value={form.industry} onChange={(e) => updateField('industry', e.target.value)} disabled={!canEdit} required />
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="companySize">Company Size</Label>
                            <Input id="companySize" value={form.companySize} onChange={(e) => updateField('companySize', e.target.value as FormState['companySize'])} disabled={!canEdit} required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="companyType">Company Type</Label>
                            <Input id="companyType" value={form.companyType} onChange={(e) => updateField('companyType', e.target.value as FormState['companyType'])} disabled={!canEdit} required />
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="foundedYear">Founded Year</Label>
                            <Input id="foundedYear" type="number" value={form.foundedYear} onChange={(e) => updateField('foundedYear', Number(e.target.value))} disabled={!canEdit} required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phoneNumber">Phone Number</Label>
                            <Input id="phoneNumber" value={form.phoneNumber ?? ''} onChange={(e) => updateField('phoneNumber', e.target.value)} disabled={!canEdit} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="companyWebsite">Company Website</Label>
                          <Input id="companyWebsite" value={form.companyWebsite} onChange={(e) => updateField('companyWebsite', e.target.value)} disabled={!canEdit} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="officialCompanyAddress">Official Company Address</Label>
                          <Input id="officialCompanyAddress" value={form.officialCompanyAddress} onChange={(e) => updateField('officialCompanyAddress', e.target.value)} disabled={!canEdit} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="companyLogo">Company Logo URL</Label>
                          <Input id="companyLogo" value={form.companyLogo} onChange={(e) => updateField('companyLogo', e.target.value)} disabled={!canEdit} required />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                            <Input id="linkedinUrl" value={form.linkedinUrl ?? ''} onChange={(e) => updateField('linkedinUrl', e.target.value)} disabled={!canEdit} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="twitterUrl">Twitter URL</Label>
                            <Input id="twitterUrl" value={form.twitterUrl ?? ''} onChange={(e) => updateField('twitterUrl', e.target.value)} disabled={!canEdit} />
                          </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="shortDescription">Short Description</Label>
                            <Textarea id="shortDescription" value={form.shortDescription} onChange={e => updateField('shortDescription', e.target.value)} className="min-h-[120px]" disabled={!canEdit} required />
                        </div>
                    </CardContent>
                </Card>

                {canEdit && (
                    <div className="mt-6 flex justify-end">
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                            'Save Changes'
                            )}
                        </Button>
                    </div>
                )}
            </form>
        </div>
    );
}
