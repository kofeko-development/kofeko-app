
'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from '@/components/logo';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

function QuestionsForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const name = searchParams.get('name');
    const email = searchParams.get('email');
    const jobId = searchParams.get('jobId');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        toast({
            title: "Information Saved!",
            description: "Your application has been submitted. Please complete your profile to finish.",
        });

        // Redirect to the signup/profile completion page, carrying over the data
        const query = new URLSearchParams({
            name: name || '',
            email: email || '',
            fromApplication: 'true',
        }).toString();

        router.push(`/signup?${query}`);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-50/70 to-orange-50/70 py-12">
            <div className="mb-6">
                <Logo />
            </div>
            <Card className="max-w-2xl w-full mx-auto">
                <CardHeader className="text-center">
                    <CardTitle className="font-headline text-3xl">Just a Few More Questions</CardTitle>
                    <CardDescription>
                        Help us understand your availability and expectations for this role.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="salary">What are your salary expectations (annual)?</Label>
                            <Input id="salary" name="salary" type="number" placeholder="e.g., 95000" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="start-date">When is your earliest possible start date?</Label>
                            <Input id="start-date" name="start-date" type="date" required />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="work-authorization">Are you legally authorized to work in the country for this position?</Label>
                            <Select name="work-authorization" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an option" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="yes">Yes</SelectItem>
                                    <SelectItem value="no-sponsorship-needed">No, but I do not require sponsorship</SelectItem>
                                    <SelectItem value="yes-sponsorship-needed">Yes, I will require sponsorship</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button type="submit" className="w-full">
                            Submit and Create Profile
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

export default function AdditionalQuestionsPage() {
    return (
        <Suspense fallback={<div>Loading questions...</div>}>
            <QuestionsForm />
        </Suspense>
    )
}
