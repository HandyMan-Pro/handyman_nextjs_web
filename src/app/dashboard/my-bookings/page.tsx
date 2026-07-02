'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/apiClient';
import {
  CalendarCheck, Wrench, Clock, MapPin, IndianRupee,
  RefreshCw, X, Loader2, AlertCircle, ShieldAlert
} from 'lucide-react';

interface Booking {
  id: string;
  service_name: string;
  provider_name: string;
  handyman_name: string;
  status: string;
  status_label: string;
  date: string;
  booking_slot: string;
  amount: number;
  total_amount: number;
  address: string;
  payment_method: string;
  created_at?: string;
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Cancel action state
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/booking-list');
      const list = res.data?.data || [];
      // Filter only active / ongoing bookings
      const active = list.filter((b: Booking) =>
        ['pending', 'assigned', 'accepted', 'in progress', 'ongoing'].includes(
          (b.status || '').toLowerCase()
        )
      );
      setBookings(active);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to retrieve bookings.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking request?')) return;

    setCancellingId(id);
    setError('');
    try {
      await apiClient.post('/booking-update', {
        booking_id: id,
        status: 'Cancelled'
      });
      setSuccessMsg('Booking cancelled successfully!');
      fetchMyBookings();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to cancel the booking.');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-indigo-500" />
            My Bookings
          </h1>
          <p className="text-zinc-400 text-sm mt-0.5">Track your ongoing home service bookings and schedules.</p>
        </div>
        <button
          onClick={fetchMyBookings}
          className="flex items-center justify-center gap-2 h-10 px-4 bg-zinc-900 border border-zinc-800 text-zinc-350 hover:text-white rounded-xl transition-all"
        >
          <RefreshCw className="w-4 h-4 text-indigo-400" />
          Refresh
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-4 py-3 text-sm animate-fade-in">
          {successMsg}
        </div>
      )}

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-4 py-3 text-sm animate-fade-in flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-zinc-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-zinc-900/40 border border-zinc-850 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="bg-zinc-900/40 border border-zinc-800/60 p-5 rounded-2xl flex flex-col lg:flex-row justify-between lg:items-center gap-5 hover:border-zinc-700/40 transition-all duration-200"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider">
                    {b.service_name}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    b.status.toLowerCase() === 'pending'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                  }`}>
                    {b.status_label || b.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-6 text-xs text-zinc-400">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    <span>{b.date} ({b.booking_slot || 'ASAP'})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-indigo-400" />
                    <span>Provider: <strong className="text-zinc-300 font-semibold">{b.provider_name || 'Partner Assigned'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-indigo-400" />
                    <span>{b.address || 'Saved Address'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 border-zinc-850 pt-4 lg:pt-0">
                <div className="text-left lg:text-right space-y-0.5">
                  <span className="text-xs text-zinc-500 block uppercase tracking-wider font-semibold">Total Cost</span>
                  <span className="text-lg font-bold text-zinc-200 flex items-center gap-0.5 lg:justify-end">
                    <IndianRupee className="w-4 h-4 text-indigo-400" />
                    {(b.total_amount || b.amount).toLocaleString('en-IN')}
                  </span>
                </div>

                <button
                  onClick={() => handleCancelBooking(b.id)}
                  disabled={cancellingId === b.id}
                  className="h-10 px-4 bg-rose-950/20 hover:bg-rose-900/30 border border-rose-900/30 hover:border-rose-900/60 text-rose-400 hover:text-rose-300 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {cancellingId === b.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                  Cancel Booking
                </button>
              </div>
            </div>
          ))}

          {bookings.length === 0 && (
            <div className="py-16 text-center bg-zinc-900/20 border border-zinc-800/40 rounded-2xl space-y-2">
              <CalendarCheck className="w-10 h-10 text-zinc-655 mx-auto" />
              <p className="text-zinc-500 text-sm font-medium">You have no active bookings right now.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
