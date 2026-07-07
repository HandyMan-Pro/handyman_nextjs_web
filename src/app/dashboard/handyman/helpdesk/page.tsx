'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { apiClient } from '../../../../lib/apiClient';
import {
  LifeBuoy,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Sparkles,
  Calendar,
  Send,
  X,
  FileText
} from 'lucide-react';

const fetcher = (url: string) => apiClient.get(url).then(res => res.data);

interface Ticket {
  id: string;
  author_name: string;
  subject: string;
  description: string;
  created_at: string;
  role: string;
  mode: string;
  status: string;
}

export default function HandymanHelpDesk() {
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form fields
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  
  // Errors & States
  const [validationError, setValidationError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: tickets = [], error, isLoading, mutate } = useSWR<Ticket[]>(
    mounted ? '/handyman/helpdesk/' : null,
    fetcher
  );

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = async () => {
    setRefreshing(true);
    await mutate();
    setRefreshing(false);
  };

  const handleOpenModal = () => {
    setSubject('');
    setDescription('');
    setValidationError('');
    setSuccessMessage('');
    setIsModalOpen(true);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    setSuccessMessage('');
    
    // Validation
    if (!subject.trim()) {
      setValidationError('Please enter a ticket subject.');
      return;
    }
    if (!description.trim()) {
      setValidationError('Please enter a ticket description.');
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post('/handyman/helpdesk/', {
        subject: subject.trim(),
        description: description.trim()
      });
      
      // Success workflow
      setSuccessMessage('Support ticket created successfully!');
      await mutate();
      
      // Close modal after brief delay to show success
      setTimeout(() => {
        setIsModalOpen(false);
        setSubject('');
        setDescription('');
        setSuccessMessage('');
      }, 1500);
      
    } catch (err: any) {
      console.error(err);
      setValidationError(err.response?.data?.detail || 'Failed to submit support ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Support Center
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Need help? Ask questions, report issues, or contact our support team.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isLoading || refreshing}
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg text-sm transition-all duration-200"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading || refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#7367F0] hover:bg-[#7367F0]/90 text-white rounded-lg text-sm font-semibold shadow-lg shadow-[#7367F0]/20 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            New Ticket
          </button>
        </div>
      </div>

      {/* Tickets List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-[#18181b] border border-zinc-800/80 rounded-xl p-5 space-y-4">
              <div className="flex justify-between">
                <div className="h-5 bg-zinc-800 rounded w-2/3" />
                <div className="h-5 bg-zinc-800 rounded w-16" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-zinc-800 rounded w-full" />
                <div className="h-4 bg-zinc-800 rounded w-5/6" />
              </div>
              <div className="h-4 bg-zinc-800 rounded w-1/3 pt-2" />
            </div>
          ))}
        </div>
      ) : tickets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tickets.map(ticket => {
            const isOpen = ticket.status.toLowerCase() === 'open';
            return (
              <div
                key={ticket.id}
                className="bg-[#18181b] border border-zinc-800/80 rounded-xl p-5 flex flex-col justify-between hover:border-zinc-700/80 transition-all duration-200 group relative overflow-hidden"
              >
                {/* Visual Accent */}
                <div className={`absolute top-0 left-0 w-1 h-full ${isOpen ? 'bg-[#7367F0]' : 'bg-zinc-600'}`} />

                <div>
                  {/* Top Row */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="text-lg font-bold text-white group-hover:text-[#7367F0] transition-colors leading-tight pl-2">
                      {ticket.subject}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        isOpen
                          ? 'bg-[#7367F0]/10 text-[#7367F0] border border-[#7367F0]/20'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700/50'
                      }`}
                    >
                      {isOpen ? <Clock className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                      {ticket.status}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-zinc-400 text-sm pl-2 mb-4 line-clamp-3 leading-relaxed">
                    {ticket.description}
                  </p>
                </div>

                {/* Footer details */}
                <div className="flex items-center justify-between border-t border-zinc-800/60 pt-3 pl-2 text-xs text-zinc-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <LifeBuoy className="w-3.5 h-3.5 text-zinc-600" />
                      {ticket.role}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-zinc-700" />
                    <span>Mode: {ticket.mode}</span>
                  </div>
                  <span className="flex items-center gap-1 font-mono text-[10px]">
                    <Calendar className="w-3 h-3" />
                    {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    }) : 'N/A'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Empty State
        <div className="bg-[#18181b] border border-zinc-800/80 rounded-xl p-12 text-center max-w-xl mx-auto mt-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="p-4 rounded-full bg-[#7367F0]/10 text-[#7367F0]">
              <MessageSquare className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">No Support Tickets</h3>
              <p className="text-zinc-400 text-sm mt-1 max-w-md mx-auto">
                You have not created any support requests yet. If you have any inquiries, click the "New Ticket" button to get in touch.
              </p>
            </div>
            <button
              onClick={handleOpenModal}
              className="mt-2 px-5 py-2 bg-[#7367F0] hover:bg-[#7367F0]/90 text-white rounded-lg text-sm font-semibold shadow-lg shadow-[#7367F0]/20 transition-all duration-200"
            >
              Get Support
            </button>
          </div>
        </div>
      )}

      {/* CREATE TICKET MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="w-full max-w-lg bg-[#18181b] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-zinc-800/60">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-[#7367F0]" />
                Create Support Ticket
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateTicket} className="p-5 space-y-4">
              {validationError && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {successMessage && (
                <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Subject */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="e.g. Issue with booking payment payout"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  disabled={submitting || !!successMessage}
                  className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 focus:border-[#7367F0] focus:ring-1 focus:ring-[#7367F0] rounded-lg text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  rows={5}
                  placeholder="Provide a detailed description of the problem or question you have..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  disabled={submitting || !!successMessage}
                  className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 focus:border-[#7367F0] focus:ring-1 focus:ring-[#7367F0] rounded-lg text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800/60 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting || !!successMessage}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !!successMessage}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#7367F0] hover:bg-[#7367F0]/90 text-white rounded-lg text-sm font-semibold shadow-lg shadow-[#7367F0]/20 transition-all duration-200 disabled:opacity-50"
                >
                  {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
