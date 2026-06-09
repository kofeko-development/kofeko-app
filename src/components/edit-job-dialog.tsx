'use client';

import { useEffect, useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ApiError } from '@/lib/api-client';
import { aiApi, jobsApi, type CreatedJob, type SkillWeight } from '@/lib/stage1-2-api';

const MIN_MANUAL_SKILLS = 2;

const defaultSkillRows = (): SkillWeight[] => [
  { skill: '', weight: 7, yearsOfExperience: 3 },
  { skill: '', weight: 7, yearsOfExperience: 3 },
];

type FormState = {
  title: string;
  requirements: string;
  jobType: string;
  employmentType: string;
  skillWeights: SkillWeight[];
};

type FieldErrors = {
  title?: string;
  jobType?: string;
  employmentType?: string;
  requirements?: string;
  skills?: string;
};

function RequiredMark() {
  return (
    <span className="text-destructive ml-0.5" aria-hidden="true">
      *
    </span>
  );
}

function jobToFormState(job: CreatedJob): FormState {
  let skillWeights: SkillWeight[] = defaultSkillRows();
  if (job.skillWeights?.length) {
    skillWeights = job.skillWeights.map((sw) => ({
      skill: sw.skill ?? '',
      weight: Math.min(10, Math.max(0, Math.round(Number(sw.weight) || 7))),
      yearsOfExperience: sw.yearsOfExperience ?? 3,
    }));
    while (skillWeights.length < MIN_MANUAL_SKILLS) {
      skillWeights.push({ skill: '', weight: 7, yearsOfExperience: 3 });
    }
  }

  return {
    title: job.title ?? '',
    requirements: job.requirements ?? job.description ?? '',
    jobType: job.department ?? '',
    employmentType: job.employmentType ?? '',
    skillWeights,
  };
}

function validateForm(form: FormState): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.title.trim()) errors.title = 'Job title is required.';
  if (!form.jobType.trim()) errors.jobType = 'Job type is required.';
  if (!form.employmentType.trim()) errors.employmentType = 'Employment type is required.';
  if (!form.requirements.trim()) errors.requirements = 'Key requirements & skills are required.';
  const filledSkills = form.skillWeights.filter((row) => row.skill.trim());
  if (filledSkills.length < MIN_MANUAL_SKILLS) {
    errors.skills = `Add at least ${MIN_MANUAL_SKILLS} skills manually.`;
  }
  return errors;
}

type EditJobDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: CreatedJob | null;
  onSaved?: () => void | Promise<void>;
};

