'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isAuthenticated, getUserData, logout, type UserData } from '../../lib/auth';
import { useNotificationStore } from '../../store/useNotificationStore';
import {
  LayoutDashboard, Users, Wrench, CalendarCheck, DollarSign,
  Megaphone, Settings, LogOut, ChevronLeft, ChevronRight,
  Bell, Search, Menu, X, Shield,
  Hammer, UserCheck, Briefcase, Tag, MessageSquare,
  MapPin, Clock, User, BadgeCheck,
  Sun, Moon, Globe, Store, List, Package, Blocks,
  ClipboardList, ClipboardCheck, UserMinus, Percent,
  CreditCard, Banknote, CircleDollarSign, BadgeDollarSign,
  MonitorPlay, Star, Headset, ChevronDown
} from 'lucide-react';
import NotificationBell from '../../components/NotificationBell';
import { useAuthStore } from '../../store/useAuthStore';
import { useTheme } from '../ThemeProvider';
import { useLanguage } from '../../contexts/LanguageContext';

export interface NavItem {
  label: string;
  icon: any;
  href?: string;
  category?: string;
  children?: NavItem[];
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
  { label: 'Blogs',       icon: MessageSquare,   href: '/dashboard/blogs',       step: '5' },
  { label: 'Finance',     icon: DollarSign,      href: '/dashboard/finance',     step: '6' },
  { label: 'Coupons',     icon: Tag,             href: '/dashboard/coupons',     step: '6' },
  { label: 'Notifications', icon: Megaphone,     href: '/dashboard/notifications', step: '6' },
  { label: 'Settings',    icon: Settings,        href: '/dashboard/settings',    step: '7' },
];

const PROVIDER_NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    category: 'MAIN'
  },
  {
    label: 'Bookings',
    icon: CalendarCheck,
    href: '/dashboard/bookings',
    category: 'MAIN'
  },
  {
    label: 'Shops',
    icon: Store,
    href: '/dashboard/shops',
    category: 'SHOP'
  },
  {
    label: 'Services',
    icon: Wrench,
    category: 'SERVICE',
    children: [
      { label: 'All Services', icon: List, href: '/dashboard/services' },
      { label: 'Packages', icon: Package, href: '/dashboard/services/packages' },
      { label: 'Addons', icon: Blocks, href: '/dashboard/services/addons' },
      { label: 'Service Request List', icon: ClipboardList, href: '/dashboard/services/requests' }
    ]
  },
  {
    label: 'Job Request List',
    icon: Briefcase,
    href: '/dashboard/job-requests',
    category: 'CUSTOM JOB'
  },
  {
    label: 'Handyman',
    icon: UserCheck,
    category: 'USER',
    children: [
      { label: 'Handyman List', icon: Users, href: '/dashboard/handymen' },
      { label: 'Handyman Request List', icon: ClipboardCheck, href: '/dashboard/handyman-requests' },
      { label: 'Unassigned Handyman', icon: UserMinus, href: '/dashboard/unassigned-handymen' },
      { label: 'Handyman Commission List', icon: Percent, href: '/dashboard/handyman-commissions' }
    ]
  },
  {
    label: 'Payments',
    icon: CreditCard,
    href: '/dashboard/payments',
    category: 'TRANSACTIONS'
  },
  {
    label: 'Cash Payments',
    icon: Banknote,
    href: '/dashboard/cash-payments',
    category: 'TRANSACTIONS'
  },
  {
    label: 'Provider Withdrawal Requests',
    icon: CircleDollarSign,
    href: '/dashboard/withdrawals',
    category: 'TRANSACTIONS'
  },
  {
    label: 'Handyman Earning List',
    icon: BadgeDollarSign,
    href: '/dashboard/handyman-earnings',
    category: 'TRANSACTIONS'
  },
  {
    label: 'Provider Promotional Banner',
    icon: MonitorPlay,
    href: '/dashboard/promotions',
    category: 'PROMOTION'
  },
  {
    label: 'Handyman Ratings List',
    icon: Star,
    href: '/dashboard/ratings',
    category: 'RATINGS'
  },
  {
    label: 'Help Desk',
    icon: Headset,
    href: '/dashboard/helpdesk',
    category: 'RATINGS'
  }
];

