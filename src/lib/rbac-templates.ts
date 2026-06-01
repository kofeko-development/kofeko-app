/**
 * Mirrors Kofeko---Backend `DEFAULT_ROLE_PERMISSION_MATRIX` for HR / recruiter / interviewer presets.
 * Used by Team → Roles UI and invite role mapping.
 */

export type BackendRoleName = 'hr_manager' | 'recruiter' | 'interviewer' | 'company_admin' | 'candidate';

export type PositionTemplateId = 'hr_manager' | 'recruiter' | 'interviewer' | 'custom';

/** HR Manager preset (same keys as backend ROLE_NAMES.HR_MANAGER). */
export const HR_MANAGER_PERMISSION_KEYS: string[] = [
  'company:read',
  'company:update',
  'tenant:read',
  'user:create',
  'user:invite',
  'user:read',
  'user:update',
  'job:create',
  'job:read',
  'job:update',
  'candidate:create',
  'candidate:read',
  'candidate:update',
  'pipeline:read',
  'pipeline:update',
  'evaluation:create',
  'evaluation:read',
  'evaluation:update',
  'communication:read',
  'analytics:read',
  'audit:read',
];

/** Recruiter preset (backend ROLE_NAMES.RECRUITER). */
export const RECRUITER_PERMISSION_KEYS: string[] = [
  'job:create',
  'job:read',
  'job:update',
  'candidate:create',
  'candidate:read',
  'candidate:update',
  'pipeline:create',
  'pipeline:read',
  'pipeline:update',
  'evaluation:create',
  'evaluation:read',
  'evaluation:update',
  'communication:create',
  'communication:read',
  'analytics:read',
];

/** Interviewer preset (backend ROLE_NAMES.INTERVIEWER). */
export const INTERVIEWER_PERMISSION_KEYS: string[] = [
  'candidate:read',
  'pipeline:read',
  'evaluation:create',
  'evaluation:read',
  'evaluation:update',
  'communication:read',
];

export const PERMISSION_LABELS: Record<string, string> = {
  'company:read': 'View company',
  'company:update': 'Edit company',
  'tenant:read': 'View workspace',
  'tenant:update': 'Edit workspace',
  'user:create': 'Create users',
  'user:invite': 'Invite team members',
  'user:read': 'View users',
  'user:update': 'Edit users',
  'rbac:manage': 'Manage roles & permissions',
  'job:create': 'Create jobs',
  'job:read': 'View jobs',
  'job:update': 'Edit jobs',
  'candidate:create': 'Create candidates',
  'candidate:read': 'View candidates',
  'candidate:update': 'Edit candidates',
  'pipeline:create': 'Create pipeline stages / moves',
  'pipeline:read': 'View pipeline',
  'pipeline:update': 'Update pipeline',
  'evaluation:create': 'Create evaluations',
  'evaluation:read': 'View evaluations',
  'evaluation:update': 'Edit evaluations',
  'communication:create': 'Send messages',
  'communication:read': 'View messages',
  'analytics:create': 'Create analytics',
  'analytics:read': 'View analytics',
  'audit:create': 'Create audit entries',
  'audit:read': 'View audit log',
};

/** All keys that can be toggled for a custom staff role (excludes super-admin RBAC by default). */
export const CUSTOM_ROLE_PERMISSION_KEYS: string[] = Array.from(
  new Set([
    ...HR_MANAGER_PERMISSION_KEYS,
    ...RECRUITER_PERMISSION_KEYS,
    ...INTERVIEWER_PERMISSION_KEYS,
    'tenant:update',
    'analytics:create',
    'audit:create',
    'audit:read',
  ]),
).sort();

export function labelForPermission(key: string): string {
  return PERMISSION_LABELS[key] ?? key;
}

/** ISO-style RBAC modules (resource prefix before `:`). Order used in admin permission matrix. */
export const RBAC_MODULE_ORDER = [
  'company',
  'tenant',
  'user',
  'job',
  'candidate',
  'pipeline',
  'evaluation',
  'communication',
  'analytics',
  'audit',
] as const;

/** Display names for permission matrix section headers. */
export const RBAC_MODULE_LABELS: Record<string, string> = {
  company: 'Company',
  tenant: 'Workspace / tenant',
  user: 'Team & users',
  job: 'Jobs',
  candidate: 'Candidates',
  pipeline: 'Pipeline',
  evaluation: 'Evaluations',
  communication: 'Communications',
  analytics: 'Analytics',
  audit: 'Audit & compliance',
  rbac: 'Access control',
};

const ACTION_LABELS: Record<string, string> = {
  read: 'Read',
  create: 'Create',
  update: 'Update',
  invite: 'Invite',
  manage: 'Manage',
};

export function permissionModuleFromKey(key: string): string {
  const [m] = key.split(':');
  return m ?? 'other';
}

export function permissionOperationLabel(key: string): string {
  const parts = key.split(':');
  const action = parts[1] ?? '';
  return ACTION_LABELS[action] ?? action.charAt(0).toUpperCase() + action.slice(1);
}

export function rbacModuleTitle(moduleKey: string): string {
  return RBAC_MODULE_LABELS[moduleKey] ?? moduleKey;
}

