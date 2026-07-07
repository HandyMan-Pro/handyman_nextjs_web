'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { apiClient } from '../../../../lib/apiClient';
import { getUserData } from '../../../../lib/auth';
import {
  Calendar, Clock, DollarSign, User, MapPin, 
  CheckCircle2, ArrowLeft, RefreshCw, AlertCircle,
  TrendingUp, Activity, Inbox
} from 'lucide-react';
import Link from 'next/link';

const fetcher = (url: string) => apiClient.get(url).then(res => res.data);

type BookingStatus = 'All' | 'Ongoing' | 'Completed' | 'Cancelled';

export default function HandymanBookingsPage() {
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<BookingStatus>('All');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setCurrentUser(getUserData());
  }, []);

  // Fetch bookings with status filter
  const queryUrl = filterStatus === 'All' 
    ? '/handyman/bookings' 
    : `/handyman/bookings?status=${filterStatus}`;

  const { data: bookings = [], error, isLoading, mutate } = useSWR(
    mounted ? queryUrl : null,
    fetcher,
    { revalidateOnFocus: true }
  );

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = async () => {
    setRefreshing(true);
    await mutate();
    setRefreshing(false);
  };

  const handleMarkAsCompleted = async (bookingId: string) => {
    setUpdatingId(bookingId);
    try {
      // API call to update status
      await apiClient.put(`/handyman/bookings/${bookingId}/status`, { status: 'Completed' });
      // Optimistic mutate
      await mutate();
    } catch (err) {
      console.error('Failed to update booking status:', err);
      alert('Error updating status. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'ongoing' || s === 'pending' || s === 'accepted') {
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
    if (s === 'completed') {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
    return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  };

  return (
    <div className="w-full min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans select-none antialiased">
      {/* Full-width Desktop Container */}
      <div className="w-full h-full p-6 lg:p-8 flex flex-col gap-6">
        
        {/* Header section with back navigation */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full pb-4 border-b border-zinc-900/60">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link 
                href="/dashboard/handyman"
                className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1 text-xs font-semibold uppercase tracking-wider group"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                Back to Dashboard
              </Link>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Booking History</h2>
            <p className="text-xs text-zinc-500 mt-1">Manage and track your assigned services and completed tasks</p>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleRefresh}
              className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800/80 flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-all active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-indigo-400' : ''}`} />
              Refresh
            </button>
          </div>
        </header>

        {/* Filter Tabs */}
        <section className="flex flex-wrap gap-2 w-full">
          {(['All', 'Ongoing', 'Completed', 'Cancelled'] as BookingStatus[]).map((tab) => {
            const isActive = filterStatus === tab;
            return (
              <button
                key={tab}
                onClick={() => setFilterStatus(tab)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 active:scale-95 shadow-md ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-indigo-600/10 border border-indigo-500/40'
                    : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-850 hover:text-white border border-zinc-800/60'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </section>

        {/* Main Content Area */}
        <main className="flex-1 w-full">
          {isLoading ? (
            /* Skeleton Loading Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
              {[...Array(6)].map((_, i) => (
                <div 
                  key={i} 
                  className="h-[280px] bg-zinc-900/60 border border-zinc-800/50 rounded-3xl animate-pulse"
                />
              ))}
            </div>
          ) : error ? (
            <div className="p-8 bg-rose-500/10 border border-rose-500/20 rounded-3xl flex flex-col items-center justify-center text-center gap-3 w-full max-w-xl mx-auto mt-8">
              <AlertCircle className="w-12 h-12 text-rose-400" />
              <h3 className="font-bold text-white">Connection Error</h3>
              <p className="text-xs text-rose-300">Failed to load your booking history: {error.message || 'Server connection error'}</p>
              <button 
                onClick={handleRefresh}
                className="mt-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all active:scale-95"
              >
                Retry
              </button>
            </div>
          ) : bookings.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center text-center p-16 bg-zinc-900/20 border border-zinc-900/60 rounded-3xl w-full max-w-lg mx-auto mt-12 gap-4">
              <div className="w-16 h-16 rounded-full bg-zinc-900/80 border border-zinc-800/60 flex items-center justify-center text-zinc-500">
                <Inbox className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">No Bookings Found</h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-xs">There are no bookings matching the &quot;{filterStatus}&quot; status in your history.</p>
              </div>
            </div>
          ) : (
            /* Bookings Card Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
              {bookings.map((booking: any) => {
                const isOngoing = ['ongoing', 'pending', 'accepted'].includes(booking.status?.toLowerCase());
                return (
                  <div 
                    key={booking.id}
                    className="bg-zinc-900/40 border border-zinc-800/50 hover:border-zinc-700/50 rounded-3xl p-6 flex flex-col justify-between hover:shadow-xl hover:shadow-indigo-500/[0.01] transition-all duration-300 group relative overflow-hidden"
                  >
                    {/* Glowing highlight effect */}
                    <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Top Row: Service Name & Status Badge */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-4">
                        <h4 className="font-bold text-white text-base tracking-tight leading-snug group-hover:text-indigo-400 transition-colors line-clamp-2">
                          {booking.service?.name || booking.service_name || 'General Service'}
                        </h4>
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border ${getStatusColor(booking.status)} shrink-0`}>
                          {booking.status}
                        </span>
                      </div>

                      {/* Customer Info Box */}
                      <div className="flex items-center gap-3 p-3 bg-zinc-950/40 border border-zinc-900 rounded-2xl">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border border-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold shrink-0">
                          {booking.customer?.avatar ? (
                            <img 
                              src={booking.customer.avatar} 
                              alt={booking.customer.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-zinc-200 truncate">{booking.customer?.name || 'Customer'}</p>
                          <p className="text-[10px] text-zinc-500 truncate mt-0.5">{booking.customer?.email}</p>
                        </div>
                      </div>

                      {/* Location & Schedule info */}
                      <div className="space-y-2 mt-4 text-xs text-zinc-400">
                        {booking.customer?.address && (
                          <div className="flex items-start gap-2">
                            <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{booking.customer.address}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                          <span>{booking.booking_date || booking.date || 'Flexible schedule'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom: Price and Actions */}
                    <div className="mt-6 pt-4 border-t border-zinc-900/60 flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider">Service Fee</span>
                        <span className="text-lg font-extrabold text-white">
                          ₹{(booking.amount || booking.service?.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      {isOngoing && (
                        <button
                          onClick={() => handleMarkAsCompleted(booking.id)}
                          disabled={updatingId === booking.id}
                          className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 border border-indigo-400/20 shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20"
                        >
                          {updatingId === booking.id ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              Updating status...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Mark as Completed
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

      </div>
    </div>
  );
}
