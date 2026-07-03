'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/apiClient';
import {
  Star, MessageCircle, Reply, Check, X, Search, RefreshCw,
  Loader2, User, Sparkles, TrendingUp, ThumbsUp, AlertCircle
} from 'lucide-react';

interface Review {
  id: string;
  customer_name: string;
  customer_image?: string;
  rating: number;
  comment: string;
  created_at: string;
  service_id: string;
  service_name?: string;
  booking_id?: string;
  reply?: string;
  replied_at?: string;
}

interface Service {
  id: string;
  name: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filtering / Search
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [replyFilter, setReplyFilter] = useState<string>('all'); // all | replied | pending

  // Reply Draft State
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    fetchReviewsAndServices();
  }, []);

  const fetchReviewsAndServices = async () => {
    setLoading(true);
    try {
      const [reviewsRes, servicesRes] = await Promise.all([
        apiClient.get('/reviews'),
        apiClient.get('/services')
      ]);

      const rawReviews = reviewsRes.data?.data || reviewsRes.data || [];
      const serviceList = servicesRes.data || [];
      
      // Map service names for cleaner display
      const mappedReviews = rawReviews.map((r: any) => {
        const s = serviceList.find((srv: Service) => srv.id === r.service_id);
        return {
          ...r,
          service_name: s ? s.name : 'General Maintenance'
        };
      });

      setReviews(mappedReviews);
      setServices(serviceList);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch customer reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleReplySubmit = async (reviewId: string) => {
    if (!replyText.trim()) return;

    setSubmittingReply(true);
    try {
      await apiClient.put(`/reviews/${reviewId}/reply`, {
        reply: replyText.trim()
      });

      // Update local state dynamically
      setReviews(prev => prev.map(r => {
        if (r.id === reviewId) {
          return {
            ...r,
            reply: replyText.trim(),
            replied_at: new Date().toISOString()
          };
        }
        return r;
      }));

      setSuccessMsg('Reply posted successfully!');
      setReplyText('');
      setReplyingReviewId(null);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  // Stats Calculations
  const averageRating = reviews.length > 0
    ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1))
    : 5.0;

  const totalReviews = reviews.length;
  const repliedReviews = reviews.filter(r => r.reply).length;
  const replyRate = totalReviews > 0
    ? Math.round((repliedReviews / totalReviews) * 100)
    : 100;

  // Rating breakdowns
  const getRatingCount = (stars: number) => reviews.filter(r => Math.round(r.rating) === stars).length;
  const ratingBreakdown = [5, 4, 3, 2, 1].map(stars => {
    const count = getRatingCount(stars);
    const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    return { stars, count, percentage };
  });

  // Filter logic
  const filteredReviews = reviews.filter(r => {
    const matchesSearch = (r.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.comment || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.service_name || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRating = ratingFilter === 'all' || Math.round(r.rating) === Number(ratingFilter);

    const matchesReply = replyFilter === 'all' ||
      (replyFilter === 'replied' && r.reply) ||
      (replyFilter === 'pending' && !r.reply);

    return matchesSearch && matchesRating && matchesReply;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customer Reviews</h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            Monitor client feedback, view aggregate ratings, and reply to customer testimonials.
          </p>
        </div>
        <button
          onClick={fetchReviewsAndServices}
          className="flex items-center justify-center gap-2 h-10 px-4 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Feedbacks
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-4 py-3 text-sm">
          {successMsg}
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-zinc-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats Cards & Rating Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Aggregate average card */}
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">Average Rating</span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-zinc-100">{averageRating}</span>
              <span className="text-zinc-500 text-sm">/ 5.0</span>
            </div>
            <div className="flex items-center gap-1 mt-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4.5 h-4.5 ${
                    i < Math.round(averageRating) ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-[10px] text-zinc-500 mt-4">Calculated from {totalReviews} reviews globally.</p>
        </div>

        {/* Reputation performance card */}
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">Response Rate</span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-zinc-100">{replyRate}%</span>
            </div>
            <p className="text-xs text-zinc-400 mt-2 font-medium">
              Replied to {repliedReviews} out of {totalReviews} total reviews.
            </p>
          </div>
          <div className="w-fit px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold uppercase tracking-widest mt-4">
            Reputation Score: High
          </div>
        </div>

        {/* Breakdown bar graph */}
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5 shadow-xl space-y-3">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">Rating Breakdown</span>
          <div className="space-y-2">
            {ratingBreakdown.map((b) => (
              <div key={b.stars} className="flex items-center gap-3 text-xs">
                <span className="w-10 font-medium text-zinc-400 flex items-center gap-1">
                  {b.stars} <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                </span>
                <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${b.percentage}%` }}
                  />
                </div>
                <span className="w-8 text-right text-zinc-500 font-mono">{b.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Review List Filter Hub */}
      <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-md">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reviews..."
            className="w-full h-10 pl-9 pr-4 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-zinc-300 placeholder:text-zinc-650 focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 w-full md:w-auto justify-end">
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="h-10 px-3 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-zinc-400 focus:outline-none"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>

          <select
            value={replyFilter}
            onChange={(e) => setReplyFilter(e.target.value)}
            className="h-10 px-3 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-zinc-400 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Reply</option>
            <option value="replied">Replied</option>
          </select>
        </div>
      </div>

      {/* Review List Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-36 bg-zinc-900/40 border border-zinc-855 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((r) => (
              <div
                key={r.id}
                className="bg-zinc-900/40 border border-zinc-800/70 p-5 rounded-2xl flex flex-col gap-4 shadow-md transition-all hover:border-zinc-700/50"
              >
                {/* Top header line */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/40 flex items-center justify-center font-bold text-zinc-400 text-sm shadow-inner">
                      {r.customer_name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-zinc-200">{r.customer_name}</h4>
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-medium mt-0.5">
                        <span>Booked:</span>
                        <span className="text-zinc-400">{r.service_name}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Rating display */}
                  <div className="flex items-center gap-4 self-start sm:self-auto">
                    <span className="text-[10px] text-zinc-500 font-medium">
                      {r.created_at ? new Date(r.created_at).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' }) : 'June 29, 2026'}
                    </span>
                    <div className="flex items-center gap-0.5 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{r.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                {/* Comment body */}
                <p className="text-xs text-zinc-350 leading-relaxed italic">
                  "{r.comment || 'No comment provided by the client.'}"
                </p>

                {/* Existing Reply or Reply Trigger */}
                {r.reply ? (
                  <div className="bg-zinc-950/40 border border-zinc-850 p-3.5 rounded-xl space-y-1.5 ml-4 sm:ml-8 relative overflow-hidden">
                    <div className="absolute top-0 bottom-0 left-0 w-[3px] bg-primary" />
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                      <Reply className="w-3.5 h-3.5 rotate-180" />
                      <span>Your Response</span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">{r.reply}</p>
                  </div>
                ) : replyingReviewId === r.id ? (
                  /* Reply input form */
                  <div className="bg-zinc-950/30 border border-zinc-850 rounded-xl p-3.5 space-y-3 ml-4 sm:ml-8">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your response to the customer..."
                      className="w-full h-20 p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-300 placeholder:text-zinc-650 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => { setReplyingReviewId(null); setReplyText(''); }}
                        className="h-8 px-3 border border-zinc-800 text-zinc-500 hover:text-zinc-300 rounded-lg text-[10px] font-bold transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleReplySubmit(r.id)}
                        disabled={submittingReply || !replyText.trim()}
                        className="h-8 px-4 bg-primary hover:bg-primary/95 text-white rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        {submittingReply && <Loader2 className="w-3 h-3 animate-spin" />}
                        Submit Reply
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Reply button trigger */
                  <button
                    onClick={() => setReplyingReviewId(r.id)}
                    className="w-fit flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 hover:text-primary uppercase tracking-wider transition-all ml-4 sm:ml-8"
                  >
                    <Reply className="w-3.5 h-3.5 rotate-180" />
                    <span>Reply to Review</span>
                  </button>
                )}
              </div>
            ))}

            {filteredReviews.length === 0 && (
              <div className="text-center py-20 bg-zinc-900/10 border border-zinc-850 rounded-2xl">
                <MessageCircle className="w-10 h-10 text-zinc-655 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-zinc-400">No matching reviews found</h4>
                <p className="text-zinc-500 text-xs mt-1">Try expanding your search query or filters.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