/** Groups assignable keys by module for matrix tables; omits keys not in `allKeys` if passed. */
export function groupPermissionsByModule(keys: string[]): { moduleKey: string; keys: string[] }[] {
  const byModule = new Map<string, string[]>();
  for (const k of keys) {
    const m = permissionModuleFromKey(k);
    if (!byModule.has(m)) byModule.set(m, []);
    byModule.get(m)!.push(k);
  }
  const orderIdx = new Map<string, number>(
    RBAC_MODULE_ORDER.map((m, i) => [m, i]),
  );
  return Array.from(byModule.entries())
    .sort(([a], [b]) => (orderIdx.get(a) ?? 999) - (orderIdx.get(b) ?? 999))
    .map(([moduleKey, moduleKeys]) => ({
      moduleKey,
      keys: [...moduleKeys].sort((x, y) => x.localeCompare(y)),
    }));
}

export const POSITION_TEMPLATES: {
  id: Exclude<PositionTemplateId, 'custom'>;
  label: string;
  shortLabel: string;
  description: string;
  backendRoleName: BackendRoleName;
  permissionKeys: string[];
}[] = [
  {
    id: 'hr_manager',
    shortLabel: 'HR Manager',
    label: 'HR Manager',
    backendRoleName: 'hr_manager',
    description:
      'People operations: invite team, manage users, full job and candidate lifecycle, read analytics and audit.',
    permissionKeys: HR_MANAGER_PERMISSION_KEYS,
  },
  {
    id: 'recruiter',
    shortLabel: 'Recruiter',
    label: 'Recruiter',
    backendRoleName: 'recruiter',
    description:
      'Sourcing and hiring: create jobs, manage candidates, pipeline, evaluations, and candidate communications.',
    permissionKeys: RECRUITER_PERMISSION_KEYS,
  },
  {
    id: 'interviewer',
    shortLabel: 'Technical Interviewer',
    label: 'Technical Interviewer',
    backendRoleName: 'interviewer',
    description:
      'Interview & assessment: read candidates and pipeline, create and update evaluations, read communications.',
    permissionKeys: INTERVIEWER_PERMISSION_KEYS,
  },
];

export function permissionsForTemplate(id: PositionTemplateId): string[] {
  if (id === 'custom') return [];
  const t = POSITION_TEMPLATES.find((p) => p.id === id);
  return t ? [...t.permissionKeys] : [];
}

export function templateByBackendRole(name: string): (typeof POSITION_TEMPLATES)[number] | undefined {
  return POSITION_TEMPLATES.find((t) => t.backendRoleName === name);
}

/** Sentinel for main “Access role” dropdown — maps to backend via `otherBaseRole`. */
export const INVITE_ACCESS_OTHER = 'other';

export type InviteAccessChoice = BackendRoleName | typeof INVITE_ACCESS_OTHER;

/** Backend roles used for invites (API `roleName`). Same three patterns everywhere. */
export const INVITE_BACKEND_ROLE_OPTIONS: {
  value: BackendRoleName;
  label: string;
  /** What they can do in the product (shown under dropdowns). */
  accessDescription: string;
}[] = [
  {
    value: 'hr_manager',
    label: 'HR Manager',
    accessDescription:
      'Company & workspace settings, invite and manage users, full jobs and candidates lifecycle, pipeline updates, AI evaluations, read analytics and audit.',
  },
  {
    value: 'recruiter',
    label: 'Recruiter',
    accessDescription:
      'Create and manage jobs, candidates, and pipeline; run and edit AI evaluations; candidate messaging; analytics read.',
  },
  {
    value: 'interviewer',
    label: 'Technical Interviewer',
    accessDescription:
      'Read candidates and pipeline; create and update evaluations; read communications — focused on interviews and assessment.',
  },
];

/** Main invite dropdown: HR Manager, Recruiter, Technical Interviewer, Other. */
export const INVITE_ACCESS_MAIN_OPTIONS: {
  value: InviteAccessChoice;
  label: string;
  summary: string;
}[] = [
  {
    value: 'hr_manager',
    label: 'HR Manager',
    summary: INVITE_BACKEND_ROLE_OPTIONS[0].accessDescription,
  },
  {
    value: 'recruiter',
    label: 'Recruiter',
    summary: INVITE_BACKEND_ROLE_OPTIONS[1].accessDescription,
  },
  {
    value: 'interviewer',
    label: 'Technical Interviewer',
    summary: INVITE_BACKEND_ROLE_OPTIONS[2].accessDescription,
  },
  {
    value: INVITE_ACCESS_OTHER,
    label: 'Other',
    summary:
      'Enter a position name for this person, then tick exactly which permissions they should have. You can use quick presets (HR / Recruiter / Technical Interviewer) or mix permissions manually.',
  },
];

export function inviteBackendRoleLabel(role: BackendRoleName): string {
  return INVITE_BACKEND_ROLE_OPTIONS.find((o) => o.value === role)?.label ?? role;
}

export function resolveInviteRoleName(
  accessChoice: InviteAccessChoice,
  otherBaseRole: BackendRoleName,
): BackendRoleName {
  if (accessChoice === INVITE_ACCESS_OTHER) {
    return otherBaseRole;
  }
  return accessChoice;
}

/** @deprecated use INVITE_ACCESS_MAIN_OPTIONS + INVITE_BACKEND_ROLE_OPTIONS */
export const INVITE_ROLE_OPTIONS = INVITE_BACKEND_ROLE_OPTIONS.map((o) => ({
  value: o.value,
  label: o.label,
  hint: o.accessDescription,
}));
