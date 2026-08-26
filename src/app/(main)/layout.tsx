
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
    Briefcase,
    FilePlus2,
    Sparkles,
    Inbox,
    User as UserIcon,
    Users,
    Users,
    Contact,
    LogOut,
    Loader2,
    Bell,
    Search,
    FileText,
    Building,
    CreditCard,
    Mic,
    Settings,
    BrainCircuit,
    ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import Logo, { getAppHomeHref } from '@/components/logo';
import { getUserDisplayName, getUserInitials } from '@/lib/user-display';
import { getStaffHeaderTitle } from '@/lib/staff-profile';
import { HeaderInboxPopover } from '@/components/header-inbox-popover';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import AppFooter from '@/components/app-footer';
import { AppShellSkeleton } from '@/components/loading/app-shell-skeleton';


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
    { route: '/assessments', permissions: ['evaluation:read'], blockedRoles: ['candidate'], redirectTo: '/dashboard' },
    { route: '/interviews', permissions: ['pipeline:read'], blockedRoles: ['candidate'], redirectTo: '/dashboard' },
    { route: '/applicants', permissions: ['candidate:read'], blockedRoles: ['candidate'], redirectTo: '/find-jobs' },
    { route: '/team', permissions: ['user:read'], blockedRoles: ['candidate'], redirectTo: '/find-jobs' },
    { route: '/my-profile', permissions: [], blockedRoles: ['candidate'], redirectTo: '/find-jobs' },
    { route: '/security', permissions: [], blockedRoles: ['candidate'], redirectTo: '/find-jobs' },
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
    const [isLoggingOut, setIsLoggingOut] = useState(false);
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

        if (hasPermission('rbac:manage') && pathname.startsWith('/security')) {
            router.replace(`/admin/security`);
            return;
        }

        // Operator/admin → redirect to admin layout, but spare shared pipeline pages
        const isSharedPage =
            pathname.startsWith('/profile') ||
            pathname.startsWith('/my-profile') ||
            pathname.startsWith('/security');

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
    }, [user, loading, router, pathname, hasPermission, user?.permissions]);

    const handleLogout = () => {
        setIsLoggingOut(true);
        setTimeout(() => {
            logout();
        }, 600);
    };

    if (loading && !user) {
        return <AppShellSkeleton />;
    }

    if (!user) {
        return null;
    }

    const allRecruiterNav = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, permissions: ['job:read', 'candidate:read'] },
        { href: '/jd-builder', label: 'JD Creator', icon: FilePlus2, permissions: ['job:create'] },
        { href: '/job-postings', label: 'Job Postings', icon: Briefcase, permissions: ['job:read'] },
        { href: '/team', label: 'Team', icon: Users, permissions: ['user:read'] },
    ];

    const recruiterNav = allRecruiterNav.filter((item) => item.permissions.some((permission) => hasPermission(permission)));

    const adminNav = [
        { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/jd-creator', label: 'JD Creator', icon: FilePlus2 },
        { href: '/admin/job-postings', label: 'Job Postings', icon: Briefcase },
        { href: '/admin/candidates', label: 'Candidates', icon: Contact },
        ...(hasPermission('user:read')
            ? [{ href: '/admin/team', label: 'Team', icon: Users }]
            : []),
    ];

    const candidateNavLinks = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/find-jobs', label: 'Find Jobs', icon: Search },
        { href: '/my-applications', label: 'Jobs Applied To', icon: FileText }
    ];



    const RecruiterSidebarHeader = () => {
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

    const RecruiterSidebarFooter = () => {
        const { state } = useSidebar();
        const avatarButton = state === 'collapsed' ? (
            <div className="relative h-10 w-10 rounded-full text-foreground flex items-center justify-center shrink-0">
                <Avatar className="h-10 w-10">
                    <AvatarFallback className="font-medium">{getUserInitials(user)}</AvatarFallback>
                </Avatar>
            </div>
        ) : (
            <div className="relative h-12 w-full rounded-md flex items-center justify-start gap-3 text-foreground p-2 shrink-0 overflow-hidden">
                <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="font-medium">{getUserInitials(user)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-left flex-1 min-w-0">
                    <span className="text-sm font-medium truncate w-full block">{getUserDisplayName(user)}</span>
                    <span className="text-xs text-muted-foreground truncate w-full block">{user.email}</span>
                </div>
            </div>
        );

        const SettingsButton = () => (
            <div className="group/settings relative w-full">
                <div
                    role="button"
                    onClick={() => router.push(hasPermission('rbac:manage') ? '/admin/security' : '/security')}
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
                            onClick={() => router.push('/my-profile')}
                        >
                            <UserIcon className="mr-2 h-4 w-4" />
                            <span>My Profile</span>
                        </div>
                        {hasPermission('company:read') && (
                            <div
                                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                                onClick={() => router.push(hasPermission('rbac:manage') ? '/admin/company-profile' : '/company-profile')}
                            >
                                <Building className="mr-2 h-4 w-4" />
                                <span>Company Profile</span>
                            </div>
                        )}
                        {hasPermission('company:update') && (
                            <div
                                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                                onClick={() => router.push(hasPermission('rbac:manage') ? '/admin/subscription' : '/subscription')}
                            >
                                <CreditCard className="mr-2 h-4 w-4" />
                                <span>Subscription</span>
                            </div>
                        )}
                        {(hasPermission('linkedin:read') || hasPermission('linkedin:connect') || hasPermission('linkedin:post')) && (
                            <div
                                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                                onClick={() => router.push(hasPermission('rbac:manage') ? '/admin/integrations' : '/settings/integrations')}
                            >
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Integrations</span>
                            </div>
                        )}
                    </div>
                </div>
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
                                        onClick={handleLogout}
                                        disabled={isLoggingOut}
                                        className="h-10 w-10 rounded-full shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 disabled:opacity-50"
                                    >
                                        {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
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
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="w-full justify-start h-10 px-3 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 disabled:opacity-50"
                        >
                            {isLoggingOut ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <LogOut className="h-4 w-4 mr-2" />}
                            <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
                        </Button>
                    )}
                </div>
            </div>
        );
    };

    const CandidateHeader = () => {

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
                                        <DropdownMenuItem disabled={isLoggingOut} onClick={handleLogout} className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 cursor-pointer">
                                            {isLoggingOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
                                            <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
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

    const isRecruiterExperience = user.role !== 'candidate';

    if (isRecruiterExperience) {
        return (
            <TooltipProvider>
                <SidebarProvider className="flex h-screen w-full flex-col overflow-hidden">
                    <div className="flex h-full min-h-0 flex-col bg-muted/40">
                        <div className="flex min-h-0 flex-1 overflow-hidden relative">
                            <Sidebar collapsible="icon">
                                <SidebarRail />
                                <RecruiterSidebarHeader />
                                <SidebarContent>
                                    <RecruiterSidebarMenu navItems={hasPermission('rbac:manage') ? adminNav : recruiterNav} pathname={pathname} />
                                </SidebarContent>
                                <SidebarTrigger />
                                <RecruiterSidebarFooter />
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

function RecruiterSidebarMenu({ navItems, pathname }: { navItems: any[], pathname: string }) {
    const { state } = useSidebar();

    return (
        <SidebarMenu>
            {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && item.href !== '/admin/dashboard' && pathname.includes(item.href));

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
