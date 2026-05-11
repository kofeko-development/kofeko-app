'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000/api/v1';
const SUPERADMIN_TOKEN_KEY = 'kofeko_superadmin_token';

type CompanyRequest = {
  id: string;
  companyName: string;
  companyType: string;
  companySize: string;
  industry: string;
  contactName: string;
  contactEmail: string;
  phoneNumber: string;
  adminEmail: string;
  /** Admin chose email/password at signup; superadmin assigns tenant slug. */
  usesSignupCredentials: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
};

export default function SuperAdminDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [requests, setRequests] = useState<CompanyRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tenantSlug, setTenantSlug] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = useMemo(() => (typeof window !== 'undefined' ? localStorage.getItem(SUPERADMIN_TOKEN_KEY) : null), []);

  const loadRequests = async () => {
    const currentToken = localStorage.getItem(SUPERADMIN_TOKEN_KEY);
    if (!currentToken) {
      router.push('/superadmin/login');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/superadmin/requests`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.message ?? 'Failed to fetch requests');
      }
      setRequests(payload.data);
    } catch (error) {
      toast({
        title: 'Failed to load requests',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      router.push('/superadmin/login');
      return;
    }
    void loadRequests();
  }, [token, router]);

  const onApprove = async () => {
    if (!selectedId) return;
    setIsSubmitting(true);
    try {
      const req = requests.find((r) => r.id === selectedId);
      const approveBody: Record<string, string | undefined> = {
        tenantSlug,
        reviewNotes: reviewNotes || undefined,
      };
      if (!req?.usesSignupCredentials) {
        approveBody.adminEmail = adminEmail;
        approveBody.adminPassword = adminPassword;
      }
      const response = await fetch(`${API_BASE_URL}/superadmin/requests/${selectedId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem(SUPERADMIN_TOKEN_KEY)}`,
        },
        body: JSON.stringify(approveBody),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.message ?? 'Approve failed');
      }
      toast({ title: 'Approved', description: result?.message ?? 'Company approved and credentials created.' });
      setSelectedId(null);
      setTenantSlug('');
      setAdminEmail('');
      setAdminPassword('');
      setReviewNotes('');
      await loadRequests();
    } catch (error) {
      toast({
        title: 'Approval failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onReject = async () => {
    if (!selectedId || !reviewNotes) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/superadmin/requests/${selectedId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem(SUPERADMIN_TOKEN_KEY)}`,
        },
        body: JSON.stringify({ reviewNotes }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.message ?? 'Reject failed');
      }
      toast({ title: 'Rejected', description: 'Company request rejected.' });
      setSelectedId(null);
      setReviewNotes('');
      await loadRequests();
    } catch (error) {
      toast({
        title: 'Rejection failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedRequest = requests.find((request) => request.id === selectedId) ?? null;

  const approveDisabled =
    isSubmitting ||
    !tenantSlug ||
    (selectedRequest != null &&
      !selectedRequest.usesSignupCredentials &&
      (!adminEmail.trim() || adminPassword.length < 8));

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Superadmin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Review company onboarding requests and issue login credentials.</p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            localStorage.removeItem(SUPERADMIN_TOKEN_KEY);
            router.push('/superadmin/login');
          }}
        >
          Logout
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          requests.map((request) => (
            <Card key={request.id} className={selectedId === request.id ? 'border-primary' : ''}>
              <CardHeader>
                <CardTitle className="text-lg">{request.companyName}</CardTitle>
                <CardDescription>
                  {request.usesSignupCredentials && request.adminEmail
                    ? `Admin login: ${request.adminEmail}`
                    : request.contactEmail
                      ? `${request.contactName} (${request.contactEmail})`
                      : [request.contactName, request.phoneNumber].filter(Boolean).join(' · ') || '—'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><span className="font-medium">Type:</span> {request.companyType}</p>
                <p><span className="font-medium">Industry:</span> {request.industry}</p>
                <p><span className="font-medium">Size:</span> {request.companySize}</p>
                <p><span className="font-medium">Status:</span> {request.status}</p>
                <Button
                  className="w-full mt-2"
                  variant={selectedId === request.id ? 'secondary' : 'default'}
                  onClick={() => {
                    setSelectedId(request.id);
                    setAdminEmail(request.adminEmail || request.contactEmail || '');
                  }}
                >
                  {selectedId === request.id ? 'Selected' : 'Review Request'}
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {selectedRequest ? (
        <Card>
          <CardHeader>
            <CardTitle>Approve or Reject: {selectedRequest.companyName}</CardTitle>
            <CardDescription>
              {selectedRequest.usesSignupCredentials
                ? 'Assign a tenant slug. The admin will sign in with the email and password they set when registering.'
                : 'Set tenant slug plus company admin email and password (legacy request without signup credentials).'}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="tenantSlug">Tenant Slug</Label>
                <Input id="tenantSlug" value={tenantSlug} onChange={(e) => setTenantSlug(e.target.value)} placeholder="your-company-slug" />
              </div>
              {selectedRequest.usesSignupCredentials ? (
                <div className="md:col-span-2 rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
                  Admin email (from registration):{' '}
                  <span className="font-medium text-foreground">{selectedRequest.adminEmail || '—'}</span>
                </div>
              ) : (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="adminEmail">Company Admin Email</Label>
                    <Input id="adminEmail" type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="adminPassword">Company Admin Password</Label>
                    <Input id="adminPassword" type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} />
                  </div>
                </>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="reviewNotes">Review Notes (required for reject, optional for approve)</Label>
              <Input id="reviewNotes" value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={onApprove} disabled={approveDisabled}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Approve & Create Credentials
              </Button>
              <Button variant="destructive" onClick={onReject} disabled={isSubmitting || !reviewNotes}>
                Reject Request
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
