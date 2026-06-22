"use client";

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Inbox,
  Users,
  FileText,
  CheckSquare,
  Bell,
  Settings,
  History,
  GraduationCap,
  BookOpen,
  Zap,
  Globe,
  FormInput,
  BarChart3,
  Sparkles,
  Menu,
  X,
  LogOut,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Building2,
  CreditCard,
  UserCheck,
  UserCircle,
  BookOpenCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

type SidebarShellProps = {
  children: React.ReactNode;
  user: {
    name: string;
    email: string;
    avatar: string;
    role: string;
  };
  tenant: {
    id: string;
    name: string;
    logo: string;
    slug: string;
  };
};

export function SidebarShell({ children, user, tenant }: SidebarShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

  useEffect(() => {
    setNavigatingTo(null);
  }, [pathname]);

  useEffect(() => {
    // Load theme setting
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme === 'dark' || (!savedTheme && systemPrefersDark) ? 'dark' : 'light';
    
    setTheme(initialTheme);
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push('/signin');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'SMART Inbox', href: '/inbox', icon: Inbox },
    { name: 'Students', href: '/students', icon: Users },
    { name: 'Applications', href: '/applications', icon: FileText },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Notifications', href: '/notifications', icon: Bell },
    { name: 'Universities', href: '/universities', icon: GraduationCap },
    { name: 'Programs', href: '/programs', icon: BookOpen },
    { name: 'Automations', href: '/automations', icon: Zap },
    { name: 'Landing Pages', href: '/landing-pages', icon: Globe },
    { name: 'Lead Forms', href: '/forms', icon: FormInput },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'AI Insights', href: '/ai-insights', icon: Sparkles },
    { name: 'Audit Logs', href: '/audit-logs', icon: History, role: ['admin', 'manager'] },
    { name: 'User Manual', href: '/manual', icon: BookOpenCheck },
  ];

  const settingsNavigation = [
    { name: 'Profile', href: '/settings/profile', icon: UserCircle },
    { name: 'General', href: '/settings/general', icon: Settings },
    { name: 'Team Management', href: '/settings/team', icon: UserCheck },
    { name: 'Branches', href: '/settings/branches', icon: Building2 },
    { name: 'Billing', href: '/settings/billing', icon: CreditCard, role: ['admin'] },
  ];

  const filteredNav = navigation.filter(item => !item.role || item.role.includes(user.role));
  const filteredSettings = settingsNavigation.filter(item => !item.role || item.role.includes(user.role));

  const NavLink = ({ item, isSettings = false }: { item: typeof navigation[0]; isSettings?: boolean }) => {
    const active = pathname === item.href || pathname.startsWith(item.href + '/');
    const loading = navigatingTo === item.href && isPending;

    const handleNavigate = (event: React.MouseEvent<HTMLAnchorElement>) => {
      // Preserve native behavior for new-tab / modified clicks.
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
        return;
      }
      event.preventDefault();
      setMobileOpen(false);
      if (active) return;
      setNavigatingTo(item.href);
      startTransition(() => {
        router.push(item.href);
      });
    };

    return (
      <Link
        href={item.href}
        onClick={handleNavigate}
        aria-busy={loading}
        className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
          active
            ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100'
        }`}
      >
        {loading ? (
          <Spinner className="h-5 w-5 flex-shrink-0" />
        ) : (
          <item.icon className="h-5 w-5 flex-shrink-0" />
        )}
        {(!collapsed || mobileOpen) && <span className="truncate">{item.name}</span>}
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-all duration-300 relative ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Workspace Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {tenant.logo ? (
                <img src={tenant.logo} alt={tenant.name} className="h-full w-full object-cover rounded-lg" />
              ) : (
                tenant.name.charAt(0).toUpperCase()
              )}
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate w-40">
                  {tenant.name}
                </span>
                <span className="text-xs text-slate-400 truncate">Workspace</span>
              </div>
            )}
          </div>
        </div>

        {/* Collapsible toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full p-1 shadow-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 z-10"
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>

        {/* Main Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="space-y-1">
            {filteredNav.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}
          </div>

          <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5" />
                {!collapsed && <span>Settings</span>}
              </div>
            </button>
            {settingsOpen && !collapsed && (
              <div className="pl-6 pt-1 space-y-1">
                {filteredSettings.map((item) => (
                  <NavLink key={item.name} item={item} isSettings />
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Bottom Profile and Settings */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
          {/* Theme switcher */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors"
          >
            {theme === 'light' ? (
              <>
                <Moon className="h-5 w-5" />
                {!collapsed && <span>Dark Mode</span>}
              </>
            ) : (
              <>
                <Sun className="h-5 w-5" />
                {!collapsed && <span>Light Mode</span>}
              </>
            )}
          </button>

          {/* User Card */}
          <div className={`flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 ${collapsed ? 'justify-center' : ''}`}>
            <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold text-sm flex-shrink-0">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="h-full w-full object-cover rounded-full" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-400 truncate uppercase">{user.role}</p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={handleLogout}
                className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 p-1"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-slate-900/40 backdrop-blur-sm">
          <aside className="w-64 bg-white dark:bg-slate-950 h-full flex flex-col p-4 shadow-xl border-r border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{tenant.name}</span>
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
              {filteredNav.map((item) => (
                <NavLink key={item.name} item={item} />
              ))}
              <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
                <span className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Settings</span>
                <div className="mt-2 space-y-1">
                  {filteredSettings.map((item) => (
                    <NavLink key={item.name} item={item} isSettings />
                  ))}
                </div>
              </div>
            </nav>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg"
              >
                {theme === 'light' ? <><Moon className="h-5 w-5" /><span>Dark Mode</span></> : <><Sun className="h-5 w-5" /><span>Light Mode</span></>}
              </button>
              <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-400 truncate uppercase">{user.role}</p>
                </div>
                <button onClick={handleLogout} className="text-slate-400 hover:text-red-500">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Bar */}
        <header className="h-16 flex md:hidden items-center justify-between px-4 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
          <span className="font-bold text-slate-900 dark:text-slate-100">{tenant.name}</span>
          <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
            {tenant.name.charAt(0).toUpperCase()}
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-grow overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
