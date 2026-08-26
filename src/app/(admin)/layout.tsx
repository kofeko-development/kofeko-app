
'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarRail,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Contact,
  LogOut,
  Building,
  Briefcase,
  FilePlus2,
  Sparkles,
  Mic,
  CreditCard,
  Users,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import Logo, { getAppHomeHref } from '@/components/logo';
import { getUserDisplayName, getUserInitials } from '@/lib/user-display';
import { HeaderInboxPopover } from '@/components/header-inbox-popover';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { AppShellSkeleton } from '@/components/loading/app-shell-skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


const adminRoutes = [
  '/admin/dashboard',
  '/admin/users',
  '/admin/recruiters',
  '/admin/candidates',
  '/admin/jd-creator',
  '/admin/job-postings',
  '/admin/company-profile',
  '/admin/security',
  '/admin/subscription',
  '/admin/team',
  '/admin/integrations',
  '/my-profile',
  '/profile',
];

function getAdminHeaderTitle(pathname: string): string {
  if (pathname.startsWith('/admin/company-profile')) return 'Company Profile';
  if (pathname.startsWith('/admin/security')) return 'Security & Login';
  if (pathname.startsWith('/admin/subscription')) return 'Subscription';
  if (pathname.startsWith('/admin/team')) return 'Team';
  if (pathname.startsWith('/admin/integrations')) return 'Integrations';
  return 'Company dashboard';
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, hasPermission, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/company-login');
      return;
    }

    if (user.role === 'candidate') {
      router.push('/find-jobs');
      return;
    }

    if (!hasPermission('rbac:manage')) {
      router.push('/dashboard');
      return;
    }

    if (pathname.startsWith('/interviews') || pathname.startsWith('/assessments')) {
      router.push('/admin/dashboard');
      return;
    }

    const isAdminRoute = adminRoutes.some((r) => pathname.startsWith(r));

    if (!isAdminRoute) {
      router.push('/admin/dashboard');
    }
  }, [user, loading, router, pathname, hasPermission, user?.permissions]);

  if (loading && !user) {
    return <AppShellSkeleton />;
  }

  if (!user || !hasPermission('rbac:manage') || user.role === 'candidate') {
    return null;
  }

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/jd-creator', label: 'JD Creator', icon: FilePlus2 },
    { href: '/admin/job-postings', label: 'Job Postings', icon: Briefcase },
    { href: '/admin/candidates', label: 'Candidates', icon: Contact },
    ...(hasPermission('user:read')
      ? [{ href: '/admin/team', label: 'Team', icon: Users }]
      : []),
  ];



  const AdminSidebarFooter = () => {
    const { state } = useSidebar();

    const avatarButton = state === 'collapsed' ? (
      <Button variant="ghost" className="relative h-10 w-10 rounded-full text-foreground hover:bg-transparent hover:text-foreground shrink-0">
        <Avatar className="h-10 w-10">
          <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
        </Avatar>
      </Button>
    ) : (
      <Button variant="ghost" className="relative h-12 w-full rounded-md justify-start gap-3 text-foreground hover:bg-muted hover:text-foreground p-2 shrink-0 overflow-hidden">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-start text-left flex-1 min-w-0">
          <span className="text-sm font-medium truncate w-full block">{getUserDisplayName(user)}</span>
          <span className="text-xs text-muted-foreground truncate w-full block">{user.email}</span>
        </div>
      </Button>
    );

    const SettingsButton = () => (
      <div className="group/settings relative w-full">
        <div
          role="button"
          onClick={() => router.push('/admin/security')}
          className={cn(
            'group flex w-full items-center gap-3 overflow-hidden rounded-md px-3 py-2 text-left text-sm font-medium transition-colors cursor-pointer outline-none',
            'text-muted-foreground hover:bg-muted hover:text-foreground',
            state === 'collapsed' && "justify-center !p-2"
          )}
        >
          <Settings className="shrink-0 h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          {state !== 'collapsed' && <span className="flex-1">Settings</span>}
        </div>

        <div className="absolute left-full bottom-0 hidden group-hover/settings:block z-50 pl-2">
          <div className="w-56 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95">
            <div
              className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
              onClick={() => router.push('/admin/company-profile')}
            >
              <Building className="mr-2 h-4 w-4" />
              <span>Company Profile</span>
            </div>
            {hasPermission('company:update') && (
              <div
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                onClick={() => router.push('/admin/subscription')}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Subscription</span>
              </div>
            )}
            {(hasPermission('linkedin:read') || hasPermission('linkedin:connect') || hasPermission('linkedin:post')) && (
              <div
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                onClick={() => router.push('/admin/integrations')}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Integrations</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );

    const LogoutButton = () => (
      <div
        role="button"
        onClick={logout}
        className={cn(
          'group flex w-full items-center gap-3 overflow-hidden rounded-md px-3 py-2 text-left text-sm font-medium transition-colors cursor-pointer outline-none',
          'text-muted-foreground hover:bg-muted hover:text-foreground',
          state === 'collapsed' && "justify-center !p-2"
        )}
      >
        <LogOut className="shrink-0 h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        {state !== 'collapsed' && <span className="flex-1">Log out</span>}
      </div>
    );

    return (
      <div className="flex flex-col mt-auto">
        <div className="flex flex-col gap-1 p-2">
          <SidebarMenuItem>
            <HeaderInboxPopover variant="sidebar" collapsed={state === 'collapsed'} />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SettingsButton />
          </SidebarMenuItem>
        </div>

        <div className={cn(
          "flex flex-col w-full",
          state === 'collapsed' ? "p-2 gap-2" : "p-4 pt-4 gap-2"
        )}>
          <div className={cn("flex-1 min-w-0", state === 'collapsed' && "flex justify-center w-full")}>
            {avatarButton}
          </div>

          {state === 'collapsed' ? (
            <div className="flex justify-center w-full">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={logout}
                    className="h-10 w-10 rounded-full shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="sr-only">Log out</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Log out</p>
                </TooltipContent>
              </Tooltip>
            </div>
          ) : (
            <Button
              variant="ghost"
              onClick={logout}
              className="w-full justify-start h-10 px-3 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span>Log out</span>
            </Button>
          )}
        </div>
      </div>
    );
  };

  const AdminSidebarHeader = () => {
    const { state } = useSidebar();
    return (
      <div className="flex h-14 items-center px-6 shrink-0">
        {state === 'collapsed' ? (
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-xl leading-none mx-auto">
            K
          </div>
        ) : (
          <Logo variant="express" href={getAppHomeHref(user.role)} />
        )}
      </div>
    );
  };

  return (
    <TooltipProvider>
      <SidebarProvider className="flex h-screen w-full flex-col overflow-hidden">
        <div className="flex h-full min-h-0 flex-col bg-muted/40">
          <div className="flex min-h-0 flex-1 overflow-hidden relative">
            <Sidebar collapsible="icon">
              <SidebarRail />
              <AdminSidebarHeader />
              <SidebarContent>
                <AdminSidebarMenu navItems={navItems} pathname={pathname} />
              </SidebarContent>
              <SidebarTrigger />
              <AdminSidebarFooter />
            </Sidebar>
            <main className="min-h-0 min-w-0 flex-1 overflow-auto p-6 bg-slate-50/50 dark:bg-slate-950/50 relative">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}

function AdminSidebarMenu({ navItems, pathname }: { navItems: any[], pathname: string }) {
  const { state } = useSidebar();

  return (
    <SidebarMenu>
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href) && (item.href !== '/admin/dashboard' || pathname === '/admin/dashboard');

        const linkContent = (
          <div
            className={cn(
              'group flex w-full items-center gap-3 overflow-hidden rounded-md px-3 py-2 text-left text-sm font-medium transition-colors',
              item.comingSoon ? 'opacity-50 cursor-not-allowed' : isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              state === 'collapsed' && "justify-center !p-2"
            )}
          >
            <item.icon className={cn(
              "shrink-0 h-4 w-4 transition-colors",
              isActive && !item.comingSoon ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
            )} />
            {state !== 'collapsed' && (
              <>
                <span className="flex-1">
                  {item.label}
                </span>
                {item.comingSoon && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-normal shrink-0">
                    Soon
                  </Badge>
                )}
              </>
            )}
          </div>
        );

        return (
          <SidebarMenuItem key={item.href}>
            {item.comingSoon ? (
              state === 'collapsed' ? (
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    {linkContent}
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center">
                    Coming soon
                  </TooltipContent>
                </Tooltip>
              ) : (
                linkContent
              )
            ) : (
              state === 'collapsed' ? (
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link href={item.href}>
                      {linkContent}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Link href={item.href}>
                  {linkContent}
                </Link>
              )
            )}
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  );
}
