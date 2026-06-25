"use client";

import { useEffect, useMemo, useState } from "react";
import { ApiError } from "@/lib/api-client";
import { getErrorDisplay } from "@/lib/error-messages";
import { linkedInApi, type LinkedInPostResult, type LinkedInPostRecord, type LinkedInPreview, type LinkedInStatus } from "@/lib/linkedin-api";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";

import { Building2, Copy, Download, ExternalLink, ImagePlus, Linkedin, Link2, Loader2, RefreshCw, Trash2, Unlink, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
};

function formatDate(d?: string | null) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString();
  } catch {
    return d;
  }
}

export function LinkedInShareModal({ open, onOpenChange, jobId }: Props) {
  const { hasPermission } = useAuth();
  const { toast } = useToast();

  const canPost = hasPermission("linkedin:post");
  const canRead = hasPermission("linkedin:read");
  const canConnect = hasPermission("linkedin:connect");
  const integrationsHref = hasPermission("rbac:manage") ? "/admin/integrations" : "/settings/integrations";

  const [preview, setPreview] = useState<LinkedInPreview | null>(null);
  const [status, setStatus] = useState<LinkedInStatus | null>(null);
  const [history, setHistory] = useState<Array<LinkedInPostRecord & { postedByUser?: { firstName: string; lastName: string } }>>(
    [],
  );
  const [activeTab, setActiveTab] = useState<string>("compose");
  const [customText, setCustomText] = useState<string>("");

  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isRemovingImage, setIsRemovingImage] = useState(false);
  const [selectedConnectionIds, setSelectedConnectionIds] = useState<string[]>([]);

  const effectiveText = useMemo(() => (customText.trim() ? customText : preview?.postText ?? ""), [customText, preview]);
  const charCount = effectiveText.length;
  const charLimit = preview?.charLimit ?? 3000;

  const loadPreview = async () => {
    setIsLoadingPreview(true);
    try {
      const p = await linkedInApi.preview(jobId);
      setPreview(p);
      setCustomText(p.postText);
    } catch (e) {
      toast({
        title: "Unable to generate LinkedIn preview",
        description: e instanceof Error ? e.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const loadStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const s = await linkedInApi.status();
      setStatus(s);
      if (s.connected && s.connections) {
        setSelectedConnectionIds(s.connections.map(c => c.id));
      }
    } catch {
      // non-blocking
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const loadHistory = async () => {
    if (!canRead) return;
    setIsLoadingHistory(true);
    try {
      const h = await linkedInApi.jobPosts(jobId);
      setHistory(h ?? []);
    } catch {
      // non-blocking
      setHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    if (!canPost) return;
    void loadPreview();
    void loadStatus();
    void loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, jobId]);

  const onCopyText = async () => {
    if (!preview) return;
    try {
      await navigator.clipboard.writeText(effectiveText);
      await linkedInApi.recordCopy({ jobId, postText: effectiveText });
      toast({ title: "Copied", description: "LinkedIn post text copied to clipboard." });
      void loadHistory();
    } catch (e) {
      toast({
        title: "Copy failed",
        description: e instanceof Error ? e.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const onOpenShare = async () => {
    if (!preview) return;
    try {
      window.open(preview.shareUrl, "_blank", "noopener,noreferrer");
      await linkedInApi.recordShare({ jobId, postText: effectiveText, shareUrl: preview.shareUrl });
      toast({
        title: "Opened LinkedIn",
        description: preview.imageUrl
          ? "Finish posting in the new tab. Attach the downloaded image if you uploaded one."
          : "Finish posting in the new tab.",
      });
      void loadHistory();
    } catch (e) {
      toast({
        title: "Could not open share",
        description: e instanceof Error ? e.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const onConnect = async () => {
    try {
      const { url } = await linkedInApi.authUrl();
      window.location.href = url;
    } catch (e) {
      toast({
        title: "Could not start LinkedIn connect",
        description: e instanceof Error ? e.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const onDisconnect = async () => {
    // Only disconnect if multiple account disconnection is requested, but for now we direct them to settings for managing connections
    window.location.href = integrationsHref;
  };

  const onImageSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowed.includes(file.type) && !/\.(jpe?g|png|gif|webp)$/i.test(file.name)) {
      toast({
        title: "Unsupported format",
        description: "Use JPG, PNG, GIF, or WEBP for LinkedIn share images.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum size is 5 MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingImage(true);
    try {
      await linkedInApi.uploadJobImage(jobId, file);
      toast({ title: "Image uploaded", description: "This image will be included when you use Post now." });
      await loadPreview();
    } catch (err) {
      toast({
        title: "Upload failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const onRemoveImage = async () => {
    setIsRemovingImage(true);
    try {
      await linkedInApi.clearJobImage(jobId);
      toast({ title: "Image removed" });
      await loadPreview();
    } catch (err) {
      toast({
        title: "Could not remove image",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRemovingImage(false);
    }
  };

  const onAutoPost = async () => {
    if (!preview) return;
    if (charCount > charLimit) {
      toast({
        title: "Post too long",
        description: `LinkedIn allows max ${charLimit} characters.`,
        variant: "destructive",
      });
      return;
    }

    if (selectedConnectionIds.length === 0) {
      toast({
        title: "No account selected",
        description: "Please select at least one LinkedIn account to post to.",
        variant: "destructive",
      });
      return;
    }

    setIsPosting(true);
    try {
      const res = await linkedInApi.autoPost({
        jobId,
        customText: effectiveText !== preview.postText ? effectiveText : undefined,
        connectionIds: selectedConnectionIds,
      });

      const successCount = res.length;
      toast({
        title: "Posted to LinkedIn",
        description: `Successfully posted to ${successCount} account${successCount > 1 ? 's' : ''}.`,
      });
      await loadHistory();
      await loadStatus();
    } catch (e) {
      const errorCode = e instanceof ApiError ? e.errorCode : undefined;
      const display = getErrorDisplay(
        errorCode,
        e instanceof ApiError ? e.message : e instanceof Error ? e.message : undefined,
      );
      toast({ title: display.title, description: display.description, variant: "destructive" });

      if (
        errorCode === "LINKEDIN_NOT_CONNECTED" ||
        errorCode === "LINKEDIN_TOKEN_EXPIRED" ||
        errorCode === "LINKEDIN_OAUTH_FAILED" ||
        errorCode === "LINKEDIN_SCOPE_DENIED"
      ) {
        setActiveTab("connect");
      }
    } finally {
      setIsPosting(false);
    }
  };

  const toggleConnection = (id: string) => {
    setSelectedConnectionIds(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  if (!canPost) {
    return null;
  }

  const connections = status?.connections ?? [];
  const hasConnections = connections.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[min(92vh,52rem)] w-[calc(100vw-2rem)] max-w-3xl flex-col gap-0 overflow-hidden p-0 sm:w-full">
        <DialogHeader className="shrink-0 space-y-2 border-b px-8 py-5 pr-14">
          <DialogTitle className="flex items-center gap-2">
            <Linkedin className="h-5 w-5 shrink-0" />
            Share to LinkedIn
          </DialogTitle>
          <DialogDescription className="text-left">
            Copy text, open LinkedIn manually, or post instantly to multiple accounts.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <TabsList className="mx-8 mt-5 h-11 w-fit shrink-0 justify-start">
            <TabsTrigger value="compose">Compose</TabsTrigger>
            <TabsTrigger value="connect">Accounts</TabsTrigger>
            {canRead ? <TabsTrigger value="history">History</TabsTrigger> : null}
          </TabsList>

          <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-8 py-5">
            <TabsContent value="compose" className="mt-0 space-y-5 focus-visible:outline-none focus-visible:ring-0">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm text-muted-foreground">
                  {preview ? (
                    <>
                      Characters: <span className={charCount > charLimit ? "text-destructive font-medium" : "font-medium"}>{charCount}</span>
                      /{charLimit}
                    </>
                  ) : (
                    "Generating preview…"
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={() => void loadPreview()} disabled={isLoadingPreview}>
                  {isLoadingPreview ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                  Regenerate
                </Button>
              </div>

              <div className="space-y-4 rounded-lg border p-5">
                <Label className="text-sm font-medium">Share image (optional)</Label>
                <p className="text-xs text-muted-foreground">
                  Used for Post now. For Copy or Open on LinkedIn, download and attach manually.
                </p>
                {preview?.imageUrl ? (
                  <div className="flex flex-col gap-3">
                    <img
                      src={preview.imageUrl}
                      alt="LinkedIn share preview"
                      className="max-h-48 w-full max-w-sm rounded-md border object-contain"
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={preview.imageUrl} target="_blank" rel="noreferrer" download>
                          <Download className="mr-2 h-4 w-4" />
                          Download image
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void onRemoveImage()}
                        disabled={isRemovingImage}
                      >
                        {isRemovingImage ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        Remove
                      </Button>
                      <Label htmlFor="linkedin-share-image-replace" className="cursor-pointer">
                        <Button variant="secondary" size="sm" asChild disabled={isUploadingImage}>
                          <span>
                            {isUploadingImage ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <ImagePlus className="mr-2 h-4 w-4" />
                            )}
                            Replace
                          </span>
                        </Button>
                        <Input
                          id="linkedin-share-image-replace"
                          type="file"
                          accept="image/jpeg,image/png,image/gif,image/webp"
                          className="sr-only"
                          onChange={(e) => void onImageSelected(e)}
                          disabled={isUploadingImage}
                        />
                      </Label>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="linkedin-share-image" className="cursor-pointer">
                      <Button variant="outline" size="sm" asChild disabled={isUploadingImage || !preview}>
                        <span>
                          {isUploadingImage ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <ImagePlus className="mr-2 h-4 w-4" />
                          )}
                          Upload image
                        </span>
                      </Button>
                      <Input
                        id="linkedin-share-image"
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        className="sr-only"
                        onChange={(e) => void onImageSelected(e)}
                        disabled={isUploadingImage || !preview}
                      />
                    </Label>
                    <p className="text-xs text-muted-foreground mt-2">JPG, PNG, GIF, or WEBP — max 5 MB</p>
                  </div>
                )}
              </div>

              <Textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Write your LinkedIn post…"
                className="min-h-[220px] w-full min-w-0 resize-none text-sm leading-relaxed"
                disabled={!preview || isLoadingPreview}
              />

              {status?.connected && hasConnections ? (
                <div className="rounded-lg border bg-muted/30 p-5 space-y-4">
                  <Label className="text-sm font-medium">Post to Accounts</Label>
                  <div className="space-y-2">
                    {connections.map((conn) => {
                      const isOrg = conn.postAsOrg;
                      const label = isOrg ? `${conn.orgName} (Company Page)` : `${conn.name} (Personal Profile)`;
                      const disabled = conn.isExpired || (isOrg && !conn.canPostAsCompanyPage);
                      return (
                        <div key={conn.id} className={`flex items-center gap-3 rounded-md border bg-background p-3 ${disabled ? "opacity-60" : ""}`}>
                          <Checkbox
                            id={`modal-post-${conn.id}`}
                            checked={selectedConnectionIds.includes(conn.id)}
                            onCheckedChange={() => toggleConnection(conn.id)}
                            disabled={disabled}
                          />
                          <Label htmlFor={`modal-post-${conn.id}`} className="flex items-center gap-2 cursor-pointer flex-1">
                            {isOrg ? <Building2 className="h-4 w-4 text-[#0077B5]" /> : <User className="h-4 w-4 text-[#0077B5]" />}
                            <div>
                              <p className="font-medium text-sm">{label}</p>
                              {disabled && <p className="text-xs text-destructive">Unavailable (Check Integrations settings)</p>}
                            </div>
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {!status?.connected ? (
                <Alert>
                  <AlertTitle>Connect LinkedIn for Post now</AlertTitle>
                  <AlertDescription>
                    Copy text and Open on LinkedIn work without connecting.{" "}
                    <Link href={integrationsHref} className="underline" onClick={() => onOpenChange(false)}>
                      Connect in Settings
                    </Link>{" "}
                    to auto-post.
                  </AlertDescription>
                </Alert>
              ) : null}
            </TabsContent>

            <TabsContent value="connect" className="mt-0 space-y-5 focus-visible:outline-none focus-visible:ring-0">
              {isLoadingStatus && !status ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full rounded-lg" />
                  <Skeleton className="h-10 w-36" />
                </div>
              ) : status?.connected && hasConnections ? (
                <div className="space-y-4">
                  <Alert>
                    <AlertTitle>Connected Accounts</AlertTitle>
                    <AlertDescription>
                      You have {connections.length} account{connections.length > 1 ? 's' : ''} connected.
                    </AlertDescription>
                  </Alert>
                  <div className="space-y-2">
                    {connections.map((conn) => (
                      <div key={conn.id} className="rounded-md border p-3">
                        <p className="font-medium text-sm">{conn.name}</p>
                        {conn.hasOrgPage && conn.orgName && <p className="text-xs text-muted-foreground mt-1">Company page: {conn.orgName}</p>}
                        {conn.isExpired && <p className="text-xs text-destructive mt-1">Token expired</p>}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <Alert variant="destructive">
                  <AlertTitle>Not connected</AlertTitle>
                  <AlertDescription>Connect your LinkedIn account to enable Post now.</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                <Button onClick={() => void onConnect()} disabled={!canConnect}>
                  <Link2 className="mr-2 h-4 w-4" />
                  Connect Account
                </Button>
                <Button variant="outline" asChild>
                  <Link href={integrationsHref} onClick={() => onOpenChange(false)}>
                    Manage Integrations
                  </Link>
                </Button>
              </div>
            </TabsContent>

            {canRead ? (
              <TabsContent value="history" className="mt-0 space-y-4 focus-visible:outline-none focus-visible:ring-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Recent LinkedIn actions for this job.</p>
                  <Button variant="outline" size="sm" onClick={() => void loadHistory()} disabled={isLoadingHistory}>
                    {isLoadingHistory ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                    Refresh
                  </Button>
                </div>

                {history.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No LinkedIn activity yet.</p>
                ) : (
                  <div className="space-y-2">
                    {history.map((row) => (
                      <div key={row.id} className="rounded-md border p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">Tier {row.tier}</Badge>
                            <Badge variant={row.status === "failed" ? "destructive" : "default"}>{row.status}</Badge>
                            {row.postUrl ? (
                              <a className="text-sm underline inline-flex items-center gap-1" href={row.postUrl} target="_blank" rel="noreferrer">
                                View post <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : null}
                          </div>
                          <div className="text-xs text-muted-foreground">{formatDate(row.createdAt)}</div>
                        </div>
                        {row.tier === 3 && (row.postedAsOrg != null || row.postedOrgName || row.postedPersonName) ? (
                          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            {row.postedAsOrg ? <Building2 className="h-3 w-3" /> : <User className="h-3 w-3" />}
                            Posted as {row.postedAsOrg ? row.postedOrgName : row.postedPersonName}
                          </div>
                        ) : null}
                        <div className="mt-2 text-sm text-muted-foreground line-clamp-2">{row.postText}</div>
                        {row.errorMessage ? (
                          <div className="mt-2 text-xs text-destructive line-clamp-2">{row.errorMessage}</div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            ) : null}
          </div>
        </Tabs>

        <DialogFooter className="shrink-0 gap-3 border-t bg-background px-8 py-5 sm:justify-between">
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <Button variant="secondary" onClick={() => void onCopyText()} disabled={!preview || activeTab !== "compose"}>
              <Copy className="mr-2 h-4 w-4" />
              Copy text
            </Button>

            {preview?.imageUrl ? (
              <Button variant="outline" asChild disabled={activeTab !== "compose"}>
                <a href={preview.imageUrl} target="_blank" rel="noreferrer" download>
                  <Download className="mr-2 h-4 w-4" />
                  Download image
                </a>
              </Button>
            ) : null}

            <Button variant="outline" onClick={() => void onOpenShare()} disabled={!preview || activeTab !== "compose"}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Open on LinkedIn
            </Button>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
            <Button
              className="w-full sm:w-auto"
              onClick={() => void onAutoPost()}
              disabled={!preview || isPosting || !status?.connected || activeTab !== "compose" || selectedConnectionIds.length === 0}
              title={
                preview?.hasShareImage
                  ? "Post with image and text to your connected LinkedIn"
                  : "Post with link preview (upload an image to include a custom graphic)"
              }
            >
              {isPosting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Linkedin className="mr-2 h-4 w-4" />}
              Post to Selected Accounts
            </Button>

            <p
              className={`text-center text-xs text-muted-foreground sm:text-right ${activeTab !== "compose" || preview?.hasShareImage ? "invisible h-0 overflow-hidden" : ""
                }`}
              aria-hidden={activeTab !== "compose" || preview?.hasShareImage}
            >
              Post now uses a link preview unless you upload an image.
            </p>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

