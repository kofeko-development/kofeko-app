'use client';

import { useMemo } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  CUSTOM_ROLE_PERMISSION_KEYS,
  POSITION_TEMPLATES,
  labelForPermission,
  groupPermissionsByModule,
  rbacModuleTitle,
} from '@/lib/rbac-templates';
import { cn } from '@/lib/utils';

export interface InvitePermissionCheckboxesProps {
  value: string[];
  onChange: (keys: string[]) => void;
  disabled?: boolean;
  idPrefix?: string;
}

type MatrixRow =
  | { kind: 'module'; moduleKey: string; title: string }
  | { kind: 'permission'; key: string };

export function InvitePermissionCheckboxes({
  value,
  onChange,
  disabled,
  idPrefix = 'perm',
}: InvitePermissionCheckboxesProps) {
  const selected = useMemo(() => new Set(value), [value]);

  const presetSets = useMemo(
    () => POSITION_TEMPLATES.map((t) => new Set(t.permissionKeys)),
    [],
  );

  const matrixRows: MatrixRow[] = useMemo(() => {
    const grouped = groupPermissionsByModule(CUSTOM_ROLE_PERMISSION_KEYS);
    const out: MatrixRow[] = [];
    for (const { moduleKey, keys } of grouped) {
      out.push({ kind: 'module', moduleKey, title: rbacModuleTitle(moduleKey) });
      for (const key of keys) {
        out.push({ kind: 'permission', key });
      }
    }
    return out;
  }, []);

  const toggleKey = (key: string, checked: boolean) => {
    const next = new Set(value);
    if (checked) next.add(key);
    else next.delete(key);
    onChange(Array.from(next));
  };

  const applyPreset = (permissionKeys: string[]) => {
    onChange([...permissionKeys]);
  };

  const totalCols = 2 + POSITION_TEMPLATES.length;

  let dataRowIndex = 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <p className="text-muted-foreground">
          Use the first column to grant access for this invite. Role columns show whether each template includes a
          permission (green = yes, red = no); click a role header to apply that template.
        </p>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{value.length}</span> /{' '}
            {CUSTOM_ROLE_PERMISSION_KEYS.length} assigned
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => onChange([])}
          >
            Clear all
          </Button>
        </div>
      </div>

      <div className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="max-h-[min(72vh,560px)] overflow-auto">
          <Table className="w-full min-w-0 table-fixed">
            <TableHeader className="sticky top-0 z-10 shadow-sm">
              <TableRow className="border-border hover:bg-primary bg-primary [&_th]:border-border/30 [&_th]:text-primary-foreground">
                <TableHead className="h-11 w-[52px] bg-primary px-1 text-center text-[10px] font-semibold uppercase leading-tight tracking-wide text-primary-foreground">
                  Grant
                </TableHead>
                <TableHead className="h-11 bg-primary px-3 text-left text-xs font-semibold uppercase tracking-wide text-primary-foreground">
                  Permission
                </TableHead>
                {POSITION_TEMPLATES.map((t) => (
                  <TableHead
                    key={t.id}
                    className="h-11 w-[11%] bg-primary px-1 text-center align-middle text-[10px] font-semibold uppercase leading-tight tracking-wide text-primary-foreground sm:w-[12%] sm:px-1.5 sm:text-[11px]"
                  >
                      <button
                        type="button"
                        disabled={disabled}
                        title={`Apply ${t.label} preset`}
                        onClick={() => applyPreset(t.permissionKeys)}
                        className={cn(
                          'mx-auto block w-full max-w-full rounded-md px-0.5 py-1 text-center font-semibold uppercase leading-snug tracking-wide',
                          'text-primary-foreground hover:bg-primary-foreground/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground/80',
                          disabled && 'pointer-events-none opacity-60',
                        )}
                      >
                        {t.shortLabel}
                      </button>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
                {matrixRows.map((row, idx) => {
                  if (row.kind === 'module') {
                    return (
                      <TableRow
                        key={`m-${row.moduleKey}-${idx}`}
                        className="border-border hover:bg-muted/60 bg-muted/50"
                      >
                        <TableCell
                          colSpan={totalCols}
                          className="py-2 pl-4 pr-3 text-xs font-semibold uppercase tracking-wide text-foreground"
                        >
                          {row.title}
                        </TableCell>
                      </TableRow>
                    );
                  }

                  const key = row.key;
                  const id = `${idPrefix}-${key.replace(/:/g, '-')}`;
                  const checked = selected.has(key);
                  const stripe =
                    dataRowIndex % 2 === 0 ? 'bg-card' : 'bg-accent-lavender/45';
                  dataRowIndex += 1;

                  return (
                    <TableRow
                      key={key}
                      className={cn(
                        'border-border hover:bg-accent-lavender/30',
                        stripe,
                      )}
                    >
                      <TableCell className="w-[52px] p-2 text-center align-middle">
                        <div className="flex justify-center">
                          <Checkbox
                            id={id}
                            checked={checked}
                            disabled={disabled}
                            onCheckedChange={(v) => toggleKey(key, v === true)}
                            aria-label={`Grant ${labelForPermission(key)}`}
                            className={cn(
                              'h-5 w-5 shrink-0 rounded-full border-2',
                              'data-[state=checked]:border-emerald-600 data-[state=checked]:bg-emerald-600 data-[state=checked]:text-white',
                              'dark:data-[state=checked]:border-emerald-500 dark:data-[state=checked]:bg-emerald-600',
                            )}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="min-w-0 py-2.5 pl-2 pr-3 align-middle">
                        <div className="min-w-0 space-y-0.5">
                          <div className="break-words text-sm font-medium leading-snug text-foreground">
                            {labelForPermission(key)}
                          </div>
                          <div className="break-all font-mono text-[11px] leading-snug text-muted-foreground">
                            {key}
                          </div>
                        </div>
                      </TableCell>
                      {presetSets.map((set, pi) => (
                        <TableCell
                          key={`${key}-preset-${pi}`}
                          className="p-1.5 text-center align-middle"
                        >
                          {set.has(key) ? (
                            <CheckCircle2
                              className="mx-auto h-[1.125rem] w-[1.125rem] shrink-0 text-emerald-600 sm:h-5 sm:w-5 dark:text-emerald-400"
                              strokeWidth={2}
                              aria-hidden
                            />
                          ) : (
                            <XCircle
                              className="mx-auto h-[1.125rem] w-[1.125rem] shrink-0 text-destructive sm:h-5 sm:w-5"
                              strokeWidth={2}
                              aria-hidden
                            />
                          )}
                          <span className="sr-only">
                            {set.has(key)
                              ? `Included in ${POSITION_TEMPLATES[pi].shortLabel}`
                              : `Not included in ${POSITION_TEMPLATES[pi].shortLabel}`}
                          </span>
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
