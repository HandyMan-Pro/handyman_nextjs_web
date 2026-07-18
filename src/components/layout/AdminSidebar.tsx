'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { logout, type UserData } from '../../lib/auth';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  LayoutGrid,
  CalendarCheck,
  MessageSquare,
  Megaphone,
  Folder,
  FolderTree,
  Wrench,
  List,
  Package,
  Puzzle,
  ClipboardList,
  ClipboardCheck,
  Blocks,
  MapPin,
  Store,
  Briefcase,
  Hammer,
  Users,
  DollarSign,
  Tag,
  Settings,
  LogOut,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  X,
  Map
} from 'lucide-react';

interface AdminSidebarProps {
  user: UserData | null;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export default function AdminSidebar({
  user,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen
}: AdminSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { t, language } = useLanguage();

  // Dropdown states for nested menus
  const [servicesOpen, setServicesOpen] = useState(false);
  const [customJobsOpen, setCustomJobsOpen] = useState(false);

  // Auto-expand menus based on current pathname
  useEffect(() => {
    if (pathname.includes('/dashboard/admin/services')) {
      setServicesOpen(true);
    }
    if (pathname.includes('/dashboard/admin/custom-jobs')) {
      setCustomJobsOpen(true);
    }
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const navItemClass = (active: boolean) => `
    w-full flex items-center gap-3 h-10 rounded-r-xl transition-all duration-200 text-sm font-medium
    ${collapsed ? 'justify-center pl-0 pr-0 rounded-xl' : 'pl-3 pr-4'}
    ${active
      ? 'bg-[#2D3319] text-[#C4D92E] border-l-4 border-[#C4D92E]'
      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40 border-l-4 border-transparent'
    }
  `;

  const subNavItemClass = (active: boolean) => `
    w-full flex items-center gap-2.5 h-9 rounded-r-lg transition-all duration-200 text-[13px] font-medium pl-10 pr-4
    ${active
      ? 'bg-[#2D3319] text-[#C4D92E] border-l-4 border-[#C4D92E]'
      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/20 border-l-4 border-transparent'
    }
  `;

  const handleNavigation = (href: string) => {
    router.push(href);
    setMobileOpen(false);
  };

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
          className={`flex items-center h-16 px-4 border-b border-zinc-800/60 ${
            collapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2D3319] flex items-center justify-center flex-shrink-0 shadow-md shadow-[#C4D92E]/10">
              <Wrench className="w-4.5 h-4.5 text-[#C4D92E] drop-shadow-[0_0_8px_rgba(196,217,46,0.5)]" />
            </div>
            {!collapsed && (
              <div className="animate-fade-in">
                <h1 className="text-sm font-bold tracking-tight leading-none text-white">
                  {t('Handyman Pro')}
                </h1>
                <p className="text-[10px] text-zinc-500 mt-0.5 capitalize">
                  {t('Admin Panel')}
                </p>
              </div>
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

        {/* Navigation - Scrollable Area */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800">
          {/* MAIN Section */}
          <div className="space-y-1">
            {!collapsed && (
              <div className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest mb-2 px-4">
                {t('MAIN')}
              </div>
            )}
            <button
              onClick={() => handleNavigation('/dashboard')}
              className={navItemClass(isActive('/dashboard'))}
              title={collapsed ? t('Dashboard') : undefined}
            >
              <LayoutGrid className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span>{t('Dashboard')}</span>}
            </button>
            <button
              onClick={() => handleNavigation('/dashboard/bookings')}
              className={navItemClass(isActive('/dashboard/bookings'))}
              title={collapsed ? t('Bookings') : undefined}
            >
              <CalendarCheck className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span>{t('Bookings')}</span>}
            </button>
            <button
              onClick={() => handleNavigation('/dashboard/blogs')}
              className={navItemClass(isActive('/dashboard/blogs'))}
              title={collapsed ? t('Blogs') : undefined}
            >
              <MessageSquare className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span>{t('Blogs')}</span>}
            </button>
            <button
              onClick={() => handleNavigation('/dashboard/notifications')}
              className={navItemClass(isActive('/dashboard/notifications'))}
              title={collapsed ? t('Notifications') : undefined}
            >
              <Megaphone className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span>{t('Notifications')}</span>}
            </button>
          </div>

          {/* SERVICE Section */}
          <div className="space-y-1">
            {!collapsed && (
              <div className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest mb-2 px-4">
                {t('SERVICE')}
              </div>
            )}
            <button
              onClick={() => handleNavigation('/dashboard/admin/categories')}
              className={navItemClass(isActive('/dashboard/admin/categories'))}
              title={collapsed ? t('Categories') : undefined}
            >
              <Folder className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span>{t('Categories')}</span>}
            </button>
            <button
              onClick={() => handleNavigation('/dashboard/admin/subcategories')}
              className={navItemClass(isActive('/dashboard/admin/subcategories'))}
              title={collapsed ? t('Subcategories') : undefined}
            >
              <FolderTree className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span>{t('Subcategories')}</span>}
            </button>

            {/* Collapsible Services Dropdown */}
            <div className="w-full">
              <button
                onClick={() => setServicesOpen(!servicesOpen)}
                className={`
                  w-full flex items-center justify-between transition-all duration-200 text-sm font-medium h-10 rounded-r-xl
                  ${collapsed ? 'justify-center pl-0 pr-0 rounded-xl' : 'pl-3 pr-4'}
                  ${(isActive('/dashboard/admin/services') && !collapsed)
                    ? 'text-[#C4D92E] bg-[#2D3319] border-l-4 border-[#C4D92E]'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40 border-l-4 border-transparent'
                  }
                `}
                title={collapsed ? t('Services') : undefined}
              >
                <div className="flex items-center gap-3">
                  <Wrench className="w-[18px] h-[18px] flex-shrink-0" />
                  {!collapsed && <span>{t('Services')}</span>}
                </div>
                {!collapsed && (
                  servicesOpen ? (
                    <ChevronDown className="w-4 h-4 text-zinc-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-zinc-500" />
                  )
                )}
              </button>
              {servicesOpen && !collapsed && (
                <div className="transition-all duration-300 overflow-hidden space-y-0.5 mt-0.5">
                  <button
                    onClick={() => handleNavigation('/dashboard/admin/services/single')}
                    className={subNavItemClass(pathname === '/dashboard/admin/services/single')}
                  >
                    <List className="w-4 h-4" />
                    <span>{t('Single Services')}</span>
                  </button>
                  <button
                    onClick={() => handleNavigation('/dashboard/admin/services/packages')}
                    className={subNavItemClass(pathname === '/dashboard/admin/services/packages')}
                  >
                    <Package className="w-4 h-4" />
                    <span>{t('Packages')}</span>
                  </button>
                  <button
                    onClick={() => handleNavigation('/dashboard/admin/services/addons')}
                    className={subNavItemClass(pathname === '/dashboard/admin/services/addons')}
                  >
                    <Puzzle className="w-4 h-4" />
                    <span>{t('Addons')}</span>
                  </button>
                  <button
                    onClick={() => handleNavigation('/dashboard/admin/services/requests')}
                    className={subNavItemClass(pathname === '/dashboard/admin/services/requests')}
                  >
                    <ClipboardList className="w-4 h-4" />
                    <span>{t('Service Requests')}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Collapsible Custom Jobs Dropdown */}
            <div className="w-full">
              <button
                onClick={() => setCustomJobsOpen(!customJobsOpen)}
                className={`
                  w-full flex items-center justify-between transition-all duration-200 text-sm font-medium h-10 rounded-r-xl
                  ${collapsed ? 'justify-center pl-0 pr-0 rounded-xl' : 'pl-3 pr-4'}
                  ${(isActive('/dashboard/admin/custom-jobs') && !collapsed)
                    ? 'text-[#C4D92E] bg-[#2D3319] border-l-4 border-[#C4D92E]'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40 border-l-4 border-transparent'
                  }
                `}
                title={collapsed ? t('Custom Jobs') : undefined}
              >
                <div className="flex items-center gap-3">
                  <ClipboardCheck className="w-[18px] h-[18px] flex-shrink-0" />
                  {!collapsed && <span>{t('Custom Jobs')}</span>}
                </div>
                {!collapsed && (
                  customJobsOpen ? (
                    <ChevronDown className="w-4 h-4 text-zinc-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-zinc-500" />
                  )
                )}
              </button>
              {customJobsOpen && !collapsed && (
                <div className="transition-all duration-300 overflow-hidden space-y-0.5 mt-0.5">
                  <button
                    onClick={() => handleNavigation('/dashboard/admin/custom-jobs/requests')}
                    className={subNavItemClass(pathname === '/dashboard/admin/custom-jobs/requests')}
                  >
                    <List className="w-4 h-4" />
                    <span>{t('Job Requests')}</span>
                  </button>
                  <button
                    onClick={() => handleNavigation('/dashboard/admin/custom-jobs/services')}
                    className={subNavItemClass(pathname === '/dashboard/admin/custom-jobs/services')}
                  >
                    <Blocks className="w-4 h-4" />
                    <span>{t('Job Services')}</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => handleNavigation('/dashboard/admin/zones')}
              className={navItemClass(isActive('/dashboard/admin/zones'))}
              title={collapsed ? t('Coverage Zones') : undefined}
            >
              <MapPin className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span>{t('Coverage Zones')}</span>}
            </button>
            <button
              onClick={() => handleNavigation('/dashboard/maps-engine')}
              className={navItemClass(isActive('/dashboard/maps-engine'))}
              title={collapsed ? t('Maps Enterprise') : undefined}
            >
              <Map className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span>{t('Maps Enterprise')}</span>}
            </button>
          </div>

          {/* SHOP Section */}
          <div className="space-y-1">
            {!collapsed && (
              <div className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest mb-2 px-4">
                {t('SHOP')}
              </div>
            )}
            <button
              onClick={() => handleNavigation('/dashboard/admin/shops')}
              className={navItemClass(isActive('/dashboard/admin/shops'))}
              title={collapsed ? t('All Shops') : undefined}
            >
              <Store className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span>{t('All Shops')}</span>}
            </button>
          </div>

          {/* USER Section */}
          <div className="space-y-1">
            {!collapsed && (
              <div className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest mb-2 px-4">
                {t('USER')}
              </div>
            )}
            <button
              onClick={() => handleNavigation('/dashboard/admin/users/providers')}
              className={navItemClass(isActive('/dashboard/admin/users/providers'))}
              title={collapsed ? t('Providers') : undefined}
            >
              <Briefcase className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span>{t('Providers')}</span>}
            </button>
            <button
              onClick={() => handleNavigation('/dashboard/admin/users/handymen')}
              className={navItemClass(isActive('/dashboard/admin/users/handymen'))}
              title={collapsed ? t('Handymen') : undefined}
            >
              <Hammer className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span>{t('Handymen')}</span>}
            </button>
            <button
              onClick={() => handleNavigation('/dashboard/admin/users/customers')}
              className={navItemClass(isActive('/dashboard/admin/users/customers'))}
              title={collapsed ? t('Customers') : undefined}
            >
              <Users className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span>{t('Customers')}</span>}
            </button>
          </div>

          {/* TRANSACTIONS Section */}
          <div className="space-y-1">
            {!collapsed && (
              <div className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest mb-2 px-4">
                {t('TRANSACTIONS')}
              </div>
            )}
            <button
              onClick={() => handleNavigation('/dashboard/finance')}
              className={navItemClass(isActive('/dashboard/finance'))}
              title={collapsed ? t('Finance') : undefined}
            >
              <DollarSign className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span>{t('Finance')}</span>}
            </button>
            <button
              onClick={() => handleNavigation('/dashboard/admin/promotions/coupons/list')}
              className={navItemClass(isActive('/dashboard/admin/promotions/coupons/list'))}
              title={collapsed ? t('Coupons') : undefined}
            >
              <Tag className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span>{t('Coupons')}</span>}
            </button>
          </div>

          {/* SETTINGS Section */}
          <div className="space-y-1">
            {!collapsed && (
              <div className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest mb-2 px-4">
                {t('SETTINGS')}
              </div>
            )}
            <button
              onClick={() => handleNavigation('/dashboard/admin/system/settings')}
              className={navItemClass(isActive('/dashboard/admin/system/settings'))}
              title={collapsed ? t('Settings') : undefined}
            >
              <Settings className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span>{t('Settings')}</span>}
            </button>
          </div>
        </nav>

        {/* Footer Toggle Button */}
        <div className="hidden lg:flex px-3 py-3 border-t border-zinc-800/60">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center h-9 rounded-xl text-zinc-500 hover:text-[#C4D92E] hover:bg-[#2D3319]/55 transition-all duration-200"
          >
            {collapsed ? (
              language === 'ar' ? <ChevronLeft className="w-4.5 h-4.5" /> : <ChevronRight className="w-4.5 h-4.5" />
            ) : (
              language === 'ar' ? <ChevronRight className="w-4.5 h-4.5" /> : <ChevronLeft className="w-4.5 h-4.5" />
            )}
          </button>
        </div>

        {/* Footer Profile Plate */}
        <div className={`p-3 border-t border-zinc-800/60 ${collapsed ? 'flex justify-center' : ''}`}>
          {collapsed ? (
            <button
              onClick={handleLogout}
              title={t('Logout')}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          ) : (
            <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/50 border border-zinc-800/40">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#2D3319] text-[#C4D92E] flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                  SA
                </div>
                <div className="flex flex-col min-w-0 leading-tight">
                  <span className="text-xs font-semibold text-white truncate">
                    {t('System Admin')}
                  </span>
                  <span className="text-[9.5px] text-zinc-500 truncate mt-0.5">
                    {user?.email || 'admin@handyman.com'}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title={t('Logout')}
                className="text-zinc-500 hover:text-red-400 transition-colors duration-200 flex-shrink-0 ml-1.5"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
