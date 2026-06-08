
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
    UserCog,
    LogOut,
    Bell,
    Search,
    FileText,
    Building,
    CreditCard,
    Mic,
    Settings,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import Logo, { getAppHomeHref } from '@/components/logo';
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
    { route: '/assessments', permissions: ['evaluation:read'], blockedRoles: ['candidate'], redirectTo: '/find-jobs' },
    { route: '/interviews', permissions: ['pipeline:read'], blockedRoles: ['candidate'], redirectTo: '/find-jobs' },
    { route: '/applicants', permissions: ['candidate:read'], blockedRoles: ['candidate'], redirectTo: '/find-jobs' },
    { route: '/team', permissions: ['user:read'], blockedRoles: ['candidate'], redirectTo: '/find-jobs' },
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
            router.push('/login');
            return;
        }

        // Super admin trying staff area
        if (getAuthType() === 'super_admin') {
            router.push('/superadmin/dashboard');
            return;
        }

        // Operator/admin → redirect to admin layout, but spare shared pipeline pages
        const isSharedPage = 
            pathname.startsWith('/profile') ||
            pathname.startsWith('/company-profile') ||
            pathname.startsWith('/interviews') ||
            pathname.startsWith('/assessments') ||
            pathname.startsWith('/inbox') ||
            pathname.startsWith('/subscription') ||
            pathname.startsWith('/team');

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
        { href: '/job-postings', label: 'Job Postings', icon: Briefcase, permissions: ['job:read'] },
        { href: '/assessments', label: 'Assessments', icon: Sparkles, permissions: ['evaluation:read'] },
        { href: '/interviews', label: 'Interviews', icon: Mic, permissions: ['pipeline:read'] },
        { href: '/settings/integrations', label: 'Integrations', icon: Settings, permissions: ['linkedin:read', 'linkedin:connect', 'linkedin:post'] },
    ];

    const recruiterNav = allRecruiterNav.filter((item) => item.permissions.some((permission) => hasPermission(permission)));

    const adminNav = [
        { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/jd-creator', label: 'JD Creator', icon: FilePlus2 },
        { href: '/admin/job-postings', label: 'Job Postings', icon: Briefcase },
        { href: '/interviews', label: 'Interviews', icon: Mic },
        { href: '/assessments', label: 'Assessments', icon: Sparkles },
        { href: '/inbox', label: 'Inbox', icon: Inbox },
        { href: '/admin/recruiters', label: 'Recruiters', icon: UserCog },
        { href: '/admin/candidates', label: 'Candidates', icon: Contact },
    ];

    const candidateNavLinks = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/find-jobs', label: 'Find Jobs', icon: Search },
        { href: '/my-applications', label: 'Jobs Applied To', icon: FileText },
        { href: '/inbox', label: 'Inbox', icon: Inbox }
    ];

    const getInitials = (name: string) => {
        const names = name.split(' ');
        if (names.length > 1) {
            return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`;
        }
        return names[0].charAt(0);
    }

    const RecruiterHeader = () => (
        <header className="flex h-16 items-center justify-between border-b bg-card px-6 shrink-0">
            <div className='flex items-center gap-4'>
                <SidebarTrigger />
                <Logo width={120} height={40} href={getAppHomeHref(user.role)} />
            </div>
            <div className="flex items-center gap-4">
                {hasPermission('rbac:manage') && (
                    <Button variant="outline" size="sm" onClick={() => router.push('/admin/dashboard')}>
                        Company dashboard
                    </Button>
                )}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-transparent hover:text-foreground">
                            <Avatar className="h-10 w-10">
                                <AvatarFallback className="font-medium">{getInitials(user.name)}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium leading-none">{user.name}</p>
                                    {user.backendRoles?.[0] && <Badge variant="outline">{user.backendRoles[0]}</Badge>}
                                </div>
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
                        <DropdownMenuItem asChild>
                            <Link href="/company-profile">
                                <Building className="mr-2 h-4 w-4" />
                                <span>Company Profile</span>
                            </Link>
                        </DropdownMenuItem>
                        {hasPermission('company:update') && (
                            <>
                                <DropdownMenuItem asChild>
                                    <Link href="/subscription">
                                        <CreditCard className="mr-2 h-4 w-4" />
                                        <span>Subscription</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/team">
                                        <Users className="mr-2 h-4 w-4" />
                                        <span>Team</span>
                                    </Link>
                                </DropdownMenuItem>
                            </>
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
                                                <AvatarFallback className="font-medium">{getInitials(user.name)}</AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56" align="end" forceMount>
                                        <DropdownMenuLabel className="font-normal">
                                            <div className="flex flex-col space-y-1">
                                                <p className="text-sm font-medium leading-none">{user.name}</p>
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
