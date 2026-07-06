'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/apiClient';
import { 
  Search, Loader2, Star, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, MessageSquare
} from 'lucide-react';

interface HandymanRating {
  id: string;
  handyman_id: string;
  handyman_name: string;
  handyman_avatar: string | null;
  customer_id: string;
  customer_name: string;
  customer_email: string | null;
  rating: number;
  comment: string;
  created_at: string;
}

export default function HandymanRatingsPage() {
  const [ratings, setRatings] = useState<HandymanRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('All');
  const [selectedAction, setSelectedAction] = useState('No Action');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  // Hover Tooltip / Detail view
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/provider/support/handyman-ratings');
      setRatings(res.data || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch handyman ratings');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = () => {
    if (selectedIds.length === 0) {
      alert('Please select records to apply action.');
      return;
    }
    alert(`Bulk Action "${selectedAction}" triggered for ${selectedIds.length} items.`);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filtered.map(r => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(x => x !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  // Filter & Search Logic
  const filtered = ratings.filter(r => {
    const matchesSearch = 
      r.handyman_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.comment && r.comment.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRating = 
      ratingFilter === 'All' || 
      Math.floor(r.rating) === parseInt(ratingFilter);

    return matchesSearch && matchesRating;
  });

  // Pagination Logic
  const totalEntries = filtered.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage) || 1;
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = Math.min(startIndex + entriesPerPage, totalEntries);
  const paginatedData = filtered.slice(startIndex, endIndex);

  // Render Golden Stars
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
        );
      } else {
        stars.push(
          <Star key={i} className="w-4 h-4 text-zinc-600 fill-transparent" />
        );
      }
    }
    return <div className="flex items-center gap-0.5">{stars}</div>;
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-zinc-100 p-4 sm:p-6 md:p-8">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Handyman Ratings</h1>
          <p className="text-sm text-zinc-400 mt-1">Monitor quality of service and customer feedback for your active handyman team.</p>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="bg-[#18181b] border border-zinc-800/60 rounded-xl overflow-hidden shadow-xl">
        
        {/* Filter Bar */}
        <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-zinc-800/60 bg-[#121214]">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="bg-[#18181b] border border-zinc-800/60 text-zinc-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#5E5CE6]"
            >
              <option value="No Action">No Action</option>
              <option value="Export Selected">Export Selected</option>
            </select>
            <button
              onClick={handleBulkAction}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-750 text-zinc-200 text-xs font-semibold rounded-lg border border-zinc-700 transition-all"
            >
              Apply
            </button>
            <select
              value={ratingFilter}
              onChange={(e) => {
                setRatingFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#18181b] border border-zinc-800/60 text-zinc-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#5E5CE6]"
            >
              <option value="All">All Stars</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#18181b] border border-zinc-800/60 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[#5E5CE6] transition-all"
            />
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-4 bg-red-900/20 border-b border-red-900/40 text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Table / Grid list */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-[#5E5CE6] animate-spin" />
            <span className="text-zinc-400 text-sm">Loading ratings data...</span>
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <MessageSquare className="w-12 h-12 text-zinc-700 mb-3" />
            <p className="text-zinc-400 text-sm">No handyman ratings found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#5E5CE6]/90 border-b border-zinc-800/60">
                  <th className="px-4 py-3.5 w-10 text-center">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={filtered.length > 0 && selectedIds.length === filtered.length}
                      className="rounded border-zinc-800 text-[#5E5CE6] focus:ring-[#5E5CE6] bg-[#121214]"
                    />
                  </th>
                  <th className="px-6 py-3.5 text-[11px] font-bold text-white uppercase tracking-wider">Handyman</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold text-white uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold text-white uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold text-white uppercase tracking-wider">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50 bg-[#18181b]">
                {paginatedData.map((r) => (
                  <tr key={r.id} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(r.id)}
                        onChange={() => handleSelectRow(r.id)}
                        className="rounded border-zinc-800 text-[#5E5CE6] focus:ring-[#5E5CE6] bg-[#121214]"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden flex items-center justify-center border border-zinc-700">
                          {r.handyman_avatar ? (
                            <img src={r.handyman_avatar} alt={r.handyman_name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-zinc-400">{r.handyman_name.slice(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{r.handyman_name}</p>
                          <p className="text-xs text-zinc-550">ID: #{r.handyman_id.slice(-4)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden flex items-center justify-center border border-zinc-700">
                          <span className="text-xs font-bold text-zinc-400">{r.customer_name.slice(0, 2).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-zinc-200">{r.customer_name}</p>
                          <p className="text-xs text-zinc-500">{r.customer_email || 'No email provided'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {renderStars(r.rating)}
                        <span className="text-xs text-zinc-400 font-bold">{r.rating.toFixed(1)} / 5.0</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-350 max-w-md relative">
                      <div 
                        className="line-clamp-2 cursor-pointer hover:text-white transition-colors"
                        onClick={() => setActiveTooltipId(activeTooltipId === r.id ? null : r.id)}
                      >
                        {r.comment || <em className="text-zinc-650">No written feedback</em>}
                      </div>

                      {/* Premium Tooltip for Full Review */}
                      {activeTooltipId === r.id && r.comment && (
                        <div className="absolute z-10 top-full left-6 mt-1 w-72 bg-[#1c1c1f] border border-zinc-800 text-zinc-300 rounded-xl p-4 shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-zinc-500">Full Review Comment</span>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveTooltipId(null);
                              }}
                              className="text-xs text-zinc-500 hover:text-white"
                            >
                              Close
                            </button>
                          </div>
                          <p className="text-xs leading-relaxed whitespace-pre-wrap">{r.comment}</p>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Pagination */}
        {!loading && totalEntries > 0 && (
          <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-800/60 bg-[#121214]">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">Display</span>
              <select
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(parseInt(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-[#18181b] border border-zinc-800/60 text-zinc-200 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#5E5CE6]"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
              <span className="text-xs text-zinc-400">entries</span>
            </div>

            <span className="text-xs text-zinc-400">
              Showing {startIndex + 1} to {endIndex} of {totalEntries} entries
            </span>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-zinc-800 bg-[#18181b] hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-50 disabled:hover:bg-transparent transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                      currentPage === page
                        ? 'bg-[#5E5CE6] text-white shadow-lg'
                        : 'border border-zinc-800 bg-[#18181b] text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-zinc-800 bg-[#18181b] hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-50 disabled:hover:bg-transparent transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
