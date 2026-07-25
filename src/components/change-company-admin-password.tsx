'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAppToast } from '@/lib/toast-helpers';
import { useApiErrorToast } from '@/hooks/use-api-error-toast';
import { apiRequest } from '@/lib/api-client';
import { KeyRound, Lock, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';
import type { User } from '@/lib/auth';

interface ChangePasswordProps {
  user: User;
}

export function ChangeCompanyAdminPassword({ user }: ChangePasswordProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { toastSuccess, toastWarning } = useAppToast();
  const { showError } = useApiErrorToast();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toastWarning({ title: 'Validation Error', description: 'Please fill in all password fields' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toastWarning({ title: 'Validation Error', description: 'New password and confirm password do not match' });
      return;
    }
    if (newPassword.length < 8) {
      toastWarning({ title: 'Validation Error', description: 'New password must be at least 8 characters long' });
      return;
    }

    setIsUpdating(true);
    try {
      await apiRequest('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      toastSuccess({ title: 'Success', description: 'Password updated successfully' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsEditing(false);
    } catch (error: any) {
      showError(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="border-purple-500/20 shadow-xs overflow-hidden">
      <CardHeader className="bg-purple-500/[0.02] border-b border-border/50 pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <KeyRound className="h-4 w-4 text-purple-600" />
          Change Password
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Update your account login password. Keep your credentials secure.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          {!isEditing ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="pwd-placeholder" className="font-medium text-foreground">
                  Password
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs font-semibold text-purple-600 border-purple-500/20 hover:bg-purple-500/5 hover:border-purple-500/40 transition-colors"
                  onClick={() => setIsEditing(true)}
                >
                  Change Password
                </Button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="pwd-placeholder"
                  value="••••••••••••••••"
                  readOnly
                  className="bg-muted/40 pl-10 cursor-not-allowed font-medium text-foreground/80 tracking-wider"
                />
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-0.5">
                <KeyRound className="h-3.5 w-3.5 text-purple-600/70 shrink-0" />
                You can update your login password at any time. Keep your credentials secure.
              </p>
            </div>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md animate-in fade-in zoom-in-95 duration-200">
              <div className="space-y-1.5">
                <Label htmlFor="current-pwd" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Current Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="current-pwd"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="pl-9 h-10 rounded-xl bg-muted/20"
                    disabled={isUpdating}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="new-pwd" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="new-pwd"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="pl-9 h-10 rounded-xl bg-muted/20"
                    disabled={isUpdating}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm-pwd" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirm-pwd"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="pl-9 h-10 rounded-xl bg-muted/20"
                    disabled={isUpdating}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-purple-500/10">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  disabled={isUpdating}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="rounded-xl px-5 h-9 bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md shadow-purple-500/20 transition-all text-xs"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                      Update Password
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
