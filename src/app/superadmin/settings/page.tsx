'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAppToast } from '@/lib/toast-helpers';
import { useApiErrorToast } from '@/hooks/use-api-error-toast';
import { superadminApi } from '@/lib/superadmin-api';
import { ArrowLeft, Copy, Download, Loader2, Shield } from 'lucide-react';

type SetupState = 'idle' | 'qr' | 'backup' | 'enabled';

export default function SuperAdminSettingsPage() {
  const { toastSuccess, toastInfo } = useAppToast();
  const { showError } = useApiErrorToast();
  const [enabled, setEnabled] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [setupState, setSetupState] = useState<SetupState>('idle');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    superadminApi
      .get2FAStatus()
      .then((status) => {
        setEnabled(status.enabled);
        if (status.enabled) setSetupState('enabled');
      })
      .catch(showError)
      .finally(() => setLoadingStatus(false));
  }, [showError]);

  const startSetup = async () => {
    try {
      setIsSubmitting(true);
      const result = await superadminApi.setup2FA();
      setQrDataUrl(result.qrDataUrl);
      setSetupState('qr');
      setVerifyCode('');
    } catch (error) {
      showError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmSetup = async (event: FormEvent) => {
    event.preventDefault();
    try {
      setIsSubmitting(true);
      const result = await superadminApi.verify2FA(verifyCode.replace(/\s/g, ''));
      setBackupCodes(result.backupCodes);
      setEnabled(true);
      setSetupState('backup');
      toastSuccess({ title: 'Two-factor enabled', description: 'Save your backup codes in a secure place.' });
    } catch (error) {
      showError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const disable2FA = async (event: FormEvent) => {
    event.preventDefault();
    try {
      setIsSubmitting(true);
      await superadminApi.disable2FA(disableCode.replace(/\s/g, ''));
      setEnabled(false);
      setSetupState('idle');
      setDisableCode('');
      setBackupCodes([]);
      toastInfo({ title: 'Two-factor disabled', description: 'You can sign in with email and password only.' });
    } catch (error) {
      showError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyBackupCodes = async () => {
    await navigator.clipboard.writeText(backupCodes.join('\n'));
    toastSuccess({ title: 'Copied', description: 'Backup codes copied to clipboard.' });
  };

  const downloadBackupCodes = () => {
    const blob = new Blob([backupCodes.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'kofeko-superadmin-backup-codes.txt';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  if (loadingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/superadmin/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Security Settings</CardTitle>
            </div>
            <CardDescription>
              Manage two-factor authentication for your superadmin account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Status: <span className="font-medium text-foreground">{enabled ? 'Enabled' : 'Disabled'}</span>
            </p>

            {!enabled && setupState === 'idle' ? (
              <Button onClick={startSetup} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Enable two-factor authentication
              </Button>
            ) : null}

            {setupState === 'qr' ? (
              <form onSubmit={confirmSetup} className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.), then enter the 6-digit code.
                </p>
                {qrDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qrDataUrl} alt="2FA QR code" className="mx-auto h-48 w-48 rounded border bg-white p-2" />
                ) : null}
                <div className="grid gap-2 max-w-xs">
                  <Label htmlFor="verifyCode">Verification code</Label>
                  <Input
                    id="verifyCode"
                    inputMode="numeric"
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value)}
                    placeholder="000000"
                    required
                  />
                </div>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Verifying...' : 'Confirm & enable'}
                </Button>
              </form>
            ) : null}

            {setupState === 'backup' ? (
              <div className="space-y-4">
                <p className="text-sm font-medium">Backup codes (shown once)</p>
                <p className="text-sm text-muted-foreground">
                  Store these codes securely. Each can be used once if you lose access to your authenticator.
                </p>
                <div className="rounded-md border bg-muted/40 p-4 font-mono text-sm grid grid-cols-2 gap-2">
                  {backupCodes.map((code) => (
                    <span key={code}>{code}</span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={copyBackupCodes}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                  <Button type="button" variant="outline" onClick={downloadBackupCodes}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button type="button" onClick={() => setSetupState('enabled')}>
                    Done
                  </Button>
                </div>
              </div>
            ) : null}

            {enabled && setupState === 'enabled' ? (
              <form onSubmit={disable2FA} className="space-y-4 border-t pt-6">
                <p className="text-sm text-muted-foreground">
                  To disable 2FA, enter a code from your authenticator or a remaining backup code.
                </p>
                <div className="grid gap-2 max-w-xs">
                  <Label htmlFor="disableCode">Authentication code</Label>
                  <Input
                    id="disableCode"
                    value={disableCode}
                    onChange={(e) => setDisableCode(e.target.value)}
                    placeholder="000000"
                    required
                  />
                </div>
                <Button type="submit" variant="destructive" disabled={isSubmitting}>
                  {isSubmitting ? 'Disabling...' : 'Disable two-factor authentication'}
                </Button>
              </form>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
