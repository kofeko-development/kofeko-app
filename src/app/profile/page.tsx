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
import type { WorkExperience, Education, Project } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { companyApi } from '@/lib/stage1-2-api';
import dynamic from 'next/dynamic';
import { buildE164Phone } from '@/lib/phone-e164';
import { apiRequest } from '@/lib/api-client';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase-client';

const PhoneInternationalField = dynamic(
  () => import('@/components/phone-international-field').then((m) => m.PhoneInternationalField),
  {
    ssr: false,
    loading: () => <div className="h-10 animate-pulse rounded-md bg-muted" aria-hidden />,
  }
);

export default function ProfilePage() {
  const { user, updateCurrentUser, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneCountryIso, setPhoneCountryIso] = useState('IN');
  const [phoneNationalDigits, setPhoneNationalDigits] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState('');
  const [workExperience, setWorkExperience] = useState<WorkExperience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [currentHobby, setCurrentHobby] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [sendOtpLoading, setSendOtpLoading] = useState(false);
  const [confirmOtpLoading, setConfirmOtpLoading] = useState(false);
  const [phoneVerificationToken, setPhoneVerificationToken] = useState<string | null>(null);
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

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
    if (user.phone) {
      setPhoneNationalDigits(user.phone.replace(/^\+\d+\s?/, ''));
      setVerifiedPhone(user.phone);
    }
    setCoverLetter(user.coverLetter || '');
    setSkills(user.skills || []);
    setWorkExperience(user.workExperience || [{ company: '', role: '', startDate: '', endDate: '' }]);
    setEducation(user.education || [{ institution: '', degree: '', field: '', dates: '' }]);
    setProjects(user.projects || [{ name: '', description: '', technologies: [] }]);
    setHobbies(user.hobbies || []);
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

  const currentFullPhone = buildE164Phone(phoneCountryIso, phoneNationalDigits) || '';
  const isPhoneChanged = currentFullPhone !== (user?.phone || '');
  const isPhoneVerified = !isPhoneChanged || (phoneVerificationToken && verifiedPhone === currentFullPhone);

  const handleSendPhoneOtp = async () => {
    if (!currentFullPhone) {
      toast({ title: 'Invalid phone', description: 'Enter a valid phone number.', variant: 'destructive' });
      return;
    }
    setSendOtpLoading(true);
    try {
      if (!(window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier = new RecaptchaVerifier(firebaseAuth, 'recaptcha-container', {
          size: 'invisible',
        });
      }
      const confirmation = await signInWithPhoneNumber(firebaseAuth, currentFullPhone, (window as any).recaptchaVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      setOtpCode('');
      setVerifiedPhone(null);
      setPhoneVerificationToken(null);
      toast({ title: 'Code sent', description: 'Check your phone for a 6-digit verification code.' });
    } catch (error) {
      toast({ title: 'Could not send code', description: error instanceof Error ? error.message : 'Try again in a moment.', variant: 'destructive' });
      if ((window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier.clear();
        (window as any).recaptchaVerifier = undefined;
      }
    } finally {
      setSendOtpLoading(false);
    }
  };

  const handleConfirmPhoneOtp = async () => {
    const code = otpCode.trim();
    if (!currentFullPhone || !/^\d{6}$/.test(code) || !confirmationResult) {
      toast({ title: 'Invalid code', description: 'Enter the 6-digit code.', variant: 'destructive' });
      return;
    }
    setConfirmOtpLoading(true);
    try {
      const result = await confirmationResult.confirm(code);
      const idToken = await result.user.getIdToken();

      const { phoneVerificationToken: token } = await apiRequest<{ phoneVerificationToken: string }>(
        '/auth/candidate-phone-otp/verify-firebase',
        { method: 'POST', body: { idToken } },
      );
      
      setPhoneVerificationToken(token);
      setVerifiedPhone(currentFullPhone);
      toast({ title: 'Phone verified', description: 'You can now save your changes.' });
    } catch (error) {
      toast({ title: 'Verification failed', description: error instanceof Error ? error.message : 'Check the code and try again.', variant: 'destructive' });
    } finally {
      setConfirmOtpLoading(false);
    }
  };

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

  const removeEducation = (index: number) => {
    if (education.length <= 1) return;
    setEducation(education.filter((_, i) => i !== index));
  };

  const addEducation = () => {
    setEducation([...education, { institution: '', degree: '', field: '', dates: '' }]);
  };

  const handleEducationChange = (index: number, field: keyof Education, value: string) => {
    const newEdu = [...education];
    newEdu[index] = { ...newEdu[index], [field]: value };
    setEducation(newEdu);
  };

  const removeProject = (index: number) => {
    if (projects.length <= 1) return;
    setProjects(projects.filter((_, i) => i !== index));
  };

  const addProject = () => {
    setProjects([...projects, { name: '', description: '', technologies: [] }]);
  };

  const handleProjectChange = (index: number, field: keyof Project, value: string | string[]) => {
    const newProj = [...projects];
    newProj[index] = { ...newProj[index], [field]: value as never };
    setProjects(newProj);
  };

  const handleAddHobby = () => {
    if (currentHobby && !hobbies.includes(currentHobby)) {
      setHobbies([...hobbies, currentHobby]);
      setCurrentHobby('');
    }
  };

  const handleRemoveHobby = (hobbyToRemove: string) => {
    setHobbies(hobbies.filter((h) => h !== hobbyToRemove));
  };

  const handleHobbyKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddHobby();
    }
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
        let updatedUserFields: Partial<User> = {};

        if (data.summary) {
          setCoverLetter(data.summary);
          updatedUserFields.coverLetter = data.summary;
        }
        if (Array.isArray(data.skills) && data.skills.length > 0) {
          setSkills(data.skills);
          updatedUserFields.skills = data.skills;
        }
        if (Array.isArray(data.experience) && data.experience.length > 0) {
          const mapped = data.experience.map((e: any) => ({
            company: e.company || '',
            role: e.role || '',
            startDate: e.startDate || '',
            endDate: e.endDate || '',
          }));
          setWorkExperience(mapped);
          updatedUserFields.workExperience = mapped;
        }

        if (Array.isArray(data.education) && data.education.length > 0) {
          const mapped = data.education.map((e: any) => ({
            institution: e.institution || '',
            degree: e.degree || '',
            field: e.field || '',
            dates: e.dates || '',
          }));
          setEducation(mapped);
          updatedUserFields.education = mapped;
        }
        if (Array.isArray(data.projects) && data.projects.length > 0) {
          const mapped = data.projects.map((p: any) => ({
            name: p.name || '',
            description: p.description || '',
            technologies: Array.isArray(p.technologies) ? p.technologies : typeof p.technologies === 'string' ? p.technologies.split(',').map((s: string) => s.trim()) : [],
          }));
          setProjects(mapped);
          updatedUserFields.projects = mapped;
        }
        if (Array.isArray(data.hobbies) && data.hobbies.length > 0) {
          setHobbies(data.hobbies);
          updatedUserFields.hobbies = data.hobbies;
        }

        if (user) {
          updateCurrentUser({
            ...user,
            ...updatedUserFields,
            resumeUrl: payload.data?.resumeUrl || user.resumeUrl,
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
    if (!isPhoneVerified) {
      toast({ title: 'Verify Phone', description: 'Please verify your new phone number before saving.', variant: 'destructive' });
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      if (user) {
        const fullPhone = buildE164Phone(phoneCountryIso, phoneNationalDigits) || '';
        const updatedUser = {
          ...user,
          name,
          email,
          phone: fullPhone,
          coverLetter,
          skills,
          workExperience,
          education,
          projects,
          hobbies,
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
              <PhoneInternationalField
                phoneCountryIso={phoneCountryIso}
                phoneNationalDigits={phoneNationalDigits}
                setPhoneCountryIso={(v) => { setPhoneCountryIso(v); setOtpSent(false); setPhoneVerificationToken(null); setVerifiedPhone(null); }}
                setPhoneNationalDigits={(v) => { setPhoneNationalDigits(v); setOtpSent(false); setPhoneVerificationToken(null); setVerifiedPhone(null); }}
                disabled={isSaving}
              />
              
              <div id="recaptcha-container"></div>

              {isPhoneChanged && !isPhoneVerified && (
                <div className="mt-2 flex flex-col gap-3 rounded-lg border bg-muted/30 p-3">
                  {!otpSent ? (
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm text-muted-foreground">You changed your phone number. Verify it to save.</p>
                      <Button type="button" size="sm" onClick={handleSendPhoneOtp} disabled={sendOtpLoading}>
                        {sendOtpLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Code'}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-end gap-2">
                      <div className="flex-1 space-y-1">
                        <Label htmlFor="phone-otp">Verification Code</Label>
                        <Input
                          id="phone-otp"
                          inputMode="numeric"
                          maxLength={6}
                          placeholder="000000"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          className="h-9 font-mono tracking-widest"
                          disabled={confirmOtpLoading}
                        />
                      </div>
                      <Button type="button" size="sm" className="h-9" onClick={handleConfirmPhoneOtp} disabled={confirmOtpLoading || otpCode.length !== 6}>
                        {confirmOtpLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm'}
                      </Button>
                    </div>
                  )}
                </div>
              )}
              {isPhoneChanged && isPhoneVerified && (
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mt-1">✓ Phone number verified</p>
              )}
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

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Education</CardTitle>
              <CardDescription>Detail your educational background.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {education.map((edu, index) => (
                <div key={index} className="relative space-y-4 rounded-lg border p-4">
                  {education.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 h-7 w-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => removeEducation(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`edu-inst-${index}`}>Institution</Label>
                      <Input id={`edu-inst-${index}`} value={edu.institution} onChange={(e) => handleEducationChange(index, 'institution', e.target.value)} placeholder="University or School" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`edu-deg-${index}`}>Degree</Label>
                      <Input id={`edu-deg-${index}`} value={edu.degree} onChange={(e) => handleEducationChange(index, 'degree', e.target.value)} placeholder="e.g., Bachelor of Science" />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`edu-field-${index}`}>Field of Study</Label>
                      <Input id={`edu-field-${index}`} value={edu.field} onChange={(e) => handleEducationChange(index, 'field', e.target.value)} placeholder="e.g., Computer Science" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`edu-dates-${index}`}>Dates / Graduation Year</Label>
                      <Input id={`edu-dates-${index}`} value={edu.dates} onChange={(e) => handleEducationChange(index, 'dates', e.target.value)} placeholder="e.g., 2018 - 2022" />
                    </div>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addEducation} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Education
              </Button>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Projects</CardTitle>
              <CardDescription>Highlight your notable projects.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {projects.map((proj, index) => (
                <div key={index} className="relative space-y-4 rounded-lg border p-4">
                  {projects.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 h-7 w-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => removeProject(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor={`proj-name-${index}`}>Project Name</Label>
                      <Input id={`proj-name-${index}`} value={proj.name} onChange={(e) => handleProjectChange(index, 'name', e.target.value)} placeholder="Awesome Application" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor={`proj-desc-${index}`}>Description</Label>
                      <Textarea id={`proj-desc-${index}`} value={proj.description} onChange={(e) => handleProjectChange(index, 'description', e.target.value)} placeholder="What did you build?" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor={`proj-tech-${index}`}>Technologies Used (comma separated)</Label>
                      <Input id={`proj-tech-${index}`} value={proj.technologies.join(', ')} onChange={(e) => handleProjectChange(index, 'technologies', e.target.value.split(',').map(t => t.trim()))} placeholder="React, Node.js, PostgreSQL" />
                    </div>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addProject} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Project
              </Button>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Hobbies & Interests</CardTitle>
              <CardDescription>What do you enjoy doing outside of work?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Input value={currentHobby} onChange={(e) => setCurrentHobby(e.target.value)} onKeyDown={handleHobbyKeyDown} placeholder="e.g., Photography, Chess..." />
                <Button type="button" onClick={handleAddHobby}>
                  Add Hobby
                </Button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {hobbies.map((hobby, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1.5 px-3 py-1">
                    {hobby}
                    <button type="button" onClick={() => handleRemoveHobby(hobby)} className="rounded-full p-0.5 hover:bg-muted-foreground/20">
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove {hobby}</span>
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

