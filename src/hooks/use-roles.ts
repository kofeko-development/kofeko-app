import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRoles, updateRole, createRole, deleteRole, ApiRole } from '@/lib/admin-api';
import { useAppToast } from '@/lib/toast-helpers';
import { useApiErrorToast } from '@/hooks/use-api-error-toast';

export const rolesQueryKey = () => ['roles'] as const;

export function useRolesList(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: rolesQueryKey(),
    queryFn: () => getRoles(),
    enabled: options?.enabled ?? true,
  });
}

export function useInvalidateRoles() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: rolesQueryKey() });
}

export function useCreateRole() {
  const { toastSuccess } = useAppToast();
  const { showError } = useApiErrorToast();
  const invalidate = useInvalidateRoles();

  return useMutation({
    mutationFn: (data: { name: string; description?: string; permissionKeys: string[] }) =>
      createRole(data),
    onSuccess: () => {
      toastSuccess({ title: 'Role created successfully' });
      invalidate();
    },
    onError: (err) => {
      showError(err, 'Failed to create role');
    },
  });
}

export function useUpdateRole() {
  const { toastSuccess } = useAppToast();
  const { showError } = useApiErrorToast();
  const invalidate = useInvalidateRoles();

  return useMutation({
    mutationFn: (params: { roleId: string; data: { name: string; description?: string; permissionKeys: string[] } }) =>
      updateRole(params.roleId, params.data),
    onSuccess: () => {
      toastSuccess({ title: 'Role updated successfully' });
      invalidate();
    },
    onError: (err) => {
      showError(err, 'Failed to update role');
    },
  });
}

export function useDeleteRole() {
  const { toastSuccess } = useAppToast();
  const { showError } = useApiErrorToast();
  const invalidate = useInvalidateRoles();

  return useMutation({
    mutationFn: (roleId: string) => deleteRole(roleId),
    onSuccess: () => {
      toastSuccess({ title: 'Role deleted successfully' });
      invalidate();
    },
    onError: (err) => {
      showError(err, 'Failed to delete role');
    },
  });
}
