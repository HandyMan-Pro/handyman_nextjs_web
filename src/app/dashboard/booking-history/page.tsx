'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/apiClient';
import {
  Clock, Calendar, Wrench, IndianRupee, MapPin, Star,
  RefreshCw, X, Loader2, MessageSquare, CheckCircle
} from 'lucide-react';

interface Booking {
  id: string;
  service_id?: string;
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
}

export default function BookingHistoryPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Review Modal State
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitLoading, setReviewSubmitLoading] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/booking-list');
      const list = res.data?.data || [];
      // Filter inactive/history bookings
      const history = list.filter((b: Booking) =>
        ['completed', 'cancelled', 'rejected', 'failed'].includes(
          (b.status || '').toLowerCase()
        )
      );
      setBookings(history);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch history.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReview = (booking: Booking) => {
    setSelectedBooking(booking);
    setReviewRating(5);
    setReviewComment('');
    setIsReviewModalOpen(true);
  };

  const handleCloseReview = () => {
    setSelectedBooking(null);
    setIsReviewModalOpen(false);
    setSuccessMsg('');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    
    // In case service_id is missing, default to a placeholder or locate from a service.
    const serviceId = selectedBooking.service_id || '654321098765432109876543'; // Fallback valid ObjectId

    setReviewSubmitLoading(true);
    setError('');

    try {
      await apiClient.post('/reviews', {
        service_id: serviceId,
        booking_id: selectedBooking.id,
        rating: Number(reviewRating),
        comment: reviewComment
      });
      setSuccessMsg('Thank you! Your review has been submitted.');
      setTimeout(() => {
        handleCloseReview();
      }, 2500);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to submit review.');
    } finally {
      setReviewSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            <Clock className="w-6 h-6 text-indigo-500" />
            Booking History
          </h1>
          <p className="text-zinc-400 text-sm mt-0.5 font-medium">Review your past bookings, invoices, and rate completed services.</p>
        </div>
        <button
          onClick={fetchHistory}
          className="flex items-center justify-center gap-2 h-10 px-4 bg-zinc-900 border border-zinc-800 text-zinc-350 hover:text-white rounded-xl transition-all"
        >
          <RefreshCw className="w-4 h-4 text-indigo-400" />
          Refresh
        </button>
      </div>

      {successMsg && !isReviewModalOpen && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-4 py-3 text-sm animate-fade-in">
          {successMsg}
        </div>
      )}

      {error && !isReviewModalOpen && (
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
                  <span className="bg-zinc-800 text-zinc-400 border border-zinc-700/30 px-2.5 py-0.5 rounded-lg text-xs font-semibold uppercase tracking-wider">
                    {b.service_name}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    b.status.toLowerCase() === 'completed'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    {b.status_label || b.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-6 text-xs text-zinc-450">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    <span>{b.date} ({b.booking_slot || 'ASAP'})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-indigo-400" />
                    <span>Partner: <strong className="text-zinc-300 font-semibold">{b.provider_name || 'Handyman Service'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-indigo-400" />
                    <span>{b.address || 'Saved Address'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 border-zinc-850 pt-4 lg:pt-0">
                <div className="text-left lg:text-right space-y-0.5">
                  <span className="text-xs text-zinc-550 block uppercase tracking-wider font-semibold">Total Paid</span>
                  <span className="text-lg font-bold text-zinc-350 flex items-center gap-0.5 lg:justify-end">
                    <IndianRupee className="w-4 h-4 text-indigo-400" />
                    {(b.total_amount || b.amount).toLocaleString('en-IN')}
                  </span>
                </div>

                {b.status.toLowerCase() === 'completed' && (
                  <button
                    onClick={() => handleOpenReview(b)}
                    className="h-10 px-4 bg-indigo-950/20 hover:bg-indigo-900/30 border border-indigo-900/30 hover:border-indigo-900/60 text-indigo-400 hover:text-indigo-300 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Rate Service
                  </button>
                )}
              </div>
            </div>
          ))}

          {bookings.length === 0 && (
            <div className="py-16 text-center bg-zinc-900/20 border border-zinc-800/40 rounded-2xl space-y-2">
              <Clock className="w-10 h-10 text-zinc-655 mx-auto" />
              <p className="text-zinc-500 text-sm font-medium">You have no booking history records.</p>
            </div>
          )}
        </div>
      )}

      {/* Star Rating Dialog Modal */}
      {isReviewModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={handleCloseReview} />
          
          <div className="relative z-10 w-full max-w-md bg-zinc-900 border border-zinc-800/80 rounded-2xl p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-450/20" />
                  Rate and Review Service
                </h3>
                <p className="text-xs text-zinc-450 mt-0.5">Booking: {selectedBooking.service_name}</p>
              </div>
              <button onClick={handleCloseReview} className="text-zinc-450 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {successMsg ? (
              <div className="py-8 text-center space-y-3 animate-fade-in">
                <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-zinc-200">{successMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                {error && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-4 py-2.5 text-xs">
                    {error}
                  </div>
                )}

                {/* Star selection */}
                <div className="space-y-1.5 text-center">
                  <label className="text-xs font-semibold text-zinc-455 uppercase tracking-wider block">Rating Star</label>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="text-2xl transition-all duration-150 hover:scale-110"
                      >
                        <Star className={`w-8 h-8 ${
                          star <= reviewRating ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'
                        }`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment box */}
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">Review Message</label>
                  <textarea
                    rows={3}
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Tell us about your experience with the partner..."
                    className="w-full p-3 bg-zinc-850/60 border border-zinc-800/80 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-650 focus:outline-none focus:ring-1 focus:ring-indigo-500/60 resize-none"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={handleCloseReview}
                    className="flex-1 h-11 bg-zinc-850 hover:bg-zinc-800 text-zinc-350 font-semibold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reviewSubmitLoading}
                    className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-indigo-650/15"
                  >
                    {reviewSubmitLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Submit Review
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
