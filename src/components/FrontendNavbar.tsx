'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Wrench, Phone, Globe, ChevronDown, Sun, Moon,
  LayoutDashboard, Calendar, Heart, MessageSquare, LogOut, X, User
} from 'lucide-react';

export default function FrontendNavbar() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showTopBanner, setShowTopBanner] = useState(true);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check auth
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user') || localStorage.getItem('user_data');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (e) {
        console.error(e);
      }
    }

    // Check theme
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setIsDarkMode(!isDarkMode);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_data');
    setCurrentUser(null);
    setIsAuthenticated(false);
    setShowProfileDropdown(false);
    router.push('/');
  };

  const isRegularUser = currentUser && currentUser.user_type !== 'admin' && currentUser.user_type !== 'demo_admin';

  return (
    <>
      {/* 1st Banner: Gold info */}
      {showTopBanner && (
        <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-zinc-950 text-[11px] md:text-xs font-semibold py-2 px-4 flex items-center justify-between select-none shadow-sm relative z-40 transition-all duration-300">
          <div className="flex-1 text-center">
            Welcome to our service! For more information, visit our About Us page.
          </div>
          <button 
            onClick={() => setShowTopBanner(false)}
            className="p-1 hover:bg-zinc-950/10 rounded-lg transition-colors cursor-pointer"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5 text-zinc-950" />
          </button>
        </div>
      )}

      {/* 2nd Bar: Purple info */}
      <div className="bg-slate-100 dark:bg-gradient-to-r dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 text-slate-600 dark:text-zinc-400 text-xs py-2 px-4 md:px-12 flex justify-between items-center select-none font-medium relative z-30 border-b border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <Phone className="w-3.5 h-3.5 text-indigo-400" />
          <span>+15265897485</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 cursor-pointer hover:text-indigo-600 dark:hover:text-white transition-colors">
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span>EN</span>
            <ChevronDown className="w-3 h-3 text-slate-400 dark:text-zinc-500" />
          </div>
        </div>
      </div>

      {/* 3rd Header: Main Navbar */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-white/80 dark:bg-zinc-900/80 border-b border-slate-100 dark:border-zinc-800/60 py-3.5 px-4 md:px-12 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => { router.push('/'); }}
          >
            <div className="bg-gradient-to-tr from-indigo-600 to-violet-500 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-600/20 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300 ease-out">
              <Wrench className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
              Handyman <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">Pro</span>
            </span>
          </div>

          {/* Menu Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-semibold text-slate-600 dark:text-zinc-300">
            <Link href="/" className="px-4 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200">Home</Link>
            <Link href="/categories" className="px-4 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200">Categories</Link>
            <Link href="/services" className="px-4 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200">Services</Link>
            <Link href="/#shops" className="px-4 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200">Shops</Link>
            <Link href="/#download" className="px-4 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200">App</Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4 relative">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme} 
              className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800/60 text-slate-500 hover:text-indigo-600 dark:text-zinc-450 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition-all duration-200 hover:scale-105"
              title="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400 fill-amber-400/20" /> : <Moon className="w-4 h-4 text-slate-700 fill-slate-700/20" />}
            </button>

            {/* Login/Profile Button */}
            {isAuthenticated && isRegularUser ? (
              <div className="relative">
                {/* Clickable Profile Button */}
                <button 
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 bg-slate-50 dark:bg-zinc-800/50 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200/60 dark:border-zinc-700/50 rounded-2xl hover:border-indigo-500/35 transition-all duration-200 select-none cursor-pointer"
                >
                  {currentUser?.profile_image ? (
                    <img 
                      src={currentUser.profile_image} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full object-cover border border-indigo-500/20" 
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      {currentUser?.first_name ? currentUser.first_name[0].toUpperCase() : currentUser?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="hidden sm:inline text-xs font-bold text-slate-700 dark:text-zinc-200 max-w-[100px] truncate">
                    {currentUser?.first_name || currentUser?.username}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 dark:text-zinc-450 transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Card */}
                {showProfileDropdown && (
                  <>
                    <div className="fixed inset-0 z-40 cursor-default" onClick={() => setShowProfileDropdown(false)} />
                    <div className="absolute right-0 mt-2.5 w-64 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/40 py-3.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 pb-3 flex items-center gap-3 border-b border-slate-100 dark:border-zinc-800/60">
                        {currentUser?.profile_image ? (
                          <img 
                            src={currentUser.profile_image} 
                            alt="Profile" 
                            className="w-10 h-10 rounded-full object-cover border border-indigo-500/30" 
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white flex items-center justify-center font-bold text-sm">
                            {currentUser?.first_name ? currentUser.first_name[0].toUpperCase() : currentUser?.username?.[0]?.toUpperCase() || 'U'}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate">
                            {currentUser?.first_name} {currentUser?.last_name || ''}
                          </h4>
                          <p className="text-[10px] text-slate-500 dark:text-zinc-550 truncate mb-1">
                            {currentUser?.email || currentUser?.username}
                          </p>
                          <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider border border-indigo-100/40 dark:border-indigo-900/30">
                            {currentUser?.user_type}
                          </span>
                        </div>
                      </div>

                      <div className="px-2 py-2 border-b border-slate-100 dark:border-zinc-800/60 flex flex-col gap-0.5">
                        {['admin', 'demo_admin', 'provider', 'handyman'].includes(currentUser?.user_type) && (
                          <button 
                            onClick={() => { setShowProfileDropdown(false); router.push('/dashboard'); }}
                            className="flex items-center gap-3 w-full px-3 py-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 dark:text-zinc-200 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/45 rounded-xl transition-colors text-left"
                          >
                            <LayoutDashboard className="w-4 h-4 text-slate-400" />
                            <span>Go to Dashboard</span>
                          </button>
                        )}
                        <button 
                          onClick={() => { setShowProfileDropdown(false); alert('My Bookings coming soon!'); }}
                          className="flex items-center gap-3 w-full px-3 py-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 dark:text-zinc-300 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/45 rounded-xl transition-colors text-left"
                        >
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>My Bookings</span>
                        </button>
                        <button 
                          onClick={() => { setShowProfileDropdown(false); alert('My Favorites coming soon!'); }}
                          className="flex items-center gap-3 w-full px-3 py-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 dark:text-zinc-300 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/45 rounded-xl transition-colors text-left"
                        >
                          <Heart className="w-4 h-4 text-slate-400" />
                          <span>My Favorites</span>
                        </button>
                        <button 
                          onClick={() => { setShowProfileDropdown(false); alert('Messages coming soon!'); }}
                          className="flex items-center gap-3 w-full px-3 py-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 dark:text-zinc-300 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/45 rounded-xl transition-colors text-left"
                        >
                          <MessageSquare className="w-4 h-4 text-slate-400" />
                          <span>Messages</span>
                        </button>
                      </div>

                      <div className="px-2 pt-2">
                        <button 
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-3 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button 
                onClick={() => router.push('/')}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold px-5 py-2.5 rounded-2xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
              >
                <User className="w-4 h-4 text-white/90" />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
