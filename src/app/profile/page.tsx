'use client';

import { useMemo, useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import type { WorkExperience } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { companyApi } from '@/lib/stage1-2-api';

export default function ProfilePage() {
  const { user, updateCurrentUser, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState('');
  const [workExperience, setWorkExperience] = useState<WorkExperience[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  const isNewUser = user && !user.resumeUrl;

  const canReadCompany = useMemo(() => Boolean(user?.permissions?.includes('company:read')), [user?.permissions]);
  const canEditCompany = useMemo(() => Boolean(user?.permissions?.includes('company:update')), [user?.permissions]);

  const [companyLoading, setCompanyLoading] = useState(false);
  const [companyProfile, setCompanyProfile] = useState<null | {
    companyName: string;
    industry: string;
    companySize: string;
    companyType: string;
    foundedYear: number;
    companyWebsite: string;
    officialCompanyAddress: string;
    phoneNumber?: string;
    companyLogo: string;
    shortDescription: string;
    linkedinUrl?: string;
    twitterUrl?: string;
  }>(null);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone || '');
    setCoverLetter(user.coverLetter || '');
    setSkills(user.skills || []);
    setWorkExperience(user.workExperience || [{ company: '', role: '', startDate: '', endDate: '' }]);
    if (user.role === 'recruiter') {
      setLinkedinUrl(user.linkedinProfileUrl || '');
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (user.role === 'candidate') return;
    if (!canReadCompany) return;

    let cancelled = false;
    setCompanyLoading(true);
    companyApi
      .get()
      .then((res) => {
        if (cancelled) return;
        setCompanyProfile({
          companyName: res.company.companyName ?? '',
          industry: res.company.industry ?? '',
          companySize: res.company.companySize,
          companyType: res.company.companyType,
          foundedYear: res.company.foundedYear ?? new Date().getFullYear(),
          companyWebsite: res.company.companyWebsite ?? '',
          officialCompanyAddress: res.company.officialCompanyAddress ?? '',
          phoneNumber: res.company.phoneNumber ?? undefined,
          companyLogo: res.company.companyLogo ?? '',
          shortDescription: res.company.shortDescription ?? '',
          linkedinUrl: res.company.linkedinUrl ?? undefined,
          twitterUrl: res.company.twitterUrl ?? undefined,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        toast({
          title: 'Unable to load company profile',
          description: err instanceof Error ? err.message : 'Please refresh and try again.',
          variant: 'destructive',
        });
      })
      .finally(() => {
        if (!cancelled) setCompanyLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, canReadCompany, toast]);

  const handleExperienceChange = (index: number, field: keyof WorkExperience, value: string) => {
    const newExperience = [...workExperience];
    newExperience[index][field] = value;
    setWorkExperience(newExperience);
  };

  const addExperience = () => {
    setWorkExperience([...workExperience, { company: '', role: '', startDate: '', endDate: '' }]);
  };

  const removeExperience = (index: number) => {
    if (workExperience.length <= 1) return;
    const newExperience = workExperience.filter((_, i) => i !== index);
    setWorkExperience(newExperience);
  };

  const handleAddSkill = () => {
    if (currentSkill && !skills.includes(currentSkill)) {
      setSkills([...skills, currentSkill]);
      setCurrentSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleResumeUpload = async (file: File | null) => {
    setResumeFile(file);
    if (!file) return;

    setIsParsing(true);
    toast({
      title: 'Parsing resume...',
      description: 'Extracting details using AI to auto-fill your profile.',
    });

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const token = localStorage.getItem('kofeko_access_token');
      const res = await fetch(
        (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api/v1') + '/portal/parse-resume',
        {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        }
      );

      if (!res.ok) {
        throw new Error('Failed to parse resume');
      }

      const payload = await res.json();
      const data = payload.data?.parsed;

      if (data) {
        if (data.summary) setCoverLetter(data.summary);
        if (Array.isArray(data.skills) && data.skills.length > 0) {
          setSkills(data.skills);
        }
        if (Array.isArray(data.experience) && data.experience.length > 0) {
          const mapped = data.experience.map((e: any) => ({
            company: e.company || '',
            role: e.role || '',
            startDate: e.startDate || '',
            endDate: e.endDate || '',
          }));
          setWorkExperience(mapped);
        }

        if (user && payload.data?.resumeUrl) {
          updateCurrentUser({
            ...user,
            resumeUrl: payload.data.resumeUrl,
          });
        }

        toast({
          title: 'Resume extracted successfully!',
          description: 'We pre-filled your summary, skills, and work experience.',
        });
      }
    } catch (err) {
      toast({
        title: 'Parsing incomplete',
        description: 'Could not auto-extract fields. Please fill them in manually.',
        variant: 'destructive',
      });
    } finally {
      setIsParsing(false);
    }
  };

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      if (user) {
        const updatedUser = {
          ...user,
          name,
          email,
          phone,
          coverLetter,
          skills,
          workExperience,
          linkedinProfileUrl: user.role === 'recruiter' ? linkedinUrl : user.linkedinProfileUrl,
          resumeUrl: resumeFile ? resumeFile.name : user.resumeUrl,
        };
        updateCurrentUser(updatedUser);
      }

      toast({
        title: 'Profile Updated',
        description: 'Your changes have been saved successfully.',
      });
      setIsSaving(false);

      if (isNewUser && user?.role === 'candidate') {
        router.push('/find-jobs');
      } else {
        router.push('/dashboard');
      }
    }, 1500);
  };

  if (loading || !user) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Company users: show company profile only (no sidebar because this route is outside (main)).
  if (user.role !== 'candidate') {
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Company Profile</h1>
          <p className="text-muted-foreground">{canEditCompany ? 'View and update your company details.' : 'View your company details.'}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Company details</CardTitle>
            <CardDescription>The information entered during company signup.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {companyLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading company profile…
              </div>
            ) : !canReadCompany ? (
              <p className="text-sm text-muted-foreground">You don&apos;t have permission to view company details.</p>
            ) : !companyProfile ? (
              <p className="text-sm text-muted-foreground">No company profile found for this tenant.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Company name</Label>
                  <Input value={companyProfile.companyName} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Input value={companyProfile.industry} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Company size</Label>
                  <Input value={companyProfile.companySize} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Company type</Label>
                  <Input value={companyProfile.companyType} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Founded year</Label>
                  <Input value={String(companyProfile.foundedYear)} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Phone number</Label>
                  <Input value={companyProfile.phoneNumber ?? ''} readOnly />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Website</Label>
                  <Input value={companyProfile.companyWebsite} readOnly />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Official address</Label>
                  <Input value={companyProfile.officialCompanyAddress} readOnly />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Company logo URL</Label>
                  <Input value={companyProfile.companyLogo} readOnly />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Short description</Label>
                  <Textarea value={companyProfile.shortDescription} readOnly className="min-h-[120px]" />
                </div>
                <div className="space-y-2">
                  <Label>LinkedIn</Label>
                  <Input value={companyProfile.linkedinUrl ?? ''} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Twitter</Label>
                  <Input value={companyProfile.twitterUrl ?? ''} readOnly />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Candidate: keep existing personal profile form.
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">{isNewUser ? 'Complete Your Profile' : 'My Profile'}</h1>
        <p className="text-muted-foreground">
          {isNewUser ? 'Please fill out your profile to start applying for jobs.' : 'Manage your personal information and settings.'}
        </p>
      </div>

      <form onSubmit={handleSaveChanges}>
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Contact Number</Label>
              <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(123) 456-7890" />
            </div>
          </CardContent>
        </Card>

        <>
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Professional Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="resume">Resume</Label>
                  <Input
                    id="resume"
                    type="file"
                    onChange={(e) => handleResumeUpload(e.target.files ? e.target.files[0] : null)}
                    className="file:font-semibold file:text-primary"
                    required={Boolean(isNewUser)}
                    disabled={isParsing}
                  />
                  {isParsing && (
                    <div className="flex items-center gap-2 text-sm text-primary animate-pulse">
                      <Loader2 className="h-4 w-4 animate-spin" /> AI is reading your resume and filling out fields below...
                    </div>
                  )}
                  {user.resumeUrl && !resumeFile && <p className="text-sm text-muted-foreground">Current file: {user.resumeUrl}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cover-letter">Cover Letter</Label>
                  <Textarea id="cover-letter" placeholder="Tell us about yourself..." value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} className="min-h-[150px]" />
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Work Experience</CardTitle>
                <CardDescription>Detail your past work experience.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {workExperience.map((exp, index) => (
                  <div key={index} className="relative space-y-4 rounded-lg border p-4">
                    {workExperience.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 h-7 w-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => removeExperience(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`company-${index}`}>Company</Label>
                        <Input id={`company-${index}`} value={exp.company} onChange={(e) => handleExperienceChange(index, 'company', e.target.value)} placeholder="Company Name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`role-${index}`}>Role</Label>
                        <Input id={`role-${index}`} value={exp.role} onChange={(e) => handleExperienceChange(index, 'role', e.target.value)} placeholder="e.g., Software Engineer" />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`start-date-${index}`}>Start Date</Label>
                        <Input id={`start-date-${index}`} type="month" value={exp.startDate} onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`end-date-${index}`}>End Date</Label>
                        <Input id={`end-date-${index}`} type="month" value={exp.endDate} onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addExperience} className="w-full">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Experience
                </Button>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Skills</CardTitle>
                <CardDescription>Enter a skill and press Enter or comma to add it.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Input value={currentSkill} onChange={(e) => setCurrentSkill(e.target.value)} onKeyDown={handleSkillKeyDown} placeholder="e.g., React, TypeScript..." />
                  <Button type="button" onClick={handleAddSkill}>
                    Add Skill
                  </Button>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1.5 px-3 py-1">
                      {skill}
                      <button type="button" onClick={() => handleRemoveSkill(skill)} className="rounded-full p-0.5 hover:bg-muted-foreground/20">
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove {skill}</span>
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
        </>

        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : isNewUser ? (
              'Save and Find Jobs'
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

