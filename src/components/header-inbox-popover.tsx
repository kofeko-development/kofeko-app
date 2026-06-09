'use client';

import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  Inbox,
  Loader2,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  stripInboxHtml,
  useInboxNotifications,
  type InboxNotification,
} from '@/hooks/use-inbox-notifications';

export function HeaderInboxPopover() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'inbox' | 'archived'>('inbox');
  const [selected, setSelected] = useState<InboxNotification | null>(null);

  const {
    notifications,
    archived,
    isLoading,
    hasLoaded,
    unreadCount,
    loadMessages,
    markAsRead,
    archiveMessage,
    unarchiveMessage,
  } = useInboxNotifications();

  useEffect(() => {
    if (open && !hasLoaded) {
      void loadMessages();
    }
  }, [open, hasLoaded, loadMessages]);

  useEffect(() => {
    if (!open) {
      setSelected(null);
      setView('inbox');
    }
  }, [open]);

  const displayed = useMemo(
    () => (view === 'inbox' ? notifications : archived),
    [view, notifications, archived],
  );

  const handleSelect = (notification: InboxNotification) => {
    setSelected(notification);
    if (!notification.read && view === 'inbox') {
      void markAsRead(notification.id);
    }
  };

  const handleArchive = async () => {
    if (!selected) return;
    await archiveMessage(selected);
    setSelected(null);
  };

  const handleUnarchive = async () => {
    if (!selected) return;
    await unarchiveMessage(selected);
    setSelected(null);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'relative h-10 w-10 rounded-full',
            open && 'bg-primary/10 text-primary',
          )}
          aria-label="Inbox"
        >
          <Inbox className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={10}
        className="w-[380px] overflow-hidden rounded-xl border bg-card p-0 shadow-xl"
      >
        {selected ? (
          <div className="flex max-h-[420px] flex-col">
            <div className="flex items-center gap-2 border-b px-3 py-2.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => setSelected(null)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{selected.subject}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(selected.date), 'MMM d, yyyy · h:mm a')}
                </p>
              </div>
              {view === 'inbox' ? (
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => void handleArchive()}>
                  <Archive className="h-4 w-4" />
                </Button>
              ) : (
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => void handleUnarchive()}>
                  <ArchiveRestore className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div
              className="overflow-y-auto px-4 py-3 text-sm leading-relaxed text-foreground/90"
              dangerouslySetInnerHTML={{ __html: selected.body }}
            />
          </div>
        ) : (
          <div className="flex max-h-[420px] flex-col">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <p className="text-sm font-semibold">Inbox</p>
                <p className="text-xs text-muted-foreground">
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                </p>
              </div>
              <div className="flex rounded-lg bg-muted/60 p-0.5">
                <button
                  type="button"
                  onClick={() => setView('inbox')}
                  className={cn(
                    'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                    view === 'inbox' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground',
                  )}
                >
                  Inbox
                </button>
                <button
                  type="button"
                  onClick={() => setView('archived')}
                  className={cn(
                    'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                    view === 'archived' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground',
                  )}
                >
                  Archived
                </button>
              </div>
            </div>

            <div className="overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : displayed.length > 0 ? (
                <div className="divide-y">
                  {displayed.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => handleSelect(notification)}
                      className="flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40"
                    >
                      <div
                        className={cn(
                          'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                          !notification.read && view === 'inbox'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground',
                        )}
                      >
                        <Mail className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={cn(
                              'truncate text-sm',
                              !notification.read && view === 'inbox' ? 'font-semibold text-foreground' : 'font-medium',
                            )}
                          >
                            {notification.subject}
                          </p>
                          {!notification.read && view === 'inbox' && (
                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {stripInboxHtml(notification.body) || 'No preview available'}
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground/80">
                          {format(new Date(notification.date), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                  <Inbox className="mb-3 h-10 w-10 text-muted-foreground/40" />
                  <p className="text-sm font-medium">No messages</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Your {view === 'inbox' ? 'inbox' : 'archive'} is empty.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
