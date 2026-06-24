'use client';

import { useMemo, useState, useEffect } from 'react';
import { useAuth, BackendUser, mapBackendUser } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Trash2, X, Pencil, Check, Save, Upload, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import type { WorkExperience, Education, Project, User } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import dynamic from 'next/dynamic';
import { composeE164Phone, validateNationalPhone } from '@/lib/phone-e164';
import { apiRequest, getAccessToken } from '@/lib/api-client';
import { ProfileSkeleton } from '@/components/loading/profile-skeleton';
import Script from 'next/script';
import { Country } from 'country-state-city';

const COMPANY_TYPE_OPTIONS = [
  { value: 'startup', label: 'Startup' },
  { value: 'enterprise', label: 'Enterprise' },
  { value: 'agency', label: 'Agency' },
  { value: 'non_profit', label: 'Non-profit' },
];

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

  const [phoneVerificationToken, setPhoneVerificationToken] = useState<string | null>(null);
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  useEffect(() => {
    if (!loading && user && user.role !== 'candidate') {
      router.replace('/my-profile');
    }
  }, [loading, user, router]);

  const isNewUser = user && !user.resumeUrl;

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setEmail(user.email);
    if (user.phone && user.phone.startsWith('+')) {
      const allCountries = Country.getAllCountries();
      // Sort by phone code length descending to match longest first (e.g. +1 242 before +1)
      const sortedCountries = [...allCountries].sort((a, b) => b.phonecode.length - a.phonecode.length);

      const cleanPhone = user.phone.substring(1); // remove +
      let matched = false;
      for (const c of sortedCountries) {
        if (cleanPhone.startsWith(c.phonecode)) {
          setPhoneCountryIso(c.isoCode);
          setPhoneNationalDigits(cleanPhone.substring(c.phonecode.length).replace(/\D/g, ''));
          setVerifiedPhone(user.phone);
          matched = true;
          break;
        }
      }
      if (!matched) {
        setPhoneNationalDigits(user.phone.replace(/\D/g, ''));
        setVerifiedPhone(user.phone);
      }
    }
    setCoverLetter(user.coverLetter || '');
    setSkills(user.skills || []);
    setWorkExperience(user.workExperience && user.workExperience.length > 0 ? user.workExperience : [{ company: '', role: '', startDate: '', endDate: '' }]);
    setEducation(user.education && user.education.length > 0 ? user.education : [{ institution: '', degree: '', field: '', dates: '' }]);
    setProjects(user.projects && user.projects.length > 0 ? user.projects : [{ name: '', description: '', technologies: [] }]);
    setHobbies(user.hobbies || []);
  }, [user]);

  const composedPhone = composeE164Phone(phoneCountryIso, phoneNationalDigits) || '';
  const phoneValidation = validateNationalPhone(phoneCountryIso, phoneNationalDigits);
  const currentFullPhone = phoneValidation.ok ? phoneValidation.e164 : '';
  const isPhoneChanged = composedPhone.replace(/\D/g, '') !== (user?.phone || '').replace(/\D/g, '');
  const isPhoneVerified = !isPhoneChanged || (verifiedPhone?.replace(/\D/g, '') === currentFullPhone.replace(/\D/g, ''));

  const hasChanges = useMemo(() => {
    if (!user) return false;

    // Check basic fields
    if (name !== user.name) return true;
    if (isPhoneChanged) return true;
    if (coverLetter !== (user.coverLetter || '')) return true;

    // Deep compare arrays using stringification for simplicity
    const normalize = (arr: any[]) => JSON.stringify(arr?.filter(i => Object.values(i).some(v => v)) || []);

    if (normalize(skills) !== normalize(user.skills || [])) return true;
    if (normalize(hobbies) !== normalize(user.hobbies || [])) return true;
    if (normalize(workExperience) !== normalize(user.workExperience || [])) return true;
    if (normalize(education) !== normalize(user.education || [])) return true;
    if (normalize(projects) !== normalize(user.projects || [])) return true;

    return false;
  }, [user, name, isPhoneChanged, coverLetter, skills, hobbies, workExperience, education, projects]);

  const handleVerifyPhoneWithMsg91 = () => {
    if (!phoneValidation.ok) {
      toast({ title: 'Invalid phone', description: phoneValidation.error, variant: 'destructive' });
      return;
    }

    if (typeof (window as any).initSendOTP !== 'function') {
      toast({ title: 'Service unavailable', description: 'Verification service is still loading. Please try again in a second.', variant: 'destructive' });
      return;
    }

    const config = {
      widgetId: "36656d677765373830393137",
      tokenAuth: "516208TzgLR9xASXN6a04272aP1",
      identifier: currentFullPhone,
      success: (data: any) => {
        handleMsg91Success(data);
      },
      failure: (error: any) => {
        toast({ title: 'Verification failed', description: error?.message || 'Verification was unsuccessful.', variant: 'destructive' });
      },
    };
    (window as any).initSendOTP(config);
  };

  const handleMsg91Success = async (data: any) => {
    try {
      const tokenToVerify = typeof data === 'string' ? data : data.message;
      if (!tokenToVerify) {
        throw new Error('Invalid verification response from MSG91');
      }

      const { phoneVerificationToken: token } = await apiRequest<{ phoneVerificationToken: string }>(
        '/auth/candidate-phone-otp/verify-msg91',
        { method: 'POST', body: { accessToken: tokenToVerify } },
      );

      setPhoneVerificationToken(token);
      setVerifiedPhone(currentFullPhone);
      toast({ title: 'Phone verified', description: 'Your phone number has been verified successfully.' });
    } catch (error) {
      toast({ title: 'Backend verification failed', description: error instanceof Error ? error.message : 'Please try again.', variant: 'destructive' });
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

      const token = getAccessToken('candidate');
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

    (async () => {
      try {
        if (user) {
          let fullPhone = user.phone || '';
          if (isPhoneChanged) {
            const phoneCheck = validateNationalPhone(phoneCountryIso, phoneNationalDigits);
            if (!phoneCheck.ok) {
              toast({
                title: 'Invalid phone',
                description: phoneCheck.error,
                variant: 'destructive',
              });
              setIsSaving(false);
              return;
            }
            fullPhone = phoneCheck.e164;
          }

          if (user.role === 'candidate') {
            // Save to backend
            const updatedBackendUser = await apiRequest<BackendUser>('/portal/profile', {
              method: 'PATCH',
              auth: true,
              body: {
                firstName: name.split(' ')[0],
                lastName: name.split(' ').slice(1).join(' ') || 'Candidate',
                phone: fullPhone,
                summary: coverLetter,
                skills,
                workExperience,
                education,
                projects,
                hobbies,
                linkedinUrl: user.linkedinProfileUrl || undefined, // Keeping existing if not changed
              },
            });

            const mapped = mapBackendUser(updatedBackendUser);
            updateCurrentUser({
              ...mapped,
              role: user.role, // Explicitly preserve the current role
              permissions: user.permissions, // Preserve permissions too
            });
          }
        }

        toast({
          title: 'Profile Updated',
          description: 'Your changes have been saved successfully.',
        });

        // Removed redirects as requested. User stays on the same page.
      } catch (err) {
        toast({
          title: 'Update failed',
          description: err instanceof Error ? err.message : 'Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsSaving(false);
      }
    })();
  };

  if (loading || !user) {
    return <ProfileSkeleton />;
  }

  if (user.role !== 'candidate') {
    return null;
  }

  // Candidate Profile UI (continues below)
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 pb-24">
      <Button
        variant="ghost"
        size="sm"
        type="button"
        onClick={() => router.back()}
        className="mb-2 w-fit p-0 h-auto hover:bg-transparent hover:text-primary"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
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
                <Input id="email" type="email" value={email} readOnly className="bg-muted cursor-not-allowed" />
                <p className="text-[10px] text-muted-foreground mt-0.5">Email cannot be changed.</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Phone Number</Label>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <PhoneInternationalField
                    phoneCountryIso={phoneCountryIso}
                    phoneNationalDigits={phoneNationalDigits}
                    setPhoneCountryIso={(v) => { setPhoneCountryIso(v); setPhoneVerificationToken(null); setVerifiedPhone(null); }}
                    setPhoneNationalDigits={(v) => { setPhoneNationalDigits(v); setPhoneVerificationToken(null); setVerifiedPhone(null); }}
                    disabled={isSaving || (!!verifiedPhone && !isEditingPhone)}
                    hideLabel
                  />
                </div>
                {!!verifiedPhone && !isEditingPhone && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-10 px-3 gap-1.5 shrink-0"
                    onClick={() => setIsEditingPhone(true)}
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                )}
                {isEditingPhone && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-10 px-3 gap-1.5 shrink-0 text-emerald-600 border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50"
                    onClick={() => setIsEditingPhone(false)}
                  >
                    <Check className="h-4 w-4" />
                    Done
                  </Button>
                )}
              </div>

              {isPhoneChanged && !isPhoneVerified && (
                <div className="mt-2 flex flex-col gap-3 rounded-lg border bg-muted/30 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-muted-foreground">You changed your phone number. Verify it to save.</p>
                    <Button type="button" size="sm" onClick={handleVerifyPhoneWithMsg91}>
                      Verify Phone
                    </Button>
                  </div>
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
                  className="h-auto file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
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

        {/* Floating Save Button */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <Button
            type="submit"
            disabled={isSaving || !hasChanges}
            className="h-12 px-8 rounded-full shadow-2xl hover:shadow-primary/20 transition-all duration-300 border border-primary/20 backdrop-blur-md disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5" />
                <span>{isNewUser ? 'Save and Find Jobs' : 'Save Changes'}</span>
              </div>
            )}
          </Button>
        </div>
      </form>
      <Script src="https://verify.msg91.com/otp-provider.js" strategy="lazyOnload" />
      <Script src="https://verify.phone91.com/otp-provider.js" strategy="lazyOnload" />
    </div>
  );
}

