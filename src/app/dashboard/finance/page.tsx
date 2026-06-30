'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/apiClient';
import {
  IndianRupee, CreditCard, ArrowUpRight, ArrowDownRight,
  Search, RefreshCw, X, Loader2, Check, AlertTriangle, FileText,
  Clock, ShieldAlert, Award
} from 'lucide-react';

interface Transaction {
  id: string;
  customer_name: string;
  type: string; // Earnings | Payout | Wallet Top-up
  amount: number;
  status: string;
  payment_method: string;
  booking_id?: string;
  date: string;
  utr_id?: string; // UPI UTR ID
}

interface ProviderDocument {
  id: string;
  provider_id: string;
  document_type: string;
  document_url: string;
  status: string; // Pending | Approved | Rejected
  admin_note?: string;
  created_at?: string;
}

interface Provider {
  id: string;
  display_name: string;
  email: string;
  wallet_balance?: number;
  user_type: string;
}

export default function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [documents, setDocuments] = useState<ProviderDocument[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Payout Form State
  const [selectedProviderId, setSelectedProviderId] = useState('');
  const [payoutAmount, setPayoutAmount] = useState('');
  const [processingPayout, setProcessingPayout] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      const [txRes, docsRes, providersRes] = await Promise.all([
        apiClient.get('/transactions'),
        apiClient.get('/admin/provider-documents'),
        apiClient.get('/providers')
      ]);
      setTransactions(txRes.data || []);
      setDocuments(docsRes.data || []);
      setProviders((providersRes.data || []).filter((u: Provider) => u.user_type === 'provider'));
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to load financial records');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleDocumentAction = async (docId: string, status: 'Approved' | 'Rejected') => {
    try {
      await apiClient.put(`/admin/provider-documents/${docId}`, {
        status: status,
        admin_note: `Document verification ${status.toLowerCase()} by administrator.`
      });
      showSuccess(`Document status updated to ${status}.`);
      fetchFinanceData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update document status');
    }
  };

  const handlePayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProviderId || !payoutAmount) return;

    setProcessingPayout(true);
    try {
      await apiClient.post('/payouts', {
        provider_id: selectedProviderId,
        amount: Number(payoutAmount),
        payment_method: 'UPI Instant Payout'
      });
      showSuccess(`Payout of ₹${payoutAmount} processed successfully!`);
      setPayoutAmount('');
      fetchFinanceData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to process payout');
    } finally {
      setProcessingPayout(false);
    }
  };

  const filteredTransactions = transactions.filter(t =>
    t.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.utr_id || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Finance & Commissions</h1>
          <p className="text-zinc-500 text-sm mt-0.5">UPI intent tracking, provider wallet balance payouts, and document verifications.</p>
        </div>
        <button
          onClick={fetchFinanceData}
          className="flex items-center justify-center gap-2 h-10 px-4 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Stats
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

      {/* Grid: Payout Form & Document approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payout form */}
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5 shadow-xl space-y-4">
          <h2 className="text-base font-bold flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-red-400" />
            Process Wallet Payout
          </h2>
          <form onSubmit={handlePayoutSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Provider</label>
              <select
                value={selectedProviderId}
                onChange={(e) => setSelectedProviderId(e.target.value)}
                required
                className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary/50"
              >
                <option value="">-- Select Provider --</option>
                {providers.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.display_name} (Bal: ₹{(p.wallet_balance ?? 0).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Payout Amount (₹)</label>
              <input
                type="number"
                min={1}
                required
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                placeholder="e.g. 1000"
                className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>

            <button
              type="submit"
              disabled={processingPayout}
              className="w-full h-11 bg-primary hover:bg-primary/95 text-white font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-2"
            >
              {processingPayout && <Loader2 className="w-4 h-4 animate-spin" />}
              Send UPI Settlement
            </button>
          </form>
        </div>

        {/* Verification submissions */}
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5 shadow-xl lg:col-span-2 space-y-4">
          <h2 className="text-base font-bold flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Verification Documents ({documents.length})
          </h2>
          <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
            {documents.map((d) => (
              <div key={d.id} className="bg-zinc-800/30 border border-zinc-800/80 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-zinc-800 border border-zinc-700/50 flex items-center justify-center rounded-lg text-primary shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-zinc-100">{d.document_type}</h4>
                    <a
                      href={d.document_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary hover:underline font-medium mt-0.5 block"
                    >
                      View Uploaded Document
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {d.status === 'Pending' ? (
                    <>
                      <button
                        onClick={() => handleDocumentAction(d.id, 'Approved')}
                        className="h-8 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => handleDocumentAction(d.id, 'Rejected')}
                        className="h-8 px-3 bg-red-950/40 hover:bg-red-900/30 text-red-400 border border-red-500/10 rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                    </>
                  ) : (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      d.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {d.status === 'Approved' ? 'Approved' : 'Rejected'}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {documents.length === 0 && (
              <p className="text-center text-xs text-zinc-500 py-12">No documents currently pending review.</p>
            )}
          </div>
        </div>
      </div>

      {/* Transactions list */}
      <div className="bg-zinc-900/80 border border-zinc-800/60 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-zinc-800/60 flex items-center justify-between gap-4">
          <h2 className="font-bold text-sm text-zinc-300">Transaction History Log</h2>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by description or UTR..."
              className="w-full h-9 pl-9 pr-4 bg-zinc-900/60 border border-zinc-800/50 rounded-xl text-xs text-zinc-350 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-zinc-800/60 bg-zinc-900/40 text-left">
                <th className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">Description</th>
                <th className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">Type</th>
                <th className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">Date</th>
                <th className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">UPI ID / Method</th>
                <th className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">UTR/TX ID</th>
                <th className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider px-4 py-3 text-right">Amount</th>
                <th className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider px-6 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-zinc-800/10 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-xs font-semibold text-zinc-200">{t.customer_name}</p>
                    {t.booking_id && <span className="text-[10px] text-zinc-500">Booking Ref: {t.booking_id}</span>}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                      t.type === 'Payout' ? 'bg-red-500/10 text-red-400 border border-red-500/10' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                    }`}>
                      {t.type === 'Payout' ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                      {t.type}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs text-zinc-400">{t.date}</td>
                  <td className="px-4 py-4 text-xs text-zinc-400 font-medium">{t.payment_method}</td>
                  <td className="px-4 py-4 text-xs text-zinc-400 font-mono">{t.utr_id || 'UPI-MANUAL'}</td>
                  <td className={`px-4 py-4 text-right text-xs font-extrabold ${t.type === 'Payout' ? 'text-red-400' : 'text-emerald-400'}`}>
                    {t.type === 'Payout' ? '-' : '+'}₹{t.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 px-2 py-0.5 rounded">
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-xs text-zinc-500">
                    No transactions recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
