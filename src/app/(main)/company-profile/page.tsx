
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';

export default function CompanyProfilePage() {
    const { user, login, loading } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    
    const [companyName, setCompanyName] = useState('');
    const [about, setAbout] = useState('');
    const [values, setValues] = useState('');
    const [mission, setMission] = useState('');
    const [logo, setLogo] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const canEdit = user?.companyRole === 'HR Admin';

    useEffect(() => {
        if (user && user.role === 'recruiter') {
            setCompanyName(user.company || '');
            // In a real app, these would come from a company profile object
            setAbout('');
            setValues('');
            setMission('');
            // and a logo URL
        }
    }, [user]);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogo(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }

    const handleSaveChanges = (e: React.FormEvent) => {
        e.preventDefault();
        if (!canEdit) return;

        setIsSaving(true);
        setTimeout(() => {
            if(user) {
                // In a real app you would save this to a specific company collection in your DB,
                // including uploading the logo file and storing its URL.
                console.log({
                    companyName,
                    about,
                    values,
                    mission,
                    logoName: logo?.name
                });
            }

            toast({
                title: 'Company Profile Updated',
                description: 'Your changes have been saved successfully.',
            });
            setIsSaving(false);
        }, 1500);
    };

    if (loading || !user) {
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
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6 items-center">
                             <div className="space-y-2">
                                <Label htmlFor="companyName">Company Name</Label>
                                <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} disabled={!canEdit} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="logo">Company Logo</Label>
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center border">
                                        {logoPreview ? (
                                            <Image src={logoPreview} alt="Logo preview" width={80} height={80} className="object-contain rounded-lg" />
                                        ) : (
                                            <UploadCloud className="h-8 w-8 text-muted-foreground" />
                                        )}
                                    </div>
                                    <Input id="logo" type="file" onChange={handleLogoChange} accept="image/*" className="file:text-primary file:font-semibold" disabled={!canEdit} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="about">About Us</Label>
                            <Textarea id="about" placeholder="What makes your company special?" value={about} onChange={e => setAbout(e.target.value)} className="min-h-[150px]" disabled={!canEdit} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="mission">Mission</Label>
                            <Textarea id="mission" placeholder="What is your company's mission?" value={mission} onChange={e => setMission(e.target.value)} className="min-h-[100px]" disabled={!canEdit} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="values">Company Values</Label>
                            <Textarea id="values" placeholder="e.g., Innovation, Customer-Centric, Integrity" value={values} onChange={e => setValues(e.target.value)} className="min-h-[100px]" disabled={!canEdit} />
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
