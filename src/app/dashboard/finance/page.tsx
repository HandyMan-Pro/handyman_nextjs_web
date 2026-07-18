'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/apiClient';
import {
  IndianRupee, CreditCard, ArrowUpRight, ArrowDownRight,
  Search, RefreshCw, X, Loader2, Check, AlertTriangle, FileText,
  Clock, ShieldAlert, Award, Send, Percent, Sparkles, AlertCircle
} from 'lucide-react';

interface Transaction {
  id: string;
  customer_name: string;
  type: string; // Earnings | Payout | Wallet Top-up | Withdrawal
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

interface Withdrawal {
  id: string;
  user_id: string;
  user_name: string;
  amount: number;
  bank_name?: string;
  account_number?: string;
  ifsc_code?: string;
  payment_method: string;
  notes?: string;
  status: string; // Pending | Approved | Rejected
  admin_note?: string;
  created_at?: string;
}

interface Commission {
  id: string;
  name: string;
  commission_type: string; // percent | flat
  commission_value: number;
  handyman_id?: string;
  handyman_name?: string;
  status: number;
}

export default function FinancePage() {
  const [role, setRole] = useState<'admin' | 'provider'>('admin');
  const [userId, setUserId] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [documents, setDocuments] = useState<ProviderDocument[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Payout Form State (Admin Only)
  const [selectedProviderId, setSelectedProviderId] = useState('');
  const [payoutAmount, setPayoutAmount] = useState('');
  const [processingPayout, setProcessingPayout] = useState(false);

  // Withdrawal Request State (Provider Only)
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI Instant Transfer');
  const [withdrawalNotes, setWithdrawalNotes] = useState('');
  const [requestingWithdrawal, setRequestingWithdrawal] = useState(false);

  // Search query
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Determine User Role
    const userStr = localStorage.getItem('user');
    const userObj = userStr ? JSON.parse(userStr) : null;
    if (userObj) {
      setUserId(userObj.id || userObj._id || '');
      setRole(userObj.user_type === 'provider' ? 'provider' : 'admin');
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchFinanceData();
    }
  }, [userId, role]);

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      if (role === 'admin') {
        const [txRes, docsRes, providersRes, withdrawalsRes, commissionsRes] = await Promise.all([
          apiClient.get('/transactions'),
          apiClient.get('/admin/provider-documents'),
          apiClient.get('/providers'),
          apiClient.get('/admin/withdrawals'),
          apiClient.get('/admin/commissions')
        ]);
        setTransactions(txRes.data || []);
        setDocuments(docsRes.data || []);
        setProviders((providersRes.data || []).filter((u: Provider) => u.user_type === 'provider'));
        setWithdrawals(withdrawalsRes.data || []);
        setCommissions(commissionsRes.data || []);
      } else {
        // Provider role
        const [balanceRes, txRes, withdrawalsRes, commissionsRes] = await Promise.all([
          apiClient.get(`/user-wallet-balance?id=${userId}`),
          apiClient.get('/wallet-history'),
          apiClient.get(`/admin/withdrawals?user_id=${userId}`),
          apiClient.get('/admin/commissions')
        ]);
        setWalletBalance(balanceRes.data?.balance || 0);
        setTransactions(txRes.data?.data || txRes.data || []);
        setWithdrawals(withdrawalsRes.data || []);
        setCommissions(commissionsRes.data || []);
      }
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

  // Admin Actions
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

  const handleProcessWithdrawal = async (withdrawalId: string, status: 'Approved' | 'Rejected') => {
    try {
      await apiClient.put(`/admin/withdrawals/${withdrawalId}`, {
        status: status,
        admin_note: `Withdrawal request ${status.toLowerCase()} by admin.`
      });
      showSuccess(`Withdrawal request marked as ${status}.`);
      fetchFinanceData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update withdrawal status');
    }
  };