export function EditJobDialog({ open, onOpenChange, job, onSaved }: EditJobDialogProps) {
  const { toast } = useToast();
  const [formState, setFormState] = useState<FormState>({
    title: '',
    requirements: '',
    jobType: '',
    employmentType: '',
    skillWeights: defaultSkillRows(),
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (open && job) {
      setFormState(jobToFormState(job));
      setFieldErrors({});
    }
  }, [open, job]);

  const updateSkillRow = (index: number, patch: Partial<SkillWeight>) => {
    setFormState((prev) => ({
      ...prev,
      skillWeights: prev.skillWeights.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    }));
  };

  const addSkillRow = () => {
    setFormState((prev) => ({
      ...prev,
      skillWeights: [...prev.skillWeights, { skill: '', weight: 7, yearsOfExperience: 3 }],
    }));
  };

  const removeSkillRow = (index: number) => {
    if (formState.skillWeights.length <= MIN_MANUAL_SKILLS) {
      toast({
        title: 'Minimum skills required',
        description: `Keep at least ${MIN_MANUAL_SKILLS} skill rows.`,
        variant: 'destructive',
      });
      return;
    }
    setFormState((prev) => ({
      ...prev,
      skillWeights: prev.skillWeights.filter((_, i) => i !== index),
    }));
  };

  const handleGenerateWithAI = async () => {
    if (!formState.title.trim()) {
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
        jobTitle: formState.title,
        requirements: formState.requirements,
        jobType: formState.jobType || undefined,
        employmentType: formState.employmentType || undefined,
      });

      setFormState((prev) => ({
        ...prev,
        requirements: result.plainText,
        skillWeights:
          result.suggestedSkills.length > 0
            ? result.suggestedSkills.length >= MIN_MANUAL_SKILLS
              ? result.suggestedSkills
              : [
                  ...result.suggestedSkills,
                  ...defaultSkillRows().slice(result.suggestedSkills.length),
                ]
            : prev.skillWeights,
      }));

      toast({
        title: 'JD Generated!',
        description: 'Description and skills have been populated by AI.',
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

  const handleSave = async () => {
    if (!job) return;

    const errors = validateForm(formState);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast({
        title: 'Missing required fields',
        description: 'Please complete all mandatory fields before saving.',
        variant: 'destructive',
      });
      return;
    }

    const requirements = formState.requirements.trim();
    const skillWeightsPayload = formState.skillWeights
      .filter((row) => row.skill.trim())
      .map((row) => ({
        skill: row.skill.trim(),
        weight: Math.min(10, Math.max(0, Math.round(Number(row.weight)) || 0)),
        yearsOfExperience: Number(row.yearsOfExperience) || 0,
      }));

    setIsSaving(true);
    try {
      await jobsApi.update(job.id, {
        title: formState.title.trim(),
        description: requirements.slice(0, 5000),
        department: formState.jobType.trim() || undefined,
        employmentType: formState.employmentType.trim() || undefined,
        requirements: requirements.slice(0, 5000),
        skillWeights: skillWeightsPayload,
      });

      toast({
        title: 'Job updated',
        description: `"${formState.title.trim()}" has been saved.`,
      });

      onOpenChange(false);
      await onSaved?.();
    } catch (error) {
      if (error instanceof ApiError && error.errorCode === 'JOB_IS_CLOSED') {
        toast({
          title: 'Job is closed',
          description: 'This job has been permanently closed and cannot be modified.',
          variant: 'destructive',
        });
        return;
      }
      toast({
        title: 'Save failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,100dvh-2rem)] w-[calc(100vw-2rem)] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:w-full">
        <DialogHeader className="shrink-0 space-y-1.5 border-b px-6 py-5">
          <DialogTitle>Edit Job</DialogTitle>
          <DialogDescription>
            Update the job details below. Changes apply to this posting immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-6 py-4">
          <div className="grid min-w-0 gap-5">
            <div className="grid gap-2">
              <Label htmlFor="edit-job-title">
                Job Title
                <RequiredMark />
              </Label>
              <Input
                id="edit-job-title"
                placeholder="e.g., Senior Frontend Developer"
                value={formState.title}
                onChange={(e) => setFormState((p) => ({ ...p, title: e.target.value }))}
                className="h-11"
              />
              {fieldErrors.title && (
                <p className="text-sm text-destructive">{fieldErrors.title}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  Job Type
                  <RequiredMark />
                </Label>
                <Select
                  value={formState.jobType}
                  onValueChange={(val) => setFormState((p) => ({ ...p, jobType: val }))}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Remote">Remote</SelectItem>
                    <SelectItem value="On-site">On-site</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
                {fieldErrors.jobType && (
                  <p className="text-sm text-destructive">{fieldErrors.jobType}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>
                  Employment Type
                  <RequiredMark />
                </Label>
                <Select
                  value={formState.employmentType}
                  onValueChange={(val) => setFormState((p) => ({ ...p, employmentType: val }))}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select employment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
                {fieldErrors.employmentType && (
                  <p className="text-sm text-destructive">{fieldErrors.employmentType}</p>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="edit-job-requirements">
                  Key Requirements &amp; Skills
                  <RequiredMark />
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-primary hover:text-primary/80"
                  onClick={() => void handleGenerateWithAI()}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  ) : (
                    <Sparkles className="mr-1 h-3 w-3" />
                  )}
                  Generate with AI
                </Button>
              </div>
              <Textarea
                id="edit-job-requirements"
                placeholder="Write the requirements, responsibilities, must-haves, nice-to-haves..."
                className="min-h-[180px] leading-relaxed"
                value={formState.requirements}
                onChange={(e) => setFormState((p) => ({ ...p, requirements: e.target.value }))}
              />
              {fieldErrors.requirements && (
                <p className="text-sm text-destructive">{fieldErrors.requirements}</p>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-semibold">
                    Skill Priorities
                    <RequiredMark />
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Add at least {MIN_MANUAL_SKILLS} skills manually. Higher weight = stronger boost when the resume shows that skill.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={addSkillRow}
                  className="h-auto p-0 font-semibold text-primary"
                >
                  Add skill
                </Button>
              </div>
              {fieldErrors.skills && (
                <p className="text-sm text-destructive">{fieldErrors.skills}</p>
              )}

              <div className="space-y-3">
                {formState.skillWeights.map((row, index) => (
                  <div
                    key={index}
                    className="grid min-w-0 gap-3 rounded-lg border p-3 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto] sm:items-center"
                  >
                    <Input
                      className="h-10 min-w-0"
                      placeholder="e.g. React"
                      value={row.skill}
                      onChange={(e) => updateSkillRow(index, { skill: e.target.value })}
                    />
                    <div className="flex items-center gap-2">
                      <span className="whitespace-nowrap text-xs font-medium text-muted-foreground">Weight</span>
                      <Input
                        type="number"
                        min={0}
                        max={10}
                        className="h-10 w-16 text-center"
                        value={row.weight}
                        onChange={(e) =>
                          updateSkillRow(index, { weight: Number.parseInt(e.target.value, 10) || 0 })
                        }
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="whitespace-nowrap text-xs font-medium text-muted-foreground">Years</span>
                      <Input
                        type="number"
                        min={0}
                        className="h-10 w-16 text-center"
                        value={row.yearsOfExperience ?? ''}
                        onChange={(e) =>
                          updateSkillRow(index, {
                            yearsOfExperience: Number.parseInt(e.target.value, 10) || 0,
                          })
                        }
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSkillRow(index)}
                      disabled={formState.skillWeights.length <= MIN_MANUAL_SKILLS}
                      className="h-10 justify-self-start text-muted-foreground hover:bg-destructive/5 hover:text-destructive sm:justify-self-auto"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="shrink-0 gap-2 border-t px-6 py-4 sm:justify-end">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void handleSave()} disabled={isSaving || !job}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
