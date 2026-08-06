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
      show: true,
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
      show: hasPermission('linkedin:read') || hasPermission('linkedin:connect') || hasPermission('linkedin:post') || hasPermission('rbac:manage') || true,
    },
  ].filter((t) => t.show);

  const handleTabClick = (key: SettingsTabKey) => {
    router.push(tabRoutes[key]);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col md:flex-row gap-6 lg:gap-10 h-[calc(100vh-4rem)] -m-6 p-6 bg-background overflow-hidden">
        {/* Settings Side Panel */}
        <aside className="shrink-0 border-r border-border/60 pr-3 md:pr-6 flex flex-col justify-between w-full md:w-72 h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="space-y-6">
            {/* Panel Header */}
            <div className="flex items-center justify-between px-2 pt-1">
              <div className="space-y-0.5 overflow-hidden">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    <SettingsIcon className="h-4.5 w-4.5" />
                  </div>
                  <h2 className="font-headline font-bold text-lg text-foreground tracking-tight truncate">
                    Company Settings
                  </h2>

                </div>
                <p className="text-xs text-muted-foreground truncate pl-1">
                  Manage workspace & preferences
                </p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="space-y-1.5">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;

                return (
                  <button
                    key={tab.key}
                    onClick={() => handleTabClick(tab.key)}
                    className={`w-full flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-left transition-all duration-200 group relative ${isActive
                      ? 'bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground font-medium'
                      }`}
                  >
                    <Icon
                      className={`h-5 w-5 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                        }`}
                    />
                    <div className="flex flex-col min-w-0 overflow-hidden">
                      <span className="text-sm truncate leading-snug">{tab.label}</span>
                      <span
                        className={`text-[11px] truncate leading-tight ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground/70'
                          }`}
                      >
                        {tab.description}
                      </span>
                    </div>
                    {isActive && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-primary-foreground/30 rounded-full" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Footer */}
          <div className="hidden md:block pt-6 border-t border-border/40 text-center">
            <p className="text-[11px] text-muted-foreground/60">
              Kofeko Admin Suite • Enterprise Settings
            </p>
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
