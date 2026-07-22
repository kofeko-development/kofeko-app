const EMPLOYMENT_TYPES = new Set(['full-time', 'part-time', 'contract', 'internship']);

function normalizeJobLabel(value?: string | null): string {
  return (value ?? '').trim();
}

function matchesSet(value: string, options: Set<string>): boolean {
  return options.has(value.toLowerCase());
}

/** Work arrangement stored in `department` (Remote, On-site, Hybrid). */
export function resolveJobWorkMode(department?: string | null): string | null {
  const value = normalizeJobLabel(department);
  if (!value || matchesSet(value, EMPLOYMENT_TYPES)) return null;

  const lower = value.toLowerCase();
  if (lower === 'remote') return 'Remote';
  if (lower === 'on-site') return 'On-site';
  if (lower === 'hybrid') return 'Hybrid';
  return null;
}

/** Hours/contract type stored in `employmentType` (Full-time, Part-time, etc.). */
export function resolveJobEmploymentType(
  employmentType?: string | null,
  department?: string | null,
): string | null {
  const primary = normalizeJobLabel(employmentType);
  if (primary) return primary;

  const dept = normalizeJobLabel(department);
  if (dept && matchesSet(dept, EMPLOYMENT_TYPES)) return dept;
  return null;
}
