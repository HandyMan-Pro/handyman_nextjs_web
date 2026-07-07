'use client';

import { useEffect, useState, useMemo } from 'react';
import useSWR from 'swr';
import { apiClient } from '../../../lib/apiClient';
import { getUserData } from '../../../lib/auth';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  Bell,
  AlertCircle,
  Filter,
  Check,
  Eye,
  TrendingUp,
  User,
  Wrench,
  Search,
  X
} from 'lucide-react';

const fetcher = (url: string) => apiClient.get(url).then(res => res.data);

type ViewType = 'month' | 'week' | 'day' | 'list';

interface Booking {
  id: string;
  service_name: string;
  customer_name: string;
  status: string;
  date: string;
  start_time: string;
  end_time: string;
  amount: number;
}

export default function HandymanDashboard() {
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState<ViewType>('month');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1. Initial mounting and user fetch
  useEffect(() => {
    setMounted(true);
    setCurrentUser(getUserData());
  }, []);

  // 2. Fetch handyman availability
  useEffect(() => {
    if (mounted) {
      apiClient.get('/handyman/availability')
        .then(res => {
          if (res.data && res.data.status) {
            setIsAvailable(res.data.is_available);
          }
        })
        .catch(err => console.error('Error fetching availability:', err));
    }
  }, [mounted]);

  // 3. Handle availability toggling
  const handleToggleAvailability = async () => {
    const previous = isAvailable;
    setIsAvailable(!previous);
    try {
      await apiClient.put('/handyman/availability/toggle', { is_available: !previous });
    } catch (err) {
      console.error('Error toggling availability:', err);
      setIsAvailable(previous);
    }
  };

  // 4. Date Range calculation for calendar API date filtering
  const range = useMemo(() => {
    let start = new Date(currentDate);
    let end = new Date(currentDate);

    if (currentView === 'month' || currentView === 'list') {
      const y = currentDate.getFullYear();
      const m = currentDate.getMonth();
      const firstDay = new Date(y, m, 1);
      const startDayOfWeek = firstDay.getDay();
      start = new Date(y, m, 1 - startDayOfWeek);

      const lastDay = new Date(y, m + 1, 0);
      const endDayOfWeek = lastDay.getDay();
      end = new Date(y, m + 1, 6 - endDayOfWeek);
    } else if (currentView === 'week') {
      const day = currentDate.getDay();
      start = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - day);
      end = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + (6 - day));
    } else if (currentView === 'day') {
      start = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      end = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    return {
      startStr: start.toISOString(),
      endStr: end.toISOString(),
      start,
      end
    };
  }, [currentDate, currentView]);

  // SWR dynamically fetches whenever the query parameters (startStr & endStr) change
  const { data, error, isLoading, mutate } = useSWR(
    mounted ? `/handyman/dashboard/calendar?start_date=${range.startStr}&end_date=${range.endStr}` : null,
    fetcher,
    {
      revalidateOnFocus: true,
      refreshInterval: 15000
    }
  );

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = async () => {
    setRefreshing(true);
    await mutate();
    setRefreshing(false);
  };

  // 5. Generate list of days for Month View grid
  const daysInMonthGrid = useMemo(() => {
    const days: Date[] = [];
    const curr = new Date(range.start);
    while (curr <= range.end) {
      days.push(new Date(curr));
      curr.setDate(curr.getDate() + 1);
    }
    return days;
  }, [range]);

  // 6. Navigation functions for toolbar
  const handlePrev = () => {
    const nextDate = new Date(currentDate);
    if (currentView === 'month' || currentView === 'list') {
      nextDate.setMonth(nextDate.getMonth() - 1);
    } else if (currentView === 'week') {
      nextDate.setDate(nextDate.getDate() - 7);
    } else if (currentView === 'day') {
      nextDate.setDate(nextDate.getDate() - 1);
    }
    setCurrentDate(nextDate);
  };

  const handleNext = () => {
    const nextDate = new Date(currentDate);
    if (currentView === 'month' || currentView === 'list') {
      nextDate.setMonth(nextDate.getMonth() + 1);
    } else if (currentView === 'week') {
      nextDate.setDate(nextDate.getDate() + 7);
    } else if (currentView === 'day') {
      nextDate.setDate(nextDate.getDate() + 1);
    }
    setCurrentDate(nextDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const monthYearLabel = useMemo(() => {
    return currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  }, [currentDate]);

  // 7. Filter and search bookings returned from backend
  const filteredBookingsList = useMemo(() => {
    if (!data?.bookings) return [];
    return data.bookings.filter((b: Booking) => {
      const matchesStatus = statusFilter === 'all' || b.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesSearch = b.service_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            b.customer_name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [data?.bookings, statusFilter, searchQuery]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const stats = data?.stats || {
    total_booking: 0,
    complete_booking: 0,
    remaining_payout: 0,
    total_revenue: 0
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'ongoing':
      case 'accepted':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'pending':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-zinc-800 text-zinc-400 border-zinc-700/60';
    }
  };

  return (
    <div className="w-full min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans select-none antialiased">
      <div className="w-full h-full p-6 lg:p-8 flex flex-col gap-6 max-w-7xl mx-auto">
        
        {/* TOP HEADER ROW */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full pb-6 border-b border-zinc-900/60 gap-4">
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

          <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-start">
            {/* Availability Toggle */}
            <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800/80 px-4 py-2 rounded-full">
              <span className="text-xs font-semibold text-zinc-400">
                Work Status: <span className={isAvailable ? "text-emerald-400 font-bold" : "text-zinc-500"}>{isAvailable ? "Online" : "Offline"}</span>
              </span>
              <button
                onClick={handleToggleAvailability}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isAvailable ? 'bg-emerald-500' : 'bg-zinc-800 border-zinc-700/60'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isAvailable ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center gap-2">
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
          </div>
        </header>

        {/* 4-CARD STATISTICS SUMMARY ROW */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          
          {/* Total Bookings Card */}
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5 flex items-center justify-between hover:border-zinc-700/50 transition-all duration-300 group">
            <div>
              <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Total Bookings</p>
              <h3 className="text-3xl font-extrabold text-white mt-2 tracking-tight">
                {stats.total_booking}
              </h3>
              <p className="text-[11px] text-zinc-600 mt-1">All-time bookings assigned</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform duration-300">
              <Wrench className="w-6 h-6" />
            </div>
          </div>

          {/* Completed Bookings Card */}
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5 flex items-center justify-between hover:border-zinc-700/50 transition-all duration-300 group">
            <div>
              <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Completed Tasks</p>
              <h3 className="text-3xl font-extrabold text-white mt-2 tracking-tight">
                {stats.complete_booking}
              </h3>
              <p className="text-[11px] text-zinc-600 mt-1">Success rate: {stats.total_booking ? Math.round((stats.complete_booking / stats.total_booking) * 100) : 0}%</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform duration-300">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          {/* Remaining Payout Card */}
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5 flex items-center justify-between hover:border-zinc-700/50 transition-all duration-300 group">
            <div>
              <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Remaining Payout</p>
              <h3 className="text-3xl font-extrabold text-amber-400 mt-2 tracking-tight">
                ₹{(stats.remaining_payout || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-[11px] text-zinc-600 mt-1">Awaiting bank settlement</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform duration-300">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          {/* Total Revenue Card */}
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5 flex items-center justify-between hover:border-zinc-700/50 transition-all duration-300 group">
            <div>
              <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Total Revenue</p>
              <h3 className="text-3xl font-extrabold text-indigo-400 mt-2 tracking-tight">
                ₹{(stats.total_revenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-[11px] text-zinc-600 mt-1">Total handyman earnings</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform duration-300">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

        </section>

        {/* INTERACTIVE CALENDAR & TASK BOARD */}
        <section className="bg-zinc-900/30 border border-zinc-900 rounded-3xl p-6 backdrop-blur-md w-full flex flex-col gap-6">
          
          {/* CALENDAR TOOLBAR / HEADER */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-zinc-900">
            {/* Left Nav */}
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-white tracking-tight min-w-[150px]">
                {monthYearLabel}
              </h3>
              <div className="flex items-center bg-zinc-950 border border-zinc-800/80 rounded-xl p-1 shadow-inner">
                <button
                  onClick={handlePrev}
                  className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900/80 active:scale-95 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleToday}
                  className="px-3 py-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 rounded-lg hover:bg-zinc-900/80 active:scale-95 transition-all mx-1"
                >
                  Today
                </button>
                <button
                  onClick={handleNext}
                  className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900/80 active:scale-95 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter & View Switchers */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between sm:justify-start">
              {/* Search Box */}
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 w-full sm:w-48 bg-zinc-950 border border-zinc-800/80 rounded-xl text-xs text-zinc-200 placeholder-zinc-650 focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
              </div>

              {/* Status Filter Dropdown */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 bg-zinc-950 border border-zinc-800/80 rounded-xl text-xs font-semibold text-zinc-300 focus:outline-none focus:border-indigo-500/50 cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted / Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
                <Filter className="absolute right-3 top-3 w-3 h-3 text-zinc-500 pointer-events-none" />
              </div>

              {/* View Options Tabs */}
              <div className="flex bg-zinc-950 border border-zinc-800/80 rounded-xl p-1 shadow-inner">
                {(['month', 'week', 'day', 'list'] as ViewType[]).map((v) => (
                  <button
                    key={v}
                    onClick={() => setCurrentView(v)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${
                      currentView === v
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* MAIN CALENDAR GRID CANVAS */}
          <div className="w-full min-h-[450px]">
            {isLoading && (
              <div className="w-full h-[450px] bg-zinc-950/20 border border-zinc-900 rounded-2xl flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
              </div>
            )}

            {!isLoading && (
              <>
                {/* 1. MONTH VIEW */}
                {currentView === 'month' && (
                  <div className="grid grid-cols-7 gap-px bg-zinc-900/40 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl">
                    {/* Headers */}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                      <div key={d} className="bg-zinc-950/80 py-3 text-center text-xs font-bold text-zinc-400 border-b border-zinc-800/60">
                        {d}
                      </div>
                    ))}
                    {/* Grid Days */}
                    {daysInMonthGrid.map((day, idx) => {
                      const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                      const isToday = day.toDateString() === new Date().toDateString();
                      
                      // Filter bookings on this specific day
                      const dayBookings = filteredBookingsList.filter((b: Booking) => {
                        const bDate = new Date(b.date);
                        return bDate.getFullYear() === day.getFullYear() &&
                               bDate.getMonth() === day.getMonth() &&
                               bDate.getDate() === day.getDate();
                      });

                      return (
                        <div
                          key={idx}
                          className={`min-h-[100px] p-2 bg-zinc-950/20 border-b border-r border-zinc-800/40 flex flex-col justify-between hover:bg-zinc-900/40 transition-colors group relative ${
                            !isCurrentMonth ? 'opacity-40' : ''
                          }`}
                        >
                          {/* Day Number */}
                          <div className="flex justify-between items-center mb-1">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              isToday
                                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                                : 'text-zinc-400 group-hover:text-white'
                            }`}>
                              {day.getDate()}
                            </span>
                            {dayBookings.length > 0 && (
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            )}
                          </div>

                          {/* Day Events stack */}
                          <div className="flex-1 flex flex-col gap-1.5 mt-1 overflow-y-auto max-h-[80px]">
                            {dayBookings.slice(0, 2).map((b: Booking) => (
                              <div
                                key={b.id}
                                onClick={() => setSelectedBooking(b)}
                                className={`text-[10px] px-2 py-1 rounded-md border font-medium truncate cursor-pointer transition-all hover:scale-[1.02] shadow-sm ${getStatusColor(b.status)}`}
                              >
                                {b.service_name}
                              </div>
                            ))}
                            {dayBookings.length > 2 && (
                              <div 
                                onClick={() => {
                                  setCurrentDate(day);
                                  setCurrentView('day');
                                }}
                                className="text-[9px] text-zinc-500 font-bold text-center py-0.5 hover:text-indigo-400 cursor-pointer"
                              >
                                +{dayBookings.length - 2} more
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 2. WEEK VIEW */}
                {currentView === 'week' && (
                  <div className="grid grid-cols-7 gap-4">
                    {Array.from({ length: 7 }).map((_, i) => {
                      const day = new Date(range.start);
                      day.setDate(day.getDate() + i);
                      const isToday = day.toDateString() === new Date().toDateString();
                      
                      const dayBookings = filteredBookingsList.filter((b: Booking) => {
                        const bDate = new Date(b.date);
                        return bDate.getFullYear() === day.getFullYear() &&
                               bDate.getMonth() === day.getMonth() &&
                               bDate.getDate() === day.getDate();
                      });

                      return (
                        <div key={i} className="flex flex-col gap-3 min-h-[300px] bg-zinc-950/20 border border-zinc-800/80 rounded-2xl p-3 hover:border-zinc-700/40 transition-colors">
                          <div className="text-center pb-2 border-b border-zinc-800/60">
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                              {day.toLocaleDateString('default', { weekday: 'short' })}
                            </p>
                            <p className={`text-base font-extrabold mt-1 mx-auto w-7 h-7 rounded-full flex items-center justify-center ${
                              isToday ? 'bg-indigo-600 text-white shadow shadow-indigo-600/20' : 'text-zinc-300'
                            }`}>
                              {day.getDate()}
                            </p>
                          </div>

                          <div className="flex flex-col gap-2 overflow-y-auto max-h-[320px]">
                            {dayBookings.length > 0 ? (
                              dayBookings.map((b: Booking) => (
                                <div
                                  key={b.id}
                                  onClick={() => setSelectedBooking(b)}
                                  className={`p-2.5 rounded-xl border flex flex-col gap-1 cursor-pointer transition-all hover:scale-[1.02] shadow-md ${getStatusColor(b.status)}`}
                                >
                                  <p className="text-xs font-bold truncate">{b.service_name}</p>
                                  <div className="flex items-center gap-1 text-[9px] opacity-80 mt-0.5">
                                    <Clock className="w-2.5 h-2.5" />
                                    <span>{b.start_time}</span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-[10px] text-zinc-600 text-center py-8">Free</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 3. DAY VIEW */}
                {currentView === 'day' && (
                  <div className="max-w-2xl mx-auto flex flex-col gap-4">
                    <div className="flex justify-between items-center bg-zinc-950/40 border border-zinc-850 p-4 rounded-2xl">
                      <div>
                        <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Schedule for</p>
                        <h4 className="text-base font-bold text-white mt-1">
                          {currentDate.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        </h4>
                      </div>
                      <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3.5 py-1.5 rounded-xl font-bold">
                        {filteredBookingsList.length} Tasks
                      </span>
                    </div>

                    <div className="flex flex-col gap-3">
                      {filteredBookingsList.length > 0 ? (
                        filteredBookingsList.map((b: Booking) => (
                          <div
                            key={b.id}
                            onClick={() => setSelectedBooking(b)}
                            className="bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700/60 p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] shadow-lg group"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                                <Wrench className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                                  {b.service_name}
                                </h4>
                                <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-zinc-600" />
                                    {b.start_time} - {b.end_time}
                                  </span>
                                  <span>•</span>
                                  <span>Cust: {b.customer_name}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-sm font-bold text-white">₹{b.amount}</p>
                                <p className="text-[10px] text-zinc-500">Earnings</p>
                              </div>
                              <span className={`text-[10px] px-2.5 py-1 rounded-lg border font-bold ${getStatusColor(b.status)}`}>
                                {b.status}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="bg-zinc-950/20 border border-zinc-900 rounded-2xl py-16 text-center">
                          <CalendarIcon className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                          <p className="text-sm text-zinc-500 font-medium">No bookings scheduled for this day.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. LIST VIEW */}
                {currentView === 'list' && (
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center bg-zinc-950/20 px-4 py-2 border-b border-zinc-900">
                      <span className="text-xs font-bold text-zinc-500">Service Task</span>
                      <div className="flex gap-16 text-xs font-bold text-zinc-500 pr-12">
                        <span>Earnings</span>
                        <span>Status</span>
                      </div>
                    </div>
                    {filteredBookingsList.length > 0 ? (
                      filteredBookingsList.map((b: Booking) => (
                        <div
                          key={b.id}
                          onClick={() => setSelectedBooking(b)}
                          className="bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-750 p-4 rounded-xl flex items-center justify-between cursor-pointer transition-all hover:translate-x-1"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
                              <CalendarIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white">{b.service_name}</p>
                              <p className="text-[10px] text-zinc-500 mt-0.5">
                                {new Date(b.date).toLocaleDateString()} at {b.start_time} • Customer: {b.customer_name}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-12 pr-4">
                            <span className="text-xs font-bold text-white">₹{b.amount}</span>
                            <span className={`text-[9px] px-2 py-0.5 rounded border font-bold ${getStatusColor(b.status)}`}>
                              {b.status}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-zinc-950/20 border border-zinc-900 rounded-2xl py-16 text-center">
                        <p className="text-sm text-zinc-500">No matching bookings found for this period.</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>

      {/* FLOAT OVERLAY MODAL FOR DETAIL VIEW */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
          <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-zinc-850">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Booking Details</span>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 rounded-full bg-zinc-950 border border-zinc-800/60 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex flex-col gap-6">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Service Requested</span>
                <h4 className="text-lg font-bold text-white mt-1">{selectedBooking.service_name}</h4>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Scheduled Date</span>
                  <p className="text-xs font-semibold text-zinc-200 mt-1">
                    {new Date(selectedBooking.date).toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Time Slot</span>
                  <p className="text-xs font-semibold text-zinc-200 mt-1">
                    {selectedBooking.start_time} - {selectedBooking.end_time}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Customer Name</span>
                  <p className="text-xs font-semibold text-zinc-200 mt-1">{selectedBooking.customer_name}</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Handyman Earning</span>
                  <p className="text-sm font-extrabold text-indigo-400 mt-1">₹{selectedBooking.amount}</p>
                </div>
              </div>

              <div className="flex items-center justify-between bg-zinc-950 p-4 rounded-xl border border-zinc-850">
                <span className="text-xs text-zinc-400 font-semibold">Booking Status</span>
                <span className={`text-[10px] px-3 py-1 rounded-lg border font-bold uppercase tracking-wider ${getStatusColor(selectedBooking.status)}`}>
                  {selectedBooking.status}
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-zinc-950 p-4 border-t border-zinc-850 flex justify-end gap-3">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-zinc-300 rounded-xl text-xs font-bold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
