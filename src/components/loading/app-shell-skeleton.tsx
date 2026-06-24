'use client';

import type { ReactNode } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { PageContentSkeleton } from './page-content-skeleton';

type AppShellSkeletonProps = {
  children?: ReactNode;
};

export function AppShellSkeleton({ children }: AppShellSkeletonProps) {
  return (
    <SidebarProvider className="flex h-screen w-full flex-col overflow-hidden">
      <div className="flex h-full min-h-0 flex-col bg-muted/40">
        <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-28" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="hidden h-4 w-28 sm:block" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </header>
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <Sidebar collapsible="icon" className="border-r">
            <SidebarRail />
            <SidebarContent className="p-2">
              <SidebarMenu>
                {Array.from({ length: 7 }).map((_, i) => (
                  <SidebarMenuItem key={i}>
                    <Skeleton className="h-9 w-full" />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
          <main className="min-h-0 min-w-0 flex-1 overflow-auto p-6">
            {children ?? <PageContentSkeleton />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
