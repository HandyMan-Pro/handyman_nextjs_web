'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { apiClient } from '../../../../lib/apiClient';
import { Star, ArrowLeft, ArrowRight, MessageSquare, AlertCircle, RefreshCw } from 'lucide-react';

const fetcher = (url: string) => apiClient.get(url).then(res => res.data);

export default function HandymanReviewsPage() {
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState(0);
  const limit = 6;
  const skip = page * limit;

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: reviews, error, isLoading, mutate } = useSWR(
    mounted ? `/handyman/reviews?skip=${skip}&limit=${limit}` : null,
    fetcher,
    { revalidateOnFocus: true }
  );

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

  // Calculate overall statistics if we have reviews
  const totalReviews = reviews?.length || 0;
  const averageRating = totalReviews > 0
    ? (reviews.reduce((acc: number, item: any) => acc + (item.rating || 0), 0) / totalReviews).toFixed(1)
    : '0.0';

  return (
    <div className="w-full min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans select-none antialiased">
      <div className="w-full h-full p-6 lg:p-8 flex flex-col gap-6">
        
        {/* Header */}
        <header className="flex justify-between items-center w-full pb-4 border-b border-zinc-900/60">
          <div>
            <p className="text-[11px] text-indigo-400 font-semibold uppercase tracking-wider">Reputation & Feedback</p>
            <h2 className="text-2xl font-bold text-white tracking-tight">Customer Reviews</h2>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleRefresh}
              className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800/80 flex items-center justify-center text-zinc-400 hover:text-white transition-all active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
          </div>
        </header>

        {/* Stats Overview */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800/80 rounded-2xl p-6 flex flex-col gap-1.5 shadow-md">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Average Rating</span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-white">{averageRating}</span>
              <span className="text-sm font-semibold text-zinc-400">/ 5.0</span>
            </div>
            <div className="flex gap-0.5 mt-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(parseFloat(averageRating))
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-zinc-700'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800/80 rounded-2xl p-6 flex flex-col gap-1.5 shadow-md">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Reviewed Sessions</span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-white">{totalReviews}</span>
              <span className="text-sm font-semibold text-zinc-400">responses this page</span>
            </div>
            <p className="text-xs text-zinc-500 mt-2 font-medium">Ratings collected from completed booking workflows.</p>
          </div>

          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800/80 rounded-2xl p-6 flex flex-col gap-1.5 shadow-md">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Satisfaction Rate</span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-white">
                {totalReviews > 0
                  ? ((reviews.filter((r: any) => r.rating >= 4).length / totalReviews) * 100).toFixed(0)
                  : '0'}%
              </span>
              <span className="text-sm font-semibold text-zinc-400">highly satisfied</span>
            </div>
            <p className="text-xs text-zinc-500 mt-2 font-medium">Percentage of reviews receiving 4 or 5 stars.</p>
          </div>
        </section>

        {/* Reviews List */}
        <main className="flex-1 min-h-[300px]">
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-zinc-900/60 border border-zinc-800/50 rounded-2xl animate-pulse" />
              ))}
            </div>
          )}

          {error && (
            <div className="p-12 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex flex-col items-center justify-center text-center gap-3">
              <AlertCircle className="w-10 h-10 text-rose-400" />
              <p className="text-sm text-rose-300 font-medium">Failed to load reviews: {error.message || 'Server connection error'}</p>
            </div>
          )}

          {!isLoading && !error && totalReviews === 0 && (
            <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/20 border border-zinc-850 border-dashed rounded-3xl text-center p-8 gap-4">
              <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800">
                <MessageSquare className="w-6 h-6 text-zinc-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">No reviews found</h3>
                <p className="text-sm text-zinc-400 mt-1 max-w-sm">Customers haven&apos;t left any feedback or ratings for your completed jobs yet.</p>
              </div>
            </div>
          )}

          {!isLoading && !error && totalReviews > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review: any) => (
                <div 
                  key={review.id} 
                  className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-850 hover:border-indigo-500/30 hover:shadow-indigo-500/5 transition-all duration-300 rounded-2xl p-6 flex flex-col justify-between gap-4 shadow-md"
                >
                  <div className="space-y-3">
                    {/* Customer Info & Stars */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        {review.customer?.avatar ? (
                          <img 
                            src={review.customer.avatar} 
                            alt={review.customer.name} 
                            className="w-10 h-10 rounded-full object-cover border border-zinc-800" 
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm shadow-sm border border-indigo-400/20">
                            {review.customer?.name?.charAt(0).toUpperCase() || 'C'}
                          </div>
                        )}
                        <div>
                          <h4 className="text-sm font-bold text-white tracking-tight">{review.customer?.name || 'Customer'}</h4>
                          <span className="text-[10px] text-indigo-400 font-semibold uppercase bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/15">
                            {review.service_name || 'General Service'}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < (review.rating || 0)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-zinc-800'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Review text */}
                    <p className="text-sm text-zinc-300 italic leading-relaxed font-normal pt-2">
                      &ldquo;{review.comment || review.text || 'No comment provided.'}&rdquo;
                    </p>
                  </div>

                  {/* Date */}
                  <div className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider pt-2 border-t border-zinc-900/60">
                    {review.created_at ? new Date(review.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    }) : 'Unknown Date'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Pagination controls */}
        {totalReviews > 0 && (
          <footer className="flex justify-between items-center w-full pt-4 border-t border-zinc-900/60">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                page === 0
                  ? 'border-zinc-900 text-zinc-600 bg-zinc-900/30 cursor-not-allowed'
                  : 'border-zinc-850 text-zinc-300 bg-zinc-900 hover:bg-zinc-850 active:scale-95'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Previous
            </button>
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Page {page + 1}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={totalReviews < limit}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                totalReviews < limit
                  ? 'border-zinc-900 text-zinc-600 bg-zinc-900/30 cursor-not-allowed'
                  : 'border-zinc-850 text-zinc-300 bg-zinc-900 hover:bg-zinc-850 active:scale-95'
              }`}
            >
              Next
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </footer>
        )}

      </div>
    </div>
  );
}
