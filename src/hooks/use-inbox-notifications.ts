'use client';

import { useCallback, useState } from 'react';
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

export function useInboxNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<InboxNotification[]>([]);
  const [archived, setArchived] = useState<InboxNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadMessages = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      let items: Record<string, unknown>[] = [];

      if (user.role === 'candidate') {
        const data = await portalApi.getMessages();
        items = Array.isArray(data) ? data : ((data as { data?: Record<string, unknown>[] })?.data ?? []);
      } else {
        const res = await communicationApi.getNotifications();
        items = res?.items ?? ((res as { data?: { items?: Record<string, unknown>[] } })?.data?.items ?? []);
      }

      const mapped = items.map(mapNotification);
      setNotifications(mapped.filter((n) => n.rawStatus !== 'archived'));
      setArchived(mapped.filter((n) => n.rawStatus === 'archived'));
      setHasLoaded(true);
    } catch (error) {
      console.error('Failed to load inbox messages', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const markAsRead = useCallback(
    async (id: string) => {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

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
    [user?.role],
  );

  const archiveMessage = useCallback(
    async (notification: InboxNotification) => {
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      setArchived((prev) => [{ ...notification, read: true }, ...prev]);

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
    [user?.role],
  );

  const unarchiveMessage = useCallback(
    async (notification: InboxNotification) => {
      setArchived((prev) => prev.filter((n) => n.id !== notification.id));
      setNotifications((prev) => [{ ...notification, read: true }, ...prev]);

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
    [user?.role],
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    archived,
    isLoading,
    hasLoaded,
    unreadCount,
    loadMessages,
    markAsRead,
    archiveMessage,
    unarchiveMessage,
  };
}
