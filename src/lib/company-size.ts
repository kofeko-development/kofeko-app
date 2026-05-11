/** Matches Kofeko backend company profile / registration enums. */
export const COMPANY_SIZE_VALUES = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1000+',
] as const;

export type CompanySizeValue = (typeof COMPANY_SIZE_VALUES)[number];

export const COMPANY_SIZE_OPTIONS: { value: CompanySizeValue; label: string }[] = [
  { value: '1-10', label: '1–10' },
  { value: '11-50', label: '11–50' },
  { value: '51-200', label: '51–200' },
  { value: '201-500', label: '201–500' },
  { value: '501-1000', label: '501–1,000' },
  { value: '1000+', label: '1,000+' },
];
