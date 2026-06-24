
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


const adminRoutes = [
  '/admin/dashboard', 
  '/admin/users', 
  '/admin/recruiters', 
  '/admin/candidates', 
  '/admin/jd-creator', 
  '/admin/job-postings',
  '/admin/company-profile',
  '/admin/subscription',
  '/admin/team',
  '/admin/integrations',
  '/my-profile',
  '/profile',
];

function getAdminHeaderTitle(pathname: string): string {
  if (pathname.startsWith('/admin/company-profile')) return 'Company Profile';
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
  }, [user, loading, router, pathname, hasPermission]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user || !hasPermission('rbac:manage') || user.role === 'candidate') {
    return null;
  }

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/jd-creator', label: 'JD Creator', icon: FilePlus2 },
    { href: '/admin/job-postings', label: 'Job Postings', icon: Briefcase },
    { href: '/interviews', label: 'Interviews', icon: Mic, comingSoon: true },
    { href: '/assessments', label: 'Assessments', icon: Sparkles, comingSoon: true },
    { href: '/admin/candidates', label: 'Candidates', icon: Contact },
    ...(hasPermission('user:read')
      ? [{ href: '/admin/team', label: 'Team', icon: Users }]
      : []),
  ];

  const AdminHeader = () => (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6 shrink-0">
      <div className='flex items-center gap-4'>
        <SidebarTrigger />
        <Logo variant="express" href={getAppHomeHref(user.role)} />
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-muted-foreground border-r pr-4">
          {getAdminHeaderTitle(pathname)}
        </span>
        <HeaderInboxPopover />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-transparent hover:text-foreground">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{getUserDisplayName(user)}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/admin/company-profile')}>
              <Building className="mr-2 h-4 w-4" />
              <span>Company Profile</span>
            </DropdownMenuItem>
            {hasPermission('company:update') && (
              <DropdownMenuItem onClick={() => router.push('/admin/subscription')}>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Subscription</span>
              </DropdownMenuItem>
            )}
            {(hasPermission('linkedin:read') || hasPermission('linkedin:connect') || hasPermission('linkedin:post')) && (
              <DropdownMenuItem onClick={() => router.push('/admin/integrations')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Integrations</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );

  return (
    <SidebarProvider className="flex h-screen w-full flex-col overflow-hidden">
      <div className="flex h-full min-h-0 flex-col bg-muted/40">
        <AdminHeader />
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <Sidebar collapsible="icon">
            <SidebarRail />
            <SidebarContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    {item.comingSoon ? (
                      <div
                        aria-disabled="true"
                        className={cn(
                          'peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-all group-data-[collapsible=icon]:!p-2 [&>svg]:size-5 [&>svg]:shrink-0 h-9',
                          'cursor-not-allowed text-muted-foreground opacity-60',
                          "group-data-[state=collapsed]:justify-center"
                        )}
                      >
                        <item.icon className="shrink-0" />
                        <span className="group-data-[state=collapsed]:hidden flex-1">
                          {item.label}
                        </span>
                        <Badge variant="secondary" className="group-data-[state=collapsed]:hidden text-[10px] px-1.5 py-0 h-5 font-normal shrink-0">
                          Coming soon
                        </Badge>
                      </div>
                    ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        'peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!p-2 [&>svg]:size-5 [&>svg]:shrink-0 h-9',
                        pathname.startsWith(item.href) && 'bg-sidebar-accent text-sidebar-accent-foreground',
                        "group-data-[state=collapsed]:justify-center"
                      )}
                    >
                      <item.icon className="shrink-0" />
                      <span className="group-data-[state=collapsed]:hidden">
                        {item.label}
                      </span>
                    </Link>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
          <main className="min-h-0 min-w-0 flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