const USER_NAV_ITEMS: NavItem[] = [
  { label: 'Find Provider',        icon: Search,        href: '/dashboard/find-provider' },
  { label: 'Find Nearby Provider', icon: MapPin,        href: '/dashboard/find-nearby' },
  { label: 'My Booking',           icon: CalendarCheck, href: '/dashboard/my-bookings' },
  { label: 'Booking History',      icon: Clock,         href: '/dashboard/booking-history' },
  { label: 'Blogs',                icon: MessageSquare, href: '/dashboard/blogs' },
  { label: 'notification',         icon: Bell,          href: '/dashboard/user-notifications' },
  { label: "User's profile page",  icon: User,          href: '/dashboard/profile' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserData | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const authUser = useAuthStore(state => state.user);
  const isVerified = useAuthStore(state => state.is_verified);
  const { resolvedTheme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const getFilteredNavItems = () => {
    if (!user) return [];
    if (user.user_type === 'admin' || user.user_type === 'demo_admin') {
      return NAV_ITEMS;
    }
    if (user.user_type === 'provider') {
      return PROVIDER_NAV_ITEMS;
    }
    if (user.user_type === 'handyman') {
      return [
        { label: 'Dashboard',   icon: LayoutDashboard, href: '/dashboard' },
        { label: 'Bookings',    icon: CalendarCheck,   href: '/dashboard/bookings' },
        { label: 'Blogs',       icon: MessageSquare,   href: '/dashboard/blogs' },
      ];
    }
    if (user.user_type === 'user') {
      return USER_NAV_ITEMS;
    }
    return NAV_ITEMS;
  };

  useEffect(() => {
    if (user) {
      const items = getFilteredNavItems();
      const newOpenMenus: Record<string, boolean> = { ...openMenus };
      let changed = false;
      items.forEach(item => {
        if (item.children) {
          const hasActiveChild = item.children.some(child => child.href && pathname.startsWith(child.href));
          if (hasActiveChild && !openMenus[item.label]) {
            newOpenMenus[item.label] = true;
            changed = true;
          }
        }
      });
      if (changed) {
        setOpenMenus(newOpenMenus);
      }
    }
  }, [pathname, user]);

  useEffect(() => {
    if (authUser) {
      setUser(authUser);
    }
  }, [authUser]);

  const fetchNotifications = useNotificationStore(state => state.fetchNotifications);
  const addNotification = useNotificationStore(state => state.addNotification);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (authChecked && user) {
      fetchNotifications();

      const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY || '2d5b62b109b0b46be69e';
      const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2';
      const channelName = `user-${user.id}`;
      
      const wsUrl = `wss://ws-${pusherCluster}.pusher.com/app/${pusherKey}?protocol=7&client=js&version=8.4.0`;
      
      let ws: WebSocket | null = null;
      let reconnectTimeout: NodeJS.Timeout;

      const connect = () => {
        try {
          ws = new WebSocket(wsUrl);
          
          ws.onopen = () => {
            console.log('[WebSocket] Connected to Pusher');
            if (ws && ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                event: 'pusher:subscribe',
                data: { channel: channelName }
              }));
            }
          };

          ws.onmessage = (event) => {
            try {
              const payload = JSON.parse(event.data);
              if (payload.event === 'new-notification') {
                const rawData = typeof payload.data === 'string' ? JSON.parse(payload.data) : payload.data;
                console.log('[WebSocket] New Notification:', rawData);
                addNotification(rawData);
              }
            } catch (err) {
              console.error('[WebSocket] Parse Error:', err);
            }
          };

          ws.onclose = (e) => {
            console.log('[WebSocket] Connection closed, reconnecting in 5s...', e);
            reconnectTimeout = setTimeout(connect, 5000);
          };

          ws.onerror = (err) => {
            console.error('[WebSocket] Error:', err);
          };
        } catch (e) {
          console.error('[WebSocket] Setup failed:', e);
        }
      };

      connect();

      return () => {
        if (ws) ws.close();
        clearTimeout(reconnectTimeout);
      };
    }
  }, [authChecked, user, fetchNotifications, addNotification]);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/?login=true');
      return;
    }
    const userData = getUserData();
    setUser(userData);
    useAuthStore.getState().setUser(userData);
    useAuthStore.getState().fetchUser();
    setAuthChecked(true);

    if (userData) {
      const isProvider = userData.user_type === 'provider';
      const path = pathname;

      if (userData.user_type === 'user') {
        const userAllowed = [
          '/dashboard/find-provider',
          '/dashboard/find-nearby',
          '/dashboard/my-bookings',
          '/dashboard/booking-history',
          '/dashboard/blogs',
          '/dashboard/user-notifications',
          '/dashboard/profile'
        ];
        if (!userAllowed.some(p => path.startsWith(p))) {
          router.replace('/dashboard/find-provider');
        }
      } else if (isProvider) {
        const providerAllowed = [
          '/dashboard',
          '/dashboard/services',
          '/dashboard/handymen',
          '/dashboard/team',
          '/dashboard/bookings',
          '/dashboard/blogs',
          '/dashboard/finance',
          '/dashboard/settings',
          '/dashboard/inbox',
          '/dashboard/reviews',
          '/dashboard/verification',
          '/dashboard/provider-notifications',
          '/dashboard/shops'
        ];
        const isAllowed = providerAllowed.some(p => path === p || path.startsWith(p + '/'));
        if (!isAllowed) {
          router.replace('/dashboard');
        }
      } else if (userData.user_type === 'handyman') {
        const handymanAllowed = [
          '/dashboard',
          '/dashboard/bookings',
          '/dashboard/blogs'
        ];
        const isAllowed = handymanAllowed.some(p => path === p || path.startsWith(p + '/'));
        if (!isAllowed) {
          router.replace('/dashboard');
        }
      }
    }
  }, [router, pathname]);

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200">
        <div className="animate-spin-slow w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 bottom-0 z-50 h-screen
        bg-white dark:bg-zinc-900/95 backdrop-blur-xl border-r border-zinc-200 dark:border-zinc-800/60
        flex flex-col transition-all duration-300 ease-spring
        ${collapsed ? 'w-[72px]' : 'w-64'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full lg:translate-x-0 lg:rtl:translate-x-0'}
      `}>
        {/* Logo area */}
        <div className={`flex items-center h-16 px-4 border-b border-zinc-200 dark:border-zinc-800/60 ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0 shadow-md shadow-primary/20">
            <Wrench className="w-4.5 h-4.5 text-white" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="text-sm font-bold tracking-tight leading-none text-zinc-800 dark:text-zinc-100">Handyman Pro</h1>
              <p className="text-[10px] text-zinc-500 mt-0.5 capitalize">
                {user?.user_type === 'demo_admin' ? t('Demo Admin') : user?.user_type ? t(`${user.user_type} Panel`) : t('Admin Panel')}
              </p>
            </div>
          )}

          {/* Mobile close */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden ms-auto text-zinc-450 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {(() => {
            const items = getFilteredNavItems();
            const categories: { name: string | null; items: NavItem[] }[] = [];
            items.forEach(item => {
              const catName = item.category || null;
              let cat = categories.find(c => c.name === catName);
              if (!cat) {
                cat = { name: catName, items: [] };
                categories.push(cat);
              }
              cat.items.push(item);
            });

            return categories.map((cat, catIdx) => (
              <div key={cat.name || `cat-${catIdx}`} className="space-y-1">
                {!collapsed && cat.name && (
                  <div className="text-[10px] tracking-wider text-zinc-500 font-bold mt-5 mb-1.5 uppercase px-3">
                    {t(cat.name)}
                  </div>
                )}
                {cat.items.map((item) => {
                  const hasChildren = !!item.children && item.children.length > 0;
                  const isOpen = !!openMenus[item.label];
                  const active = item.href ? isActive(item.href) : (item.children?.some(c => c.href && isActive(c.href)) || false);
                  const Icon = item.icon;

                  return (
                    <div key={item.label} className="w-full space-y-1">
                      {hasChildren ? (
                        <button
                          onClick={() => setOpenMenus(prev => ({ ...prev, [item.label]: !prev[item.label] }))}
                          title={collapsed ? t(item.label) : undefined}
                          className={`
                            w-full flex items-center gap-3 h-10 rounded-xl text-sm font-medium transition-all duration-200
                            ${collapsed ? 'justify-center px-0' : 'px-3'}
                            ${active
                              ? 'bg-primary/10 text-primary'
                              : 'text-zinc-650 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                            }
                          `}
                        >
                          <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${active ? 'text-primary' : ''}`} />
                          {!collapsed && (
                            <>
                              <span className="flex-1 text-left rtl:text-right">{t(item.label)}</span>
                              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (item.href) {
                              router.push(item.href);
                              setMobileOpen(false);
                            }
                          }}
                          title={collapsed ? t(item.label) : undefined}
                          className={`
                            w-full flex items-center gap-3 h-10 rounded-xl text-sm font-medium transition-all duration-200
                            ${collapsed ? 'justify-center px-0' : 'px-3'}
                            ${active
                              ? 'bg-primary/15 text-primary shadow-sm'
                              : 'text-zinc-655 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                            }
                          `}
                        >
                          <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${active ? 'text-primary' : ''}`} />
                          {!collapsed && <span>{t(item.label)}</span>}
                        </button>
                      )}

                      {/* Nested dropdown items */}
                      {hasChildren && isOpen && !collapsed && (
                        <div className="border-l border-zinc-200 dark:border-zinc-800 ml-5 pl-3 space-y-1">
                          {item.children?.map((child) => {
                            const childActive = child.href ? isActive(child.href) : false;
                            const ChildIcon = child.icon;
                            return (
                              <button
                                key={child.href}
                                onClick={() => {
                                  if (child.href) {
                                    router.push(child.href);
                                    setMobileOpen(false);
                                  }
                                }}
                                className={`
                                  w-full flex items-center gap-2.5 h-8 rounded-lg text-[13px] font-medium transition-all duration-200 px-2.5
                                  ${childActive
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/40'
                                  }
                                `}
                              >
                                <ChildIcon className={`w-4 h-4 flex-shrink-0 ${childActive ? 'text-primary' : ''}`} />
                                <span className="text-left rtl:text-right">{t(child.label)}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ));
          })()}
        </nav>

        {/* Collapse toggle */}
        <div className="hidden lg:flex px-3 py-3 border-t border-zinc-200 dark:border-zinc-800/60">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center h-9 rounded-xl text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-all"
          >
            {collapsed ? (
              language === 'ar' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
            ) : (
              language === 'ar' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* User section */}
        <div className={`px-3 py-3 border-t border-zinc-200 dark:border-zinc-800/60 ${collapsed ? 'flex justify-center' : ''}`}>
          {collapsed ? (
            <button
              onClick={logout}
              title={t('Logout')}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex flex-col gap-2 w-full">
              <div className="flex items-center gap-3">
                {user?.profile_image ? (
                  <img
                    src={user.profile_image}
                    alt={user.display_name || 'User Profile'}
                    className="w-9 h-9 rounded-xl object-cover flex-shrink-0 border border-zinc-200 dark:border-zinc-800"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      const fallback = (e.target as HTMLImageElement).nextElementSibling;
                      if (fallback) fallback.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-9 h-9 rounded-xl bg-zinc-150 dark:bg-zinc-850 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0 ${user?.profile_image ? 'hidden' : ''}`}>
                  {user?.first_name?.charAt(0) || 'A'}{user?.last_name?.charAt(0) || ''}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-medium truncate">{user?.display_name || user?.first_name || 'Admin'}</p>
                    {isVerified && (
                      <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500/20 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500 truncate">{user?.email || 'admin@handyman.com'}</p>
                </div>
                <button
                  onClick={logout}
                  title={t('Logout')}
                  className="text-zinc-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 transition-colors flex-shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Commission Info */}
              {user?.user_type === 'provider' && (
                <div className="mt-6 mb-2 space-y-3 px-1 border-t border-zinc-200 dark:border-zinc-800/60 pt-5">
                  <div className="text-[13px] text-zinc-600 dark:text-zinc-300 flex items-center gap-2">
                    <span className="font-bold text-zinc-800 dark:text-zinc-100">Commission Value:</span> 
                    <span>{user.commission_value || 70}%</span>
                  </div>
                  <div className="text-[13px] text-zinc-600 dark:text-zinc-300 flex items-center gap-2">
                    <span className="font-bold text-zinc-800 dark:text-zinc-100">Commission Type:</span> 
                    <span>{user.commission_type || 'Percent'}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800/40 flex items-center px-4 lg:px-6 gap-4">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
              <input
                type="text"
                placeholder={t('Search bookings or services...')}
                className="w-full h-9 pl-9 pr-4 bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/50 rounded-lg text-sm text-zinc-800 dark:text-zinc-300 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Provider Name and BadgeCheck in Top Navbar */}
            {user?.user_type === 'provider' && (
              <div className="hidden md:flex items-center gap-1.5 mr-2">
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                  {user.display_name || `${user.first_name} ${user.last_name}`.trim() || user.username}
                </span>
                {isVerified && (
                  <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500/20 shrink-0" />
                )}
              </div>
            )}

            {/* Notification bell dropdown */}
            <NotificationBell />

            {/* i18n Dropdown (Globe Icon) */}
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900/60 dark:hover:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800/50 text-zinc-655 transition-all"
                title="Change Language"
              >
                <Globe className="w-4.5 h-4.5 text-zinc-500 dark:text-zinc-400" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 rtl:left-0 rtl:right-auto mt-2 w-40 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg py-1 text-sm font-medium z-50">
                  <button
                    onClick={() => { setLanguage('en'); setLangDropdownOpen(false); }}
                    className={`w-full text-left rtl:text-right px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${language === 'en' ? 'text-primary' : 'text-zinc-700 dark:text-zinc-300'}`}
                  >
                    🇺🇸 English
                  </button>
                  <button
                    onClick={() => { setLanguage('bn'); setLangDropdownOpen(false); }}
                    className={`w-full text-left rtl:text-right px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${language === 'bn' ? 'text-primary' : 'text-zinc-700 dark:text-zinc-300'}`}
                  >
                    🇧🇩 বাংলা (Bengali)
                  </button>
                  <button
                    onClick={() => { setLanguage('ar'); setLangDropdownOpen(false); }}
                    className={`w-full text-left rtl:text-right px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${language === 'ar' ? 'text-primary' : 'text-zinc-700 dark:text-zinc-300'}`}
                  >
                    🇸🇦 العربية (Arabic)
                  </button>
                </div>
              )}
            </div>

            {/* Theme switcher */}
            <button
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900/60 dark:hover:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800/50 text-zinc-655 transition-all duration-300"
              title="Toggle Theme"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="w-4.5 h-4.5 text-amber-500 hover:rotate-45 transition-transform duration-300" />
              ) : (
                <Moon className="w-4.5 h-4.5 text-indigo-600 hover:-rotate-12 transition-transform duration-300" />
              )}
            </button>

            {/* Role badge */}
            <div className="hidden sm:flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-lg text-xs font-medium capitalize">
              <Shield className="w-3 h-3" />
              {user?.user_type === 'demo_admin' ? t('Demo Admin') : t(user?.user_type || 'Admin')}
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
