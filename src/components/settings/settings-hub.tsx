'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useSidebar } from '@/components/ui/sidebar';
import {
  Building2,
  ShieldCheck,
  CreditCard,
  Settings as SettingsIcon,
  Sparkles,
  Lock,
  Globe,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import CompanyProfilePage from '@/components/company-profile-page';
import SubscriptionPage from '@/app/(main)/subscription/page';
import IntegrationsPage from '@/components/integrations-page';
import { ChangeCompanyAdminEmail } from '@/components/change-company-admin-email';
import { ChangeCompanyAdminPassword } from '@/components/change-company-admin-password';
import { cn } from '@/lib/utils';

export type SettingsTabKey = 'profile' | 'security' | 'subscription' | 'integrations';

interface SettingsHubProps {
  defaultTab?: SettingsTabKey;
}

export function SettingsHub({ defaultTab = 'profile' }: SettingsHubProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, hasPermission } = useAuth();
  const { open, setOpen } = useSidebar();

  useEffect(() => {
    if (open) {
      setOpen(false);
    }
  }, [open, setOpen]);

  const paramTab = searchParams.get('tab') as SettingsTabKey | null;
  const activeTab: SettingsTabKey = paramTab || defaultTab;
  const isAdminRoute = pathname.startsWith('/admin');

  const tabRoutes: Record<SettingsTabKey, string> = {
    profile: isAdminRoute ? '/admin/company-profile' : '/company-profile',
    security: isAdminRoute ? '/admin/security' : '/security',
    subscription: isAdminRoute ? '/admin/subscription' : '/subscription',
    integrations: isAdminRoute ? '/admin/integrations' : '/settings/integrations',
  };

  const tabs = [
    {
      key: 'profile' as SettingsTabKey,
      label: 'Company Profile',
      description: 'Brand, logo & online presence',
      icon: Building2,
      show: hasPermission('company:read') || hasPermission('rbac:manage'),
    },
    {
      key: 'security' as SettingsTabKey,
      label: 'Security & Login',
      description: 'Admin email & password change',
      icon: ShieldCheck,
      show: true,
    },
    {
      key: 'subscription' as SettingsTabKey,
      label: 'Subscription',
      description: 'Current plan, usage & billing',
      icon: CreditCard,
      show: hasPermission('company:update') || hasPermission('rbac:manage'),
    },
    {
      key: 'integrations' as SettingsTabKey,
      label: 'Integrations',
      description: 'LinkedIn, Twitter & APIs',
      icon: Layers,
      show: hasPermission('linkedin:read') || hasPermission('linkedin:connect') || hasPermission('linkedin:post') || hasPermission('rbac:manage'),
    },
  ].filter((t) => t.show);

  const handleTabClick = (key: SettingsTabKey) => {
    router.push(tabRoutes[key]);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col md:flex-row gap-6 lg:gap-10 h-[calc(100vh-4rem)] -m-6 p-6 bg-slate-50 dark:bg-slate-950/50 overflow-hidden">
        {/* Settings Side Panel */}
        <aside className="shrink-0 md:border-r border-border/40 pr-3 md:pr-6 flex flex-col justify-between w-full md:w-[240px] h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="space-y-8">
            {/* Panel Header */}
            <div className="px-3 pt-2">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Settings
              </h2>
            </div>

            {/* Navigation Tabs */}
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;

                return (
                  <button
                    key={tab.key}
                    onClick={() => handleTabClick(tab.key)}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-300 group relative overflow-hidden",
                      isActive
                        ? "text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {/* Hover Background Layer */}
                    <div
                      className={cn(
                        "absolute inset-0 bg-primary/10 transition-transform duration-300 ease-out origin-left",
                        isActive ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100"
                      )}
                    />

                    {/* Icon */}
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 relative z-10 transition-transform duration-300 ease-out group-hover:scale-110",
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                      )}
                    />

                    {/* Text */}
                    <span
                      className={cn(
                        "text-sm truncate leading-snug relative z-10 transition-transform duration-300 ease-out",
                        isActive ? "translate-x-1" : "group-hover:translate-x-1"
                      )}
                    >
                      {tab.label}
                    </span>

                    {/* Active Indicator Bar */}
                    <div
                      className={cn(
                        "absolute left-0 top-1/2 -translate-y-1/2 w-1 bg-primary rounded-r-full transition-all duration-300 ease-out",
                        isActive ? "h-6 opacity-100" : "h-0 opacity-0 group-hover:h-4 group-hover:opacity-40"
                      )}
                    />
                  </button>
                );
              })}
            </nav>
          </div>

        </aside>

        {/* Main Settings Content Area */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto overflow-x-hidden pr-2 pb-20 animate-in fade-in duration-300">
          {activeTab === 'profile' && <CompanyProfilePage />}

          {activeTab === 'security' && (
            <div className="flex flex-col gap-8 max-w-5xl">
              <div className="border-b border-border/40 pb-5">
                <h1 className="text-3xl font-bold font-headline tracking-tight text-foreground flex items-center gap-3">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                  Account Security & Login
                </h1>
                <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">
                  Manage your primary administrative login email address and keep your password credentials updated for secure dashboard access.
                </p>
              </div>

              <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {user && <ChangeCompanyAdminEmail user={user} mode="card" />}
                {user && <ChangeCompanyAdminPassword user={user} />}
              </div>
            </div>
          )}

          {activeTab === 'subscription' && <SubscriptionPage />}

          {activeTab === 'integrations' && <IntegrationsPage />}
        </main>
      </div>
    </TooltipProvider>
  );
}
