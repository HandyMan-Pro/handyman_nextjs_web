'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { apiClient } from '../../lib/apiClient';
import { logout } from '../../lib/auth';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  Hammer,
  LayoutGrid,
  Calendar,
  CreditCard,
  Banknote,
  Headset,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';

const fetcher = (url: string) => apiClient.get(url).then(res => res.data);

interface HandymanSidebarProps {
  user: any;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export default function HandymanSidebar({
  user,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen
}: HandymanSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, language } = useLanguage();

  // Fetch Handyman Profile dynamically
  const { data: profile } = useSWR('/handyman/profile', fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false
  });

  const displayName = profile?.display_name || user?.display_name || 'John Doe';
  const email = profile?.email || user?.email || 'demo@handyman.com';
  const avatar = profile?.profile_image || user?.profile_image || 'https://avatar.vercel.sh/handyman.png';

  const isActive = (href: string) => {
    if (href === '/dashboard/handyman') {
      return pathname === '/dashboard/handyman';
    }
    return pathname.startsWith(href);
  };

  const navItemClass = (active: boolean) => `
    w-full flex items-center gap-3 h-10 rounded-md transition-all duration-200 text-sm font-medium px-4 py-2
    ${collapsed ? 'justify-center px-0' : ''}
    ${active
      ? 'bg-[#232336] text-[#7367F0]'
      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
    }
  `;

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Mobile Sidebar Backdrop overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed lg:sticky top-0 bottom-0 z-50 h-screen
          bg-[#121214] border-r border-zinc-800/60
          flex flex-col transition-all duration-300 ease-in-out
          ${collapsed ? 'w-[72px]' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full lg:translate-x-0 lg:rtl:translate-x-0'}
        `}
      >
        {/* Header Logo */}
        <div
          className={`flex items-center h-16 px-4 ${
            collapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-400 flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-500/10">
              <Hammer className="w-4.5 h-4.5 text-white" />
            </div>
            {!collapsed && (
              <h1 className="text-xl font-bold tracking-tight text-[#7367F0] animate-fade-in">
                {t('Handyman')}
              </h1>
            )}
          </div>

          {/* Mobile close button */}
          {!collapsed && mobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Profile Block (Clickable) */}
        <div className="border-b border-t border-zinc-800/60 p-4">
          {collapsed ? (
            <Link href="/dashboard/handyman/profile" className="flex justify-center">
              <img
                src={avatar}
                alt={displayName}
                className="w-10 h-10 rounded-full object-cover border border-zinc-800 cursor-pointer hover:border-[#7367F0] transition-colors"
                title={displayName}
              />
            </Link>
          ) : (
            <Link
              href="/dashboard/handyman/profile"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 cursor-pointer hover:bg-zinc-800/30 p-2 rounded-lg transition-colors duration-200"
            >
              <img
                src={avatar}
                alt={displayName}
                className="w-10 h-10 rounded-full object-cover border border-zinc-800 flex-shrink-0"
              />
              <div className="flex flex-col min-w-0 leading-tight">
                <span className="text-sm font-bold text-white truncate">
                  {email}
                </span>
                <span className="text-xs text-zinc-400 truncate mt-0.5">
                  {displayName}
                </span>
              </div>
            </Link>
          )}
        </div>

        {/* Navigation - Scrollable Area */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin scrollbar-thumb-zinc-850">
          
          {/* MAIN Section */}
          <div className="space-y-1">
            {!collapsed && (
              <div className="text-[11px] uppercase text-zinc-500 font-bold tracking-widest mt-2 mb-2 px-4">
                {t('MAIN')}
              </div>
            )}
            <Link
              href="/dashboard/handyman"
              onClick={() => setMobileOpen(false)}
              className={navItemClass(isActive('/dashboard/handyman'))}
              title={collapsed ? t('Dashboard') : undefined}
            >
              <LayoutGrid className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span>{t('Dashboard')}</span>}
            </Link>
            <Link
              href="/dashboard/handyman/bookings"
              onClick={() => setMobileOpen(false)}
              className={navItemClass(isActive('/dashboard/handyman/bookings'))}
              title={collapsed ? t('Bookings') : undefined}
            >
              <Calendar className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span>{t('Bookings')}</span>}
            </Link>
          </div>

          {/* TRANSACTIONS Section */}
          <div className="space-y-1">
            {!collapsed && (
              <div className="text-[11px] uppercase text-zinc-500 font-bold tracking-widest mt-4 mb-2 px-4">
                {t('TRANSACTIONS')}
              </div>
            )}
            <Link
              href="/dashboard/handyman/payments"
              onClick={() => setMobileOpen(false)}
              className={navItemClass(isActive('/dashboard/handyman/payments'))}
              title={collapsed ? t('Payments') : undefined}
            >
              <CreditCard className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span>{t('Payments')}</span>}
            </Link>
            <Link
              href="/dashboard/handyman/cash-payments"
              onClick={() => setMobileOpen(false)}
              className={navItemClass(isActive('/dashboard/handyman/cash-payments'))}
              title={collapsed ? t('Cash Payments') : undefined}
            >
              <Banknote className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span>{t('Cash Payments')}</span>}
            </Link>
          </div>

          {/* PROMOTION Section */}
          <div className="space-y-1">
            {!collapsed && (
              <div className="text-[11px] uppercase text-zinc-500 font-bold tracking-widest mt-4 mb-2 px-4">
                {t('PROMOTION')}
              </div>
            )}
            <Link
              href="/dashboard/handyman/helpdesk"
              onClick={() => setMobileOpen(false)}
              className={navItemClass(isActive('/dashboard/handyman/helpdesk'))}
              title={collapsed ? t('Help Desk') : undefined}
            >
              <Headset className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span>{t('Help Desk')}</span>}
            </Link>
          </div>

        </nav>

        {/* Footer Toggle Button */}
        <div className="hidden lg:flex px-3 py-3 border-t border-zinc-800/60">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center h-9 rounded-xl text-zinc-500 hover:text-[#7367F0] hover:bg-[#232336]/40 transition-all duration-200"
          >
            {collapsed ? (
              language === 'ar' ? <ChevronLeft className="w-4.5 h-4.5" /> : <ChevronRight className="w-4.5 h-4.5" />
            ) : (
              language === 'ar' ? <ChevronRight className="w-4.5 h-4.5" /> : <ChevronLeft className="w-4.5 h-4.5" />
            )}
          </button>
        </div>

        {/* Footer Logout Plate */}
        <div className="p-3 border-t border-zinc-800/60">
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center justify-center h-9 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200
              ${collapsed ? '' : 'gap-2.5 px-3'}
            `}
            title={t('Logout')}
          >
            <LogOut className="w-4.5 h-4.5 flex-shrink-0" />
            {!collapsed && <span className="text-xs font-semibold">{t('Logout')}</span>}
          </button>
        </div>

      </aside>
    </>
  );
}
