'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { apiClient } from '../../../lib/apiClient';
import { getUserData } from '../../../lib/auth';
import {
  TrendingUp, Calendar, DollarSign, Hammer, Wrench, Clock,
  ArrowUpRight, User, RefreshCw, Briefcase, MessageSquare,
  Home, Bell, ChevronRight, CheckCircle2, AlertCircle, Sparkles
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const fetcher = (url: string) => apiClient.get(url).then(res => res.data);

export default function HandymanDashboard() {
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'bookings' | 'blogs' | 'profile'>('home');

  useEffect(() => {
    setMounted(true);
    setCurrentUser(getUserData());
  }, []);

  const { data, error, isLoading, mutate } = useSWR('/handyman/dashboard/summary', fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 10000 // refresh every 10s
  });

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = async () => {
    setRefreshing(true);
    await mutate();
    setRefreshing(false);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const dashboardData = data?.status ? data : null;

  return (
    <div className="w-full min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans select-none antialiased">
      {/* Mobile Frame Simulation Container */}
      <div className="w-full max-w-md mx-auto bg-zinc-950 min-h-screen flex flex-col shadow-2xl relative border-x border-zinc-900 pb-24">
        
        {/* Top Status Bar / Header */}
        <header className="px-5 pt-6 pb-4 flex items-center justify-between border-b border-zinc-900/60 sticky top-0 bg-zinc-950/80 backdrop-blur-md z-40">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-md border border-indigo-400/20">
                {currentUser?.display_name?.charAt(0).toUpperCase() || 'H'}
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-zinc-955 rounded-full shadow-lg shadow-emerald-500/20" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Welcome back</p>
              <h2 className="text-sm font-bold text-white tracking-tight truncate max-w-[150px]">
                {currentUser?.display_name || 'Handyman'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleRefresh}
              className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800/80 flex items-center justify-center text-zinc-400 hover:text-white transition-all active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
            <button className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800/80 flex items-center justify-center text-zinc-400 hover:text-white transition-all active:scale-95 relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-zinc-900" />
            </button>
          </div>
        </header>

        {/* Scrollable Dashboard View */}
        <main className="flex-1 px-5 pt-4 space-y-6 overflow-y-auto">
          
          {/* Dashboard Loading or Error States */}
          {isLoading && !dashboardData && (
            <div className="space-y-6">
              {/* Earnings card skeleton */}
              <div className="h-44 bg-zinc-900/60 border border-zinc-800/50 rounded-3xl animate-pulse" />
              {/* Grid skeleton */}
              <div className="grid grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 bg-zinc-900/60 border border-zinc-800/50 rounded-2xl animate-pulse" />
                ))}
              </div>
              {/* Chart skeleton */}
              <div className="h-64 bg-zinc-900/60 border border-zinc-800/50 rounded-3xl animate-pulse" />
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex flex-col items-center justify-center text-center gap-3">
              <AlertCircle className="w-8 h-8 text-rose-400" />
              <p className="text-xs text-rose-300 font-medium">Failed to load statistics: {error.message || 'Server connection error'}</p>
              <button 
                onClick={handleRefresh}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all active:scale-95"
              >
                Retry
              </button>
            </div>
          )}

          {/* Core Content */}
          {dashboardData && (
            <>
              {/* Hero Earning Card (iOS Style Glassmorphic Box) */}
              <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-3xl p-6 shadow-xl border border-indigo-500/20">
                <div className="absolute right-[-20px] top-[-20px] w-40 h-40 bg-white/5 rounded-full blur-3xl" />
                <div className="absolute left-[-20px] bottom-[-20px] w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />
                
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2 px-2.5 py-1 bg-white/10 rounded-full backdrop-blur-md border border-white/10">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span className="text-[10px] font-bold text-white tracking-wide uppercase">Today&apos;s Highlights</span>
                  </div>
                  <span className="text-[10px] text-indigo-200 font-semibold uppercase">Earnings</span>
                </div>

                <p className="text-zinc-200 text-xs font-medium">Today&apos;s Revenue</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-extrabold tracking-tight text-white">
                    ₹{(dashboardData.todays_earning || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  <div className="flex items-center gap-0.5 px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md text-[10px] font-bold">
                    <TrendingUp className="w-2.5 h-2.5" />
                    +12%
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-indigo-200 uppercase font-medium">Monthly Commission</p>
                    <p className="text-base font-bold text-white mt-0.5">
                      ₹{(dashboardData.monthly_earnings || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-indigo-200 uppercase font-medium">Total Bookings</p>
                    <p className="text-base font-bold text-white mt-0.5">{dashboardData.total_booking}</p>
                  </div>
                </div>
              </section>

              {/* 4-Grid Statistics */}
              <section className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-4 flex flex-col justify-between hover:border-zinc-700/60 transition-all duration-300 group">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <Clock className="w-4 h-4" />
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                  </div>
                  <div className="mt-4">
                    <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Today&apos;s Services</p>
                    <p className="text-2xl font-bold text-white mt-1">{dashboardData.todays_services}</p>
                  </div>
                </div>

                <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-4 flex flex-col justify-between hover:border-zinc-700/60 transition-all duration-300 group">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                  </div>
                  <div className="mt-4">
                    <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Upcoming Services</p>
                    <p className="text-2xl font-bold text-white mt-1">{dashboardData.upcoming_services}</p>
                  </div>
                </div>

                <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-4 flex flex-col justify-between hover:border-zinc-700/60 transition-all duration-300 group">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-xl bg-lime-500/10 border border-lime-500/20 flex items-center justify-center text-lime-400">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                  </div>
                  <div className="mt-4">
                    <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Total Tasks</p>
                    <p className="text-2xl font-bold text-white mt-1">{dashboardData.total_booking}</p>
                  </div>
                </div>

                <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-4 flex flex-col justify-between hover:border-zinc-700/60 transition-all duration-300 group">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="mt-4">
                    <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Work Status</p>
                    <p className="text-sm font-bold text-emerald-400 mt-1">Available</p>
                  </div>
                </div>
              </section>

              {/* Monthly Revenue Chart */}
              <section className="bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-5 backdrop-blur-md">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Monthly Revenue Trend</h3>
                    <p className="text-[10px] text-zinc-500">Overview of this calendar year&apos;s earnings</p>
                  </div>
                </div>

                <div className="w-full h-48 mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart 
                      data={dashboardData.monthly_revenue_chart} 
                      margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="handymanRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#5E5CE6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#5E5CE6" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1d1d21" vertical={false} />
                      <XAxis 
                        dataKey="month" 
                        stroke="#52525b" 
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="#52525b" 
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `₹${v}`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#09090b', 
                          borderColor: '#1d1d21',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '11px',
                        }}
                        formatter={(value) => [`₹${value}`, 'Earning']}
                        labelStyle={{ color: '#71717a', fontWeight: 'bold' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#5E5CE6" 
                        strokeWidth={2.5}
                        fillOpacity={1} 
                        fill="url(#handymanRevenue)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* Today's Schedule Overview List */}
              <section className="bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Scheduled Tasks Today</h3>
                  <span className="text-[10px] text-indigo-400 font-semibold hover:text-indigo-300 transition-colors flex items-center gap-0.5 cursor-pointer">
                    View Schedule <ChevronRight className="w-3 h-3" />
                  </span>
                </div>

                <div className="space-y-2.5">
                  {dashboardData.todays_services > 0 ? (
                    <div className="p-3.5 rounded-2xl bg-zinc-950/40 border border-zinc-800/60 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                          <Wrench className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">General Appliance Repair</p>
                          <p className="text-[10px] text-zinc-500 mt-0.5">Today at 2:00 PM</p>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                        Assigned
                      </span>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-xs text-zinc-500">No services scheduled for today.</p>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="absolute bottom-0 left-0 right-0 h-20 bg-zinc-950/90 backdrop-blur-lg border-t border-zinc-900 flex items-center justify-around px-4 z-40">
          {[
            { id: 'home', label: 'Home', icon: Home, path: '/dashboard/handyman' },
            { id: 'bookings', label: 'Bookings', icon: Calendar, path: '/dashboard/bookings' },
            { id: 'blogs', label: 'Blogs', icon: MessageSquare, path: '/dashboard/blogs' },
            { id: 'profile', label: 'Profile', icon: User, path: '/dashboard/profile' }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  window.location.href = tab.path;
                }}
                className="flex flex-col items-center justify-center gap-1.5 py-1 text-zinc-500 hover:text-zinc-300 transition-all"
              >
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-indigo-500/10 text-indigo-400 scale-110' : 'text-zinc-500'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-medium transition-all ${isActive ? 'text-indigo-400 font-bold' : 'text-zinc-500'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>

      </div>
    </div>
  );
}
