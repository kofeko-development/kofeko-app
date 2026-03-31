
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Copy, ClipboardCopy } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const demoQuestions = [
    "Can you describe a time when you had to design a complex user interface from scratch? What was your process?",
    "How do you ensure your frontend code is both performant and accessible?",
    "Explain your approach to state management in a large-scale React application.",
    "Walk me through how you would debug a critical CSS issue that only appears on a specific device or browser.",
    "Describe a challenging code review you participated in. What made it challenging and what was the outcome?"
];

export default function AssessmentsPage() {
  const [jobDescription, setJobDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [assessment, setAssessment] = useState<{ questions: string[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription || !skills) {
      toast({
        title: 'Missing Information',
        description: 'Please provide both a job description and key skills.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setAssessment(null);
    // Simulate AI call
    setTimeout(() => {
        setAssessment({ questions: demoQuestions });
        setIsLoading(false);
        toast({
            title: 'Assessment Generated!',
            description: 'Review the generated questions below.'
        });
    }, 1500);
  };

  const handleCopyQuestions = () => {
    if (assessment) {
      const questionsText = assessment.questions.map((q, i) => `${i + 1}. ${q}`).join('\n');
      navigator.clipboard.writeText(questionsText);
      toast({ title: 'Questions copied to clipboard!' });
    }
  };

  return (
    <div className="flex flex-col gap-6">
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Skill Assessment Generator</h1>
          <p className="text-muted-foreground">Instantly create relevant interview questions for any role.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Create New Assessment</CardTitle>
          <CardDescription>Enter the role details to generate tailored interview questions.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerateAssessment} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="job-description">Job Description</Label>
              <Textarea
                id="job-description"
                placeholder="Paste the full job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="min-h-[200px]"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skills">Key Skills to Assess</Label>
              <Textarea
                id="skills"
                placeholder="e.g., Product Management, Agile, SaaS, User Research, Data Analysis"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="min-h-[100px]"
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Generate Questions
            </Button>
          </form>

          {(isLoading || assessment) && <Separator className="my-8" />}

          {isLoading && (
             <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin"/>
                <span>Generating...</span>
             </div>
          )}

          {assessment && (
            <div className="space-y-4">
              <Label>Generated Interview Questions</Label>
               <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
                    <ol className="space-y-3 list-decimal list-inside text-sm">
                    {assessment.questions.map((q, i) => (
                        <li key={i}>{q}</li>
                    ))}
                    </ol>
                </div>

              <div className='mt-4 flex gap-2'>
                <Button onClick={handleCopyQuestions} variant="outline" size="sm">
                  <ClipboardCopy className="mr-2 h-4 w-4" />
                  Copy Questions
                </Button>
                <Button type="button" onClick={(e) => handleGenerateAssessment(e)} variant="secondary" size="sm" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
                    Regenerate
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
