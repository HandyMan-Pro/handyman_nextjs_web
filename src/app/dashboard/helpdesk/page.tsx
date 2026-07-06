'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/apiClient';
import { 
  Search, Loader2, Plus, Eye, X, AlertCircle, CheckCircle, ChevronLeft, ChevronRight, MessageSquare, Ticket
} from 'lucide-react';

interface HelpdeskTicket {
  id: string;
  provider_id: string;
  subject: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function HelpdeskPage() {
  const [tickets, setTickets] = useState<HelpdeskTicket[]>([]);
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
  const [selectedTicket, setSelectedTicket] = useState<HelpdeskTicket | null>(null);

  // Form State
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/provider/support/helpdesk');
      setTickets(res.data || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch support tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description) {
      alert('Please fill out all required fields.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    // Optimistic UI updates
    const tempId = Math.random().toString(36).substring(7);
    const mockTicket: HelpdeskTicket = {
      id: tempId,
      provider_id: '',
      subject,
      description,
      status: 'Open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setTickets(prev => [mockTicket, ...prev]);

    try {
      await apiClient.post('/provider/support/helpdesk', {
        subject,
        description
      });

      setSuccess('Support ticket created successfully!');
      setSubject('');
      setDescription('');
      setIsNewModalOpen(false);
      fetchTickets();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit support ticket.');
      // Rollback optimistic update
      fetchTickets();
    } finally {
      setSubmitting(false);
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
      setSelectedIds(filtered.map(t => t.id));
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
  const filtered = tickets.filter(t => {
    const matchesSearch = 
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = 
      statusFilter === 'All' || 
      t.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Pagination Logic
  const totalEntries = filtered.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage) || 1;
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = Math.min(startIndex + entriesPerPage, totalEntries);
  const paginatedData = filtered.slice(startIndex, endIndex);

  // Format Date nicely
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-zinc-100 p-4 sm:p-6 md:p-8">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Help Desk</h1>
          <p className="text-sm text-zinc-400 mt-1">Submit support requests, ask questions, or report platform issues.</p>
        </div>
        <button
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#5E5CE6] hover:bg-[#4E4CD6] active:bg-[#3E3CB6] text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-[#5E5CE6]/20"
        >
          <Plus className="w-4 h-4" />
          New Ticket
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
              <option value="Close Selected">Close Selected</option>
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
              <option value="All">All Status</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
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

        {/* Table / Grid list */}
        {loading && tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-[#5E5CE6] animate-spin" />
            <span className="text-zinc-400 text-sm">Loading support tickets...</span>
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Ticket className="w-12 h-12 text-zinc-700 mb-3" />
            <p className="text-zinc-400 text-sm">No support tickets requested.</p>
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
                  <th className="px-6 py-3.5 text-[11px] font-bold text-white uppercase tracking-wider">Ticket ID</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold text-white uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold text-white uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold text-white uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold text-white uppercase tracking-wider text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50 bg-[#18181b]">
                {paginatedData.map((t) => (
                  <tr key={t.id} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(t.id)}
                        onChange={() => handleSelectRow(t.id)}
                        className="rounded border-zinc-800 text-[#5E5CE6] focus:ring-[#5E5CE6] bg-[#121214]"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-[#5E5CE6]">
                      #{t.id.slice(-6)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-white max-w-xs truncate">
                      {t.subject}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                        t.status.toLowerCase() === 'resolved'
                          ? 'bg-green-900/30 text-green-400 border border-green-800/50'
                          : t.status.toLowerCase() === 'in progress'
                          ? 'bg-blue-900/30 text-blue-400 border border-blue-800/50'
                          : 'bg-amber-900/30 text-amber-400'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-400">
                      {formatDate(t.created_at)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedTicket(t);
                          setIsViewModalOpen(true);
                        }}
                        className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
                        title="View Description"
                      >
                        <Eye className="w-4.5 h-4.5" />
                      </button>
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

      {/* New Ticket Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#18181b] border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 flex items-center justify-between border-b border-zinc-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Ticket className="w-5 h-5 text-[#5E5CE6]" />
                Create New Support Ticket
              </h3>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateTicket}>
              <div className="p-6 space-y-4">
                
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Subject / Issue Summary</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Delayed withdrawal bank payout request"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-[#121214] border border-zinc-800/60 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-650 focus:outline-none focus:border-[#5E5CE6] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Detailed Description</label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Please explain the issue you are experiencing in detail. Provide booking IDs or bank details if relevant."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[#121214] border border-zinc-800/60 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-650 focus:outline-none focus:border-[#5E5CE6] transition-all resize-none"
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
                      Creating...
                    </>
                  ) : (
                    'Submit Ticket'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Ticket Details Modal */}
      {isViewModalOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#18181b] border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 flex items-center justify-between border-b border-zinc-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#5E5CE6]" />
                Support Ticket Details
              </h3>
              <button
                onClick={() => {
                  setSelectedTicket(null);
                  setIsViewModalOpen(false);
                }}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-3 pt-2 text-sm">
                <div className="flex justify-between border-b border-zinc-800/40 pb-2">
                  <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Ticket ID</span>
                  <span className="font-semibold text-zinc-200">#{selectedTicket.id.slice(-6)}</span>
                </div>
                
                <div className="flex justify-between border-b border-zinc-800/40 pb-2">
                  <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Subject</span>
                  <span className="font-bold text-white">{selectedTicket.subject}</span>
                </div>

                <div className="flex justify-between border-b border-zinc-800/40 pb-2">
                  <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Ticket Status</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                    selectedTicket.status.toLowerCase() === 'resolved'
                      ? 'bg-green-900/30 text-green-400 border border-green-800/50'
                      : selectedTicket.status.toLowerCase() === 'in progress'
                      ? 'bg-blue-900/30 text-blue-400 border border-blue-800/50'
                      : 'bg-amber-900/30 text-amber-400'
                  }`}>
                    {selectedTicket.status}
                  </span>
                </div>

                <div className="flex justify-between border-b border-zinc-800/40 pb-2">
                  <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Submitted Date</span>
                  <span className="font-medium text-zinc-200">{formatDate(selectedTicket.created_at)}</span>
                </div>

                <div className="bg-[#121214] border border-zinc-800/60 rounded-xl p-4 mt-2">
                  <span className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Description</span>
                  <p className="text-xs text-zinc-350 leading-relaxed whitespace-pre-wrap">{selectedTicket.description}</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-[#121214] border-t border-zinc-800 flex justify-end">
              <button
                onClick={() => {
                  setSelectedTicket(null);
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
