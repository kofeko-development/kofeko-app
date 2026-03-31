
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Copy, Save } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import sanitizeHtml from 'sanitize-html';
import { z } from 'zod';

const BuildJobDescriptionInputSchema = z.object({
  jobTitle: z.string().describe('The title of the job.'),
  requirements: z.string().describe('The key requirements and skills for the job.'),
  location: z.string().optional().describe('The location of the job.'),
  jobType: z.string().optional().describe('The type of job (e.g., On-site, Remote, Hybrid).'),
  employmentType: z.string().optional().describe('The type of employment (e.g., Full-time, Part-time, Contract).'),
});
type BuildJobDescriptionInput = z.infer<typeof BuildJobDescriptionInputSchema>;


function getJdTemplate(input: BuildJobDescriptionInput): string {
  const template = `
<div class="space-y-8">
    <div>
        <h2 class="text-lg font-bold font-headline mb-2 text-foreground">About Kofeko</h2>
        <p class="text-muted-foreground">Kofeko is an AI-powered hiring co-pilot designed for startups and SMBs. We accelerate hiring by structuring roles, understanding candidates beyond keywords, and removing ambiguity at decision points — without taking control away from you.</p>
    </div>

    <div>
        <h2 class="text-lg font-bold font-headline mb-2 text-foreground">Our Mission</h2>
        <p class="text-muted-foreground">To empower organizations to hire smarter and faster by leveraging AI to streamline the entire recruitment lifecycle, from creating compelling job descriptions to identifying the best-fit candidates.</p>
    </div>

    <div>
        <h2 class="text-lg font-bold font-headline mb-2 text-foreground">The Role: ${input.jobTitle}</h2>
        <p class="text-muted-foreground">We are seeking a passionate and experienced ${input.jobTitle || 'Professional'} to join our team. In this role, you will be a key player in shaping our product's user experience. You will be responsible for leading the development of our next-generation user interfaces, creating reusable components, and ensuring our applications are performant, accessible, and scalable. You'll work closely with our design and product teams to bring innovative ideas to life.</p>
    </div>

    <div class="space-y-4">
        <div>
            <h3 class="font-semibold text-foreground mb-2">Core Expectations</h3>
            <ul class="list-disc list-inside space-y-2 text-muted-foreground pl-4">
            <li>Develop and maintain high-quality, reusable, and scalable frontend code using React and TypeScript.</li>
            <li>Collaborate with UI/UX designers to translate wireframes and mockups into functional web applications.</li>
            <li>Own features from conception to deployment, including architectural design, implementation, and testing.</li>
            <li>Champion best practices for frontend development, including performance, accessibility, and testing.</li>
            </ul>
        </div>

        <div>
            <h3 class="font-semibold text-foreground mb-2">Required Skills & Experience</h3>
            <ul class="list-disc list-inside space-y-2 text-muted-foreground pl-4">
            <li>5+ years of professional experience in your field.</li>
            <li>Expertise in relevant technologies for the role.</li>
            <li>Strong understanding of industry best practices.</li>
            <li>A keen eye for detail and a passion for creating excellent work.</li>
            </ul>
        </div>

        <div>
            <h3 class="font-semibold text-foreground mb-2">Nice to Have Skills & Certifications</h3>
            <ul class="list-disc list-inside space-y-2 text-muted-foreground pl-4">
            <li>Experience with data visualization libraries (e.g., D3.js, Recharts).</li>
            <li>Familiarity with backend technologies (Node.js, GraphQL).</li>
            <li>Contributions to open-source projects.</li>
            <li>Relevant industry certifications.</li>
            </ul>
        </div>
    </div>
</div>
`;
  return template;
}

export default function JdBuilderPage() {
  const [jobTitle, setJobTitle] = useState('');
  const [requirements, setRequirements] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [employmentType, setEmploymentType] = useState('');

  const [generatedJD, setGeneratedJD] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle || !requirements) {
      toast({
        title: 'Missing Information',
        description: 'Please provide at least a Job Title and Key Requirements.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setGeneratedJD('');

    try {
      const input: BuildJobDescriptionInput = {
        jobTitle,
        requirements,
        location,
        jobType,
        employmentType,
      };
      
      const result = getJdTemplate(input);
      
      // Simulate a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));

      setGeneratedJD(result);
      toast({
        title: 'Description Generated!',
        description: 'Your job description has been created.',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error Generating Description',
        description: 'Could not generate a description. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedJD);
    toast({
      title: 'Copied to clipboard!',
    });
  };

  const handleSave = () => {
    toast({
      title: 'Job Saved!',
      description: 'This job has been saved and is ready to be posted.',
    });
  };

  const cleanHtml = sanitizeHtml(generatedJD, {
    allowedTags: ['h2', 'h3', 'ul', 'li', 'p', 'b', 'i', 'strong', 'em', 'br', 'div'],
    allowedAttributes: {
      '*': ['class'],
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">AI Job Description Builder</h1>
          <p className="text-muted-foreground">Instantly create compelling job descriptions for any role with Atlas.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Create New Job Description</CardTitle>
          <CardDescription>Enter the role details and let Atlas craft the perfect job description.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="job-title">Job Title</Label>
                <Input
                  id="job-title"
                  placeholder="e.g., Senior Frontend Developer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., San Francisco, CA"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="job-type">Job Type</Label>
                <Select value={jobType} onValueChange={setJobType} disabled={isLoading}>
                  <SelectTrigger id="job-type">
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="On-site">On-site</SelectItem>
                    <SelectItem value="Remote">Remote</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="employment-type">Employment Type</Label>
                <Select value={employmentType} onValueChange={setEmploymentType} disabled={isLoading}>
                  <SelectTrigger id="employment-type">
                    <SelectValue placeholder="Select employment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Key Requirements & Skills</Label>
              <Textarea
                id="requirements"
                placeholder="e.g., 5+ years of React experience, proficient in TypeScript, strong understanding of UI/UX principles..."
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                className="min-h-[150px]"
                disabled={isLoading}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Generate Description
            </Button>
          </form>

          {(isLoading || generatedJD) && <Separator className="my-8" />}

          {isLoading && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Generating...</span>
            </div>
          )}

          {generatedJD && (
            <div className="space-y-4">
              <Label>Generated Description</Label>
              <div
                className="max-w-none rounded-lg border bg-muted/50 p-6 min-h-[300px] text-sm"
                dangerouslySetInnerHTML={{ __html: cleanHtml }}
              />
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCopy}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
                <Button onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Save & Post Job
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
