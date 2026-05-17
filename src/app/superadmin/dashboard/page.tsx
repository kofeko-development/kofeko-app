'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  Shield, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  LogOut, 
  ExternalLink,
  Info,
  Calendar,
  Users,
  KeyRound,
  FileText
} from 'lucide-react';
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
  usesSignupCredentials: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewNotes?: string | null;
  tenantSlug?: string | null;
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
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');

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
      setRequests(payload.data || []);
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

  // Compute stat counts
  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter(r => r.status === 'pending').length;
    const approved = requests.filter(r => r.status === 'approved').length;
    const rejected = requests.filter(r => r.status === 'rejected').length;
    return { total, pending, approved, rejected };
  }, [requests]);

  // Filter requests based on status tab and search term
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchesTab = activeTab === 'all' || r.status === activeTab;
      const search = searchTerm.toLowerCase();
      const matchesSearch = 
        r.companyName.toLowerCase().includes(search) || 
        r.contactEmail.toLowerCase().includes(search) || 
        (r.adminEmail && r.adminEmail.toLowerCase().includes(search));
      return matchesTab && matchesSearch;
    });
  }, [requests, activeTab, searchTerm]);

  return (
    <div className="min-h-screen bg-muted/20 pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-white">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-foreground">KOFEKO</span>
              <span className="text-xs block text-muted-foreground font-semibold -mt-1 uppercase tracking-wider">Superadmin Portal</span>
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={logout} className="gap-2 text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        {/* Banner */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold font-headline tracking-tight text-foreground">Welcome back, Platform Administrator</h1>
            <p className="text-muted-foreground">
              Verify legal credentials, provision corporate tenants, and manage access parameters across the ecosystem.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-sm transition-all">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase">Total Applications</p>
                <h3 className="text-3xl font-extrabold text-foreground mt-1">{stats.total}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Building2 className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-sm transition-all">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase">Pending Review</p>
                <h3 className="text-3xl font-extrabold text-amber-500 mt-1">{stats.pending}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Clock className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-sm transition-all">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase">Approved Tenants</p>
                <h3 className="text-3xl font-extrabold text-emerald-500 mt-1">{stats.approved}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-sm transition-all">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase">Rejected Requests</p>
                <h3 className="text-3xl font-extrabold text-rose-500 mt-1">{stats.rejected}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
                <XCircle className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Tabs */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between border-b pb-4">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Requests', count: stats.total },
              { id: 'pending', label: 'Pending Review', count: stats.pending, color: 'text-amber-500 bg-amber-500/10' },
              { id: 'approved', label: 'Approved', count: stats.approved, color: 'text-emerald-500 bg-emerald-500/10' },
              { id: 'rejected', label: 'Rejected', count: stats.rejected, color: 'text-rose-500 bg-rose-500/10' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 border ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-background hover:bg-muted text-muted-foreground border-muted'
                }`}
              >
                {tab.label}
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeTab === tab.id ? 'bg-primary-foreground/20 text-primary-foreground' : tab.color || 'bg-muted text-muted-foreground'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by company or email..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Requests Feed */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm font-medium">Fetching tenant registrations...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <Card className="border-dashed border-2 py-16 flex flex-col items-center justify-center text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4 opacity-55" />
            <h3 className="font-semibold text-lg">No Registration Requests Found</h3>
            <p className="text-muted-foreground max-w-md mt-1 text-sm">
              There are no matching registrations under this category at the moment.
            </p>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredRequests.map((request) => {
              const formattedDate = new Date(request.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              return (
                <Card 
                  key={request.id} 
                  className={`hover:shadow-md transition-all border flex flex-col justify-between overflow-hidden group ${
                    request.status === 'approved' ? 'hover:border-emerald-500/30' : 
                    request.status === 'rejected' ? 'hover:border-rose-500/30' : 
                    'hover:border-amber-500/30'
                  }`}
                >
                  <div>
                    {/* Status header strip */}
                    <div className={`px-4 py-2 border-b text-xs font-bold uppercase tracking-wider flex items-center justify-between ${
                      request.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600' :
                      request.status === 'rejected' ? 'bg-rose-500/10 text-rose-600' :
                      'bg-amber-500/10 text-amber-600'
                    }`}>
                      <span className="flex items-center gap-1">
                        {request.status === 'approved' && <CheckCircle2 className="h-3.5 w-3.5" />}
                        {request.status === 'rejected' && <XCircle className="h-3.5 w-3.5" />}
                        {request.status === 'pending' && <Clock className="h-3.5 w-3.5" />}
                        {request.status}
                      </span>
                      <span className="text-muted-foreground font-light flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formattedDate}
                      </span>
                    </div>

                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-lg font-bold shrink-0">
                          {request.companyName.charAt(0)}
                        </div>
                        <div>
                          <CardTitle className="text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {request.companyName}
                          </CardTitle>
                          <CardDescription className="line-clamp-1 mt-0.5">
                            {request.companyWebsite || 'No website listed'}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-2.5 text-sm pb-6">
                      <div className="flex items-center justify-between border-b pb-2 text-muted-foreground">
                        <span>Industry</span>
                        <span className="font-semibold text-foreground">{request.industry || '—'}</span>
                      </div>
                      <div className="flex items-center justify-between border-b pb-2 text-muted-foreground">
                        <span>Company Size</span>
                        <span className="font-semibold text-foreground">{request.companySize || '—'}</span>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Contact Admin</span>
                        <span className="font-semibold text-foreground truncate max-w-[150px]">{request.adminEmail || request.contactEmail}</span>
                      </div>

                      {/* Display slug if approved */}
                      {request.status === 'approved' && request.tenantSlug && (
                        <div className="mt-3 p-2 bg-emerald-500/5 border border-emerald-500/10 rounded-lg text-xs flex items-center justify-between">
                          <span className="text-muted-foreground uppercase font-semibold">Tenant Slug:</span>
                          <span className="font-mono font-bold text-emerald-600">{request.tenantSlug}</span>
                        </div>
                      )}

                      {/* Display notes if rejected */}
                      {request.status === 'rejected' && request.reviewNotes && (
                        <div className="mt-3 p-2.5 bg-rose-500/5 border border-rose-500/10 rounded-lg text-xs space-y-1">
                          <span className="text-rose-600 uppercase font-semibold block">Rejection Reason:</span>
                          <p className="text-muted-foreground font-light italic">"{request.reviewNotes}"</p>
                        </div>
                      )}
                    </CardContent>
                  </div>

                  <div className="px-6 pb-6 pt-0">
                    <Button
                      className={`w-full font-bold shadow-sm ${
                        request.status === 'approved' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' :
                        request.status === 'rejected' ? 'bg-rose-500 hover:bg-rose-600 text-white' :
                        'bg-primary hover:bg-primary/90 text-white'
                      }`}
                      onClick={() => {
                        setSelectedId(request.id);
                        setAdminEmail(request.adminEmail || request.contactEmail || '');
                        setTenantSlug(request.tenantSlug || generateTenantSlug());
                        setReviewNotes(request.reviewNotes || '');
                      }}
                    >
                      {request.status === 'pending' ? 'Review & Decision' : 'View Request Details'}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Review Dialog */}
      <Dialog open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              Request Review: {selectedRequest?.companyName}
            </DialogTitle>
            <DialogDescription>
              Analyze the full corporate information submitted and execute tenant state changes.
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="grid gap-6 py-4">
              {/* Submission details block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-muted/40 p-5 rounded-xl border border-muted">
                <div className="sm:col-span-2 flex items-center gap-4 border-b pb-4 mb-2">
                  {selectedRequest.companyLogo ? (
                    <img src={selectedRequest.companyLogo} alt="Logo" className="w-16 h-16 object-contain rounded-lg bg-white border" />
                  ) : (
                    <div className="h-16 w-16 bg-primary/10 text-primary font-bold rounded-lg flex items-center justify-center text-2xl">
                      {selectedRequest.companyName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{selectedRequest.companyName}</h3>
                    <p className="text-muted-foreground text-sm flex items-center gap-1.5 mt-0.5">
                      <ExternalLink className="h-3.5 w-3.5" />
                      <a href={selectedRequest.companyWebsite} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {selectedRequest.companyWebsite || 'No website listed'}
                      </a>
                    </p>
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-muted-foreground uppercase text-[11px] tracking-wider">Company Type</span> 
                  <p className="mt-1 font-medium">{selectedRequest.companyType || '—'}</p>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground uppercase text-[11px] tracking-wider">Industry</span> 
                  <p className="mt-1 font-medium">{selectedRequest.industry || '—'}</p>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground uppercase text-[11px] tracking-wider">Company Size</span> 
                  <p className="mt-1 font-medium">{selectedRequest.companySize || '—'}</p>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground uppercase text-[11px] tracking-wider">Founded Year</span> 
                  <p className="mt-1 font-medium">{selectedRequest.foundedYear || '—'}</p>
                </div>
                
                <div className="sm:col-span-2 border-t pt-3">
                  <span className="font-semibold text-muted-foreground uppercase text-[11px] tracking-wider">Short Description</span> 
                  <p className="mt-1 font-light italic">"{selectedRequest.shortDescription || 'No description provided.'}"</p>
                </div>
                
                <div className="sm:col-span-2 border-t pt-3">
                  <span className="font-semibold text-muted-foreground uppercase text-[11px] tracking-wider">Official Address</span> 
                  <p className="mt-1 text-muted-foreground">{selectedRequest.officialCompanyAddress || '—'}</p>
                </div>

                <div className="sm:col-span-2 border-t pt-3">
                  <span className="font-semibold text-muted-foreground uppercase text-[11px] tracking-wider">Structured Address</span> 
                  <p className="mt-1 text-muted-foreground">
                    {typeof selectedRequest.companyAddress === 'object' && selectedRequest.companyAddress !== null ? (
                      Object.entries(selectedRequest.companyAddress).map(([k, v]) => v ? `${k}: ${v}` : null).filter(Boolean).join(', ')
                    ) : String(selectedRequest.companyAddress || '—')}
                  </p>
                </div>

                <div className="sm:col-span-2 border-t pt-3 grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-semibold text-muted-foreground uppercase text-[11px] tracking-wider">Contact Person</span> 
                    <p className="mt-1 font-medium">{selectedRequest.contactName || '—'}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground uppercase text-[11px] tracking-wider">Contact Email</span> 
                    <p className="mt-1 font-medium">{selectedRequest.contactEmail || '—'}</p>
                  </div>
                </div>

                <div className="sm:col-span-2 border-t pt-3 flex gap-4">
                   {selectedRequest.linkedinUrl && (
                     <a href={selectedRequest.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-primary text-xs font-semibold flex items-center gap-1 hover:underline">
                       LinkedIn Profile <ExternalLink className="h-3 w-3" />
                     </a>
                   )}
                   {selectedRequest.twitterUrl && (
                     <a href={selectedRequest.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-primary text-xs font-semibold flex items-center gap-1 hover:underline">
                       Twitter Profile <ExternalLink className="h-3 w-3" />
                     </a>
                   )}
                </div>
              </div>

              {/* Status display or Action inputs */}
              {selectedRequest.status !== 'pending' ? (
                <div className="border-t pt-4 space-y-4">
                  <h4 className="font-bold text-sm text-foreground uppercase tracking-wider flex items-center gap-1">
                    <Info className="h-4 w-4 text-primary" />
                    Decision Record
                  </h4>
                  <div className={`p-4 rounded-xl border flex flex-col gap-2 ${
                    selectedRequest.status === 'approved' ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-800' : 'bg-rose-500/5 border-rose-500/10 text-rose-800'
                  }`}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold uppercase tracking-wider text-[11px]">Final Action Status:</span>
                      <span className="font-extrabold capitalize">{selectedRequest.status}</span>
                    </div>
                    {selectedRequest.tenantSlug && (
                      <div className="flex items-center justify-between text-sm border-t pt-2 mt-1">
                        <span className="font-semibold uppercase tracking-wider text-[11px]">Tenant Slug assigned:</span>
                        <span className="font-mono font-bold">{selectedRequest.tenantSlug}</span>
                      </div>
                    )}
                    {selectedRequest.reviewNotes && (
                      <div className="text-sm border-t pt-2 mt-1 space-y-1">
                        <span className="font-semibold uppercase tracking-wider text-[11px] block">Review/Rejection Notes:</span>
                        <p className="italic font-light text-muted-foreground">"{selectedRequest.reviewNotes}"</p>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button variant="outline" onClick={() => setSelectedId(null)}>
                      Close Review Window
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 border-t pt-4">
                  <h4 className="font-bold text-sm text-foreground uppercase tracking-wider flex items-center gap-1">
                    <KeyRound className="h-4 w-4 text-primary" />
                    State Provisioning & Actions
                  </h4>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2 md:col-span-2">
                      <Label htmlFor="tenantSlug" className="font-semibold">Tenant Slug</Label>
                      <Input 
                        id="tenantSlug" 
                        value={tenantSlug} 
                        onChange={(e) => setTenantSlug(e.target.value)} 
                        placeholder="8 character uppercase alphanumeric" 
                        className="font-mono uppercase font-bold"
                      />
                    </div>
                    
                    {selectedRequest.usesSignupCredentials ? (
                      <div className="md:col-span-2 rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
                        <div className="font-semibold text-foreground uppercase text-[11px] tracking-wider mb-1">Signup Credentials Mode</div>
                        Admin will log in using the email specified during signup:{' '}
                        <span className="font-bold text-foreground block mt-1">{selectedRequest.adminEmail || '—'}</span>
                      </div>
                    ) : (
                      <>
                        <div className="grid gap-2">
                          <Label htmlFor="adminEmail" className="font-semibold">Company Admin Email</Label>
                          <Input id="adminEmail" type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="adminPassword" className="font-semibold">Company Admin Password</Label>
                          <Input id="adminPassword" type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="reviewNotes" className="font-semibold">Decision Remarks / Rejection Notes (required for reject)</Label>
                    <Input id="reviewNotes" value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} placeholder="Provide summary notes about this onboarding decision..." />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t mt-2">
                    <Button onClick={onApprove} disabled={approveDisabled} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold">
                      {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Approve & Provision Tenant
                    </Button>
                    <Button variant="destructive" onClick={onReject} disabled={isSubmitting || !reviewNotes} className="flex-1 font-bold">
                      Reject & Revoke Request
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
