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
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCurrentUser(getUserData());
  }, []);

  useEffect(() => {
    if (mounted) {
      apiClient.get('/handyman/availability')
        .then(res => {
          if (res.data && res.data.status) {
            setIsAvailable(res.data.is_available);
          }
        })
        .catch(err => console.error("Error fetching availability:", err));
    }
  }, [mounted]);

  const handleToggleAvailability = async () => {
    const previous = isAvailable;
    setIsAvailable(!previous);
    try {
      await apiClient.put('/handyman/availability/toggle', { is_available: !previous });
    } catch (err) {
      console.error("Error toggling availability:", err);
      setIsAvailable(previous);
    }
  };

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
      {/* Full-width Desktop Container */}
      <div className="w-full h-full p-6 lg:p-8 flex flex-col gap-6">
        
        {/* Top Header */}
        <header className="flex justify-between items-center w-full pb-4 border-b border-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-md border border-indigo-400/20 text-lg">
                {currentUser?.display_name?.charAt(0).toUpperCase() || 'H'}
              </div>
              <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-zinc-950 rounded-full shadow-lg ${
                isAvailable ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-zinc-500 shadow-zinc-500/20'
              }`} />
            </div>
            <div>
              <p className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wider">Welcome back</p>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {currentUser?.display_name || 'Handyman'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Work Status Toggle Switch */}
            <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800/80 px-4 py-2 rounded-full mr-2">
              <span className="text-xs font-semibold text-zinc-400">
                Work Status: <span className={isAvailable ? "text-emerald-400 font-bold" : "text-zinc-500"}>{isAvailable ? "Online" : "Offline"}</span>
              </span>
              <button
                onClick={handleToggleAvailability}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isAvailable ? 'bg-emerald-500' : 'bg-zinc-850 border-zinc-700/60'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isAvailable ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <button 
              onClick={handleRefresh}
              className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800/80 flex items-center justify-center text-zinc-400 hover:text-white transition-all active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
            <button className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800/80 flex items-center justify-center text-zinc-400 hover:text-white transition-all active:scale-95 relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Scrollable Dashboard View */}
        <main className="flex-1 space-y-6">
          
          {/* Dashboard Loading or Error States */}
          {isLoading && !dashboardData && (
            <div className="space-y-6">
              {/* Earnings card skeleton */}
              <div className="h-44 bg-zinc-900/60 border border-zinc-800/50 rounded-3xl animate-pulse" />
              {/* Grid skeleton */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-28 bg-zinc-900/60 border border-zinc-800/50 rounded-2xl animate-pulse" />
                ))}
              </div>
              {/* Chart skeleton */}
              <div className="h-80 bg-zinc-900/60 border border-zinc-800/50 rounded-3xl animate-pulse" />
            </div>
          )}

          {error && (
            <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex flex-col items-center justify-center text-center gap-3">
              <AlertCircle className="w-10 h-10 text-rose-400" />
              <p className="text-sm text-rose-300 font-medium">Failed to load statistics: {error.message || 'Server connection error'}</p>
              <button 
                onClick={handleRefresh}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all active:scale-95"
              >
                Retry
              </button>
            </div>
          )}

          {/* Core Content */}
          {dashboardData && (
            <>
              {/* Hero Earning Card (Full-width responsive gradient card) */}
              <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-3xl p-6 shadow-xl border border-indigo-500/20 w-full">
                <div className="absolute right-[-20px] top-[-20px] w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                <div className="absolute left-[-20px] bottom-[-20px] w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
                
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full backdrop-blur-md border border-white/10">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span className="text-xs font-bold text-white tracking-wide uppercase">Today&apos;s Highlights</span>
                  </div>
                  <span className="text-xs text-indigo-200 font-semibold uppercase">Earnings Overview</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div>
                    <p className="text-zinc-200 text-sm font-medium">Today&apos;s Revenue</p>
                    <div className="flex items-baseline gap-3 mt-1">
                      <span className="text-5xl font-extrabold tracking-tight text-white">
                        ₹{(dashboardData.todays_earning || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                      <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold">
                        <TrendingUp className="w-3 h-3" />
                        +12%
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 md:border-l md:border-white/10 md:pl-8">
                    <div>
                      <p className="text-xs text-indigo-200 uppercase font-medium">Monthly Commission</p>
                      <p className="text-2xl font-bold text-white mt-1">
                        ₹{(dashboardData.monthly_earnings || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-indigo-200 uppercase font-medium">Total Bookings</p>
                      <p className="text-2xl font-bold text-white mt-1">{dashboardData.total_booking}</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* 4-Grid Statistics */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-5 flex flex-col justify-between hover:border-zinc-700/60 transition-all duration-300 group h-full w-full">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <Clock className="w-5 h-5" />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                  </div>
                  <div className="mt-6">
                    <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Today&apos;s Services</p>
                    <p className="text-3xl font-bold text-white mt-2">{dashboardData.todays_services}</p>
                  </div>
                </div>

                <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-5 flex flex-col justify-between hover:border-zinc-700/60 transition-all duration-300 group h-full w-full">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                  </div>
                  <div className="mt-6">
                    <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Upcoming Services</p>
                    <p className="text-3xl font-bold text-white mt-2">{dashboardData.upcoming_services}</p>
                  </div>
                </div>

                <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-5 flex flex-col justify-between hover:border-zinc-700/60 transition-all duration-300 group h-full w-full">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-lime-500/10 border border-lime-500/20 flex items-center justify-center text-lime-400">
                      <Wrench className="w-5 h-5" />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                  </div>
                  <div className="mt-6">
                    <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Total Tasks</p>
                    <p className="text-3xl font-bold text-white mt-2">{dashboardData.total_booking}</p>
                  </div>
                </div>

                <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-5 flex flex-col justify-between hover:border-zinc-700/60 transition-all duration-300 group h-full w-full">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isAvailable ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-zinc-800/40 border border-zinc-800/60 text-zinc-500'
                    }`}>
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <span className={`w-2.5 h-2.5 rounded-full ${isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`} />
                  </div>
                  <div className="mt-6">
                    <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Work Status</p>
                    <p className={`text-base font-bold mt-2 ${isAvailable ? 'text-emerald-400' : 'text-zinc-500'}`}>
                      {isAvailable ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
              </section>

              {/* Monthly Revenue Chart */}
              <section className="bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-6 backdrop-blur-md w-full">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Monthly Revenue Trend</h3>
                    <p className="text-xs text-zinc-500">Overview of this calendar year&apos;s earnings</p>
                  </div>
                </div>

                <div className="w-full h-80 mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart 
                      data={dashboardData.monthly_revenue_chart} 
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
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
                        stroke="#71717a" 
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="#71717a" 
                        fontSize={11}
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
                          fontSize: '12px',
                        }}
                        formatter={(value) => [`₹${value}`, 'Earning']}
                        labelStyle={{ color: '#a1a1aa', fontWeight: 'bold' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#5E5CE6" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#handymanRevenue)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* Today's Schedule Overview List */}
              <section className="bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-6 space-y-4 w-full">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Scheduled Tasks Today</h3>
                  <span className="text-xs text-indigo-400 font-semibold hover:text-indigo-300 transition-colors flex items-center gap-0.5 cursor-pointer">
                    View Schedule <ChevronRight className="w-4 h-4" />
                  </span>
                </div>

                <div className="space-y-3">
                  {dashboardData.todays_services > 0 ? (
                    <div className="p-4 rounded-2xl bg-zinc-950/40 border border-zinc-800/60 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                          <Wrench className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">General Appliance Repair</p>
                          <p className="text-xs text-zinc-500 mt-0.5">Today at 2:00 PM</p>
                        </div>
                      </div>
                      <span className="text-xs px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                        Assigned
                      </span>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm text-zinc-500">No services scheduled for today.</p>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}
        </main>

      </div>
    </div>
  );
}
