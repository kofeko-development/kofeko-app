'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Archive, ArchiveRestore, Inbox, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  stripInboxHtml,
  useInboxNotifications,
  type InboxNotification,
} from '@/hooks/use-inbox-notifications';

function InboxComponent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const [selectedNotification, setSelectedNotification] = useState<InboxNotification | null>(null);
  const [view, setView] = useState<'inbox' | 'archived'>('inbox');

  const {
    notifications,
    archived,
    isLoading,
    loadMessages,
    markAsRead,
    archiveMessage,
    unarchiveMessage,
  } = useInboxNotifications();

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  const handleSelectNotification = (notification: InboxNotification) => {
    setSelectedNotification(notification);
    if (!notification.read && view === 'inbox') {
      void markAsRead(notification.id);
    }
  };

  useEffect(() => {
    const selectedId = searchParams.get('select');
    const list = view === 'inbox' ? notifications : archived;

    if (selectedId) {
      const notificationToSelect = list.find((n) => n.id === selectedId);
      if (notificationToSelect) {
        handleSelectNotification(notificationToSelect);
      }
      return;
    }

    if (view === 'inbox' && notifications.length > 0 && !selectedNotification) {
      setSelectedNotification(notifications[0]);
    } else if (view === 'archived' && archived.length > 0 && !selectedNotification) {
      setSelectedNotification(archived[0]);
    }
  }, [searchParams, notifications, archived, view, selectedNotification]);

  const handleArchive = async () => {
    if (!selectedNotification) return;
    await archiveMessage(selectedNotification);
    setSelectedNotification(null);
    toast({ title: 'Message archived.' });
  };

  const handleUnarchive = async () => {
    if (!selectedNotification) return;
    await unarchiveMessage(selectedNotification);
    setSelectedNotification(null);
    toast({ title: 'Message moved to inbox.' });
  };

  const displayedNotifications = useMemo(
    () => (view === 'inbox' ? notifications : archived),
    [view, notifications, archived],
  );

  return (
    <div className="flex h-full flex-col gap-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Inbox</h1>
        <p className="text-muted-foreground">Notifications and updates about your applications.</p>
      </div>

      <div className="grid h-[calc(100vh-200px)] flex-1 gap-6 md:grid-cols-3">
        <Card className="flex flex-col md:col-span-1">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setView('inbox');
                  setSelectedNotification(null);
                }}
                className={cn(
                  'flex-1 justify-center rounded-lg px-3 py-2 text-sm font-semibold text-foreground hover:bg-primary/5 hover:text-primary',
                  view === 'inbox' && 'bg-primary/5 text-primary',
                )}
              >
                <Inbox className="mr-2 h-4 w-4" /> Inbox
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setView('archived');
                  setSelectedNotification(null);
                }}
                className={cn(
                  'flex-1 justify-center rounded-lg px-3 py-2 text-sm font-semibold text-foreground hover:bg-primary/5 hover:text-primary',
                  view === 'archived' && 'bg-primary/5 text-primary',
                )}
              >
                <Archive className="mr-2 h-4 w-4" /> Archived
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-2 pt-0">
            {isLoading ? (
              <div className="flex h-full flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : displayedNotifications.length > 0 ? (
              <div className="flex flex-col gap-1">
                {displayedNotifications.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => handleSelectNotification(n)}
                    className={cn(
                      'w-full rounded-lg border-2 border-transparent p-3 text-left transition-colors',
                      selectedNotification?.id === n.id ? 'border-primary/20 bg-primary/10' : 'hover:bg-muted/50',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <p className={cn('font-semibold', !n.read && view === 'inbox' && 'text-primary')}>
                        {n.subject}
                      </p>
                      {!n.read && view === 'inbox' && (
                        <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="mt-1 truncate text-sm text-muted-foreground">{stripInboxHtml(n.body)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{format(new Date(n.date), 'MMM dd, yyyy')}</p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center p-4 text-center text-muted-foreground">
                <FileText className="mb-4 h-12 w-12" />
                <h4 className="font-semibold">No messages here</h4>
                <p className="text-sm">Your {view} folder is empty.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col md:col-span-2">
          {selectedNotification ? (
            <>
              <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="leading-tight">{selectedNotification.subject}</CardTitle>
                    <CardDescription className="mt-1">
                      {format(new Date(selectedNotification.date), 'PPPP p')}
                    </CardDescription>
                  </div>
                  {view === 'inbox' ? (
                    <Button variant="outline" size="icon" className="shrink-0" onClick={() => void handleArchive()}>
                      <Archive className="h-4 w-4" />
                      <span className="sr-only">Archive</span>
                    </Button>
                  ) : (
                    <Button variant="outline" size="icon" className="shrink-0" onClick={() => void handleUnarchive()}>
                      <ArchiveRestore className="h-4 w-4" />
                      <span className="sr-only">Unarchive</span>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto px-4 py-2">
                <div
                  className="prose prose-sm dark:prose-invert max-w-none pt-2 font-sans"
                  dangerouslySetInnerHTML={{ __html: selectedNotification.body }}
                />
              </CardContent>
            </>
          ) : (
            <CardContent className="flex h-full flex-col items-center justify-center text-center">
              <Inbox className="mb-4 h-16 w-16 text-muted-foreground/50" />
              <h3 className="text-xl font-semibold">Select a message</h3>
              <p className="text-muted-foreground">Choose a message from the left to read it.</p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function InboxPageContent() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <InboxComponent />
    </Suspense>
  );
}
