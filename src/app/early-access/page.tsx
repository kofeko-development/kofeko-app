
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const features = [
    { id: 'insights', label: 'Automated candidate insights' },
    { id: 'generation', label: 'Job description & assessment generation' },
    { id: 'matching', label: 'AI-backed candidate matching' },
    { id: 'ats', label: 'Applicant tracking' },
    { id: 'scheduling', label: 'Interview scheduling' },
    { id: 'analytics', label: 'Dashboard and hiring analytics' },
    { id: 'other', label: 'Other' }
];

export default function EarlyAccessPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: 'Thank you for your interest!',
        description: "You've been added to our early access list. We'll be in touch soon.",
      });
      
      // Redirect to home page after 2 seconds
      setTimeout(() => {
        router.push('/');
      }, 2000);
      
    }, 1500);
  };

  return (
    <Card className="max-w-2xl w-full mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">Join the Innovation</CardTitle>
          <CardDescription>
            Be among the early users to experience the future of hiring with AI.
            <span className="block mt-1">Register now for exclusive early access.</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="full-name">Full Name *</Label>
                        <Input id="full-name" name="full-name" placeholder="John Doe" required disabled={isLoading} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input id="email" name="email" type="email" placeholder="john.doe@example.com" required disabled={isLoading} />
                    </div>
                </div>
                 <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input id="phone" name="phone" type="tel" placeholder="(123) 456-7890" required disabled={isLoading} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="job-title">Job Title/Role *</Label>
                        <Input id="job-title" name="job-title" placeholder="Hiring Manager, Recruiter, etc." required disabled={isLoading} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name *</Label>
                    <Input id="company-name" name="company-name" placeholder="Innovate Corp." disabled={isLoading} required />
                </div>
            </div>
            
            <div className="space-y-4">
                 <div className="space-y-2">
                    <Label>How many people does your company typically hire in a year?</Label>
                    <Select name="hiring-volume" disabled={isLoading}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1-10">1-10</SelectItem>
                            <SelectItem value="11-50">11-50</SelectItem>
                            <SelectItem value="51-100">51-100</SelectItem>
                            <SelectItem value="100+">100+</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label>Which of these best describes your current hiring process?</Label>
                     <Select name="hiring-process" disabled={isLoading}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="manual">Mostly manual (spreadsheets, email)</SelectItem>
                            <SelectItem value="ats">Using a traditional Applicant Tracking System (ATS)</SelectItem>
                            <SelectItem value="hybrid">A mix of different tools</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            
            <div className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="pain-points">What are your biggest pain points in hiring today?</Label>
                    <Textarea name="pain-points" id="pain-points" placeholder="e.g., Time-consuming resume screening, lack of quality candidates, etc." disabled={isLoading} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="interest-reason">What made you interested in Kofeko?</Label>
                    <Textarea name="interest-reason" id="interest-reason" placeholder="e.g., The AI features, simplifying the workflow, etc." disabled={isLoading} />
                </div>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Which features are you most interested in?</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {features.map((feature) => (
                        <div key={feature.id} className="flex items-center gap-2">
                            <Checkbox name={`feature-${feature.id}`} id={feature.id} />
                            <Label htmlFor={feature.id} className="font-normal">{feature.label}</Label>
                        </div>
                        ))}
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label>Would you like early access to premium features? *</Label>
                     <RadioGroup name="premium-access" className="flex gap-4" required>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="prem1" /><Label htmlFor="prem1">Yes, please!</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="prem2" /><Label htmlFor="prem2">No, thank you</Label></div>
                    </RadioGroup>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="suggestions">Any suggestions, questions, or features you'd like to see?</Label>
                <Textarea name="suggestions" id="suggestions" placeholder="Your feedback is valuable to us!" disabled={isLoading} />
            </div>

            <div className="flex items-center space-x-2">
                <Checkbox id="updates" defaultChecked />
                <Label htmlFor="updates" className="text-sm font-normal text-muted-foreground">
                   I'd like to receive updates on Kofeko's development and launch
                </Label>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              {isLoading ? 'Submitting...' : 'Join the Waitlist'}
            </Button>
          </form>
        </CardContent>
    </Card>
  );
}
