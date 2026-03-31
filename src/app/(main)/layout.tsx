
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
  LogOut,
  Bell,
  Search,
  FileText,
  Building,
  CreditCard,
  Mic,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import Logo from '@/components/logo';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { applicantNotifications } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import AppFooter from '@/components/app-footer';


const recruiterRoutes = ['/dashboard', '/job-postings', '/profile', '/applicants', '/team', '/jd-builder', '/assessments', '/company-profile', '/subscription', '/about', '/interviews'];
const candidateRoutes = ['/find-jobs', '/dashboard', '/inbox', '/my-applications', '/profile', '/open-positions'];


export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role === 'operator') {
      router.push('/admin/dashboard');
      return;
    }

    // Basic role-based route protection
    const baseRoute = '/' + pathname.split('/')[1];
    if (user.role === 'recruiter' && !recruiterRoutes.some(r => pathname.startsWith(r))) {
        router.push('/dashboard');
    }
    if (user.role === 'candidate' && !candidateRoutes.some(r => pathname.startsWith(r))) {
        router.push('/dashboard');
    }

  }, [user, loading, router, pathname]);
  
  if (loading || !user || user.role === 'operator') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      </div>
    );
  }

  const allRecruiterNav = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['HR Admin', 'Hiring Manager', 'Interviewer'] },
    { href: '/jd-builder', label: 'JD Builder', icon: FilePlus2, roles: ['HR Admin'] },
    { href: '/job-postings', label: 'Job Postings', icon: Briefcase, roles: ['HR Admin', 'Hiring Manager', 'Interviewer'] },
    { href: '/assessments', label: 'Assessments', icon: Sparkles, roles: ['HR Admin', 'Hiring Manager'] },
    { href: '/interviews', label: 'Interviews', icon: Mic, roles: ['HR Admin', 'Hiring Manager', 'Interviewer'] },
  ];
  
  const recruiterNav = allRecruiterNav.filter(item => user.companyRole && item.roles.includes(user.companyRole));

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
            <Logo width={120} height={40}/>
        </div>
        <div className="flex items-center gap-4">
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
                        {user.companyRole && <Badge variant="outline">{user.companyRole}</Badge>}
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
                {user.companyRole === 'HR Admin' && (
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
     const unreadCount = user ? applicantNotifications.filter(n => n.applicantId === user.uid && !n.read).length : 0;
     const notifications = user ? applicantNotifications.filter(n => n.applicantId === user.uid).slice(0, 5) : [];

    return (
        <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/95 shadow-md backdrop-blur-sm">
            <div className="container">
                <div className="flex h-20 items-center">
                    <Link href={'/dashboard'}>
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
                                        <Bell className="h-5 w-5"/>
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

  if (user.role === 'recruiter') {
    return (
        <TooltipProvider>
        <SidebarProvider>
        <div className="flex h-screen flex-col bg-muted/40">
            <RecruiterHeader />
            <div className="flex flex-1 overflow-hidden">
            <Sidebar collapsible="icon">
                <SidebarRail />
                <SidebarContent>
                    <SidebarMenu>
                    {recruiterNav.map((item) => (
                        <SidebarMenuItem key={item.href}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        'peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!p-2 [&>svg]:size-5 [&>svg]:shrink-0 h-9',
                                        pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard') && 'bg-sidebar-accent text-sidebar-accent-foreground',
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
            <main className="flex-1 p-6 overflow-auto">
                {children}
            </main>
            </div>
        </div>
        </SidebarProvider>
        </TooltipProvider>
    );
  }

  if (user.role === 'candidate') {
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
