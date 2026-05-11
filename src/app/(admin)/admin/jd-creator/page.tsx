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
import { aiApi, jobsApi } from '@/lib/stage1-2-api';

function htmlToPlainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildJobDescriptionForDb(jobTitle: string, requirements: string, generatedHtml: string): string {
  const fromHtml = htmlToPlainText(generatedHtml);
  const base = fromHtml.length >= 10 ? fromHtml : `${jobTitle}. ${requirements}`.trim();
  return base.slice(0, 5000);
}

export default function AdminJdCreatorPage() {
  const [jobTitle, setJobTitle] = useState('');
  const [requirements, setRequirements] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [employmentType, setEmploymentType] = useState('');

  const [generatedJD, setGeneratedJD] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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
      const result = await aiApi.generateJd({
        jobTitle: jobTitle.trim(),
        requirements: requirements.trim(),
        location: location.trim() || undefined,
        jobType: jobType.trim() || undefined,
        employmentType: employmentType.trim() || undefined,
      });
      setGeneratedJD(result.html);
      toast({
        title: 'Description Generated!',
        description: 'Your job description has been created.',
      });
    } catch (error) {
      toast({
        title: 'Error Generating Description',
        description: error instanceof Error ? error.message : 'Could not generate a description. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedJD);
    toast({ title: 'Copied to clipboard!' });
  };

  const handleSave = async () => {
    if (!jobTitle.trim() || !requirements.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please fill in job title and key requirements before saving.',
        variant: 'destructive',
      });
      return;
    }
    if (!generatedJD.trim()) {
      toast({
        title: 'Generate first',
        description: 'Generate a job description, then save to post the job.',
        variant: 'destructive',
      });
      return;
    }

    const description = buildJobDescriptionForDb(jobTitle, requirements, generatedJD);
    if (description.length < 10) {
      toast({
        title: 'Description too short',
        description: 'Add more detail to requirements or regenerate the description.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const created = await jobsApi.create({
        title: jobTitle.trim(),
        description,
        location: location.trim() || undefined,
        employmentType: employmentType.trim() || undefined,
        department: jobType.trim() || undefined,
        requirements: requirements.trim().slice(0, 5000),
        openings: 1,
      });
      await jobsApi.publish(created.id);
      toast({
        title: 'Job posted',
        description: 'The job is live and visible to candidates in Find Jobs.',
      });
    } catch (error) {
      toast({
        title: 'Could not save job',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const cleanHtml = sanitizeHtml(generatedJD, {
    allowedTags: ['h2', 'h3', 'ul', 'li', 'p', 'b', 'i', 'strong', 'em', 'br', 'div'],
    allowedAttributes: { '*': ['class'] },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">JD Creator</h1>
          <p className="text-muted-foreground">Post your requirements and generate a job description with AI.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create a new job description</CardTitle>
          <CardDescription>Enter role details and let Atlas generate a JD in your theme.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
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
                  placeholder="e.g., Ahmedabad"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
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
                placeholder="Write the requirements, responsibilities, must-haves, nice-to-haves..."
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                className="min-h-[150px]"
                disabled={isLoading}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
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
              <div className="min-h-[300px] max-w-none rounded-lg border bg-muted/50 p-6 text-sm" dangerouslySetInnerHTML={{ __html: cleanHtml }} />
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCopy}>
                  <Copy className="mr-2 h-4 w-4" /> Copy
                </Button>
                <Button onClick={() => void handleSave()} disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Post job
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

