'use client';

import { useState } from 'react';
import { Mail, CheckCircle2, Loader2, KeyRound, ArrowRight } from 'lucide-react';
import { useAuth, mapBackendUser, type User } from '@/lib/auth';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppToast } from '@/lib/toast-helpers';
import { useApiErrorToast } from '@/hooks/use-api-error-toast';
import { apiRequest, setAccessToken } from '@/lib/api-client';

interface ChangeCompanyAdminEmailProps {
  user: User;
  mode?: 'inline' | 'card';
}

export function ChangeCompanyAdminEmail({ user, mode = 'inline' }: ChangeCompanyAdminEmailProps) {
  const { updateCurrentUser } = useAuth();
  const { toastSuccess, toastWarning } = useAppToast();
  const { showError } = useApiErrorToast();

  const [isEditing, setIsEditing] = useState(false);
  const [targetEmail, setTargetEmail] = useState(user.email);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const isCompanyAdmin =
    user.companyRole === 'Company Admin' ||
    user.backendRoles?.includes('company_admin');

  if (!isCompanyAdmin) {
    if (mode === 'card') return null;
    return (
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            value={user.email}
            readOnly
            className="bg-muted pl-10 cursor-not-allowed"
          />
        </div>
        <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
      </div>
    );
  }

  const handleStartEdit = () => {
    setTargetEmail(user.email);
    setIsEditing(true);
    setOtpSent(false);
    setOtpCode('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setOtpSent(false);
    setOtpCode('');
    setTargetEmail(user.email);
  };

  const handleSendOtp = async () => {
    const cleanEmail = targetEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      toastWarning({
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
      });
      return;
    }
    if (cleanEmail === user.email.toLowerCase()) {
      toastWarning({
        title: 'Same Email',
        description: 'Please enter a new email address different from your current one.',
      });
      return;
    }

    setSendingOtp(true);
    try {
      await apiRequest<{ sent: boolean }>('/auth/change-email-otp/send', {
        method: 'POST',
        auth: true,
        body: { newEmail: cleanEmail },
      });
      setOtpSent(true);
      toastSuccess({
        title: 'Verification Code Sent',
        description: `We sent a 6-digit confirmation code to ${cleanEmail}.`,
      });
    } catch (err: any) {
      showError(err);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    const cleanCode = otpCode.trim();
    const cleanEmail = targetEmail.trim().toLowerCase();
    if (cleanCode.length !== 6) return;

    setVerifyingOtp(true);
    try {
      const response = await apiRequest<{ user: any; accessToken?: string }>('/auth/change-email-otp/verify', {
        method: 'POST',
        auth: true,
        body: { newEmail: cleanEmail, code: cleanCode },
      });

      if (response.accessToken) {
        setAccessToken('staff', response.accessToken);
      }

      if (response.user) {
        const mapped = mapBackendUser(response.user);
        updateCurrentUser({
          ...mapped,
          role: user.role,
          permissions: user.permissions,
          backendRoles: user.backendRoles,
          companyRole: user.companyRole,
          company: user.company,
        });
      }

      setIsEditing(false);
      setOtpSent(false);
      setOtpCode('');

      toastSuccess({
        title: 'Email Updated Successfully',
        description: `Your company admin email has been changed to ${cleanEmail}.`,
      });
    } catch (err: any) {
      showError(err);
    } finally {
      setVerifyingOtp(false);
    }
  };

  const content = (
    <div className="space-y-4">
      {!isEditing ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="email" className="font-medium text-foreground">
              Email address
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs font-semibold text-primary border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-colors"
              onClick={handleStartEdit}
            >
              Change Email
            </Button>
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              value={user.email}
              readOnly
              className="bg-muted/40 pl-10 cursor-not-allowed font-medium text-foreground/80"
            />
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-0.5">
            <KeyRound className="h-3.5 w-3.5 text-primary/70 shrink-0" />
            As Company Admin, you can update your primary account email with code confirmation.
          </p>
        </div>
      ) : !otpSent ? (
        <div className="rounded-xl border border-primary/20 bg-primary/[0.03] p-4 space-y-4 animate-in fade-in zoom-in-95 duration-200 shadow-xs">
          <div className="flex items-center justify-between border-b border-primary/10 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground leading-none">Change Company Admin Email</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">Verification required via 6-digit OTP code</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              New Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="new-email"
                type="email"
                placeholder="newadmin@company.com"
                value={targetEmail}
                onChange={(e) => setTargetEmail(e.target.value)}
                disabled={sendingOtp}
                className="pl-10 bg-background border-border/80 h-10 font-medium"
                autoFocus
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              We will send a security verification code to this new email address to confirm ownership.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-primary/10">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={sendingOtp}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSendOtp}
              disabled={sendingOtp || !targetEmail || targetEmail.trim().toLowerCase() === user.email.toLowerCase()}
              className="text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs"
            >
              {sendingOtp ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Sending Code...
                </>
              ) : (
                <>
                  Send Confirmation Code
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-primary/20 bg-primary/[0.03] p-4 space-y-4 animate-in fade-in zoom-in-95 duration-200 shadow-xs">
          <div className="flex items-center justify-between border-b border-primary/10 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground leading-none">Verify New Email Address</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">Enter the security code sent to your inbox</p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setOtpSent(false);
                setOtpCode('');
              }}
              disabled={verifyingOtp}
              className="h-7 text-xs text-primary hover:text-primary/80"
            >
              Change Email
            </Button>
          </div>

          <div className="rounded-lg bg-background/90 p-3 border border-border/60 text-xs text-muted-foreground space-y-1 shadow-2xs">
            <p className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              We sent a 6-digit confirmation code to:
            </p>
            <p className="font-semibold text-foreground text-sm pl-3.5 font-mono select-all">{targetEmail}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="otp-code" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Enter 6-Digit Code
              </Label>
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs text-primary font-medium"
                onClick={handleSendOtp}
                disabled={sendingOtp || verifyingOtp}
              >
                {sendingOtp ? 'Resending...' : 'Resend Code'}
              </Button>
            </div>
            <Input
              id="otp-code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="••••••"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              disabled={verifyingOtp}
              className="text-center font-mono text-xl tracking-[0.4em] font-bold bg-background border-border/80 h-12 shadow-inner"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-primary/10">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={verifyingOtp}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleVerifyOtp}
              disabled={verifyingOtp || otpCode.length !== 6}
              className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            >
              {verifyingOtp ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Updating Email...
                </>
              ) : (
                <>
                  Confirm & Update Email
                  <CheckCircle2 className="ml-1.5 h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  if (mode === 'card') {
    return (
      <Card className="border-primary/20 shadow-xs overflow-hidden">
        <CardHeader className="bg-primary/[0.02] border-b border-border/50 pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <KeyRound className="h-4 w-4 text-primary" />
            Company Admin Email Security
          </CardTitle>
          <CardDescription className="text-xs">
            Manage the primary administrative login email for {user.company ?? 'your company account'}.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {content}
        </CardContent>
      </Card>
    );
  }

  return content;
}
