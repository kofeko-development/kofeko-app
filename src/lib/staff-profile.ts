import type { User } from './types';
import {
  POSITION_TEMPLATES,
  groupPermissionsByModule,
  labelForPermission,
  rbacModuleTitle,
} from './rbac-templates';

export function getStaffRoleTitle(user: User): string {
  if (user.companyRole) return user.companyRole;
  if (user.backendRoles?.includes('company_admin')) return 'Company Admin';
  return 'Team Member';
}

export function getStaffHeaderTitle(user: User, pathname: string): string {
  if (pathname.startsWith('/company-profile') || pathname.startsWith('/admin/company-profile')) {
    return 'Company Profile';
  }
  return getStaffRoleTitle(user);
}

export function getStaffRoleDescription(user: User): string {
  const roles = user.backendRoles ?? [];

  if (roles.some((role) => role.startsWith('custom_'))) {
    return 'Custom role with permissions assigned by your company administrator.';
  }

  if (roles.includes('company_admin') || user.role === 'operator') {
    return 'Company administrator with access to the dashboard, team management, jobs, candidates, and company settings.';
  }

  const template = POSITION_TEMPLATES.find((entry) => roles.includes(entry.backendRoleName));
  if (template) return template.description;

  return 'Team member with permissions assigned to your account.';
}

export function getGroupedStaffPermissions(permissions: string[] | undefined) {
  const keys = permissions ?? [];
  return groupPermissionsByModule(keys).filter((group) => group.keys.length > 0);
}

export { labelForPermission, rbacModuleTitle };
