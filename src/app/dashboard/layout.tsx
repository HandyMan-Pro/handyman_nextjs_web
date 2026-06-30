'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isAuthenticated, getUserData, logout, type UserData } from '../../lib/auth';
import {
  LayoutDashboard, Users, Wrench, CalendarCheck, DollarSign,
  Megaphone, Settings, LogOut, ChevronLeft, ChevronRight,
  Bell, Search, Menu, X, Shield,
  Hammer, UserCheck, Briefcase, Tag, MessageSquare
} from 'lucide-react';

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  badge?: number;
  step?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',   icon: LayoutDashboard, href: '/dashboard',            step: '1' },
  { label: 'Services',    icon: Wrench,          href: '/dashboard/services',    step: '2' },
  { label: 'Providers',   icon: Briefcase,       href: '/dashboard/providers',   step: '3' },
  { label: 'Handymen',    icon: Hammer,          href: '/dashboard/handymen',    step: '3' },
  { label: 'Customers',   icon: Users,           href: '/dashboard/customers',   step: '3' },
  { label: 'Bookings',    icon: CalendarCheck,   href: '/dashboard/bookings',    step: '4' },
  { label: 'Finance',     icon: DollarSign,      href: '/dashboard/finance',     step: '5' },
  { label: 'Coupons',     icon: Tag,             href: '/dashboard/coupons',     step: '6' },
  { label: 'Notifications', icon: Megaphone,     href: '/dashboard/notifications', step: '6' },
  { label: 'Settings',    icon: Settings,        href: '/dashboard/settings',    step: '7' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserData | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }
    setUser(getUserData());
    setAuthChecked(true);
  }, [router]);

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="animate-spin-slow w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen flex bg-zinc-950">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen
        bg-zinc-900/95 backdrop-blur-xl border-r border-zinc-800/60
        flex flex-col transition-all duration-300 ease-spring
        ${collapsed ? 'w-[72px]' : 'w-64'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo area */}
        <div className={`flex items-center h-16 px-4 border-b border-zinc-800/60 ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0 shadow-md shadow-primary/20">
            <Wrench className="w-4.5 h-4.5 text-white" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="text-sm font-bold tracking-tight leading-none">Handyman Pro</h1>
              <p className="text-[10px] text-zinc-500 mt-0.5">Admin Panel</p>
            </div>
          )}

          {/* Mobile close */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden ml-auto text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <button
                key={item.href}
                onClick={() => {
                  router.push(item.href);
                  setMobileOpen(false);
                }}
                title={collapsed ? item.label : undefined}
                className={`
                  w-full flex items-center gap-3 h-10 rounded-xl text-sm font-medium transition-all duration-200
                  ${collapsed ? 'justify-center px-0' : 'px-3'}
                  ${active
                    ? 'bg-primary/15 text-primary shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                  }
                `}
              >
                <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${active ? 'text-primary' : ''}`} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="hidden lg:flex px-3 py-3 border-t border-zinc-800/60">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center h-9 rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60 transition-all"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* User section */}
        <div className={`px-3 py-3 border-t border-zinc-800/60 ${collapsed ? 'flex justify-center' : ''}`}>
          {collapsed ? (
            <button
              onClick={logout}
              title="Logout"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                {user?.first_name?.charAt(0) || 'A'}{user?.last_name?.charAt(0) || ''}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.display_name || user?.first_name || 'Admin'}</p>
                <p className="text-[11px] text-zinc-500 truncate">{user?.email || 'admin@handyman.com'}</p>
              </div>
              <button
                onClick={logout}
                title="Logout"
                className="text-zinc-500 hover:text-red-400 transition-colors flex-shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/40 flex items-center px-4 lg:px-6 gap-4">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-zinc-400 hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full h-9 pl-9 pr-4 bg-zinc-900/60 border border-zinc-800/50 rounded-lg text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <button className="relative w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-all">
              <Bell className="w-[18px] h-[18px]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
            </button>

            {/* Admin badge */}
            <div className="hidden sm:flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-lg text-xs font-medium">
              <Shield className="w-3 h-3" />
              Admin
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
