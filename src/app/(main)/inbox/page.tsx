'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Archive, ArchiveRestore, Inbox, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { portalApi } from '@/lib/portal-api';
import { communicationApi } from '@/lib/stage1-2-api';

type Notification = {
    id: string;
    date: string;
    subject: string;
    body: string;
    read: boolean;
    rawStatus: string;
};

const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '');
};

function InboxComponent() {
    const { user } = useAuth();
    const { toast } = useToast();
    const searchParams = useSearchParams();
    
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [archived, setArchived] = useState<Notification[]>([]);
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
    const [view, setView] = useState<'inbox' | 'archived'>('inbox');
    const [isLoading, setIsLoading] = useState(true);

    const loadMessages = async () => {
        try {
            setIsLoading(true);
            let items: any[] = [];

            if (user?.role === 'candidate') {
                const data = await portalApi.getMessages();
                items = Array.isArray(data) ? data : (data as any)?.data || [];
            } else {
                const res = await communicationApi.getNotifications();
                items = res?.items || (res as any)?.data?.items || [];
            }

            const mapped = items.map((msg: any) => ({
                id: msg.id,
                date: msg.createdAt,
                subject: msg.title || msg.subject || 'Notification Update',
                body: msg.body || '',
                read: msg.status === 'read' || msg.status === 'archived',
                rawStatus: msg.status
            }));

            // Filter inbox vs archived
            const inboxList = mapped.filter((n: any) => n.rawStatus !== 'archived');
            const archiveList = mapped.filter((n: any) => n.rawStatus === 'archived');

            setNotifications(inboxList);
            setArchived(archiveList);
        } catch (err) {
            console.error('Failed to load inbox messages', err);
            toast({
                title: "Error loading messages",
                description: "Could not fetch updates at this time.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            loadMessages();
        }
    }, [user]);

    const markAsRead = async (id: string) => {
        setNotifications(prev => 
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
        if (selectedNotification?.id === id) {
            setSelectedNotification(prev => prev ? { ...prev, read: true } : null);
        }
        try {
            if (user?.role === 'candidate') {
                await portalApi.markMessageRead(id);
            } else {
                await communicationApi.markNotificationRead(id);
            }
        } catch (err) {
            console.error('Failed to mark message as read', err);
        }
    };

    useEffect(() => {
        const selectedId = searchParams.get('select');
        if (selectedId) {
            const list = view === 'inbox' ? notifications : archived;
            const notificationToSelect = list.find(n => n.id === selectedId);
            if (notificationToSelect) {
                handleSelectNotification(notificationToSelect);
            }
        } else if (view === 'inbox' && notifications.length > 0 && !selectedNotification) {
            setSelectedNotification(notifications[0]);
        } else if (view === 'archived' && archived.length > 0 && !selectedNotification) {
            setSelectedNotification(archived[0]);
        }
    }, [searchParams, notifications, archived, view]);
    
    const handleSelectNotification = (notification: Notification) => {
        setSelectedNotification(notification);
        if (!notification.read && view === 'inbox') {
            markAsRead(notification.id);
        }
    }

    const handleArchive = async () => {
        if (!selectedNotification) return;

        const msgToArchive = selectedNotification;
        setNotifications(prev => prev.filter(n => n.id !== msgToArchive.id));
        setArchived(prev => [msgToArchive, ...prev]);
        setSelectedNotification(null);
        toast({ title: "Message archived." });

        try {
            if (user?.role === 'candidate') {
                await portalApi.archiveMessage(msgToArchive.id);
            } else {
                await communicationApi.markNotificationRead(msgToArchive.id);
            }
        } catch (err) {
            console.error('Failed to archive message', err);
        }
    }
    
    const handleUnarchive = async () => {
        if (!selectedNotification) return;
        
        const msgToUnarchive = selectedNotification;
        setArchived(prev => prev.filter(n => n.id !== msgToUnarchive.id));
        setNotifications(prev => [msgToUnarchive, ...prev]);
        setSelectedNotification(null);
        toast({ title: "Message moved to inbox." });

        try {
            if (user?.role === 'candidate') {
                await portalApi.unarchiveMessage(msgToUnarchive.id);
            } else {
                await communicationApi.markNotificationRead(msgToUnarchive.id);
            }
        } catch (err) {
            console.error('Failed to unarchive message', err);
        }
    }

    const displayedNotifications = useMemo(() => {
        return view === 'inbox' ? notifications : archived;
    }, [view, notifications, archived]);

    return (
        <div className="flex flex-col gap-6 h-full">
            <div>
                <h1 className="text-3xl font-bold font-headline">Inbox</h1>
                <p className="text-muted-foreground">Notifications and updates about your applications.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 flex-1 h-[calc(100vh-200px)]">
                <Card className="md:col-span-1 flex flex-col">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                             <Button
                                variant="ghost"
                                onClick={() => {
                                    setView('inbox');
                                    setSelectedNotification(null);
                                }}
                                className={cn(
                                    "flex-1 justify-center text-sm font-semibold text-foreground hover:text-primary hover:bg-primary/5 px-3 py-2 rounded-lg",
                                    view === 'inbox' && "text-primary bg-primary/5"
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
                                    "flex-1 justify-center text-sm font-semibold text-foreground hover:text-primary hover:bg-primary/5 px-3 py-2 rounded-lg",
                                    view === 'archived' && "text-primary bg-primary/5"
                                )}
                            >
                                <Archive className="mr-2 h-4 w-4" /> Archived
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-2 pt-0 flex-1 overflow-y-auto">
                          {isLoading ? (
                             <div className="flex flex-col items-center justify-center h-full py-12">
                                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
                             </div>
                          ) : displayedNotifications.length > 0 ? (
                             <div className="flex flex-col gap-1">
                                 {displayedNotifications.map(n => (
                                     <button
                                         key={n.id}
                                         onClick={() => handleSelectNotification(n)}
                                         className={cn(
                                             "w-full text-left p-3 rounded-lg border-2 border-transparent transition-colors",
                                             selectedNotification?.id === n.id ? "bg-primary/10 border-primary/20" : "hover:bg-muted/50",
                                         )}
                                     >
                                         <div className="flex items-center justify-between">
                                             <p className={cn("font-semibold", !n.read && view === 'inbox' && "text-primary")}>
                                                 {n.subject}
                                             </p>
                                             {!n.read && view === 'inbox' && (
                                                 <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                             )}
                                         </div>
                                         <p className="text-sm text-muted-foreground truncate mt-1">{stripHtml(n.body)}</p>
                                         <p className="text-xs text-muted-foreground mt-1">{format(new Date(n.date), 'MMM dd, yyyy')}</p>
                                     </button>
                                 ))}
                             </div>
                          ) : (
                             <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
                                 <FileText className="w-12 h-12 mb-4" />
                                 <h4 className="font-semibold">No messages here</h4>
                                 <p className="text-sm">Your {view} folder is empty.</p>
                             </div>
                          )}
                    </CardContent>
                </Card>

                <Card className="md:col-span-2 flex flex-col">
                    {selectedNotification ? (
                        <>
                            <CardHeader className="p-4 pb-2">
                               <div className="flex items-start justify-between gap-4">
                                  <div>
                                      <CardTitle className="leading-tight">{selectedNotification.subject}</CardTitle>
                                      <CardDescription className="mt-1">{format(new Date(selectedNotification.date), 'PPPP p')}</CardDescription>
                                  </div>
                                   {view === 'inbox' ? (
                                        <Button variant="outline" size="icon" className="shrink-0" onClick={handleArchive}>
                                            <Archive className="h-4 w-4" />
                                            <span className="sr-only">Archive</span>
                                        </Button>
                                   ) : (
                                        <Button variant="outline" size="icon" className="shrink-0" onClick={handleUnarchive}>
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
                          <CardContent className="flex flex-col items-center justify-center h-full text-center">
                             <Inbox className="w-16 h-16 text-muted-foreground/50 mb-4" />
                             <h3 className="text-xl font-semibold">Select a message</h3>
                             <p className="text-muted-foreground">Choose a message from the left to read it.</p>
                          </CardContent>
                    )}
                </Card>
            </div>
        </div>
    );
}

export default function InboxPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <InboxComponent />
        </Suspense>
    )
}
