'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { aiApi, jobsApi, type CreatedJob } from '@/lib/stage1-2-api';
import { useAuth } from '@/lib/auth';
import { useApiErrorToast } from '@/hooks/use-api-error-toast';
import { useInvalidateJobs } from '@/hooks/use-jobs';

const MIN_MANUAL_SKILLS = 2;

const defaultSkillRows = () => [
  { skill: '', weight: 7, yearsOfExperience: 3 },
  { skill: '', weight: 7, yearsOfExperience: 3 },
];

type JdFormErrors = {
  jobTitle?: string;
  jobType?: string;
  employmentType?: string;
  requirements?: string;
  skills?: string;
};

function RequiredMark() {
  return <span className="text-destructive ml-0.5" aria-hidden="true">*</span>;
}

function validateJdForm(input: {
  jobTitle: string;
  jobType: string;
  employmentType: string;
  requirements: string;
  skillWeights: { skill: string; weight: number; yearsOfExperience?: number }[];
}): JdFormErrors {
  const errors: JdFormErrors = {};

  if (!input.jobTitle.trim()) {
    errors.jobTitle = 'Job title is required.';
  }
  if (!input.jobType.trim()) {
    errors.jobType = 'Job type is required.';
  }
  if (!input.employmentType.trim()) {
    errors.employmentType = 'Employment type is required.';
  }
  if (!input.requirements.trim()) {
    errors.requirements = 'Key requirements & skills are required.';
  }

  const filledSkills = input.skillWeights.filter((row) => row.skill.trim());
  if (filledSkills.length < MIN_MANUAL_SKILLS) {
    errors.skills = `Add at least ${MIN_MANUAL_SKILLS} skills manually.`;
  }

  return errors;
}

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
  const [jobType, setJobType] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [skillWeights, setSkillWeights] = useState(defaultSkillRows);

  const [generatedJD, setGeneratedJD] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [savingAction, setSavingAction] = useState<'draft' | 'open' | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<JdFormErrors>({});
  const [drafts, setDrafts] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();
  const { showError } = useApiErrorToast();
  const { user, loading: authLoading } = useAuth();
  const invalidateJobs = useInvalidateJobs();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editJobId = searchParams.get('edit');
  const loadedEditIdRef = useRef<string | null>(null);

  const loadJobIntoForm = useCallback((job: CreatedJob) => {
    setEditingId(job.id);
    setJobTitle(job.title ?? '');
    setRequirements(job.requirements ?? job.description ?? '');
    setJobType(job.department ?? '');
    setEmploymentType(job.employmentType ?? '');
    if (job.skillWeights?.length) {
      const rows = job.skillWeights.map((sw) => ({
        skill: sw.skill ?? '',
        weight: sw.weight ?? 7,
        yearsOfExperience: sw.yearsOfExperience ?? 3,
      }));
      while (rows.length < MIN_MANUAL_SKILLS) {
        rows.push({ skill: '', weight: 7, yearsOfExperience: 3 });
      }
      setSkillWeights(rows);
    } else {
      setSkillWeights(defaultSkillRows());
    }
    setFieldErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (authLoading || !user) return;
    loadDrafts();
  }, [authLoading, user]);

  useEffect(() => {
    if (authLoading || !user || !editJobId || loadedEditIdRef.current === editJobId) return;

    let cancelled = false;
    void (async () => {
      try {
        const job = await jobsApi.get(editJobId);
        if (cancelled) return;
        loadedEditIdRef.current = editJobId;
        loadJobIntoForm(job);
        router.replace('/admin/jd-creator', { scroll: false });
        toast({ title: 'Job loaded', description: `Editing: ${job.title}` });
      } catch (error) {
        toast({
          title: 'Could not load job',
          description: error instanceof Error ? error.message : 'Please try again.',
          variant: 'destructive',
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, editJobId, loadJobIntoForm, router, toast]);

  const loadDrafts = async () => {
    try {
      const res = await jobsApi.list({ status: 'draft', limit: 10 });
      setDrafts(res.items || []);
    } catch (error) {
      console.error('Failed to load drafts:', error);
    }
  };

  const loadDraft = (job: CreatedJob) => {
    loadJobIntoForm(job);
    toast({ title: 'Draft loaded', description: `Editing: ${job.title}` });
  };

  const addSkillRow = () => {
    setSkillWeights([...skillWeights, { skill: '', weight: 7, yearsOfExperience: 3 }]);
  };

  const updateSkillRow = (index: number, patch: Partial<{ skill: string; weight: number; yearsOfExperience?: number }>) => {
    setSkillWeights(skillWeights.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const removeSkillRow = (index: number) => {
    if (skillWeights.length <= MIN_MANUAL_SKILLS) {
      toast({
        title: 'Minimum skills required',
        description: `Keep at least ${MIN_MANUAL_SKILLS} skill rows.`,
        variant: 'destructive',
      });
      return;
    }
    setSkillWeights(skillWeights.filter((_, i) => i !== index));
  };

  const runFormValidation = () => {
    const errors = validateJdForm({
      jobTitle,
      jobType,
      employmentType,
      requirements,
      skillWeights,
    });
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!runFormValidation()) {
      toast({
        title: 'Missing required fields',
        description: 'Please complete all mandatory fields before generating.',
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
        jobType: jobType.trim() || undefined,
        employmentType: employmentType.trim() || undefined,
      });
      setGeneratedJD(result.html);
      toast({
        title: 'Description Generated!',
        description: 'Your job description has been created.',
      });
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalSave = async (status: 'open' | 'draft') => {
    if (!runFormValidation()) {
      toast({
        title: 'Missing required fields',
        description: 'Please complete all mandatory fields before saving.',
        variant: 'destructive',
      });
      return;
    }

    setSavingAction(status);
    try {
      let created;
      if (editingId) {
        created = await jobsApi.update(editingId, {
          title: jobTitle.trim(),
          description: requirements,
          employmentType: employmentType.trim() || undefined,
          department: jobType.trim() || undefined,
          requirements: requirements.trim().slice(0, 5000),
          skillWeights: skillWeights
            .filter((sw) => sw.skill.trim())
            .map((sw) => ({
              ...sw,
              skill: sw.skill.trim(),
              yearsOfExperience: Number(sw.yearsOfExperience) || 0,
            })),
        });
      } else {
        created = await jobsApi.create({
          title: jobTitle.trim(),
          description: requirements,
          employmentType: employmentType.trim() || undefined,
          department: jobType.trim() || undefined,
          requirements: requirements.trim().slice(0, 5000),
          openings: 1,
          skillWeights: skillWeights
            .filter((sw) => sw.skill.trim())
            .map((sw) => ({
              ...sw,
              skill: sw.skill.trim(),
              yearsOfExperience: Number(sw.yearsOfExperience) || 0,
            })),
        });
      }

      if (status === 'open') {
        await jobsApi.publish(created.id);
      }

      await invalidateJobs();
      toast({
        title: status === 'open' ? 'Job Posted!' : 'Draft Saved!',
        description: status === 'open' ? 'Your job is now live.' : 'You can find it in your drafts.',
      });
      void loadDrafts();
      if (status === 'open') {
        setEditingId(null);
        setJobTitle('');
        setRequirements('');
        setJobType('');
        setEmploymentType('');
        setSkillWeights(defaultSkillRows());
        setFieldErrors({});
      }
    } catch (error) {
      toast({
        title: 'Save failed',
        description: error instanceof Error ? error.message : 'Could not save the job.',
        variant: 'destructive',
      });
    } finally {
      setSavingAction(null);
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
      if (result.suggestedSkills.length > 0) {
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
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-headline">JD Creator</h1>
            <p className="text-muted-foreground">{editingId ? 'Update the job details below and save.' : 'Post your requirements and generate a job description with AI.'}</p>
          </div>
          {editingId && (
            <Button variant="outline" size="sm" onClick={() => { setEditingId(null); loadedEditIdRef.current = null; setJobTitle(''); setRequirements(''); setJobType(''); setEmploymentType(''); setSkillWeights(defaultSkillRows()); setFieldErrors({}); }}>
              Create New Instead
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create a new job description</CardTitle>
            <CardDescription>Enter role details and let Atlas generate a JD in your theme.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="job-title">Job Title<RequiredMark /></Label>
                  <Input
                    id="job-title"
                    placeholder="e.g., Senior Frontend Developer"
                    value={jobTitle}
                    onChange={(e) => {
                      setJobTitle(e.target.value);
                      if (fieldErrors.jobTitle) setFieldErrors((prev) => ({ ...prev, jobTitle: undefined }));
                    }}
                    disabled={isLoading}
                    className={fieldErrors.jobTitle ? 'border-destructive' : undefined}
                    required
                  />
                  {fieldErrors.jobTitle ? (
                    <p className="text-sm text-destructive" role="alert">{fieldErrors.jobTitle}</p>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="job-type">Job Type<RequiredMark /></Label>
                  <Select
                    value={jobType}
                    onValueChange={(value) => {
                      setJobType(value);
                      if (fieldErrors.jobType) setFieldErrors((prev) => ({ ...prev, jobType: undefined }));
                    }}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="job-type" className={fieldErrors.jobType ? 'border-destructive' : undefined}>
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="On-site">On-site</SelectItem>
                      <SelectItem value="Remote">Remote</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldErrors.jobType ? (
                    <p className="text-sm text-destructive" role="alert">{fieldErrors.jobType}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employment-type">Employment Type<RequiredMark /></Label>
                  <Select
                    value={employmentType}
                    onValueChange={(value) => {
                      setEmploymentType(value);
                      if (fieldErrors.employmentType) setFieldErrors((prev) => ({ ...prev, employmentType: undefined }));
                    }}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="employment-type" className={fieldErrors.employmentType ? 'border-destructive' : undefined}>
                      <SelectValue placeholder="Select employment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldErrors.employmentType ? (
                    <p className="text-sm text-destructive" role="alert">{fieldErrors.employmentType}</p>
                  ) : null}
                </div>
              </div>

              <Separator className="my-2" />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="requirements">Key Requirements & Skills<RequiredMark /></Label>
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
                  placeholder="Write the requirements, responsibilities, must-haves, nice-to-haves..."
                  value={requirements}
                  onChange={(e) => {
                    setRequirements(e.target.value);
                    if (fieldErrors.requirements) setFieldErrors((prev) => ({ ...prev, requirements: undefined }));
                  }}
                  className={`min-h-[150px] ${fieldErrors.requirements ? 'border-destructive' : ''}`}
                  disabled={isLoading || isGenerating}
                  required
                />
                {fieldErrors.requirements ? (
                  <p className="text-sm text-destructive" role="alert">{fieldErrors.requirements}</p>
                ) : null}
              </div>

              <Separator className="my-2" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-semibold">Skill priorities<RequiredMark /></h3>
                    <p className="text-[11px] text-muted-foreground">
                      Add at least {MIN_MANUAL_SKILLS} skills manually. Higher weight = stronger boost when the resume shows that skill (e.g. React 10, CSS 6).
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
                        className={`flex-1 h-10 ${fieldErrors.skills && !row.skill.trim() ? 'border-destructive' : ''}`}
                        placeholder="e.g. React"
                        value={row.skill}
                        onChange={(e) => {
                          updateSkillRow(index, { skill: e.target.value });
                          if (fieldErrors.skills) setFieldErrors((prev) => ({ ...prev, skills: undefined }));
                        }}
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
                        disabled={skillWeights.length <= MIN_MANUAL_SKILLS}
                        className="h-10 text-muted-foreground hover:text-destructive hover:bg-destructive/5 disabled:opacity-40"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  {fieldErrors.skills ? (
                    <p className="text-sm text-destructive" role="alert">{fieldErrors.skills}</p>
                  ) : null}
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-11"
                  disabled={savingAction !== null || isGenerating}
                  onClick={() => void handleFinalSave('draft')}
                >
                  {savingAction === 'draft' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save as Draft
                </Button>
                <Button
                  type="button"
                  className="flex-1 h-11"
                  disabled={savingAction !== null || isGenerating}
                  onClick={() => void handleFinalSave('open')}
                >
                  {savingAction === 'open' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
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
              Recent Drafts
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
                    <div className="font-medium text-sm group-hover:text-primary">{job.title}</div>
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
    </div>
  );
}
