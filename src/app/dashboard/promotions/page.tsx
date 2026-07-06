'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/apiClient';
import { 
  Search, Loader2, Plus, Eye, Trash2, X, AlertCircle, Calendar, DollarSign, Image as ImageIcon, CheckCircle, ChevronLeft, ChevronRight
} from 'lucide-react';

interface PromoBanner {
  id: string;
  provider_id: string;
  image_url: string;
  start_date: string;
  end_date: string;
  price: number;
  status: string;
  reason: string;
  created_at: string;
}

const PRESET_BANNERS = [
  {
    name: 'Modern Maintenance Promo',
    url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Electrical Repairs Specialist',
    url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Smart Home Installation',
    url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80',
  }
];

export default function PromotionalBannersPage() {
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedAction, setSelectedAction] = useState('No Action');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  // Modal States
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<PromoBanner | null>(null);

  // New Request Form State
  const [imageUrl, setImageUrl] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [price, setPrice] = useState('150.00');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/provider/promotions');
      setBanners(res.data || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch promotional banners');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl || !startDate || !endDate || !price) {
      alert('Please fill out all required fields.');
      return;
    }

    const priceVal = parseFloat(price);
    if (isNaN(priceVal) || priceVal <= 0) {
      alert('Please enter a valid price.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Ensure date format matches ISO string
      const startIso = new Date(startDate).toISOString();
      const endIso = new Date(endDate).toISOString();

      await apiClient.post('/provider/promotions', {
        image_url: imageUrl,
        start_date: startIso,
        end_date: endIso,
        price: priceVal
      });

      setSuccess('Promotional banner request submitted successfully!');
      setImageUrl('');
      setStartDate('');
      setEndDate('');
      setIsNewModalOpen(false);
      fetchBanners();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit promotion request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRequest = async (id: string) => {
    if (!confirm('Are you sure you want to cancel and delete this promotional request?')) {
      return;
    }

    setError('');
    setSuccess('');
    try {
      await apiClient.delete(`/provider/promotions/${id}`);
      setSuccess('Request cancelled and deleted successfully.');
      fetchBanners();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to cancel promotional request.');
    }
  };

  const handleBulkAction = async () => {
    if (selectedIds.length === 0) {
      alert('Please select records to apply action.');
      return;
    }

    if (selectedAction === 'Delete Selected') {
      if (confirm(`Are you sure you want to cancel all ${selectedIds.length} selected requests?`)) {
        setError('');
        setSuccess('');
        try {
          await Promise.all(selectedIds.map(id => apiClient.delete(`/provider/promotions/${id}`)));
          setSuccess('Selected promotional requests deleted.');
          setSelectedIds([]);
          fetchBanners();
        } catch (err: any) {
          setError(err.message || 'Failed to delete some selected requests.');
        }
      }
    } else {
      alert(`Action "${selectedAction}" triggered for selected rows.`);
    }
  };

  // Checkbox handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filtered.map(b => b.id));
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
  const filtered = banners.filter(b => {
    const matchesSearch = b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.image_url.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || b.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  // Pagination Logic
  const totalEntries = filtered.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage) || 1;
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = Math.min(startIndex + entriesPerPage, totalEntries);
  const paginatedData = filtered.slice(startIndex, endIndex);

  // Format Date Range cleanly
  const formatDateRange = (startStr: string, endStr: string) => {
    try {
      const start = new Date(startStr);
      const end = new Date(endStr);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return `${startStr} - ${endStr}`;
      }
      const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
      return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
    } catch {
      return `${startStr} - ${endStr}`;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-zinc-100 p-4 sm:p-6 md:p-8">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Provider Promotional Banner</h1>
          <p className="text-sm text-zinc-400 mt-1">Submit high-visibility marketing banners to attract more custom job bids.</p>
        </div>
        <button
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#5E5CE6] hover:bg-[#4E4CD6] active:bg-[#3E3CB6] text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-[#5E5CE6]/20"
        >
          <Plus className="w-4 h-4" />
          New
        </button>
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
              <option value="Delete Selected">Cancel/Delete Selected</option>
            </select>
            <button
              onClick={handleBulkAction}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-750 text-zinc-200 text-xs font-semibold rounded-lg border border-zinc-700 transition-all"
            >
              Apply
            </button>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#18181b] border border-zinc-800/60 text-zinc-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#5E5CE6]"
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
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
        {success && (
          <div className="p-4 bg-emerald-900/20 border-b border-emerald-900/40 text-emerald-400 text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            {success}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-[#5E5CE6] animate-spin" />
            <span className="text-zinc-400 text-sm">Loading promotions data...</span>
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ImageIcon className="w-12 h-12 text-zinc-700 mb-3" />
            <p className="text-zinc-400 text-sm">No promotional banners requested.</p>
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
                  <th className="px-6 py-3.5 text-[11px] font-bold text-white uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold text-white uppercase tracking-wider">Banner</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold text-white uppercase tracking-wider">Date Range</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold text-white uppercase tracking-wider text-right">Price</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold text-white uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold text-white uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold text-white uppercase tracking-wider text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50 bg-[#18181b]">
                {paginatedData.map((b) => (
                  <tr key={b.id} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(b.id)}
                        onChange={() => handleSelectRow(b.id)}
                        className="rounded border-zinc-800 text-[#5E5CE6] focus:ring-[#5E5CE6] bg-[#121214]"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-[#5E5CE6]">
                      #{b.id.slice(-4)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <img
                        src={b.image_url}
                        alt="banner"
                        className="w-10 h-10 object-cover rounded-md border border-zinc-700/80"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-300">
                      {formatDateRange(b.start_date, b.end_date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-white font-bold text-right">
                      ${b.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                        b.status.toLowerCase() === 'accepted'
                          ? 'bg-green-900/30 text-green-400 border border-green-800/50'
                          : b.status.toLowerCase() === 'pending'
                          ? 'bg-amber-900/30 text-amber-400'
                          : 'bg-red-900/30 text-red-400'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-400 max-w-xs truncate">
                      {b.reason || '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => {
                            setSelectedBanner(b);
                            setIsViewModalOpen(true);
                          }}
                          className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRequest(b.id)}
                          className="p-1 rounded-lg text-red-500 hover:text-red-400 hover:bg-red-950/20 transition-all"
                          title="Delete/Cancel"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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

      {/* New Request Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#18181b] border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 flex items-center justify-between border-b border-zinc-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#5E5CE6]" />
                Request Promotional Banner
              </h3>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateRequest}>
              <div className="p-6 space-y-4">
                
                {/* Preset Banner Selector */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Preset High-Quality Banners</label>
                  <div className="grid grid-cols-3 gap-3">
                    {PRESET_BANNERS.map((preset) => (
                      <button
                        type="button"
                        key={preset.url}
                        onClick={() => setImageUrl(preset.url)}
                        className={`group relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                          imageUrl === preset.url ? 'border-[#5E5CE6] scale-[0.98]' : 'border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex items-end p-1.5">
                          <span className="text-[9px] font-bold text-white truncate w-full">{preset.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom URL Input */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Or Custom Banner Image URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://example.com/banner.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full bg-[#121214] border border-zinc-800/60 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-650 focus:outline-none focus:border-[#5E5CE6] transition-all"
                  />
                </div>

                {/* Date Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-zinc-550" />
                      Start Date
                    </label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-[#121214] border border-zinc-800/60 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-[#5E5CE6] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-zinc-550" />
                      End Date
                    </label>
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-[#121214] border border-zinc-800/60 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-[#5E5CE6] transition-all"
                    />
                  </div>
                </div>

                {/* Price (Mock Budget) */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-zinc-550" />
                    Estimated Budget ($)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    placeholder="150.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-[#121214] border border-zinc-800/60 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-650 focus:outline-none focus:border-[#5E5CE6] transition-all"
                  />
                </div>

              </div>
              
              <div className="p-4 bg-[#121214] border-t border-zinc-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-sm rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-[#5E5CE6] hover:bg-[#4E4CD6] active:bg-[#3E3CB6] disabled:opacity-50 text-white font-semibold text-sm rounded-lg transition-all shadow-md shadow-[#5E5CE6]/10"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {isViewModalOpen && selectedBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#18181b] border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 flex items-center justify-between border-b border-zinc-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#5E5CE6]" />
                Promotional Banner Details
              </h3>
              <button
                onClick={() => {
                  setSelectedBanner(null);
                  setIsViewModalOpen(false);
                }}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              
              <div className="aspect-video w-full rounded-xl overflow-hidden border border-zinc-800 bg-[#121214] flex items-center justify-center relative">
                <img
                  src={selectedBanner.image_url}
                  alt="Promotional Banner Enlarged"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="space-y-3 pt-2 text-sm">
                <div className="flex justify-between border-b border-zinc-800/40 pb-2">
                  <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Promotion ID</span>
                  <span className="font-semibold text-zinc-200">#{selectedBanner.id.slice(-6)}</span>
                </div>
                
                <div className="flex justify-between border-b border-zinc-800/40 pb-2">
                  <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Scheduled Range</span>
                  <span className="font-medium text-zinc-200">
                    {formatDateRange(selectedBanner.start_date, selectedBanner.end_date)}
                  </span>
                </div>

                <div className="flex justify-between border-b border-zinc-800/40 pb-2">
                  <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Budget/Price</span>
                  <span className="font-bold text-white">${selectedBanner.price.toFixed(2)}</span>
                </div>

                <div className="flex justify-between border-b border-zinc-800/40 pb-2">
                  <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Approval Status</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                    selectedBanner.status.toLowerCase() === 'accepted'
                      ? 'bg-green-900/30 text-green-400 border border-green-800/50'
                      : selectedBanner.status.toLowerCase() === 'pending'
                      ? 'bg-amber-900/30 text-amber-400'
                      : 'bg-red-900/30 text-red-400'
                  }`}>
                    {selectedBanner.status}
                  </span>
                </div>

                {selectedBanner.status.toLowerCase() === 'rejected' && (
                  <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-4">
                    <span className="block text-xs font-bold text-red-400 uppercase tracking-wider mb-1">Rejection Reason</span>
                    <p className="text-xs text-red-300/90 leading-relaxed">{selectedBanner.reason || 'No specific reason provided by the administrator.'}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4 bg-[#121214] border-t border-zinc-800 flex justify-end">
              <button
                onClick={() => {
                  setSelectedBanner(null);
                  setIsViewModalOpen(false);
                }}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-sm rounded-lg transition-all"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
