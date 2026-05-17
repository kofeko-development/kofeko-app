'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { evaluationsApi } from '@/lib/stage1-2-api';
import { 
  Sparkles, 
  Search, 
  User, 
  Briefcase, 
  Calendar, 
  ArrowRight, 
  ChevronRight, 
  SlidersHorizontal,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

type EvaluationItem = {
  id: string;
  score: number;
  summary?: string | null;
  whyCard?: string | null;
  createdAt: string;
  candidate?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  job?: {
    id: string;
    title: string;
  } | null;
  skillMatches?: any;
  sectionScores?: any;
  hiringIntelligence?: any;
};

export default function AssessmentsPage() {
  const { toast } = useToast();
  const [evaluations, setEvaluations] = useState<EvaluationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [selectedEval, setSelectedEval] = useState<EvaluationItem | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editScore, setEditScore] = useState<number>(0);
  const [editWhyCard, setEditWhyCard] = useState<string>('');

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      const res = await evaluationsApi.list({ page: 1, limit: 100 });
      setEvaluations(res.items || []);
    } catch (error) {
      console.error('Failed to load evaluations', error);
      toast({
        title: 'Error loading assessments',
        description: error instanceof Error ? error.message : 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const handleOpenDetail = (evalItem: EvaluationItem) => {
    setSelectedEval(evalItem);
    setEditScore(evalItem.score);
    setEditWhyCard(evalItem.whyCard || evalItem.summary || '');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEval) return;
    try {
      setIsUpdating(true);
      await evaluationsApi.update(selectedEval.id, {
        score: editScore,
        whyCard: editWhyCard,
      });
      toast({
        title: 'Evaluation updated',
        description: 'Candidate score and breakdown updated successfully.',
      });
      setSelectedEval(null);
      fetchEvaluations();
    } catch (error) {
      toast({
        title: 'Failed to update',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredEvaluations = evaluations.filter((item) => {
    const candidateName = `${item.candidate?.firstName || ''} ${item.candidate?.lastName || ''}`.toLowerCase();
    const jobTitle = (item.job?.title || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return candidateName.includes(search) || jobTitle.includes(search);
  });

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (score >= 60) return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
  };

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
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
          <p className="text-muted-foreground text-sm font-medium">Analyzing database and evaluating metrics...</p>
        </div>
      ) : filteredEvaluations.length === 0 ? (
        <Card className="border-dashed border-2 py-16 flex flex-col items-center justify-center text-center">
          <Sparkles className="h-12 w-12 text-muted-foreground mb-4 opacity-55" />
          <h3 className="font-semibold text-lg">No Assessments Found</h3>
          <p className="text-muted-foreground max-w-md mt-1 text-sm">
            Assessments appear automatically when candidates submit resumes and are run through the AI screener.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredEvaluations.map((item) => {
            const candidateName = `${item.candidate?.firstName || 'Candidate'} ${item.candidate?.lastName || ''}`;
            const formattedDate = new Date(item.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
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
                          "{item.whyCard}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 shrink-0 border-t md:border-t-0 pt-4 md:pt-0">
                    <div className="flex items-center gap-2">
                      <div className={`px-3 py-1 rounded-full border text-sm font-semibold tracking-wide ${getScoreBadgeColor(item.score)}`}>
                        Match Score: {item.score}%
                      </div>
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

      {/* Detail & Update Dialog */}
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
              <DialogDescription className="text-sm">
                Evaluation for <strong className="font-semibold text-foreground">{selectedEval.job?.title}</strong>
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-4">
              {/* Score card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted/30 border rounded-xl p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-xs text-muted-foreground font-semibold uppercase">Overall Fit</span>
                  <span className="text-4xl font-extrabold text-primary mt-1.5">{selectedEval.score}%</span>
                </div>
                
                <div className="bg-muted/30 border rounded-xl p-4 flex flex-col items-center justify-center text-center col-span-2">
                  <span className="text-xs text-muted-foreground font-semibold uppercase self-start mb-2">Confidence Level</span>
                  <div className="flex items-center gap-2 self-start text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    High AI confidence based on CV parse & JD alignment.
                  </div>
                </div>
              </div>

              {/* Skills Matches & Breakdown */}
              {selectedEval.skillMatches && (
                <div className="space-y-2">
                  <h4 className="font-bold text-sm text-foreground uppercase tracking-wider">Skill Matching Breakdown</h4>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {Object.entries(selectedEval.skillMatches).map(([skill, val]: [string, any]) => (
                      <Badge key={skill} variant="secondary" className="px-2.5 py-1 text-xs">
                        {skill}: {typeof val === 'number' ? `${val}/10` : String(val)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Edit Score & whyCard Form */}
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
                    onChange={(e) => setEditScore(Number(e.target.value))}
                    className="max-w-[120px]"
                    required
                  />
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
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
