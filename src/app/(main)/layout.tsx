
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
    Briefcase,
    FilePlus2,
    Sparkles,
    Inbox,
    User as UserIcon,
    Users,
    Contact,
    LogOut,
    Bell,
    Search,
    FileText,
    Building,
    CreditCard,
    Mic,
    Settings,
    BrainCircuit,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import Logo, { getAppHomeHref } from '@/components/logo';
import { getUserDisplayName, getUserInitials } from '@/lib/user-display';
import { getStaffHeaderTitle } from '@/lib/staff-profile';
import { HeaderInboxPopover } from '@/components/header-inbox-popover';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import AppFooter from '@/components/app-footer';


import { getAuthType } from '@/lib/api-client';
import type { UserRole } from '@/lib/types';

type RouteRule = {
    route: string;
    permissions: string[];
    allowedRoles?: UserRole[];
    blockedRoles?: UserRole[];
    redirectTo?: string;
};

const routePermissions: RouteRule[] = [
    // Shared routes
    { route: '/dashboard', permissions: [] },
    // Staff-only routes
    { route: '/job-postings', permissions: ['job:read'], blockedRoles: ['candidate'], redirectTo: '/find-jobs' },
    { route: '/jd-builder', permissions: ['job:create'], blockedRoles: ['candidate'], redirectTo: '/find-jobs' },
    { route: '/ai-evaluation-lab', permissions: ['job:create', 'evaluation:create'], blockedRoles: ['candidate'], redirectTo: '/find-jobs' },
    { route: '/assessments', permissions: ['evaluation:read'], blockedRoles: ['candidate'], redirectTo: '/dashboard' },
    { route: '/interviews', permissions: ['pipeline:read'], blockedRoles: ['candidate'], redirectTo: '/dashboard' },
    { route: '/applicants', permissions: ['candidate:read'], blockedRoles: ['candidate'], redirectTo: '/find-jobs' },
    { route: '/team', permissions: ['user:read'], blockedRoles: ['candidate'], redirectTo: '/find-jobs' },
    { route: '/my-profile', permissions: [], blockedRoles: ['candidate'], redirectTo: '/find-jobs' },
    { route: '/company-profile', permissions: ['company:read'], blockedRoles: ['candidate'], redirectTo: '/find-jobs' },
    { route: '/subscription', permissions: ['company:update'], blockedRoles: ['candidate'], redirectTo: '/find-jobs' },
    { route: '/inbox', permissions: ['communication:read'] },
    { route: '/settings', permissions: ['linkedin:read', 'linkedin:connect', 'linkedin:post'], blockedRoles: ['candidate'], redirectTo: '/find-jobs' },
    // Candidate-only routes
    { route: '/find-jobs', permissions: [], allowedRoles: ['candidate'], redirectTo: '/dashboard' },
    { route: '/my-applications', permissions: [], allowedRoles: ['candidate'], redirectTo: '/dashboard' },
    { route: '/open-positions', permissions: [], allowedRoles: ['candidate'], redirectTo: '/dashboard' },
    // Shared routes
    { route: '/profile', permissions: [] },
    { route: '/about', permissions: [] },
];


