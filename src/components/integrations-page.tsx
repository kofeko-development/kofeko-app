"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Building2, CheckCircle, Linkedin, Link2, RefreshCw, Unlink, User, Plus } from "lucide-react";

import { linkedInApi, type LinkedInConnectionDetails } from "@/lib/linkedin-api";
import { useAuth } from "@/lib/auth";
import { useAppToast } from "@/lib/toast-helpers";
import { useApiErrorToast } from "@/hooks/use-api-error-toast";
import {
  useInvalidateLinkedInStatus,
  useLinkedInStatus,
} from "@/hooks/use-linkedin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";

function ConnectionCard({ 
  connection, 
  onRefresh, 
  canConnect 
}: { 
  connection: LinkedInConnectionDetails;
  onRefresh: () => Promise<void>;
  canConnect: boolean;
}) {
  const { toastSuccess, toastError } = useAppToast();
  const { showError } = useApiErrorToast();
  const [postAsOrg, setPostAsOrg] = useState(connection.postAsOrg ?? Boolean(connection.hasOrgPage));
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isSavingPref, setIsSavingPref] = useState(false);
  const [isRefreshingOrg, setIsRefreshingOrg] = useState(false);
  const [isLinkingOrg, setIsLinkingOrg] = useState(false);
  const [manualOrgId, setManualOrgId] = useState("");
  const [manualOrgName, setManualOrgName] = useState("");

  const onDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await linkedInApi.disconnect(connection.id);
      toastSuccess({ title: "LinkedIn disconnected" });
      await onRefresh();
    } catch (e) {
      toastError({
        title: "Could not disconnect LinkedIn",
        description: e instanceof Error ? e.message : "Please try again.",
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  const onRefreshOrganization = async () => {
    setIsRefreshingOrg(true);
    try {
      const res = await linkedInApi.refreshOrganization(connection.id);
      toastSuccess({ title: "Company page loaded", description: res.orgName ?? `Page ID ${res.orgId}` });
      await onRefresh();
    } catch (e) {
      showError(e);
    } finally {
      setIsRefreshingOrg(false);
    }
  };

  const onLinkOrganization = async () => {
    setIsLinkingOrg(true);
    try {
      const res = await linkedInApi.setOrganization(connection.id, manualOrgId, manualOrgName || undefined);
      toastSuccess({
        title: "Company page linked",
        description: res.canPostAsCompanyPage
          ? `${res.orgName ?? res.orgId} — ready for Post now`
          : `${res.orgName ?? res.orgId} linked, but reconnect with org scopes to post as the page.`,
      });
      await onRefresh();
    } catch (e) {
      showError(e);
    } finally {
      setIsLinkingOrg(false);
    }
  };

  const onSavePreference = async () => {
    setIsSavingPref(true);
    try {
      await linkedInApi.updatePreference(connection.id, postAsOrg);
      await onRefresh();
      toastSuccess({ title: "Preference saved" });
    } catch (e) {
      toastError({
        title: "Could not save preference",
        description: e instanceof Error ? e.message : "Please try again.",
      });
    } finally {
      setIsSavingPref(false);
    }
  };

  return (
    <div className="space-y-5 border-b pb-6 last:border-0 last:pb-0">
      <div className="rounded-lg bg-green-50 border border-green-200 p-3">
        <p className="text-sm font-medium text-green-900">Connected as {connection.name}</p>
        {connection.email ? <p className="text-xs text-green-700 mt-0.5">{connection.email}</p> : null}
        {connection.connectedAt ? (
          <p className="text-xs text-green-700 mt-0.5">
            Last connected {new Date(connection.connectedAt).toLocaleDateString()}
          </p>
        ) : null}
      </div>

      {connection.hasOrgPage && connection.orgName ? (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 flex gap-3">
          <Building2 className="h-5 w-5 text-blue-600 shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-900">
              Company page linked: {connection.orgName}
              {connection.orgId ? ` (ID ${connection.orgId})` : ""}
            </p>
            <p className="text-xs text-blue-700">
              {connection.canPostAsCompanyPage
                ? "Ready to post as this company page."
                : "Page linked — reconnect with org scopes enabled to post as the company."}
            </p>
          </div>
        </div>
      ) : connection.orgDiscoveryHint ? (
        <Alert variant="info">
          <AlertTitle>LinkedIn company page not detected yet</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>{connection.orgDiscoveryHint}</p>
            <p className="text-xs">
              Note: Kofeko admin / super admin is not the same as LinkedIn Company Page admin. You must admin the page on linkedin.com.
            </p>
          </AlertDescription>
        </Alert>
      ) : null}

      {!connection.hasOrgPage || !connection.orgName ? (
        <div className="space-y-3 rounded-lg border p-4">
          <Label className="text-sm font-medium">Link company page manually</Label>
          <p className="text-xs text-muted-foreground">
            In LinkedIn: open your company page → Admin tools → Page info → copy the numeric Page ID (or paste a /company/12345 URL).
          </p>
          <div className="space-y-2">
            <Input
              placeholder="Page ID or https://linkedin.com/company/12345678"
              value={manualOrgId}
              onChange={(e) => setManualOrgId(e.target.value)}
            />
            <Input
              placeholder="Display name (optional)"
              value={manualOrgName}
              onChange={(e) => setManualOrgName(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => void onRefreshOrganization()} disabled={!canConnect || isRefreshingOrg}>
              {isRefreshingOrg ? <RefreshCw className="mr-2 h-3 w-3 animate-spin" /> : <RefreshCw className="mr-2 h-3 w-3" />}
              Refresh pages from LinkedIn
            </Button>
            <Button size="sm" onClick={() => void onLinkOrganization()} disabled={!canConnect || !manualOrgId.trim() || isLinkingOrg}>
              {isLinkingOrg ? <RefreshCw className="mr-2 h-3 w-3 animate-spin" /> : null}
              Save page link
            </Button>
          </div>
        </div>
      ) : null}

      {connection.hasOrgPage ? (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Default posting destination</Label>
          <RadioGroup
            value={postAsOrg ? "org" : "personal"}
            onValueChange={(v) => setPostAsOrg(v === "org")}
            className="space-y-2"
          >
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <RadioGroupItem value="org" id={`pref-org-${connection.id}`} />
              <Label htmlFor={`pref-org-${connection.id}`} className="flex items-center gap-2 cursor-pointer flex-1">
                <Building2 className="h-4 w-4 text-[#0077B5]" />
                <div>
                  <p className="font-medium text-sm">{connection.orgName} (Company Page)</p>
                  <p className="text-xs text-muted-foreground">Recommended</p>
                </div>
              </Label>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <RadioGroupItem value="personal" id={`pref-personal-${connection.id}`} />
              <Label htmlFor={`pref-personal-${connection.id}`} className="flex items-center gap-2 cursor-pointer flex-1">
                <User className="h-4 w-4" />
                <div>
                  <p className="font-medium text-sm">{connection.name} (Personal Profile)</p>
                  <p className="text-xs text-muted-foreground">Posts on your personal feed</p>
                </div>
              </Label>
            </div>
          </RadioGroup>
          <Button variant="outline" size="sm" onClick={() => void onSavePreference()} disabled={!canConnect || isSavingPref}>
            {isSavingPref ? <RefreshCw className="mr-2 h-3 w-3 animate-spin" /> : null}
            Save preference
          </Button>
        </div>
      ) : null}

      {connection.isExpired ? (
        <Alert variant="destructive">
          <AlertTitle>Token expired</AlertTitle>
          <AlertDescription>Disconnect and reconnect your LinkedIn account.</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-wrap gap-2 pt-2 border-t mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => void onDisconnect()}
          disabled={!canConnect || isDisconnecting}
          className="text-destructive border-destructive/30 hover:bg-destructive/5"
        >
          {isDisconnecting ? <RefreshCw className="mr-2 h-3 w-3 animate-spin" /> : <Unlink className="mr-2 h-3 w-3" />}
          Disconnect
        </Button>
      </div>
    </div>
  );
}

export default function IntegrationsPage() {
  const { user, hasPermission } = useAuth();
  const { toastSuccess, toastError } = useAppToast();
  const { showError } = useApiErrorToast();
  const searchParams = useSearchParams();

  const canRead = hasPermission("linkedin:read") || hasPermission("linkedin:connect") || hasPermission("linkedin:post");
  const canConnect = hasPermission("linkedin:connect");

  const invalidateLinkedInStatus = useInvalidateLinkedInStatus();
  const {
    data: status,
    isLoading,
    isFetching,
    isError: statusError,
    error: statusLoadError,
    refetch: refetchLinkedInStatus,
  } = useLinkedInStatus({ enabled: Boolean(user) && canRead });

  const [isConnecting, setIsConnecting] = useState(false);

  const decodeCallbackReason = (raw: string | null) => {
    if (!raw) return null;
    return raw
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, "&");
  };

  const callbackBanner = useMemo(() => {
    const li = searchParams.get("linkedin");
    if (!li) return null;
    if (li === "connected") {
      const org = searchParams.get("org");
      const name = searchParams.get("name");
      const desc = org
        ? `Connected as ${name ?? "member"}. Company page found: ${org}.`
        : `Connected as ${name ?? "member"}. You can auto-post to your personal profile.`;
      return { variant: "success" as const, title: "LinkedIn connected", desc };
    }
    if (li === "error") {
      return {
        variant: "destructive" as const,
        title: "LinkedIn connection failed",
        desc: decodeCallbackReason(searchParams.get("reason")) ?? "Please try again.",
      };
    }
    return null;
  }, [searchParams]);

  useEffect(() => {
    if (searchParams.get("linkedin") === "connected") {
      void invalidateLinkedInStatus();
    }
  }, [searchParams, invalidateLinkedInStatus]);

  useEffect(() => {
    if (!statusError) return;
    toastError({
      title: "Unable to load LinkedIn status",
      description: statusLoadError instanceof Error ? statusLoadError.message : "Please try again.",
    });
  }, [statusError, statusLoadError, toastError]);

  const onConnect = async () => {
    setIsConnecting(true);
    try {
      const { url } = await linkedInApi.authUrl();
      window.location.href = url;
    } catch (e) {
      showError(e);
      setIsConnecting(false);
    }
  };

  const loadStatus = async () => {
    await refetchLinkedInStatus();
  };

  if (!canRead) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Integrations</h1>
          <p className="text-muted-foreground">Connect third-party services.</p>
        </div>
        <Alert variant="destructive">
          <AlertTitle>Access denied</AlertTitle>
          <AlertDescription>You don&apos;t have permission to view integrations.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const connections = status?.connections ?? [];
  const hasConnections = connections.length > 0;

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight text-foreground">Integrations</h1>
        <p className="text-muted-foreground mt-1 text-base">Connect your external accounts to unlock automation and publishing features.</p>
      </div>

      {callbackBanner ? (
        <Alert variant={callbackBanner.variant} className="border-border/50 bg-background shadow-sm max-w-3xl">
          <AlertTitle>{callbackBanner.title}</AlertTitle>
          <AlertDescription>{callbackBanner.desc}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-bold font-headline tracking-tight text-foreground">Connectors</h2>
          <p className="text-sm text-muted-foreground mt-1">Available apps and services</p>
        </div>

        <div className="max-w-4xl">
          <Card className="border border-border/60 bg-card shadow-sm overflow-hidden rounded-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-muted/10 border-b border-border/40">
              <div className="flex items-center gap-5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#0077B5] shadow-sm ring-4 ring-background">
                  <Linkedin className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    LinkedIn
                    {status?.connected && hasConnections && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                        <span className="h-1 w-1 rounded-full bg-emerald-500" />
                        Connected
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Post job openings directly to your company pages or personal profiles.
                  </p>
                </div>
              </div>
              
              {!hasConnections && !isLoading && (
                <Button
                  onClick={() => void onConnect()}
                  disabled={!canConnect || isConnecting}
                  className="rounded-full shadow-sm bg-[#0077B5] hover:bg-[#006097] text-white shrink-0"
                >
                  {isConnecting ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  {isConnecting ? "Connecting…" : "Add Connection"}
                </Button>
              )}
            </div>

            <CardContent className="p-6">
              {isLoading && !status ? (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-10 w-48" />
                </div>
              ) : hasConnections ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-border/40 pb-4">
                    <h4 className="text-sm font-semibold text-foreground">Active Connections ({connections.length})</h4>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => void loadStatus()} disabled={isLoading || isFetching} className="text-muted-foreground hover:text-foreground">
                        <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
                        Refresh
                      </Button>
                      <Button
                        onClick={() => void onConnect()}
                        disabled={!canConnect || isConnecting}
                        variant="outline"
                        size="sm"
                        className="bg-[#0077B5]/5 hover:bg-[#0077B5]/10 text-[#0077B5] border-[#0077B5]/20 rounded-full"
                      >
                        {isConnecting ? <RefreshCw className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Plus className="mr-2 h-3.5 w-3.5" />}
                        {isConnecting ? "Connecting…" : "Add Another"}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-1">
                    {connections.map((conn) => (
                      <ConnectionCard 
                        key={conn.id} 
                        connection={conn} 
                        onRefresh={loadStatus} 
                        canConnect={canConnect} 
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-10 space-y-4">
                  <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center">
                    <Unlink className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                  <div className="max-w-sm">
                    <h4 className="font-medium text-foreground">No accounts connected</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Connect your LinkedIn account to enable automatic job publishing and enhanced candidate sourcing.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
