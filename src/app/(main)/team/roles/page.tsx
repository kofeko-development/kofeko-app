'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, ShieldCheck, FileEdit, Trash2, ArrowLeft, Briefcase } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  CUSTOM_ROLE_PERMISSION_KEYS,
  type PositionTemplateId,
  POSITION_TEMPLATES,
  labelForPermission,
  permissionsForTemplate,
} from '@/lib/rbac-templates';
import { cn } from '@/lib/utils';

type SavedOrgRole = {
  id: string;
  name: string;
  positionTemplate: PositionTemplateId;
  permissionKeys: string[];
};

function sortKeys(keys: string[]) {
  return [...keys].sort();
}

export default function RoleManagementPage() {
  const router = useRouter();
  const pathname = usePathname();
  const teamBasePath = pathname.startsWith('/admin/team') ? '/admin/team' : '/team';
  const { toast } = useToast();

  const [orgRoles, setOrgRoles] = useState<SavedOrgRole[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [positionTemplate, setPositionTemplate] = useState<PositionTemplateId>('recruiter');
  const [roleName, setRoleName] = useState('');
  const [customPerms, setCustomPerms] = useState<Set<string>>(() => new Set(permissionsForTemplate('recruiter')));

  const templatePresetKeys = useMemo(
    () => (positionTemplate === 'custom' ? [] : sortKeys(permissionsForTemplate(positionTemplate))),
    [positionTemplate],
  );

  useEffect(() => {
    if (positionTemplate === 'custom') {
      return;
    }
    const preset = new Set(permissionsForTemplate(positionTemplate));
    setCustomPerms(preset);
    const t = POSITION_TEMPLATES.find((x) => x.id === positionTemplate);
    if (t && !editingId) {
      setRoleName((prev) => (prev.trim() === '' ? t.shortLabel : prev));
    }
  }, [positionTemplate, editingId]);

  const resetDialog = useCallback(() => {
    setEditingId(null);
    setPositionTemplate('recruiter');
    setRoleName('');
    setCustomPerms(new Set(permissionsForTemplate('recruiter')));
  }, []);

  const openCreate = () => {
    resetDialog();
    setRoleName(POSITION_TEMPLATES.find((t) => t.id === 'recruiter')?.shortLabel ?? 'Recruiter');
    setDialogOpen(true);
  };

  const openEdit = (role: SavedOrgRole) => {
    setEditingId(role.id);
    setPositionTemplate(role.positionTemplate);
    setRoleName(role.name);
    setCustomPerms(new Set(role.permissionKeys));
    setDialogOpen(true);
  };

  const handleSave = () => {
    const name = roleName.trim();
    if (!name) {
      toast({ title: 'Name required', description: 'Enter a role name.', variant: 'destructive' });
      return;
    }
    const keys =
      positionTemplate === 'custom' ? sortKeys(Array.from(customPerms)) : sortKeys(permissionsForTemplate(positionTemplate));

    if (positionTemplate === 'custom' && keys.length === 0) {
      toast({
        title: 'Pick permissions',
        description: 'Select at least one permission for a custom role.',
        variant: 'destructive',
      });
      return;
    }

    if (editingId) {
      setOrgRoles((prev) =>
        prev.map((r) =>
          r.id === editingId ? { ...r, name, positionTemplate, permissionKeys: keys } : r,
        ),
      );
      toast({ title: 'Role updated', description: `"${name}" saved.` });
    } else {
      setOrgRoles((prev) => [...prev, { id: crypto.randomUUID(), name, positionTemplate, permissionKeys: keys }]);
      toast({ title: 'Role created', description: `"${name}" added. Use it when describing access in your team processes.` });
    }
    setDialogOpen(false);
    resetDialog();
  };

  const handleDelete = (id: string) => {
    setOrgRoles((prev) => prev.filter((r) => r.id !== id));
    toast({ title: 'Role removed' });
  };

  const toggleCustomPerm = (key: string, checked: boolean) => {
    setCustomPerms((prev) => {
      const next = new Set(prev);
      if (checked) next.add(key);
      else next.delete(key);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Button variant="ghost" size="sm" onClick={() => router.push(teamBasePath)} className="mb-1 w-fit px-2">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Team
          </Button>
          <h1 className="font-headline text-3xl font-bold">Roles & access</h1>
          <p className="text-muted-foreground">
            Choose a position preset (matches backend hiring roles) or build a custom role with specific permissions.
          </p>
        </div>
        <Button onClick={openCreate} className="shrink-0">
          <PlusCircle className="mr-2 h-4 w-4" /> Create role
        </Button>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Position presets</h2>
        <p className="text-sm text-muted-foreground">
          These mirror what each position can do in the product. Invites on the Team page map to the same backend roles
          (HR Manager, Recruiter, Technical Interviewer).
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {POSITION_TEMPLATES.map((t) => (
            <Card key={t.id} className="border-muted">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Briefcase className="h-4 w-4 text-primary" />
                  {t.label}
                </CardTitle>
                <CardDescription className="text-xs leading-relaxed">{t.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  {t.permissionKeys.length} permissions
                </p>
                <div className="flex max-h-28 flex-wrap gap-1 overflow-y-auto">
                  {t.permissionKeys.slice(0, 8).map((k) => (
                    <Badge key={k} variant="secondary" className="text-[10px] font-normal">
                      {labelForPermission(k)}
                    </Badge>
                  ))}
                  {t.permissionKeys.length > 8 ? (
                    <Badge variant="outline" className="text-[10px]">
                      +{t.permissionKeys.length - 8} more
                    </Badge>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Organization roles</h2>
        <p className="text-sm text-muted-foreground">
          Saved roles for your playbook (naming conventions, job descriptions, or training). They do not sync to the API
          yet—backend roles are still the system defaults above.
        </p>
        {orgRoles.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center gap-2 py-12 text-center text-sm text-muted-foreground">
              <ShieldCheck className="h-10 w-10 opacity-40" />
              <p>No custom roles yet. Create one from a preset or fully custom permissions.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {orgRoles.map((role) => (
              <Card key={role.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <ShieldCheck className="h-4 w-4" />
                        {role.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {role.positionTemplate === 'custom'
                          ? 'Custom permissions'
                          : `Based on: ${POSITION_TEMPLATES.find((t) => t.id === role.positionTemplate)?.label ?? role.positionTemplate}`}
                      </CardDescription>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(role)}>
                        <FileEdit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(role.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">{role.permissionKeys.length} permissions</p>
                  <div className="flex max-h-24 flex-wrap gap-1 overflow-y-auto">
                    {role.permissionKeys.slice(0, 10).map((k) => (
                      <Badge key={k} variant="outline" className="text-[10px] font-normal">
                        {labelForPermission(k)}
                      </Badge>
                    ))}
                    {role.permissionKeys.length > 10 ? (
                      <Badge variant="secondary" className="text-[10px]">
                        +{role.permissionKeys.length - 10}
                      </Badge>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Dialog
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) resetDialog();
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-lg overflow-hidden sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit role' : 'Create role'}</DialogTitle>
            <DialogDescription>
              Pick a position to load its default access, or choose Custom to name the role and select permissions
              yourself.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="position">Position / preset</Label>
              <Select
                value={positionTemplate}
                onValueChange={(v) => {
                  setPositionTemplate(v as PositionTemplateId);
                  if ((v as PositionTemplateId) !== 'custom') {
                    const t = POSITION_TEMPLATES.find((x) => x.id === v);
                    if (t) setRoleName(t.shortLabel);
                  }
                }}
              >
                <SelectTrigger id="position">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {POSITION_TEMPLATES.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom — name & pick permissions</SelectItem>
                </SelectContent>
              </Select>
              {positionTemplate !== 'custom' ? (
                <p className="text-xs text-muted-foreground">
                  {POSITION_TEMPLATES.find((t) => t.id === positionTemplate)?.description}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Choose individual permissions below. This is for documentation and planning; live invites still use HR
                  Manager, Recruiter, or Technical Interviewer on the Team page.
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role-name">Role name</Label>
              <Input
                id="role-name"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="e.g. Senior Recruiter — EMEA"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>Access</Label>
              {positionTemplate === 'custom' ? (
                <ScrollArea className="h-[220px] rounded-md border p-3">
                  <div className="grid gap-3 pr-3">
                    {CUSTOM_ROLE_PERMISSION_KEYS.map((key) => (
                      <div key={key} className="flex items-start gap-2">
                        <Checkbox
                          id={`perm-${key}`}
                          checked={customPerms.has(key)}
                          onCheckedChange={(c) => toggleCustomPerm(key, c === true)}
                        />
                        <Label htmlFor={`perm-${key}`} className={cn('cursor-pointer text-sm font-normal leading-snug')}>
                          <span className="font-medium">{labelForPermission(key)}</span>
                          <span className="ml-1.5 font-mono text-[11px] text-muted-foreground">{key}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="rounded-md border bg-muted/30 p-3">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    {templatePresetKeys.length} permissions (from preset — switch to Custom to edit individually)
                  </p>
                  <div className="flex max-h-[180px] flex-wrap gap-1 overflow-y-auto">
                    {templatePresetKeys.map((k) => (
                      <Badge key={k} variant="secondary" className="text-[10px] font-normal">
                        {labelForPermission(k)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave}>
              {editingId ? 'Save changes' : 'Create role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