  // Provider Actions
  const handleWithdrawalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawalAmount) return;

    setRequestingWithdrawal(true);
    try {
      await apiClient.post('/withdrawal-request', {
        amount: Number(withdrawalAmount),
        bank_name: bankName,
        account_number: accountNumber,
        ifsc_code: ifscCode,
        payment_method: paymentMethod,
        notes: withdrawalNotes
      });
      showSuccess('Withdrawal request submitted for review!');
      setWithdrawalAmount('');
      setWithdrawalNotes('');
      fetchFinanceData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit withdrawal request');
    } finally {
      setRequestingWithdrawal(false);
    }
  };

  const filteredTransactions = transactions.filter(t =>
    (t.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.utr_id || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Statistics calculations
  const totalIncome = transactions
    .filter(t => t.type !== 'Payout' && t.type !== 'Withdrawal' && t.status === 'Completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingWithdrawalSum = withdrawals
    .filter(w => w.status === 'Pending')
    .reduce((sum, w) => sum + w.amount, 0);

  const activeCommissions = commissions.filter(c => c.status === 1);

  return (
    <div className="space-y-8 relative">
      {/* Background ambient glows */}
      <div className="fixed top-0 left-[20%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-[10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10" />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">Finance & Earnings</h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            {role === 'admin' 
              ? 'UPI intent tracking, provider wallet balance payouts, and document verifications.'
              : 'Keep track of your job earnings, commission breakdowns, and transfer payouts.'}
          </p>
        </div>
        <button
          onClick={fetchFinanceData}
          className="group flex items-center justify-center gap-2.5 h-10 px-5 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white rounded-xl transition-all shadow-[0_0_20px_rgba(0,0,0,0.2)] active:scale-95 font-semibold"
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

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#0a0a0c]/60 backdrop-blur-xl border border-white/5 rounded-[24px] p-6 shadow-2xl flex items-center justify-between relative z-10 hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.8)]">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
              {role === 'admin' ? 'Total Platform Volume' : 'Total Earnings'}
            </span>
            <span className="text-2xl font-black text-zinc-100 flex items-center">
              <IndianRupee className="w-5 h-5 text-emerald-400" />
              {totalIncome.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-500/10">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#0a0a0c]/60 backdrop-blur-xl border border-white/5 rounded-[24px] p-6 shadow-2xl flex items-center justify-between relative z-10 hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.8)]">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
              {role === 'admin' ? 'Total Payouts Done' : 'Withdrawable Wallet Balance'}
            </span>
            <span className="text-2xl font-black text-zinc-100 flex items-center">
              <IndianRupee className="w-5 h-5 text-primary" />
              {(role === 'admin' 
                ? transactions.filter(t => t.type === 'Payout' || t.type === 'Withdrawal').reduce((sum, t) => sum + t.amount, 0)
                : walletBalance
              ).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center border border-primary/10">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#0a0a0c]/60 backdrop-blur-xl border border-white/5 rounded-[24px] p-6 shadow-2xl flex items-center justify-between relative z-10 hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.8)]">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
              {role === 'admin' ? 'Pending Withdrawals' : 'In-Review Withdrawals'}
            </span>
            <span className="text-2xl font-black text-zinc-100 flex items-center">
              <IndianRupee className="w-5 h-5 text-amber-400" />
              {pendingWithdrawalSum.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="w-10 h-10 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center border border-amber-500/10">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ─── DUAL ROLE WORKFLOWS ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Side forms/breakdowns */}
        <div className="space-y-6 lg:col-span-1">
          {role === 'admin' ? (
            /* ADMIN: Manual payout trigger form */
            <div className="bg-[#0a0a0c]/60 backdrop-blur-xl border border-white/5 rounded-[24px] p-6 shadow-2xl space-y-6 relative z-10">
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
                    className="w-full h-11 px-3 bg-[#0a0a0c]/90 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-primary/50 shadow-inner focus:outline-none focus:ring-1 focus:ring-primary/50"
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
                    className="w-full h-11 px-3 bg-[#0a0a0c]/90 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-primary/50 shadow-inner placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={processingPayout}
                  className="w-full h-11 bg-primary hover:bg-primary/95 text-zinc-950 font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-2"
                >
                  {processingPayout && <Loader2 className="w-4 h-4 animate-spin" />}
                  Send UPI Settlement
                </button>
              </form>
            </div>
          ) : (
            /* PROVIDER: Request wallet withdrawal form */
            <div className="bg-[#0a0a0c]/60 backdrop-blur-xl border border-white/5 rounded-[24px] p-6 shadow-2xl space-y-6 relative z-10">
              <h2 className="text-base font-bold flex items-center gap-2">
                <Send className="w-4.5 h-4.5 text-primary" />
                Request Withdrawal
              </h2>
              <form onSubmit={handleWithdrawalRequest} className="space-y-3.5">
                <div>
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Amount (₹)</label>
                  <input
                    type="number"
                    min={100}
                    max={walletBalance}
                    required
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    placeholder={`Max: ₹${walletBalance}`}
                    className="w-full h-10 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">UPI ID / Account No.</label>
                  <input
                    type="text"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="e.g. mobile@ybl or Acc No."
                    className="w-full h-10 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">IFSC Code / Bank Name (Optional)</label>
                  <input
                    type="text"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value)}
                    placeholder="IFSC or Bank Name"
                    className="w-full h-10 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Payout Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full h-10 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary/50"
                  >
                    <option value="UPI Instant Transfer">UPI Transfer</option>
                    <option value="Direct Bank Account Transfer">Bank Account IMPS</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={requestingWithdrawal || Number(withdrawalAmount) > walletBalance || walletBalance < 100}
                  className="w-full h-10 bg-primary hover:bg-primary/95 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-2"
                >
                  {requestingWithdrawal && <Loader2 className="w-4 h-4 animate-spin" />}
                  Submit Request
                </button>
              </form>
            </div>
          )}

          {/* Commissions settings card */}
          <div className="bg-[#0a0a0c]/60 backdrop-blur-xl border border-white/5 rounded-[24px] p-6 shadow-2xl space-y-6 relative z-10">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Percent className="w-4.5 h-4.5 text-primary" />
              Platform Commission Rates
            </h2>
            <div className="space-y-2.5">
              {activeCommissions.map(c => (
                <div key={c.id} className="flex justify-between items-center text-xs p-2 bg-zinc-800/30 border border-zinc-800/60 rounded-xl">
                  <span className="text-zinc-300 font-medium">{c.name}</span>
                  <span className="text-primary font-bold">{c.commission_value}{c.commission_type === 'percent' ? '%' : ' Flat'}</span>
                </div>
              ))}
              {activeCommissions.length === 0 && (
                <div className="flex items-center gap-2 p-3 bg-zinc-800/30 border border-zinc-800/60 rounded-xl text-xs text-zinc-500">
                  <AlertCircle className="w-4.5 h-4.5 text-zinc-650" />
                  <span>Standard 10% platform commission applies to all booking orders.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side approvals or withdrawal status lists */}
        <div className="lg:col-span-2 space-y-6">
          {role === 'admin' ? (
            /* ADMIN view: Document approvals & Withdrawal requests */
            <>
              {/* Document verifications */}
              <div className="bg-[#0a0a0c]/60 backdrop-blur-xl border border-white/5 rounded-[24px] p-6 shadow-2xl space-y-6 relative z-10">
                <h2 className="text-base font-bold flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Verification Documents ({documents.length})
                </h2>
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {documents.map((d) => (
                    <div key={d.id} className="bg-zinc-800/30 border border-zinc-800/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-zinc-800 border border-zinc-700/50 flex items-center justify-center rounded-lg text-primary shrink-0">
                          <FileText className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-zinc-100">{d.document_type}</h4>
                          <a
                            href={d.document_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-primary hover:underline font-medium mt-0.5 block"
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
                              className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-semibold transition-all flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" /> Approve
                            </button>
                            <button
                              onClick={() => handleDocumentAction(d.id, 'Rejected')}
                              className="h-7 px-2.5 bg-red-955/40 hover:bg-red-900/30 text-red-400 border border-red-500/10 rounded-lg text-[10px] font-semibold transition-all flex items-center gap-1"
                            >
                              <X className="w-3 h-3" /> Reject
                            </button>
                          </>
                        ) : (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            d.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                            {d.status === 'Approved' ? 'Approved' : 'Rejected'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {documents.length === 0 && (
                    <p className="text-center text-xs text-zinc-500 py-10">No documents pending review.</p>
                  )}
                </div>
              </div>

              {/* Withdrawal Requests */}
              <div className="bg-[#0a0a0c]/60 backdrop-blur-xl border border-white/5 rounded-[24px] p-6 shadow-2xl space-y-6 relative z-10">
                <h2 className="text-base font-bold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-455" />
                  Withdrawal Requests ({withdrawals.length})
                </h2>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {withdrawals.map((w) => (
                    <div key={w.id} className="bg-zinc-800/30 border border-zinc-800/80 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-zinc-100">{w.user_name}</span>
                          <span className="text-[10px] text-zinc-500 font-mono">({w.payment_method})</span>
                        </div>
                        <p className="text-[11px] text-zinc-400">Acc/UPI: <strong className="font-mono text-zinc-200">{w.account_number}</strong></p>
                        {w.notes && <p className="text-[10px] text-zinc-500 italic">Notes: "{w.notes}"</p>}
                      </div>
                      <div className="flex items-center gap-4 self-end sm:self-auto">
                        <span className="font-bold text-sm text-zinc-100 flex items-center">
                          <IndianRupee className="w-3.5 h-3.5" />
                          {w.amount.toLocaleString('en-IN')}
                        </span>
                        {w.status === 'Pending' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleProcessWithdrawal(w.id, 'Approved')}
                              className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-semibold transition-all"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleProcessWithdrawal(w.id, 'Rejected')}
                              className="h-7 px-2.5 bg-red-955/40 hover:bg-red-900/30 text-red-400 border border-red-500/10 rounded-lg text-[10px] font-semibold transition-all"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            w.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                            {w.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {withdrawals.length === 0 && (
                    <p className="text-center text-xs text-zinc-500 py-10">No withdrawal requests recorded.</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* PROVIDER view: Withdrawal Requests Status */
            <div className="bg-[#0a0a0c]/60 backdrop-blur-xl border border-white/5 rounded-[24px] p-6 shadow-2xl space-y-6 relative z-10">
              <h2 className="text-base font-bold flex items-center gap-2">
                <Clock className="w-4.5 h-4.5 text-primary" />
                Withdrawal Requests & History
              </h2>
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {withdrawals.map((w) => (
                  <div key={w.id} className="bg-zinc-800/20 border border-zinc-800/60 rounded-xl p-3.5 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="font-bold text-xs text-zinc-200">₹{w.amount.toLocaleString('en-IN')}</span>
                      <p className="text-[10px] text-zinc-400">Method: {w.payment_method} • Acc: {w.account_number}</p>
                      {w.admin_note && <p className="text-[10px] text-zinc-500">Note: "{w.admin_note}"</p>}
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                      w.status === 'Approved' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : w.status === 'Pending'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {w.status}
                    </span>
                  </div>
                ))}
                {withdrawals.length === 0 && (
                  <div className="text-center py-16 text-zinc-500 text-xs">
                    No withdrawal requests submitted yet.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transactions list */}
      <div className="overflow-x-auto rounded-[28px] border border-white/5 bg-[#0a0a0c]/60 backdrop-blur-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] relative z-10">
        <div className="p-4 border-b border-zinc-800/60 flex items-center justify-between gap-4">
          <h2 className="font-bold text-sm text-zinc-300">Transaction History Log</h2>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by description or UTR..."
              className="relative z-10 w-full h-11 pl-10 pr-4 bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/10 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 transition-all shadow-lg"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-white/5 text-left">
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
                      t.type === 'Payout' || t.type === 'Withdrawal' 
                        ? 'bg-red-500/10 text-red-400 border border-red-500/10' 
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                    }`}>
                      {t.type === 'Payout' || t.type === 'Withdrawal' ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                      {t.type}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs text-zinc-400">{t.date}</td>
                  <td className="px-4 py-4 text-xs text-zinc-400 font-medium">{t.payment_method}</td>
                  <td className="px-4 py-4 text-xs text-zinc-400 font-mono">{t.utr_id || 'UPI-MANUAL'}</td>
                  <td className={`px-4 py-4 text-right text-xs font-extrabold ${t.type === 'Payout' || t.type === 'Withdrawal' ? 'text-red-400' : 'text-emerald-400'}`}>
                    {t.type === 'Payout' || t.type === 'Withdrawal' ? '-' : '+'}₹{t.amount.toLocaleString('en-IN')}
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
