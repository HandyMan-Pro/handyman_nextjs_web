'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../../../lib/apiClient';
import {
  Star, Trash2, Loader2, AlertCircle, Search, ShieldAlert, ChevronLeft, ChevronRight
} from 'lucide-react';

interface UserInfo {
  name: string;
  email: string;
  avatar: string;
}

interface HandymanRating {
  id: string;
  handyman_id: string;
  customer_id: string;
  rating: number;
  comment: string;
  created_at: string;
  handyman: UserInfo;
  customer: UserInfo;
}

const swrCache: { [key: string]: any } = {};

function useSimpleSWR<T>(key: string | null, fetcher: (url: string) => Promise<T>) {
  const [data, setData] = useState<T | undefined>(key ? swrCache[key] : undefined);
  const [error, setError] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(!data);

  useEffect(() => {
    if (!key) return;
    let active = true;
    setIsLoading(true);
    fetcher(key)
      .then((res) => {
        if (active) {
          swrCache[key] = res;
          setData(res);
          setError(null);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err);
          setIsLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [key, fetcher]);

  return { data, setData, error, isLoading };
}

export default function HandymanRatingsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const ratingsFetcher = useCallback(async (url: string) => {
    const res = await apiClient.get(url);
    return res.data as HandymanRating[];
  }, []);

  const { data: ratings = [], setData: setRatings, error: fetchError, isLoading } = useSimpleSWR<HandymanRating[]>(
    '/admin/ratings/handymen',
    ratingsFetcher
  );

  // Filter ratings by search query
  const filteredRatings = useMemo(() => {
    if (!searchQuery.trim()) return ratings;
    const query = searchQuery.toLowerCase();
    return ratings.filter(r => 
      r.handyman.name.toLowerCase().includes(query) ||
      r.handyman.email.toLowerCase().includes(query) ||
      r.customer.name.toLowerCase().includes(query) ||
      r.customer.email.toLowerCase().includes(query) ||
      r.comment.toLowerCase().includes(query)
    );
  }, [ratings, searchQuery]);

  // Pagination helper
  const paginatedRatings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRatings.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRatings, currentPage]);

  const totalPages = Math.ceil(filteredRatings.length / itemsPerPage);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginatedRatings.map(r => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(item => item !== id));
    }
  };

  const handleDeleteRating = async (id: string) => {
    if (!confirm('Are you sure you want to delete this rating? This action is permanent.')) return;
    setIsDeletingId(id);
    const originalRatings = [...ratings];

    // Optimistic UI update
    setRatings(ratings.filter(r => r.id !== id));
    setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));

    try {
      await apiClient.delete(`/admin/ratings/handymen/${id}`);
    } catch (err) {
      setRatings(originalRatings);
      alert('Failed to delete handyman rating. Reverting changes.');
    } finally {
      setIsDeletingId(null);
    }
  };

  const tabs = [
    { name: 'User Ratings', href: '/dashboard/admin/ratings/users', active: false },
    { name: 'Handyman Ratings', href: '/dashboard/admin/ratings/handymen', active: true },
  ];

  return (
    <div className="space-y-6 text-zinc-300">
      {/* Title & Tabs */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShieldAlert className="w-5.5 h-5.5 text-[#5E5CE6]" />
            Ratings & Review Moderation
          </h1>
          <p className="text-zinc-550 text-xs mt-0.5">
            Audit and moderate ratings given to customers or providers in the system.
          </p>
        </div>

        {/* Tab Row */}
        <div className="flex border-b border-zinc-800/80 overflow-x-auto whitespace-nowrap scrollbar-none">
          {tabs.map((t) => (
            <button
              key={t.name}
              onClick={() => router.push(t.href)}
              className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 -mb-[2px] ${
                t.active
                  ? 'border-[#5E5CE6] text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-3 bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-md rounded-xl flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search ratings by handyman name, customer name, email, or review content..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full bg-zinc-950/60 border border-zinc-800/60 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white placeholder-zinc-550 focus:outline-none focus:border-[#5E5CE6] transition-colors"
          />
        </div>
      </div>

      {/* Main Glassmorphic Table Container */}
      <div className="bg-zinc-900/50 border border-zinc-800/60 backdrop-blur-md rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#5E5CE6] animate-spin" />
            <span className="text-xs text-zinc-550">Fetching handyman ratings...</span>
          </div>
        ) : fetchError ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-red-400">
            <AlertCircle className="w-8 h-8" />
            <span className="text-xs">Failed to load handyman ratings list.</span>
          </div>
        ) : filteredRatings.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-xs">
            No handyman ratings found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#5E5CE6]/90 text-[11px] font-bold text-white uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 rounded-tl-xl">
                    <input
                      type="checkbox"
                      checked={paginatedRatings.length > 0 && paginatedRatings.every(r => selectedIds.includes(r.id))}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4">Handyman</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Review</th>
                  <th className="py-3 px-4 rounded-tr-xl text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50 text-xs">
                {paginatedRatings.map((rating) => (
                  <tr key={rating.id} className="bg-[#18181b] border-b border-zinc-800/50 hover:bg-zinc-850/20 transition-colors">
                    {/* Checkbox */}
                    <td className="py-4 px-4 w-12">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(rating.id)}
                        onChange={(e) => handleSelectOne(rating.id, e.target.checked)}
                        className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                      />
                    </td>

                    {/* Handyman Double-Line */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center border border-zinc-700">
                          {rating.handyman.avatar ? (
                            <img src={rating.handyman.avatar} alt={rating.handyman.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[10px] font-bold text-zinc-550 uppercase">{rating.handyman.name.substring(0, 2)}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs">{rating.handyman.name}</div>
                          <div className="text-zinc-500 text-[10px] mt-0.5">{rating.handyman.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Customer Double-Line */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center border border-zinc-700">
                          {rating.customer.avatar ? (
                            <img src={rating.customer.avatar} alt={rating.customer.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[10px] font-bold text-zinc-550 uppercase">{rating.customer.name.substring(0, 2)}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs">{rating.customer.name}</div>
                          <div className="text-zinc-500 text-[10px] mt-0.5">{rating.customer.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Rating Gold Stars */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, idx) => {
                          const starNum = idx + 1;
                          return (
                            <Star
                              key={idx}
                              className={`w-3.5 h-3.5 ${
                                starNum <= rating.rating
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-zinc-700 fill-zinc-800'
                              }`}
                            />
                          );
                        })}
                      </div>
                    </td>

                    {/* Review with tooltip */}
                    <td className="py-4 px-4 max-w-xs relative group cursor-help">
                      <p className="text-zinc-400 line-clamp-2 leading-relaxed">
                        {rating.comment || <span className="text-zinc-650 italic">No comment left</span>}
                      </p>
                      {rating.comment && (
                        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-30 max-w-sm p-3 bg-zinc-950 border border-zinc-800 rounded-lg shadow-xl text-zinc-300 leading-normal pointer-events-none text-xs">
                          {rating.comment}
                        </div>
                      )}
                    </td>

                    {/* Action delete */}
                    <td className="py-4 px-4 text-right">
                      <button
                        disabled={isDeletingId === rating.id}
                        onClick={() => handleDeleteRating(rating.id)}
                        className="p-1.5 rounded hover:bg-red-500/10 text-red-500 hover:text-red-400 disabled:opacity-50 transition-transform hover:scale-110 duration-200"
                      >
                        {isDeletingId === rating.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-zinc-550" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <span className="text-[11px] text-zinc-500">
            Showing Page <strong className="text-zinc-300">{currentPage}</strong> of <strong className="text-zinc-300">{totalPages}</strong> ({filteredRatings.length} items)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-zinc-800 text-zinc-400 disabled:opacity-50 hover:bg-zinc-850 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded border border-zinc-800 text-zinc-400 disabled:opacity-50 hover:bg-zinc-850 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
