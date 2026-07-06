'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/apiClient';
import { useAuthStore } from '../../../store/useAuthStore';
import {
  ClipboardList, Search, Eye, Trash2, X, Loader2,
  AlertCircle, CheckCircle, HelpCircle, DollarSign, BookOpen, User
} from 'lucide-react';

interface Bid {
  provider_id: string;
  provider_name: string;
  bid_amount: number;
  cover_letter: string;
}

interface CustomJob {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_image?: string;
  budget: number;
  status: string;
  awarded_provider_id?: string;
  bids: Bid[];
  created_at: string;
  updated_at: string;
}

export default function CustomJobsPage() {
  const currentUser = useAuthStore(state => state.user);

  const [jobs, setJobs] = useState<CustomJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Table Selection & Filters
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [entriesCount, setEntriesCount] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<CustomJob | null>(null);

  // Bid Form State
  const [bidAmount, setBidAmount] = useState<number>(0.0);
  const [coverLetter, setCoverLetter] = useState('');
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/provider/custom-jobs');
      setJobs(res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch open custom jobs.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBidModal = (job: CustomJob) => {
    setSelectedJob(job);
    setFormError('');
    
    // Check if provider has already bid
    const myBid = job.bids.find(b => b.provider_id === currentUser?.id);
    if (myBid) {
      setBidAmount(myBid.bid_amount);
      setCoverLetter(myBid.cover_letter);
    } else {
      setBidAmount(job.budget);
      setCoverLetter('');
    }
    
    setModalOpen(true);
  };

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    setFormError('');

    if (bidAmount <= 0) {
      setFormError('Bid amount must be greater than $0.');
      return;
    }
    if (!coverLetter.trim()) {
      setFormError('Please write a cover letter introducing yourself.');
      return;
    }

    setFormSaving(true);
    try {
      await apiClient.post(`/provider/custom-jobs/${selectedJob.id}/bid`, {
        bid_amount: Number(bidAmount),
        cover_letter: coverLetter.trim()
      });
      setSuccess('Bid placed successfully!');
      setModalOpen(false);
      fetchJobs();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || err.message || 'Failed to submit bid.');
    } finally {
      setFormSaving(false);
    }
  };

  const handleWithdrawBid = async (jobId: string) => {
    if (!window.confirm('Are you sure you want to withdraw your bid from this job request?')) {
      return;
    }

    try {
      await apiClient.delete(`/provider/custom-jobs/${jobId}/bid`);
      setSuccess('Bid withdrawn successfully.');
      fetchJobs();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to withdraw bid.');
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredJobs.map(j => j.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(x => x !== id));
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const totalEntries = filteredJobs.length;
  const totalPages = Math.ceil(totalEntries / entriesCount) || 1;
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * entriesCount, currentPage * entriesCount);

  return (
    <div className="space-y-6 text-zinc-300">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <ClipboardList className="w-5.5 h-5.5 text-[#5E5CE6]" />
            Job Request List
          </h1>
          <p className="text-zinc-550 text-xs mt-0.5">
            View open-market customer custom jobs and place your bids to apply.
          </p>
        </div>
      </div>

      {/* Alerts */}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-4 py-2.5 text-xs flex justify-between items-center animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold">{success}</span>
          </div>
          <button onClick={() => setSuccess('')} className="text-zinc-500 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-4 py-2.5 text-xs flex justify-between items-center animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <span className="font-semibold">{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-zinc-500 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-[#1c1c1e]/60 border border-zinc-800/80 p-3 rounded-xl">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select className="h-8.5 px-3 bg-[#2c2c2e] border border-zinc-800 rounded-lg text-xs text-zinc-300 focus:outline-none">
            <option>No Action</option>
          </select>
          <button className="h-8.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg text-xs transition-colors">
            Apply
          </button>
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8.5 pl-9 pr-4 bg-[#121214] border border-zinc-800/60 rounded-lg text-xs text-white placeholder:text-zinc-650 focus:outline-none focus:border-[#5E5CE6]/60 transition-colors"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="border border-zinc-850 rounded-xl overflow-hidden bg-[#18181b]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#5E5CE6]/90 border-b border-zinc-850">
                <th className="py-3 px-4 text-left w-12">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={filteredJobs.length > 0 && selectedIds.length === filteredJobs.length}
                    className="accent-[#5E5CE6]"
                  />
                </th>
                <th className="py-3 px-4 text-left text-[11px] font-bold text-white uppercase tracking-wider">
                  Title
                </th>
                <th className="py-3 px-4 text-center text-[11px] font-bold text-white uppercase tracking-wider">
                  Provider
                </th>
                <th className="py-3 px-4 text-left text-[11px] font-bold text-white uppercase tracking-wider">
                  Customer
                </th>
                <th className="py-3 px-4 text-left text-[11px] font-bold text-white uppercase tracking-wider">
                  Status
                </th>
                <th className="py-3 px-4 text-left text-[11px] font-bold text-white uppercase tracking-wider">
                  Price
                </th>
                <th className="py-3 px-4 text-right text-[11px] font-bold text-white uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="border-b border-zinc-850 animate-pulse">
                    <td className="py-4 px-4"><div className="h-4 bg-zinc-800 rounded w-4" /></td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-zinc-800 rounded-full" />
                        <div className="h-4 bg-zinc-800 rounded w-36" />
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center"><div className="h-4 bg-zinc-800 rounded w-6 mx-auto" /></td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-zinc-800" />
                        <div className="h-4 bg-zinc-800 rounded w-24" />
                      </div>
                    </td>
                    <td className="py-4 px-4"><div className="h-4 bg-zinc-800 rounded w-16" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-zinc-800 rounded w-14" /></td>
                    <td className="py-4 px-4 text-right"><div className="h-4 bg-zinc-800 rounded w-12 ml-auto" /></td>
                  </tr>
                ))
              ) : paginatedJobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-zinc-550">
                    No custom job requests available in open market.
                  </td>
                </tr>
              ) : (
                paginatedJobs.map(job => {
                  const hasBid = job.bids.some(b => b.provider_id === currentUser?.id);
                  return (
                    <tr key={job.id} className="border-b border-zinc-850 hover:bg-zinc-900/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(job.id)}
                          onChange={(e) => handleSelectOne(job.id, e.target.checked)}
                          className="accent-[#5E5CE6]"
                        />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {job.image_url ? (
                            <img src={job.image_url} alt={job.title} className="w-9 h-9 rounded-full object-cover border border-zinc-800" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-850">
                              <ClipboardList className="w-4 h-4 text-zinc-600" />
                            </div>
                          )}
                          <button
                            onClick={() => handleOpenBidModal(job)}
                            className="font-semibold text-left text-[#5E5CE6] hover:text-[#5E5CE6]/80 transition-colors cursor-pointer focus:outline-none"
                          >
                            {job.title}
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center text-zinc-500 font-bold">
                        -
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        <div className="flex items-center gap-2.5">
                          {job.customer_image ? (
                            <img src={job.customer_image} alt={job.customer_name} className="w-6 h-6 rounded-full object-cover border border-zinc-850" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-[#5E5CE6]/10 flex items-center justify-center border border-zinc-850">
                              <User className="w-3.5 h-3.5 text-[#5E5CE6]" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-white">{job.customer_name}</p>
                            <p className="text-[10px] text-zinc-400">{job.customer_email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md px-2 py-1 text-xs">
                          {job.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-bold text-white">
                        ${job.budget.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-3.5">
                          <button
                            onClick={() => handleOpenBidModal(job)}
                            className="p-1 text-zinc-400 hover:text-white transition-colors"
                            title={hasBid ? "View / Edit Bid" : "Place Bid"}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {hasBid && (
                            <button
                              onClick={() => handleWithdrawBid(job.id)}
                              className="p-1 text-rose-500 hover:text-rose-400 transition-colors"
                              title="Withdraw Bid"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-4 py-3 bg-[#121214] border-t border-zinc-850 flex flex-col sm:flex-row gap-3 items-center justify-between text-xs text-zinc-550 font-semibold">
          <div className="flex items-center gap-1.5">
            <span>Display</span>
            <select
              value={entriesCount}
              onChange={(e) => {
                setEntriesCount(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="h-7 px-2 bg-[#2c2c2e] border border-zinc-800 rounded text-zinc-300 focus:outline-none"
            >
              {[10, 25, 50].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <span>entries</span>
          </div>

          <div>
            {totalEntries > 0 ? (
              <span>
                {(currentPage - 1) * entriesCount + 1} to {Math.min(currentPage * entriesCount, totalEntries)} of {totalEntries} entries
              </span>
            ) : (
              <span>0 entries</span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="h-8 px-3.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg disabled:opacity-40 disabled:hover:bg-zinc-800 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="h-8 px-3.5 bg-[#5E5CE6] hover:bg-[#5E5CE6]/90 text-white font-bold rounded-lg disabled:opacity-40 disabled:hover:bg-[#5E5CE6] transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Bid Modal */}
      {modalOpen && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#1c1c1e] border border-zinc-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden text-zinc-300">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-850 bg-[#121214]">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4.5 h-4.5 text-[#5E5CE6]" />
                Job Details & Bid Submission
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-zinc-500 hover:text-white w-7 h-7 rounded-full hover:bg-zinc-800 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Job Details Card */}
              <div className="bg-[#121214] border border-zinc-850 p-4 rounded-xl space-y-2.5">
                <h4 className="text-white font-bold text-sm">{selectedJob.title}</h4>
                <p className="text-xs text-zinc-450 leading-relaxed">{selectedJob.description}</p>
                <div className="flex items-center justify-between pt-2.5 border-t border-zinc-850 text-xs">
                  <span className="text-zinc-550">Customer Budget:</span>
                  <span className="text-emerald-400 font-extrabold flex items-center gap-0.5">
                    <DollarSign className="w-3.5 h-3.5" />
                    {selectedJob.budget.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Status information if already bid */}
              {selectedJob.bids.some(b => b.provider_id === currentUser?.id) && (
                <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl px-4 py-2.5 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                  <span className="font-semibold">You have already placed a bid on this job. Submitting again will update your bid.</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handlePlaceBid} className="space-y-4">
                {formError && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-4 py-2.5 text-xs flex items-center gap-1.5 animate-fadeIn">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span className="font-semibold">{formError}</span>
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">
                    Your Bid Amount ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={bidAmount}
                    onChange={(e) => setBidAmount(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-[#2c2c2e] border border-zinc-800 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">
                    Cover Letter *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Describe your qualifications, how you plan to tackle the job, and why they should choose you..."
                    className="w-full p-3 bg-[#2c2c2e] border border-zinc-800 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none resize-none"
                  />
                </div>

                <div className="pt-3 border-t border-zinc-850 flex justify-end gap-3.5">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="h-9 px-4 border border-zinc-800 text-zinc-450 hover:text-white font-bold text-xs rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formSaving}
                    className="h-9 px-5 bg-[#5E5CE6] hover:bg-[#5E5CE6]/90 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    {formSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Submit Bid
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
