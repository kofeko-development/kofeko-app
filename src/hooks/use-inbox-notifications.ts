'use client';

import { useCallback, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { communicationApi } from '@/lib/stage1-2-api';
import { portalApi } from '@/lib/portal-api';

export type InboxNotification = {
  id: string;
  date: string;
  subject: string;
  body: string;
  read: boolean;
  rawStatus: string;
};

type InboxData = {
  notifications: InboxNotification[];
  archived: InboxNotification[];
};

export function stripInboxHtml(html: string) {
  return html.replace(/<[^>]*>/g, '').trim();
}

function mapNotification(msg: Record<string, unknown>): InboxNotification {
  const status = String(msg.status ?? '');
  return {
    id: String(msg.id),
    date: String(msg.createdAt ?? new Date().toISOString()),
    subject: String(msg.title ?? msg.subject ?? 'Notification'),
    body: String(msg.body ?? ''),
    read: status === 'read' || status === 'archived',
    rawStatus: status,
  };
}

const inboxQueryKey = (role?: string, userId?: string) => ['inbox-messages', role, userId] as const;

async function fetchInboxMessages(role: string): Promise<InboxData> {
  let items: Record<string, unknown>[] = [];

  if (role === 'candidate') {
    const data = await portalApi.getMessages();
    items = Array.isArray(data) ? data : ((data as { data?: Record<string, unknown>[] })?.data ?? []);
  } else {
    const res = await communicationApi.getNotifications();
    items = res?.items ?? ((res as { data?: { items?: Record<string, unknown>[] } })?.data?.items ?? []);
  }

  const mapped = items.map(mapNotification);
  return {
    notifications: mapped.filter((n) => n.rawStatus !== 'archived'),
    archived: mapped.filter((n) => n.rawStatus === 'archived'),
  };
}

export function useInboxNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [fetchEnabled, setFetchEnabled] = useState(false);

  const queryKey = inboxQueryKey(user?.role, user?.uid);

  const { data, isLoading, isFetched, refetch } = useQuery({
    queryKey,
    queryFn: () => fetchInboxMessages(user!.role),
    enabled: Boolean(user) && fetchEnabled,
  });

  const notifications = data?.notifications ?? [];
  const archived = data?.archived ?? [];

  const updateCache = useCallback(
    (updater: (prev: InboxData) => InboxData) => {
      queryClient.setQueryData<InboxData>(queryKey, (prev) => {
        const base = prev ?? { notifications: [], archived: [] };
        return updater(base);
      });
    },
    [queryClient, queryKey],
  );

  const loadMessages = useCallback(async () => {
    if (!user) return;

    if (!fetchEnabled) {
      setFetchEnabled(true);
      return;
    }

    await refetch();
  }, [user, fetchEnabled, refetch]);

  const markAsRead = useCallback(
    async (id: string) => {
      updateCache((prev) => ({
        ...prev,
        notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      }));

      try {
        if (user?.role === 'candidate') {
          await portalApi.markMessageRead(id);
        } else {
          await communicationApi.markNotificationRead(id);
        }
      } catch (error) {
        console.error('Failed to mark message as read', error);
      }
    },
    [updateCache, user?.role],
  );

  const archiveMessage = useCallback(
    async (notification: InboxNotification) => {
      updateCache((prev) => ({
        notifications: prev.notifications.filter((n) => n.id !== notification.id),
        archived: [{ ...notification, read: true }, ...prev.archived],
      }));

      try {
        if (user?.role === 'candidate') {
          await portalApi.archiveMessage(notification.id);
        } else {
          await communicationApi.markNotificationRead(notification.id);
        }
      } catch (error) {
        console.error('Failed to archive message', error);
      }
    },
    [updateCache, user?.role],
  );

  const unarchiveMessage = useCallback(
    async (notification: InboxNotification) => {
      updateCache((prev) => ({
        archived: prev.archived.filter((n) => n.id !== notification.id),
        notifications: [{ ...notification, read: true }, ...prev.notifications],
      }));

      try {
        if (user?.role === 'candidate') {
          await portalApi.unarchiveMessage(notification.id);
        } else {
          await communicationApi.markNotificationRead(notification.id);
        }
      } catch (error) {
        console.error('Failed to unarchive message', error);
      }
    },
    [updateCache, user?.role],
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    archived,
    isLoading,
    hasLoaded: isFetched,
    unreadCount,
    loadMessages,
    markAsRead,
    archiveMessage,
    unarchiveMessage,
  };
}
