'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useApiErrorToast } from '@/hooks/use-api-error-toast';
import {
  Loader2,
  Sparkles,
  Upload,
  Trash2,
  Plus,
  BrainCircuit,
  ChevronDown,
  ChevronUp,
  FileText,
} from 'lucide-react';
import { aiApi, type EvaluationLabResultItem, type SkillWeight } from '@/lib/stage1-2-api';
import sanitizeHtml from 'sanitize-html';

function scoreBadgeClass(score: number): string {
  if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
  if (score >= 60) return 'bg-amber-100 text-amber-800 border-amber-200';
  return 'bg-red-100 text-red-800 border-red-200';
}

function ResultCard({ item, rank }: { item: EvaluationLabResultItem; rank: number }) {
  const [expanded, setExpanded] = useState(rank === 1);

  if (!item.success) {
    return (
      <Card className="border-destructive/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              {item.fileName}
            </CardTitle>
            <Badge variant="destructive">Failed</Badge>
          </div>
          <CardDescription>{item.error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const hi = item.analysis.hiringIntelligence;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <span className="text-muted-foreground font-normal">#{rank}</span>
            <FileText className="h-4 w-4 text-muted-foreground" />
            {item.fileName}
          </CardTitle>
          <Badge className={scoreBadgeClass(item.overallScore)} variant="outline">
            {item.overallScore}% match
          </Badge>
        </div>
        <CardDescription>{item.rankingSummary}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {hi?.applicationSummary && (
          <p className="text-sm text-muted-foreground">{hi.applicationSummary}</p>
        )}

        {item.analysis.scores.skillMatches.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.analysis.scores.skillMatches.map((m) => (
              <Badge
                key={m.skill}
                variant="outline"
                className={m.matched ? 'border-green-300 bg-green-50' : 'border-slate-200 bg-slate-50 opacity-70'}
              >
                {m.skill} ({m.weight}){m.matched ? ' ✓' : ''}
              </Badge>
            ))}
          </div>
        )}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? <ChevronUp className="mr-1 h-4 w-4" /> : <ChevronDown className="mr-1 h-4 w-4" />}
          {expanded ? 'Hide details' : 'Show full analysis'}
        </Button>

        {expanded && (
          <div className="space-y-4 rounded-lg border bg-muted/30 p-4 text-sm">
            <div>
              <p className="font-semibold mb-1">Section scores</p>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {Object.entries(item.analysis.scores.sections).map(([key, val]) => (
                  <div key={key} className="flex justify-between rounded bg-background px-2 py-1">
                    <span className="capitalize text-muted-foreground">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="font-medium">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {hi?.keyStrengths && hi.keyStrengths.length > 0 && (
              <div>
                <p className="font-semibold mb-1">Key strengths</p>
                <ul className="list-disc pl-5 space-y-0.5 text-muted-foreground">
                  {hi.keyStrengths.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {hi?.areasForGrowth && hi.areasForGrowth.length > 0 && (
              <div>
                <p className="font-semibold mb-1">Areas for growth</p>
                <ul className="list-disc pl-5 space-y-0.5 text-muted-foreground">
                  {hi.areasForGrowth.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {hi?.riskFlags && hi.riskFlags.length > 0 && (
              <div>
                <p className="font-semibold mb-1 text-amber-700">Risk flags</p>
                <ul className="list-disc pl-5 space-y-0.5 text-muted-foreground">
                  {hi.riskFlags.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {hi?.interviewRecommendation && (
              <div>
                <p className="font-semibold mb-1">Interview recommendation</p>
                <p className="text-muted-foreground capitalize">
                  {hi.interviewRecommendation.classification.replace(/_/g, ' ')} — {hi.interviewRecommendation.reasoning}
                </p>
              </div>
            )}

            {item.analysis.scores.roleFitNotes && (
              <div>
                <p className="font-semibold mb-1">Role fit notes</p>
                <p className="text-muted-foreground">{item.analysis.scores.roleFitNotes}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AiEvaluationLabPage() {
  const { toast } = useToast();
  const { showError } = useApiErrorToast();

  const [jobTitle, setJobTitle] = useState('');
  const [requirements, setRequirements] = useState('');
  const [description, setDescription] = useState('');
  const [jdHtml, setJdHtml] = useState('');
  const [skillWeights, setSkillWeights] = useState<SkillWeight[]>([]);
  const [resumeFiles, setResumeFiles] = useState<File[]>([]);
  const [results, setResults] = useState<EvaluationLabResultItem[] | null>(null);

  const [isGeneratingJd, setIsGeneratingJd] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const handleGenerateJd = async () => {
    if (!jobTitle.trim()) {
      toast({ title: 'Job title required', variant: 'destructive' });
      return;
    }
    setIsGeneratingJd(true);
    try {
      const data = await aiApi.generateJd({
        jobTitle: jobTitle.trim(),
        requirements: requirements.trim(),
      });
      setJdHtml(data.html);
      setDescription(data.plainText || '');
      setSkillWeights(data.suggestedSkills ?? []);
      toast({ title: 'Job description generated' });
    } catch (err) {
      showError(err);
    } finally {
      setIsGeneratingJd(false);
    }
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    if (!picked.length) return;
    setResumeFiles((prev) => {
      const names = new Set(prev.map((f) => f.name));
      const merged = [...prev];
      for (const f of picked) {
        if (!names.has(f.name)) merged.push(f);
      }
      return merged.slice(0, 30);
    });
    e.target.value = '';
  };

  const removeFile = (name: string) => {
    setResumeFiles((prev) => prev.filter((f) => f.name !== name));
  };

  const updateSkill = (index: number, patch: Partial<SkillWeight>) => {
    setSkillWeights((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  const addSkill = () => {
    setSkillWeights((prev) => [...prev, { skill: '', weight: 5, yearsOfExperience: 1 }]);
  };

  const removeSkill = (index: number) => {
    setSkillWeights((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRunEvaluation = async () => {
    if (!jobTitle.trim() || !description.trim()) {
      toast({
        title: 'Missing job details',
        description: 'Generate or enter a job title and description first.',
        variant: 'destructive',
      });
      return;
    }
    if (resumeFiles.length === 0) {
      toast({ title: 'Upload at least one resume', variant: 'destructive' });
      return;
    }

    setIsEvaluating(true);
    setResults(null);
    try {
      const data = await aiApi.runEvaluationLab({
        jobTitle: jobTitle.trim(),
        description: description.trim(),
        skillWeights: skillWeights.filter((s) => s.skill.trim()),
        resumes: resumeFiles,
      });
      setResults(data.results);
      const successCount = data.results.filter((r) => r.success).length;
      toast({
        title: 'Evaluation complete',
        description: `${successCount} of ${data.results.length} resume(s) scored.`,
      });
    } catch (err) {
      showError(err);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 pb-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <BrainCircuit className="h-8 w-8 text-primary" />
            AI Evaluation Lab
          </h1>
          <p className="text-muted-foreground mt-1">
            Generate a JD and score multiple resumes in one place. Nothing is saved to the database.
          </p>
        </div>
        <Badge variant="secondary" className="shrink-0">
          Testing only
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Create job description</CardTitle>
          <CardDescription>Generate with AI or paste your own description below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job title</Label>
              <Input
                id="jobTitle"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior MERN Stack Developer"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="requirements">Requirements / context</Label>
              <Textarea
                id="requirements"
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="Key skills, experience level, responsibilities..."
                rows={3}
              />
            </div>
          </div>
          <Button type="button" onClick={() => void handleGenerateJd()} disabled={isGeneratingJd}>
            {isGeneratingJd ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Generate JD with AI
          </Button>

          {jdHtml && (
            <div
              className="prose prose-sm max-w-none rounded-lg border bg-muted/20 p-4"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(jdHtml) }}
            />
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Job description (used for scoring)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={8}
              placeholder="Plain-text JD used when evaluating resumes..."
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Skill priorities (weight 0–10)</Label>
              <Button type="button" variant="outline" size="sm" onClick={addSkill}>
                <Plus className="mr-1 h-3 w-3" /> Add skill
              </Button>
            </div>
            {skillWeights.length === 0 ? (
              <p className="text-sm text-muted-foreground">No skills yet — generate a JD or add manually.</p>
            ) : (
              <div className="space-y-2">
                {skillWeights.map((sw, i) => (
                  <div key={i} className="flex flex-wrap items-center gap-2">
                    <Input
                      className="flex-1 min-w-[140px]"
                      value={sw.skill}
                      onChange={(e) => updateSkill(i, { skill: e.target.value })}
                      placeholder="Skill name"
                    />
                    <Input
                      type="number"
                      min={0}
                      max={10}
                      className="w-20"
                      value={sw.weight}
                      onChange={(e) => updateSkill(i, { weight: Number(e.target.value) })}
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeSkill(i)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Upload resumes</CardTitle>
          <CardDescription>PDF, DOCX, or TXT — up to 30 files, 8 MB each.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input
              type="file"
              accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              multiple
              onChange={handleFilesChange}
              className="cursor-pointer"
            />
          </div>
          {resumeFiles.length > 0 && (
            <ul className="space-y-1 text-sm">
              {resumeFiles.map((f) => (
                <li key={f.name} className="flex items-center justify-between rounded border px-3 py-2">
                  <span className="truncate">{f.name}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(f.name)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
          <Button
            type="button"
            size="lg"
            className="w-full md:w-auto"
            onClick={() => void handleRunEvaluation()}
            disabled={isEvaluating || resumeFiles.length === 0}
          >
            {isEvaluating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            {isEvaluating ? `Evaluating ${resumeFiles.length} resume(s)...` : 'Run AI evaluation'}
          </Button>
          {isEvaluating && (
            <p className="text-sm text-muted-foreground">
              This may take a minute per resume while Replicate analyzes each file.
            </p>
          )}
        </CardContent>
      </Card>

      {results && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold font-headline">3. Results (ranked by score)</h2>
          {results.map((item, idx) => (
            <ResultCard key={item.fileName + idx} item={item} rank={idx + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