export default function MainLayout({ children }: { children: React.ReactNode }) {
    const { user, hasPermission, logout, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (loading) return;

        if (!user) {
            // Not logged in at all
            router.push('/company-login');
            return;
        }

        // Super admin trying staff area
        if (getAuthType() === 'super_admin') {
            router.push('/superadmin/dashboard');
            return;
        }

        if (hasPermission('rbac:manage') && pathname.startsWith('/company-profile')) {
            router.replace('/admin/company-profile');
            return;
        }

        if (hasPermission('rbac:manage') && pathname.startsWith('/subscription')) {
            router.replace('/admin/subscription');
            return;
        }

        if (hasPermission('rbac:manage') && pathname.startsWith('/team')) {
            router.replace(`/admin${pathname}`);
            return;
        }

        if (hasPermission('rbac:manage') && pathname.startsWith('/settings')) {
            const query = typeof window !== 'undefined' ? window.location.search : '';
            router.replace(`/admin/integrations${query}`);
            return;
        }

        // Operator/admin → redirect to admin layout, but spare shared pipeline pages
        const isSharedPage = 
            pathname.startsWith('/profile') ||
            pathname.startsWith('/my-profile') ||
            pathname.startsWith('/ai-evaluation-lab');

        if (pathname.startsWith('/interviews') || pathname.startsWith('/assessments')) {
            router.push(hasPermission('rbac:manage') ? '/admin/dashboard' : '/dashboard');
            return;
        }

        if (hasPermission('rbac:manage') && !isSharedPage) {
            router.push('/admin/dashboard');
            return;
        }

        const matched = routePermissions.find(({ route }) => pathname.startsWith(route));

        if (!matched) {
            router.push(user.role === 'candidate' ? '/find-jobs' : '/dashboard');
            return;
        }

        if (matched.blockedRoles?.includes(user.role)) {
            router.push(matched.redirectTo ?? (user.role === 'candidate' ? '/find-jobs' : '/dashboard'));
            return;
        }

        if (matched.allowedRoles && !matched.allowedRoles.includes(user.role)) {
            router.push(matched.redirectTo ?? '/dashboard');
            return;
        }

        if (
            user.role !== 'candidate' &&
            matched.permissions.length > 0 &&
            !matched.permissions.some((permission) => hasPermission(permission))
        ) {
            router.push(matched.redirectTo ?? '/dashboard');
        }
    }, [user, loading, router, pathname, hasPermission]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const allRecruiterNav = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, permissions: ['job:read', 'candidate:read'] },
        { href: '/jd-builder', label: 'JD Creator', icon: FilePlus2, permissions: ['job:create'] },
        { href: '/ai-evaluation-lab', label: 'AI Lab', icon: BrainCircuit, permissions: ['job:create', 'evaluation:create'] },
        { href: '/job-postings', label: 'Job Postings', icon: Briefcase, permissions: ['job:read'] },
        { href: '/assessments', label: 'Assessments', icon: Sparkles, permissions: ['evaluation:read'], comingSoon: true },
        { href: '/interviews', label: 'Interviews', icon: Mic, permissions: ['pipeline:read'], comingSoon: true },
        { href: '/team', label: 'Team', icon: Users, permissions: ['user:read'] },
    ];

    const recruiterNav = allRecruiterNav.filter((item) => item.permissions.some((permission) => hasPermission(permission)));

    const adminNav = [
        { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/jd-creator', label: 'JD Creator', icon: FilePlus2 },
        { href: '/ai-evaluation-lab', label: 'AI Lab', icon: BrainCircuit },
        { href: '/admin/job-postings', label: 'Job Postings', icon: Briefcase },
        { href: '/interviews', label: 'Interviews', icon: Mic, comingSoon: true },
        { href: '/assessments', label: 'Assessments', icon: Sparkles, comingSoon: true },
        { href: '/admin/candidates', label: 'Candidates', icon: Contact },
        ...(hasPermission('user:read')
            ? [{ href: '/admin/team', label: 'Team', icon: Users }]
            : []),
    ];

    const candidateNavLinks = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/find-jobs', label: 'Find Jobs', icon: Search },
        { href: '/my-applications', label: 'Jobs Applied To', icon: FileText },
        { href: '/inbox', label: 'Inbox', icon: Inbox }
    ];

    const RecruiterHeader = () => (
        <header className="flex h-16 items-center justify-between border-b bg-card px-6 shrink-0">
            <div className='flex items-center gap-4'>
                <SidebarTrigger />
                <Logo width={120} height={40} href={getAppHomeHref(user.role)} />
            </div>
            <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-muted-foreground border-r pr-4">
                    {getStaffHeaderTitle(user, pathname)}
                </span>
                <HeaderInboxPopover />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-transparent hover:text-foreground">
                            <Avatar className="h-10 w-10">
                                <AvatarFallback className="font-medium">{getUserInitials(user)}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-sm font-medium leading-none">{getUserDisplayName(user)}</p>
                                    {user.companyRole && <Badge variant="outline">{user.companyRole}</Badge>}
                                </div>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/my-profile">
                                <UserIcon className="mr-2 h-4 w-4" />
                                <span>My Profile</span>
                            </Link>
                        </DropdownMenuItem>
                        {hasPermission('company:read') && (
                            <DropdownMenuItem asChild>
                                <Link href={hasPermission('rbac:manage') ? '/admin/company-profile' : '/company-profile'}>
                                    <Building className="mr-2 h-4 w-4" />
                                    <span>Company Profile</span>
                                </Link>
                            </DropdownMenuItem>
                        )}
                        {hasPermission('company:update') && (
                            <DropdownMenuItem asChild>
                                <Link href={hasPermission('rbac:manage') ? '/admin/subscription' : '/subscription'}>
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    <span>Subscription</span>
                                </Link>
                            </DropdownMenuItem>
                        )}
                        {(hasPermission('linkedin:read') || hasPermission('linkedin:connect') || hasPermission('linkedin:post')) && (
                            <DropdownMenuItem asChild>
                                <Link href={hasPermission('rbac:manage') ? '/admin/integrations' : '/settings/integrations'}>
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Integrations</span>
                                </Link>
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
    )

    const CandidateHeader = () => {
        const unreadCount = 0;
        const notifications: Array<{ id: string; subject: string; read: boolean }> = [];

        return (
            <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/95 shadow-md backdrop-blur-sm">
                <div className="container">
                    <div className="flex h-20 items-center">
                        <Link href="/find-jobs">
                            <Logo width={120} height={40} />
                        </Link>

                        <div className="hidden md:flex items-center gap-2 ml-auto">
                            <nav className="flex items-center gap-1">
                                {candidateNavLinks.map((link) => (
                                    <Button key={link.href + link.label} variant="ghost" asChild>
                                        <Link
                                            href={link.href}
                                            className={cn(
                                                "text-sm font-semibold text-foreground hover:text-primary hover:bg-primary/5 px-3 py-2 rounded-lg",
                                                pathname === link.href && "text-primary bg-primary/5"
                                            )}
                                        >
                                            <link.icon className="mr-2 h-4 w-4" />
                                            {link.label}
                                        </Link>
                                    </Button>
                                ))}
                            </nav>
                            <div className="flex items-center pl-2 gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="relative">
                                            <Bell className="h-5 w-5" />
                                            {unreadCount > 0 && (
                                                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
                                                    {unreadCount}
                                                </span>
                                            )}
                                            <span className="sr-only">Notifications</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-80">
                                        <DropdownMenuLabel>Recent Notifications</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        {notifications.length > 0 ? notifications.map(n => (
                                            <DropdownMenuItem key={n.id} asChild className="cursor-pointer focus:bg-primary/5">
                                                <Link href={`/inbox?select=${n.id}`}>
                                                    <p className={cn("font-semibold truncate", !n.read && "text-primary", n.read && "text-foreground/80 focus:text-foreground/80")}>{n.subject}</p>
                                                </Link>
                                            </DropdownMenuItem>
                                        )) : (
                                            <p className="p-2 text-sm text-muted-foreground">No new notifications.</p>
                                        )}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild className="cursor-pointer font-semibold justify-center focus:bg-primary/5 focus:text-primary">
                                            <Link href="/inbox">View all notifications</Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-transparent hover:text-foreground">
                                            <Avatar className="h-10 w-10">
                                                <AvatarFallback className="font-medium">{getUserInitials(user)}</AvatarFallback>
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
                                        <DropdownMenuItem asChild>
                                            <Link href="/profile">
                                                <UserIcon className="mr-2 h-4 w-4" />
                                                <span>My Profile</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={logout}>
                                            <LogOut className="mr-2 h-4 w-4" />
                                            <span>Log out</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        )
    }

    const isRecruiterExperience = hasPermission('job:create') || hasPermission('job:update') || hasPermission('user:read');

    if (isRecruiterExperience) {
        return (
            <TooltipProvider>
                <SidebarProvider className="flex h-screen w-full flex-col overflow-hidden">
                    <div className="flex h-full min-h-0 flex-col bg-muted/40">
                        <RecruiterHeader />
                        <div className="flex min-h-0 flex-1 overflow-hidden">
                            <Sidebar collapsible="icon">
                                <SidebarRail />
                                <SidebarContent>
                                    <SidebarMenu>
                                        {(hasPermission('rbac:manage') ? adminNav : recruiterNav).map((item) => (
                                            <SidebarMenuItem key={item.href}>
                                                {item.comingSoon ? (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
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
                                                        </TooltipTrigger>
                                                        <TooltipContent side="right" align="center">
                                                            Coming soon
                                                        </TooltipContent>
                                                    </Tooltip>
                                                ) : (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Link
                                                            href={item.href}
                                                            className={cn(
                                                                'peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!p-2 [&>svg]:size-5 [&>svg]:shrink-0 h-9',
                                                                pathname.startsWith(item.href) && 
                                                                (item.href !== '/dashboard' || pathname === '/dashboard') && 
                                                                (item.href !== '/admin/dashboard' || pathname === '/admin/dashboard') && 
                                                                'bg-sidebar-accent text-sidebar-accent-foreground',
                                                                "group-data-[state=collapsed]:justify-center"
                                                            )}
                                                        >
                                                            <item.icon className="shrink-0" />
                                                            <span className="group-data-[state=collapsed]:hidden">
                                                                {item.label}
                                                            </span>
                                                        </Link>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="right" align="center">
                                                        {item.label}
                                                    </TooltipContent>
                                                </Tooltip>
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
            </TooltipProvider>
        );
    }

    if (!isRecruiterExperience) {
        return (
            <div className="flex min-h-screen flex-col bg-muted/40">
                <CandidateHeader />
                <main className="container flex-1 p-6 mt-20">
                    {children}
                </main>
                <AppFooter />
            </div>
        )
    }

    return null;
}
