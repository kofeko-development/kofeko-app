export type HiringStageConfig = {
  stage: string;
  label?: string | null;
  order: number;
  enabled: boolean;
};

export const DEFAULT_HIRING_STAGES: HiringStageConfig[] = [
  { stage: 'applied', label: 'Applied', order: 1, enabled: true },
  { stage: 'screening', label: 'Screening', order: 2, enabled: true },
  { stage: 'technical_interview', label: 'Technical Interview', order: 3, enabled: true },
  { stage: 'hr_interview', label: 'HR Interview', order: 4, enabled: true },
  { stage: 'offer', label: 'Offer', order: 5, enabled: true },
  { stage: 'hired', label: 'Hired', order: 6, enabled: true },
  { stage: 'rejected', label: 'Rejected', order: 7, enabled: true },
];

const DEFAULT_STAGE_LABELS = Object.fromEntries(
  DEFAULT_HIRING_STAGES.map((stage) => [stage.stage, stage.label]),
) as Record<string, string>;

const INVALID_STAGE_LABELS = new Set(['none', 'null', 'undefined', 'n/a', 'na', '-']);

function formatStageKey(stageKey: string): string {
  if (stageKey.startsWith('custom_')) return 'Custom Round';
  return stageKey
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/** Use saved label when meaningful; otherwise fall back to the standard stage name. */
export function resolveHiringStageLabel(stage: Pick<HiringStageConfig, 'stage' | 'label'>): string {
  const custom = stage.label?.trim();
  if (custom && !INVALID_STAGE_LABELS.has(custom.toLowerCase())) {
    return custom;
  }

  return DEFAULT_STAGE_LABELS[stage.stage] ?? formatStageKey(stage.stage);
}

export function getActiveHiringStages(customStages?: HiringStageConfig[] | null): HiringStageConfig[] {
  const source =
    customStages && Array.isArray(customStages) && customStages.length > 0
      ? customStages
      : DEFAULT_HIRING_STAGES;

  return [...source]
    .sort((a, b) => a.order - b.order)
    .filter((stage) => stage.enabled && stage.stage !== 'rejected')
    .map((stage) => ({
      ...stage,
      label: resolveHiringStageLabel(stage),
    }));
}
