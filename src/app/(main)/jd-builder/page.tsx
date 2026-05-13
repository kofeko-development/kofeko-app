
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Copy, Save, Plus, Trash2, Clock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import sanitizeHtml from 'sanitize-html';
import { z } from 'zod';
import { aiApi, jobsApi } from '@/lib/stage1-2-api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [jobType, setJobType] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [skillWeights, setSkillWeights] = useState<SkillWeight[]>([]);

  const [generatedJD, setGeneratedJD] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    try {
      const res = await jobsApi.list({ status: 'draft', limit: 10 });
      setDrafts(res.items || []);
    } catch (error) {
      console.error('Failed to load drafts:', error);
    }
  };

  const loadDraft = (job: any) => {
    const isDirty = jobTitle.trim() !== '' || requirements.trim() !== '';
    
    if (editingId === job.id) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (isDirty && !editingId) {
      setPendingDraft(job);
      setShowConfirmDialog(true);
      return;
    }

    executeLoadDraft(job);
  };

  const executeLoadDraft = (job: any) => {
    setEditingId(job.id);
    setJobTitle(job.title);
    setRequirements(job.description || job.requirements || '');
    setJobType(job.department || '');
    setEmploymentType(job.employmentType || '');
    if (job.skillWeights) {
      setSkillWeights(job.skillWeights);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast({ title: 'Draft loaded', description: `Editing: ${job.title}` });
    setShowConfirmDialog(false);
    setPendingDraft(null);
  };

  const addSkillRow = () => {
    setSkillWeights([...skillWeights, { skill: '', weight: 7, yearsOfExperience: 3 }]);
  };

  const updateSkillRow = (index: number, patch: Partial<SkillWeight>) => {
    setSkillWeights(skillWeights.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const removeSkillRow = (index: number) => {
    setSkillWeights(skillWeights.filter((_, i) => i !== index));
  };

  const handleFinalSave = async (status: 'open' | 'draft') => {
    if (!jobTitle.trim() || !requirements.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please provide a job title and requirements.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      let created;
      if (editingId) {
        created = await jobsApi.update(editingId, {
          title: jobTitle.trim(),
          description: requirements,
          employmentType: employmentType.trim() || undefined,
          department: jobType.trim() || undefined,
          requirements: requirements.trim().slice(0, 5000),
          skillWeights: skillWeights.length > 0 ? skillWeights.map(sw => ({
            ...sw,
            yearsOfExperience: Number(sw.yearsOfExperience) || 0
          })) : undefined,
        });
      } else {
        created = await jobsApi.create({
          title: jobTitle.trim(),
          description: requirements,
          employmentType: employmentType.trim() || undefined,
          department: jobType.trim() || undefined,
          requirements: requirements.trim().slice(0, 5000),
          openings: 1,
          skillWeights: skillWeights.length > 0 ? skillWeights.map(sw => ({
            ...sw,
            yearsOfExperience: Number(sw.yearsOfExperience) || 0
          })) : undefined,
        });
      }

      if (status === 'open') {
        await jobsApi.publish(created.id);
      }

      toast({
        title: status === 'open' ? 'Job Posted!' : 'Draft Saved!',
        description: status === 'open' ? 'Your job is now live.' : 'You can find it in your drafts.',
      });
      loadDrafts();
      if (status === 'open') {
        setEditingId(null);
        setJobTitle('');
        setRequirements('');
        setSkillWeights([]);
      }
    } catch (error) {
      toast({
        title: 'Save failed',
        description: error instanceof Error ? error.message : 'Could not save the job.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateWithAI = async () => {
    if (!jobTitle.trim()) {
      toast({
        title: 'Title required',
        description: 'Please enter a job title first.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await aiApi.generateJd({
        jobTitle: jobTitle.trim(),
        requirements: requirements.trim(),
        jobType: jobType.trim() || undefined,
        employmentType: employmentType.trim() || undefined,
      });

      setRequirements(result.plainText);
      if (result.suggestedSkills && result.suggestedSkills.length > 0) {
        setSkillWeights(result.suggestedSkills);
      }

      toast({
        title: 'JD Generated!',
        description: 'Description and skills have been populated.',
      });
    } catch (error) {
      toast({
        title: 'Generation failed',
        description: error instanceof Error ? error.message : 'AI could not generate the JD.',
      } finally {
        setIsGenerating(false);
      }
    };

    return (
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-headline">JD Builder</h1>
              <p className="text-muted-foreground">{editingId ? 'Editing existing draft' : 'Enter the role details and let Atlas craft the perfect job description.'}</p>
            </div>
            {editingId && (
              <Button variant="outline" size="sm" onClick={() => { setEditingId(null); setJobTitle(''); setRequirements(''); setSkillWeights([]); }}>
                Create New Instead
              </Button>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Create New Job Description</CardTitle>
              <CardDescription>Enter the role details and let Atlas craft the perfect job description.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid gap-4">
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
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="job-type">Job Type</Label>
                    <Select value={jobType} onValueChange={setJobType}>
                      <SelectTrigger id="job-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Remote">Remote</SelectItem>
                        <SelectItem value="On-site">On-site</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employment-type">Employment Type</Label>
                    <Select value={employmentType} onValueChange={setEmploymentType}>
                      <SelectTrigger id="employment-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Full-time">Full-time</SelectItem>
                        <SelectItem value="Part-time">Part-time</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                        <SelectItem value="Internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator className="my-2" />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="requirements">Key Requirements & Skills</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-[11px] text-primary hover:text-primary/80"
                      onClick={handleGenerateWithAI}
                      disabled={isGenerating || isLoading}
                    >
                      {isGenerating ? (
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      ) : (
                        <Sparkles className="mr-1 h-3 w-3" />
                      )}
                      {requirements.length > 0 ? 'Enhance with AI' : 'Generate with AI'}
                    </Button>
                  </div>
                  <Textarea
                    id="requirements"
                    placeholder="e.g., 5+ years of React experience, proficient in TypeScript, strong understanding of UI/UX principles..."
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    className="min-h-[150px]"
                    disabled={isLoading || isGenerating}
                    required
                  />
                </div>

                <Separator className="my-2" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h3 className="text-sm font-semibold">Skill priorities</h3>
                      <p className="text-[11px] text-muted-foreground">
                        Higher weight = stronger boost when the resume shows that skill (e.g. React 10, CSS 6).
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      onClick={addSkillRow}
                      className="h-auto p-0 text-primary font-semibold"
                    >
                      Add skill
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {skillWeights.map((row, index) => (
                      <div key={index} className="flex items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                        <Input
                          className="flex-1 h-10"
                          placeholder="e.g. React"
                          value={row.skill}
                          onChange={(e) => updateSkillRow(index, { skill: e.target.value })}
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground font-medium">Weight</span>
                          <Input
                            type="number"
                            min={0}
                            max={10}
                            className="w-14 h-10 text-center"
                            value={row.weight}
                            onChange={(e) =>
                              updateSkillRow(index, { weight: Number.parseInt(e.target.value, 10) || 0 })
                            }
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground font-medium">Years</span>
                          <Input
                            type="number"
                            min={0}
                            className="w-14 h-10 text-center"
                            value={row.yearsOfExperience || ''}
                            onChange={(e) =>
                              updateSkillRow(index, { yearsOfExperience: Number.parseInt(e.target.value, 10) || 0 })
                            }
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSkillRow(index)}
                          className="h-10 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {skillWeights.length === 0 && (
                      <p className="text-center py-2 text-xs text-muted-foreground border border-dashed rounded-md">
                        No skill priorities added. Add skills to help AI matching.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-11"
                    disabled={isSaving || isGenerating}
                    onClick={() => void handleFinalSave('draft')}
                  >
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save as Draft
                  </Button>
                  <Button
                    type="button"
                    className="flex-1 h-11"
                    disabled={isSaving || isGenerating}
                    onClick={() => void handleFinalSave('open')}
                  >
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Post Job
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Saved Drafts
              </CardTitle>
              <CardDescription>Click to continue editing</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {drafts.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    No drafts found
                  </div>
                ) : (
                  drafts.map((job) => (
                    <button
                      key={job.id}
                      onClick={() => loadDraft(job)}
                      className="w-full text-left p-4 hover:bg-muted/50 transition-colors group"
                    >
                      <div className="font-medium text-sm group-hover:text-primary line-clamp-1">{job.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(job.updatedAt).toLocaleDateString()}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Quick Tip</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Use the AI button next to "Key Requirements" to perfect your JD before posting. AI will also suggest the best skill weights for you.
              </p>
            </CardContent>
          </Card>
        </div>
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved work in the current form. Loading this draft will overwrite your current progress. Do you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Editing</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => pendingDraft && executeLoadDraft(pendingDraft)}
            >
              Discard & Load Draft
            </AlertDialogAction>
            <AlertDialogAction 
              onClick={async () => {
                await handleFinalSave('draft');
                if (pendingDraft) executeLoadDraft(pendingDraft);
              }}
            >
              Save Current & Load
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
