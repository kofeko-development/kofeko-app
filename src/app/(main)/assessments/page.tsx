'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useApiErrorToast } from '@/hooks/use-api-error-toast';
import { useAuth } from '@/lib/auth';
import { evaluationsApi, type EvaluationRecord } from '@/lib/stage1-2-api';
import {
  parseHiringIntelligence,
  normalizeSkillMatches,
  validateOverrideScore,
} from '@/lib/evaluation-utils';
import {
  Sparkles,
  Search,
  Briefcase,
  Calendar,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

type EvaluationItem = EvaluationRecord;

function getConfidenceLabel(hi: Record<string, unknown> | null): string {
  if (!hi) return 'No AI confidence data yet.';
  const confidence = hi.confidence ?? hi.aiConfidence ?? hi.overallConfidence;
  if (typeof confidence === 'string' && confidence.trim()) return confidence;
  if (typeof confidence === 'number') {
    if (confidence >= 0.8) return 'High AI confidence based on CV parse & JD alignment.';
    if (confidence >= 0.5) return 'Moderate AI confidence — review recommended.';
    return 'Lower AI confidence — manual review recommended.';
  }
  const sectionScores = hi.sectionScores;
  if (sectionScores && typeof sectionScores === 'object') {
    return 'Confidence derived from section-level scoring.';
  }
  return 'AI evaluation completed — see breakdown below.';
}

export default function AssessmentsPage() {
  const { toast } = useToast();
  const { showError } = useApiErrorToast();
  const { hasPermission } = useAuth();
  const canUpdateEvaluation = hasPermission('evaluation:update');
  const [evaluations, setEvaluations] = useState<EvaluationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedEval, setSelectedEval] = useState<EvaluationItem | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editScore, setEditScore] = useState<string>('');
  const [editWhyCard, setEditWhyCard] = useState<string>('');
  const [scoreError, setScoreError] = useState<string | null>(null);

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      const res = await evaluationsApi.list({ page: 1, limit: 100 });
      setEvaluations(res.items || []);
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchEvaluations();
  }, []);

  const handleOpenDetail = (evalItem: EvaluationItem) => {
    setSelectedEval(evalItem);
    setEditScore(String(evalItem.score));
    setEditWhyCard(evalItem.whyCard || evalItem.summary || '');
    setScoreError(null);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEval) return;

    const parsed = Number(editScore);
    const validationError = validateOverrideScore(parsed);
    if (validationError) {
      setScoreError(validationError);
      return;
    }
    setScoreError(null);

    try {
      setIsUpdating(true);
      await evaluationsApi.update(selectedEval.id, {
        score: parsed,
        whyCard: editWhyCard,
      });
      toast({
        title: 'Evaluation updated',
        description: 'Candidate score and breakdown updated successfully.',
      });
      setSelectedEval(null);
      void fetchEvaluations();
    } catch (error) {
      showError(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredEvaluations = evaluations.filter((item) => {
    const candidateName = `${item.candidate?.firstName || ''} ${item.candidate?.lastName || ''}`.toLowerCase();
    const jobTitle = (item.job?.title || '').toLowerCase();
    const summary = (item.summary || item.whyCard || '').toLowerCase();
    const search = searchTerm.toLowerCase().trim();
    if (!search) return true;
    return (
      candidateName.includes(search) ||
      jobTitle.includes(search) ||
      summary.includes(search)
    );
  });

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (score >= 60) return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
  };

  const selectedHi = selectedEval ? parseHiringIntelligence(selectedEval.hiringIntelligence) : null;
  const selectedSkills = selectedEval ? normalizeSkillMatches(selectedEval.skillMatches) : [];

  return (
    <div className="flex flex-col gap-6 p-4 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-headline tracking-tight flex items-center gap-2 text-foreground">
            <Sparkles className="h-8 w-8 text-primary animate-pulse" />
            AI Skill Assessments
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time candidate profile scoring, skills analysis, and evaluation match indexes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => void fetchEvaluations()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <div className="relative w-64 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by candidate or role..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent" />
          <p className="text-muted-foreground text-sm font-medium">Loading evaluations...</p>
        </div>
      ) : evaluations.length === 0 ? (
        <Card className="border-dashed border-2 py-16 flex flex-col items-center justify-center text-center">
          <Sparkles className="h-12 w-12 text-muted-foreground mb-4 opacity-55" />
          <h3 className="font-semibold text-lg">No evaluations yet</h3>
          <p className="text-muted-foreground max-w-md mt-1 text-sm">
            Run <strong>Evaluate with AI</strong> on a job applicant to create an assessment here.
          </p>
        </Card>
      ) : filteredEvaluations.length === 0 ? (
        <Card className="border-dashed border-2 py-16 flex flex-col items-center justify-center text-center">
          <Search className="h-12 w-12 text-muted-foreground mb-4 opacity-55" />
          <h3 className="font-semibold text-lg">No matching assessments</h3>
          <p className="text-muted-foreground max-w-md mt-1 text-sm">
            No results for &quot;{searchTerm}&quot;. Try a different name or job title.
          </p>
          <Button variant="link" className="mt-2" onClick={() => setSearchTerm('')}>
            Clear search
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredEvaluations.map((item) => {
            const candidateName = `${item.candidate?.firstName || 'Candidate'} ${item.candidate?.lastName || ''}`;
            const formattedDate = new Date(item.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <Card
                key={item.id}
                className="hover:shadow-md transition-all border border-muted hover:border-primary/20 group cursor-pointer"
                onClick={() => handleOpenDetail(item)}
              >
                <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                      {candidateName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
                        {candidateName}
                        <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all translate-x-[-4px] group-hover:translate-x-0" />
                      </h3>
                      <p className="text-sm text-muted-foreground font-medium flex items-center gap-1.5 mt-0.5">
                        <Briefcase className="h-3.5 w-3.5" />
                        {item.job?.title || 'General Application'}
                      </p>
                      {item.whyCard && (
                        <p className="text-sm text-muted-foreground/80 line-clamp-1 mt-2 max-w-2xl font-light italic">
                          &quot;{item.whyCard}&quot;
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 shrink-0 border-t md:border-t-0 pt-4 md:pt-0">
                    <div className={`px-3 py-1 rounded-full border text-sm font-semibold tracking-wide ${getScoreBadgeColor(item.score)}`}>
                      Match Score: {item.score}%
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formattedDate}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={selectedEval !== null} onOpenChange={(open) => !open && setSelectedEval(null)}>
        {selectedEval && (
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1 text-primary">
                <Sparkles className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-wider">AI Assessment Details</span>
              </div>
              <DialogTitle className="text-2xl font-bold text-foreground">
                {selectedEval.candidate?.firstName} {selectedEval.candidate?.lastName}
              </DialogTitle>
              <DialogDescription className="text-sm flex flex-col gap-2">
                <span>
                  Evaluation for{' '}
                  <strong className="font-semibold text-foreground">{selectedEval.job?.title || 'Unknown role'}</strong>
                </span>
                {selectedEval.job?.id && (
                  <Button variant="link" className="h-auto p-0 justify-start" asChild>
                    <Link href={`/job-postings/${selectedEval.job.id}`}>
                      <ExternalLink className="h-3.5 w-3.5 mr-1" />
                      View job posting
                    </Link>
                  </Button>
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted/30 border rounded-xl p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-xs text-muted-foreground font-semibold uppercase">Overall Fit</span>
                  <span className="text-4xl font-extrabold text-primary mt-1.5">{selectedEval.score}%</span>
                </div>

                <div className="bg-muted/30 border rounded-xl p-4 flex flex-col col-span-2">
                  <span className="text-xs text-muted-foreground font-semibold uppercase mb-2">Confidence Level</span>
                  <div className="flex items-start gap-2 text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{getConfidenceLabel(selectedHi)}</span>
                  </div>
                </div>
              </div>

              {(selectedEval.summary || selectedEval.whyCard) && (
                <div className="space-y-2">
                  <h4 className="font-bold text-sm text-foreground uppercase tracking-wider">AI Summary</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedEval.whyCard || selectedEval.summary}
                  </p>
                </div>
              )}

              {selectedSkills.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-sm text-foreground uppercase tracking-wider">Skill Matching Breakdown</h4>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {selectedSkills.map((match, idx) => (
                      <Badge key={`${match.skill}-${idx}`} variant="secondary" className="px-2.5 py-1 text-xs">
                        {match.skill}
                        {match.matched ? ' ✓' : ''}
                        {typeof match.score === 'number' ? ` (${match.score})` : ''}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedEval.sectionScores && typeof selectedEval.sectionScores === 'object' && (
                <div className="space-y-2">
                  <h4 className="font-bold text-sm text-foreground uppercase tracking-wider">Section Scores</h4>
                  <div className="grid gap-2 text-sm">
                    {Object.entries(selectedEval.sectionScores as Record<string, unknown>).map(([key, val]) => (
                      <div key={key} className="flex justify-between border-b border-muted/50 pb-1">
                        <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                        <span className="font-medium">{typeof val === 'number' ? `${val}%` : String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedHi && (
                <div className="space-y-2">
                  <h4 className="font-bold text-sm text-foreground uppercase tracking-wider">Hiring Intelligence</h4>
                  <div className="text-sm text-muted-foreground space-y-2 rounded-lg border bg-muted/20 p-3">
                    {typeof selectedHi.applicationSummary === 'string' && (
                      <p><span className="font-semibold text-foreground">Application: </span>{selectedHi.applicationSummary}</p>
                    )}
                    {typeof selectedHi.experienceSummary === 'object' && selectedHi.experienceSummary !== null && (
                      <p>
                        <span className="font-semibold text-foreground">Experience: </span>
                        {(selectedHi.experienceSummary as { narrative?: string }).narrative || '—'}
                      </p>
                    )}
                    {Array.isArray(selectedHi.riskFlags) && selectedHi.riskFlags.length > 0 && (
                      <p>
                        <span className="font-semibold text-foreground">Risk flags: </span>
                        {(selectedHi.riskFlags as string[]).join(', ')}
                      </p>
                    )}
                    {Array.isArray(selectedHi.suggestedInterviewQuestions) &&
                      (selectedHi.suggestedInterviewQuestions as string[]).length > 0 && (
                        <div>
                          <span className="font-semibold text-foreground">Suggested questions:</span>
                          <ul className="list-disc list-inside mt-1">
                            {(selectedHi.suggestedInterviewQuestions as string[]).slice(0, 5).map((q, i) => (
                              <li key={i}>{q}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>
                </div>
              )}

              {canUpdateEvaluation ? (
                <form onSubmit={handleUpdate} className="space-y-4 border-t pt-4">
                  <h4 className="font-bold text-sm text-foreground uppercase tracking-wider">Recruiter Review & Overrides</h4>

                  <div className="grid gap-2">
                    <Label htmlFor="score" className="text-sm font-semibold">Override Match Score (0 - 100)</Label>
                    <Input
                      id="score"
                      type="number"
                      min={0}
                      max={100}
                      value={editScore}
                      onChange={(e) => {
                        setEditScore(e.target.value);
                        setScoreError(null);
                      }}
                      className="max-w-[120px]"
                      required
                    />
                    {scoreError && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {scoreError}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="whyCard" className="text-sm font-semibold">Evaluation Summary & Notes</Label>
                    <Textarea
                      id="whyCard"
                      value={editWhyCard}
                      onChange={(e) => setEditWhyCard(e.target.value)}
                      rows={4}
                      placeholder="Enter candidate profile highlights, fit reasons, or skill summaries..."
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={() => setSelectedEval(null)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating ? 'Saving Changes...' : 'Save Overrides'}
                    </Button>
                  </div>
                </form>
              ) : (
                <p className="text-sm text-muted-foreground border-t pt-4">
                  You do not have permission to override scores. Ask an admin if you need evaluation:update access.
                </p>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
