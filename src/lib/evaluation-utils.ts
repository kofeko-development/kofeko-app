/** Shared helpers for AI evaluation display across job applicants and assessments. */

export type HiringIntelligence = Record<string, unknown>;

export type SkillMatchEntry = {
  skill: string;
  matched?: boolean;
  score?: number;
};

export type EvaluationRankEntry = {
  rank: number;
  candidate: { id: string; firstName?: string; lastName?: string; email?: string };
  evaluation: { score: number; id?: string };
};

export type EvaluateAllResult = {
  evaluated: number;
  failed: number;
  errors?: Array<{ candidateId: string; reason: string }>;
};

export function parseHiringIntelligence(raw: unknown): HiringIntelligence | null {
  if (raw == null) return null;
  if (typeof raw === 'object' && !Array.isArray(raw)) return raw as HiringIntelligence;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as HiringIntelligence;
      }
    } catch {
      return null;
    }
  }
  return null;
}

export function hasAiEvaluation(evaluation: unknown): boolean {
  if (!evaluation || typeof evaluation !== 'object') return false;
  const e = evaluation as { id?: string; score?: number; aiGenerated?: boolean };
  return Boolean(e.id) || typeof e.score === 'number';
}

export function getEvaluationScore(evaluation: unknown): number | null {
  if (!hasAiEvaluation(evaluation)) return null;
  const score = (evaluation as { score?: number }).score;
  return typeof score === 'number' && !Number.isNaN(score) ? score : null;
}

/** Display label for match score column and badges. */
export function formatMatchScoreLabel(hasEvaluation: boolean, score: number | null): string {
  if (!hasEvaluation || score === null) return 'Not assessed';
  return `${Math.round(score)}%`;
}

/** Progress bar value: 0 when not assessed (bar hidden via hasEvaluation check in UI). */
export function getMatchScoreProgress(hasEvaluation: boolean, score: number | null): number {
  if (!hasEvaluation || score === null) return 0;
  return Math.min(100, Math.max(0, score));
}

export function normalizeSkillMatches(raw: unknown): SkillMatchEntry[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    const out: SkillMatchEntry[] = [];
    for (const item of raw) {
      if (typeof item === 'string') {
        out.push({ skill: item, matched: true });
        continue;
      }
      if (item && typeof item === 'object' && 'skill' in item) {
        const o = item as { skill?: string; matched?: boolean; score?: number };
        const skill = String(o.skill ?? '').trim();
        if (skill) out.push({ skill, matched: o.matched, score: o.score });
      }
    }
    return out;
  }
  if (typeof raw === 'object') {
    return Object.entries(raw as Record<string, unknown>).map(([skill, val]) => ({
      skill,
      score: typeof val === 'number' ? val : undefined,
      matched: typeof val === 'number' ? val > 0 : Boolean(val),
    }));
  }
  return [];
}

export function buildRankMap(rankings: EvaluationRankEntry[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const row of rankings) {
    if (row.candidate?.id != null) map.set(row.candidate.id, row.rank);
  }
  return map;
}

export function formatBatchEvaluationMessage(
  result: EvaluateAllResult,
  applicantCount: number,
): { title: string; description: string } {
  const { evaluated, failed, errors = [] } = result;

  if (applicantCount === 0) {
    return {
      title: 'No candidates to evaluate',
      description: 'Add candidates to this job pipeline before running batch AI evaluation.',
    };
  }

  if (evaluated === 0 && failed === 0) {
    return {
      title: 'Nothing to evaluate',
      description: 'All candidates with resumes may already have evaluations, or none are eligible.',
    };
  }

  const errorPreview = errors
    .slice(0, 3)
    .map((e) => e.reason)
    .join('; ');

  if (evaluated === 0 && failed > 0) {
    return {
      title: 'Batch evaluation failed',
      description: errorPreview || `${failed} candidate(s) could not be evaluated.`,
    };
  }

  if (failed > 0) {
    return {
      title: 'Batch evaluation finished with errors',
      description: `Evaluated ${evaluated}, failed ${failed}.${errorPreview ? ` ${errorPreview}` : ''}`,
    };
  }

  return {
    title: 'Batch evaluation finished',
    description: `Successfully evaluated ${evaluated} candidate(s).`,
  };
}

export function validateOverrideScore(value: number): string | null {
  if (Number.isNaN(value)) return 'Enter a valid score between 0 and 100.';
  if (value < 0 || value > 100) return 'Score must be between 0 and 100.';
  return null;
}
