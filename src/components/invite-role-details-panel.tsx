'use client';

import { CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  INVITE_ACCESS_OTHER,
  INVITE_BACKEND_ROLE_OPTIONS,
  POSITION_TEMPLATES,
  groupPermissionsByModule,
  inviteBackendRoleLabel,
  labelForPermission,
  permissionsForTemplate,
  rbacModuleTitle,
  type InviteAccessChoice,
  type PositionTemplateId,
} from '@/lib/rbac-templates';

type InviteRoleDetailsPanelProps = {
  accessChoice: InviteAccessChoice;
};

export function InviteRoleDetailsPanel({ accessChoice }: InviteRoleDetailsPanelProps) {
  if (accessChoice === INVITE_ACCESS_OTHER) {
    return (
      <div className="rounded-xl border bg-muted/40 px-5 py-4 text-sm leading-relaxed text-muted-foreground">
        <p className="font-medium text-foreground">Custom role</p>
        <p className="mt-1">
          Enter a position name below, then choose exactly which permissions this person should have. You can use quick
          presets or mix permissions manually.
        </p>
      </div>
    );
  }

  const template = POSITION_TEMPLATES.find((entry) => entry.backendRoleName === accessChoice);
  const roleOption = INVITE_BACKEND_ROLE_OPTIONS.find((entry) => entry.value === accessChoice);
  const roleLabel = roleOption?.label ?? inviteBackendRoleLabel(accessChoice);
  const roleSummary = roleOption?.accessDescription ?? template?.description ?? '';
  const permissionKeys =
    template?.permissionKeys ?? permissionsForTemplate(accessChoice as PositionTemplateId);
  const groupedPermissions = groupPermissionsByModule(permissionKeys);

  return (
    <div className="space-y-5 rounded-xl border bg-card p-5 shadow-sm">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold">{roleLabel}</h3>
          <Badge variant="secondary">{permissionKeys.length} permissions</Badge>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{roleSummary}</p>
      </div>

      <div className="space-y-4">
        <p className="text-sm font-semibold">Roles & responsibilities</p>
        {groupedPermissions.map(({ moduleKey, keys }) => (
          <div key={moduleKey} className="rounded-lg border bg-muted/20 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {rbacModuleTitle(moduleKey)}
            </p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {keys.map((key) => (
                <li key={key} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{labelForPermission(key)}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
