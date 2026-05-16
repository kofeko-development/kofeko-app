'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';

const generateTenantSlug = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let slug = '';
  for (let i = 0; i < 8; i++) {
    slug += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return slug;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000/api/v1';
const SUPERADMIN_TOKEN_KEY = 'kofeko_superadmin_token';

type CompanyRequest = {
  id: string;
  companyName: string;
  companyAddress: Record<string, string> | string | null;
  industry: string;
  companySize: string;
  companyType: string;
  foundedYear: number;
  companyWebsite: string;
  officialCompanyAddress: string;
  phoneNumber: string;
  companyLogo: string;
  shortDescription: string;
  linkedinUrl: string | null;
  twitterUrl: string | null;
  termsAccepted: boolean;
  contactName: string;
  contactEmail: string;
  adminEmail: string;
  /** Admin chose email/password at signup; superadmin assigns tenant slug. */
  usesSignupCredentials: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
};

export default function SuperAdminDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { logout } = useAuth();
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
          onClick={logout}
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
                  variant="default"
                  onClick={() => {
                    setSelectedId(request.id);
                    setAdminEmail(request.adminEmail || request.contactEmail || '');
                    setTenantSlug(generateTenantSlug());
                  }}
                >
                  Review Request
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Request: {selectedRequest?.companyName}</DialogTitle>
            <DialogDescription>
              Review the details submitted by the company and assign a tenant slug to approve.
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-md border">
                <div className="sm:col-span-2 flex items-center gap-4 border-b pb-4 mb-2">
                  {selectedRequest.companyLogo && (
                    <img src={selectedRequest.companyLogo} alt="Logo" className="w-16 h-16 object-contain rounded-md bg-white border" />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold">{selectedRequest.companyName}</h3>
                    <p className="text-muted-foreground text-sm">{selectedRequest.companyWebsite}</p>
                  </div>
                </div>

                <div><span className="font-medium text-muted-foreground">Type:</span> <br/> {selectedRequest.companyType}</div>
                <div><span className="font-medium text-muted-foreground">Industry:</span> <br/> {selectedRequest.industry}</div>
                <div><span className="font-medium text-muted-foreground">Size:</span> <br/> {selectedRequest.companySize}</div>
                <div><span className="font-medium text-muted-foreground">Founded Year:</span> <br/> {selectedRequest.foundedYear}</div>
                
                <div className="sm:col-span-2"><span className="font-medium text-muted-foreground">Short Description:</span> <br/> {selectedRequest.shortDescription}</div>
                
                <div className="sm:col-span-2"><span className="font-medium text-muted-foreground">Official Address:</span> <br/> {selectedRequest.officialCompanyAddress}</div>
                <div className="sm:col-span-2">
                  <span className="font-medium text-muted-foreground">Structured Address:</span> <br/> 
                  {typeof selectedRequest.companyAddress === 'object' && selectedRequest.companyAddress !== null ? (
                    Object.entries(selectedRequest.companyAddress).map(([k, v]) => v ? `${k}: ${v}` : null).filter(Boolean).join(', ')
                  ) : String(selectedRequest.companyAddress || '—')}
                </div>

                <div><span className="font-medium text-muted-foreground">Contact Name:</span> <br/> {selectedRequest.contactName}</div>
                <div><span className="font-medium text-muted-foreground">Contact Email:</span> <br/> {selectedRequest.contactEmail}</div>
                <div><span className="font-medium text-muted-foreground">Phone Number:</span> <br/> {selectedRequest.phoneNumber || '—'}</div>
                
                <div className="sm:col-span-2 flex gap-4">
                   {selectedRequest.linkedinUrl && <a href={selectedRequest.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">LinkedIn</a>}
                   {selectedRequest.twitterUrl && <a href={selectedRequest.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Twitter</a>}
                </div>
                
                <div className="sm:col-span-2">
                   <span className="font-medium text-muted-foreground">Terms Accepted:</span> {selectedRequest.termsAccepted ? 'Yes' : 'No'}
                </div>
              </div>

              <div className="grid gap-4 border-t pt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="tenantSlug">Tenant Slug</Label>
                    <Input id="tenantSlug" value={tenantSlug} onChange={(e) => setTenantSlug(e.target.value)} placeholder="8 character uppercase alphanumeric" />
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

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button onClick={onApprove} disabled={approveDisabled} className="flex-1">
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Approve & Create Credentials
                  </Button>
                  <Button variant="destructive" onClick={onReject} disabled={isSubmitting || !reviewNotes} className="flex-1">
                    Reject Request
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
