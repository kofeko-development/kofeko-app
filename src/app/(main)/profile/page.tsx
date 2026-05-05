
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Linkedin, PlusCircle, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import type { WorkExperience } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

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

    const isNewUser = user && !user.resumeUrl;

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
            setPhone(user.phone || '');
            setCoverLetter(user.coverLetter || '');
            setSkills(user.skills || []);
            setWorkExperience(user.workExperience || [{ company: '', role: '', startDate: '', endDate: '' }]);
            if(user.role === 'recruiter') {
                setLinkedinUrl(user.linkedinProfileUrl || '');
            }
        }
    }, [user]);

    const handleExperienceChange = (index: number, field: keyof WorkExperience, value: string) => {
        const newExperience = [...workExperience];
        newExperience[index][field] = value;
        setWorkExperience(newExperience);
    };

    const addExperience = () => {
        setWorkExperience([...workExperience, { company: '', role: '', startDate: '', endDate: '' }]);
    };

    const removeExperience = (index: number) => {
        if (workExperience.length <= 1) return; // Always keep at least one form
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
        setSkills(skills.filter(skill => skill !== skillToRemove));
    };

    const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            handleAddSkill();
        }
    };

    const handleSaveChanges = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setTimeout(() => {
            if(user) {
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
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
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
                        <div className="grid md:grid-cols-2 gap-4">
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

                {user.role === 'recruiter' && (
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Company Information</CardTitle>
                            <CardDescription>Update your company's public information.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="space-y-2">
                                <Label htmlFor="linkedin-url">Company LinkedIn URL</Label>
                                <div className="relative">
                                    <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        id="linkedin-url" 
                                        value={linkedinUrl} 
                                        onChange={(e) => setLinkedinUrl(e.target.value)}
                                        placeholder="https://www.linkedin.com/company/your-company"
                                        className="pl-10"
                                    />
                                </div>
                             </div>
                        </CardContent>
                    </Card>
                )}

                {user.role === 'candidate' && (
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
                                    onChange={(e) => setResumeFile(e.target.files ? e.target.files[0] : null)}
                                    className="file:text-primary file:font-semibold"
                                    required={isNewUser}
                                />
                                {user.resumeUrl && !resumeFile && (
                                    <p className="text-sm text-muted-foreground">Current file: {user.resumeUrl}</p>
                                )}
                             </div>
                              <div className="space-y-2">
                                <Label htmlFor="cover-letter">Cover Letter</Label>
                                <Textarea id="cover-letter" placeholder="Tell us about yourself..." value={coverLetter} onChange={e => setCoverLetter(e.target.value)} className="min-h-[150px]" />
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
                                <div key={index} className="space-y-4 p-4 border rounded-lg relative">
                                    {workExperience.length > 1 && (
                                         <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => removeExperience(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor={`company-${index}`}>Company</Label>
                                            <Input id={`company-${index}`} value={exp.company} onChange={e => handleExperienceChange(index, 'company', e.target.value)} placeholder="Company Name" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`role-${index}`}>Role</Label>
                                            <Input id={`role-${index}`} value={exp.role} onChange={e => handleExperienceChange(index, 'role', e.target.value)} placeholder="e.g., Software Engineer"/>
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                         <div className="space-y-2">
                                            <Label htmlFor={`start-date-${index}`}>Start Date</Label>
                                            <Input id={`start-date-${index}`} type="month" value={exp.startDate} onChange={e => handleExperienceChange(index, 'startDate', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`end-date-${index}`}>End Date</Label>
                                            <Input id={`end-date-${index}`} type="month" value={exp.endDate} onChange={e => handleExperienceChange(index, 'endDate', e.target.value)} />
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
                                <Input
                                    value={currentSkill}
                                    onChange={(e) => setCurrentSkill(e.target.value)}
                                    onKeyDown={handleSkillKeyDown}
                                    placeholder="e.g., React, TypeScript..."
                                />
                                <Button type="button" onClick={handleAddSkill}>Add Skill</Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-4">
                                {skills.map((skill, index) => (
                                    <Badge key={index} variant="secondary" className="flex items-center gap-1.5 py-1 px-3">
                                        {skill}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSkill(skill)}
                                            className="rounded-full hover:bg-muted-foreground/20 p-0.5"
                                        >
                                            <X className="h-3 w-3" />
                                            <span className="sr-only">Remove {skill}</span>
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    </>
                )}

                <div className="mt-6 flex justify-end">
                    <Button type="submit" disabled={isSaving}>
                        {isSaving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                           isNewUser ? 'Save and Find Jobs' : 'Save Changes'
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}

    