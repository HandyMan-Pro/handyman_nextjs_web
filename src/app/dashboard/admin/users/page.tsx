'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { apiClient } from '../../../../lib/apiClient';
import {
  Search, Check, ShieldAlert, ShieldCheck, Ban, UserCheck, Users,
  TrendingUp, Award, Wallet, Plus, Edit2, Trash2, X, Loader2,
  AlertCircle, DollarSign, Settings
} from 'lucide-react';

// Interfaces
interface ProviderUser {
  id: string;
  email: string;
  display_name: string;
  profile_image?: string;
  verification_status: string;
  is_blocked: boolean;
  status: string;
  shop_count: number;
  wallet_amount: number;
}

interface HandymanUser {
  id: string;
  email: string;
  display_name: string;
  profile_image?: string;
  verification_status: string;
  is_blocked: boolean;
  status: string;
  parent_provider_id?: string;
  provider?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

interface CustomerUser {
  id: string;
  email: string;
  display_name: string;
  profile_image?: string;
  is_blocked: boolean;
  status: string;
  total_points: number;
  current_points: number;
  wallet_amount: number;
}

interface CommissionRule {
  id: string;
  name: string;
  commission_value: number;
  commission_type: string;
  status: number;
}

// Simple SWR custom implementation for reactive API binding
const swrCache: { [key: string]: any } = {};

function useSimpleSWR<T>(key: string | null, fetcher: (url: string) => Promise<T>) {
  const [data, setData] = useState<T | undefined>(key ? swrCache[key] : undefined);
  const [error, setError] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(!data);

  const revalidate = useCallback(async () => {
    if (!key) return;
    setIsLoading(true);
    try {
      const result = await fetcher(key);
      swrCache[key] = result;
      setData(result);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [key, fetcher]);

  useEffect(() => {
    if (!key) return;
    revalidate();
  }, [key, revalidate]);

  const mutate = useCallback((newData?: T | ((prev?: T) => T | undefined), options = { revalidate: true }) => {
    if (!key) return;
    if (newData !== undefined) {
      const resolvedData = typeof newData === 'function' ? (newData as Function)(swrCache[key]) : newData;
      swrCache[key] = resolvedData;
      setData(resolvedData);
    }
    if (options.revalidate) {
      revalidate();
    }
  }, [key, revalidate]);

  return { data, error, isLoading, mutate, revalidate };
}

// Debounce hook
function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export default function AdminUsersPage() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'providers' | 'handymen' | 'customers'>('providers');

  useEffect(() => {
    if (pathname.includes('/providers')) {
      setActiveTab('providers');
    } else if (pathname.includes('/handymen')) {
      setActiveTab('handymen');
    } else if (pathname.includes('/customers')) {
      setActiveTab('customers');
    }
  }, [pathname]);

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 400);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [verifyFilter, setVerifyFilter] = useState<string>('all');

  // Commissions Modals State
  const [isRulesListModalOpen, setIsRulesListModalOpen] = useState(false);
  const [isRuleFormModalOpen, setIsRuleFormModalOpen] = useState(false);
  const [commissionRules, setCommissionRules] = useState<CommissionRule[]>([]);
  const [editingRule, setEditingRule] = useState<CommissionRule | null>(null);

  // Commission Rule Form Fields
  const [ruleName, setRuleName] = useState('');
  const [ruleValue, setRuleValue] = useState<number>(10);
  const [ruleType, setRuleType] = useState('Percent');
  const [ruleStatus, setRuleStatus] = useState<number>(1);

  // Feedback Notifications / Toasts
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  // API List Fetchers
  const providersFetcher = useCallback(async (url: string) => {
    const res = await apiClient.get(url);
    return res.data as ProviderUser[];
  }, []);

  const handymenFetcher = useCallback(async (url: string) => {
    const res = await apiClient.get(url);
    return res.data as HandymanUser[];
  }, []);

  const customersFetcher = useCallback(async (url: string) => {
    const res = await apiClient.get(url);
    return res.data as CustomerUser[];
  }, []);

  // Compute SWR URLs dynamically
  const providersKey = useMemo(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.append('search', debouncedSearch);
    if (statusFilter !== 'all') params.append('status', statusFilter);
    if (verifyFilter !== 'all') params.append('verification_status', verifyFilter);
    return `/admin/users/providers?${params.toString()}`;
  }, [debouncedSearch, statusFilter, verifyFilter]);

  const handymenKey = useMemo(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.append('search', debouncedSearch);
    if (statusFilter !== 'all') params.append('status', statusFilter);
    if (verifyFilter !== 'all') params.append('verification_status', verifyFilter);
    return `/admin/users/handymen?${params.toString()}`;
  }, [debouncedSearch, statusFilter, verifyFilter]);

  const customersKey = useMemo(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.append('search', debouncedSearch);
    if (statusFilter !== 'all') params.append('status', statusFilter);
    return `/admin/users/customers?${params.toString()}`;
  }, [debouncedSearch, statusFilter]);

  // SWR Hooks
  const { data: providers = [], mutate: mutateProviders, isLoading: providersLoading } = useSimpleSWR<ProviderUser[]>(
    activeTab === 'providers' ? providersKey : null,
    providersFetcher
  );

  const { data: handymen = [], mutate: mutateHandymen, isLoading: handymenLoading } = useSimpleSWR<HandymanUser[]>(
    activeTab === 'handymen' ? handymenKey : null,
    handymenFetcher
  );

  const { data: customers = [], mutate: mutateCustomers, isLoading: customersLoading } = useSimpleSWR<CustomerUser[]>(
    activeTab === 'customers' ? customersKey : null,
    customersFetcher
  );

  // Fetch Commission Rules list
  const fetchCommissionRules = useCallback(async () => {
    try {
      const res = await apiClient.get('/admin/users/commissions/providers');
      setCommissionRules(res.data || []);
    } catch (err: any) {
      showToast('Failed to load commission rules.', 'error');
    }
  }, [showToast]);

  useEffect(() => {
    if (isRulesListModalOpen) {
      fetchCommissionRules();
    }
  }, [isRulesListModalOpen, fetchCommissionRules]);

  // Actions
  const handleApprove = async (userId: string) => {
    try {
      await apiClient.put(`/admin/users/${userId}/approve`);
      showToast('User account successfully approved!');
      
      // Update state locally based on active tab
      if (activeTab === 'providers') {
        mutateProviders(providers.map(p => p.id === userId ? { ...p, status: 'active' } : p), { revalidate: false });
      } else if (activeTab === 'handymen') {
        mutateHandymen(handymen.map(h => h.id === userId ? { ...h, status: 'active' } : h), { revalidate: false });
      }
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to approve user.', 'error');
    }
  };

  const handleToggleVerify = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'verified' ? 'unverified' : 'verified';
    
    // Optimistically update UI
    const originalProviders = [...providers];
    const originalHandymen = [...handymen];
    
    if (activeTab === 'providers') {
      mutateProviders(providers.map(p => p.id === userId ? { ...p, verification_status: nextStatus } : p), { revalidate: false });
    } else if (activeTab === 'handymen') {
      mutateHandymen(handymen.map(h => h.id === userId ? { ...h, verification_status: nextStatus } : h), { revalidate: false });
    }

    try {
      const res = await apiClient.put(`/admin/users/${userId}/toggle-verify`);
      showToast(`Verification status updated to: ${res.data.verification_status}`);
    } catch (err: any) {
      // Revert state
      if (activeTab === 'providers') mutateProviders(originalProviders, { revalidate: false });
      if (activeTab === 'handymen') mutateHandymen(originalHandymen, { revalidate: false });
      showToast(err.response?.data?.detail || 'Failed to toggle verification status.', 'error');
    }
  };

  const handleToggleBlock = async (userId: string, isBlocked: boolean) => {
    const nextBlockState = !isBlocked;
    const nextStatusState = nextBlockState ? 'inactive' : 'active';

    // Optimistically update UI
    const originalProviders = [...providers];
    const originalHandymen = [...handymen];
    const originalCustomers = [...customers];

    if (activeTab === 'providers') {
      mutateProviders(providers.map(p => p.id === userId ? { ...p, is_blocked: nextBlockState, status: nextStatusState } : p), { revalidate: false });
    } else if (activeTab === 'handymen') {
      mutateHandymen(handymen.map(h => h.id === userId ? { ...h, is_blocked: nextBlockState, status: nextStatusState } : h), { revalidate: false });
    } else if (activeTab === 'customers') {
      mutateCustomers(customers.map(c => c.id === userId ? { ...c, is_blocked: nextBlockState, status: nextStatusState } : c), { revalidate: false });
    }

    try {
      const res = await apiClient.put(`/admin/users/${userId}/toggle-block`);
      showToast(res.data.is_blocked ? 'User is now BLOCKED' : 'User is now UNBLOCKED');
    } catch (err: any) {
      // Revert state
      if (activeTab === 'providers') mutateProviders(originalProviders, { revalidate: false });
      if (activeTab === 'handymen') mutateHandymen(originalHandymen, { revalidate: false });
      if (activeTab === 'customers') mutateCustomers(originalCustomers, { revalidate: false });
      showToast(err.response?.data?.detail || 'Failed to toggle block status.', 'error');
    }
  };

  // Commission Rule Operations
  const handleOpenRuleForm = (rule: CommissionRule | null = null) => {
    if (rule) {
      setEditingRule(rule);
      setRuleName(rule.name);
      setRuleValue(rule.commission_value);
      setRuleType(rule.commission_type);
      setRuleStatus(rule.status);
    } else {
      setEditingRule(null);
      setRuleName('');
      setRuleValue(10);
      setRuleType('Percent');
      setRuleStatus(1);
    }
    setIsRuleFormModalOpen(true);
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: ruleName,
      commission_value: Number(ruleValue),
      commission_type: ruleType,
      status: Number(ruleStatus)
    };

    try {
      if (editingRule) {
        await apiClient.put(`/admin/users/commissions/providers/${editingRule.id}`, payload);
        showToast('Commission rule updated successfully.');
      } else {
        await apiClient.post('/admin/users/commissions/providers', payload);
        showToast('Commission rule created successfully.');
      }
      setIsRuleFormModalOpen(false);
      fetchCommissionRules();
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to save commission rule.', 'error');
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this commission rule?')) return;
    try {
      await apiClient.delete(`/admin/users/commissions/providers/${ruleId}`);
      showToast('Commission rule deleted successfully.');
      fetchCommissionRules();
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to delete rule.', 'error');
    }
  };

  // Header Statistics Calculations
  const stats = useMemo(() => {
    if (activeTab === 'providers') {
      return {
        total: providers.length,
        active: providers.filter(p => p.status === 'active').length,
        blocked: providers.filter(p => p.is_blocked).length,
        pending: providers.filter(p => p.status === 'pending_approval').length,
      };
    } else if (activeTab === 'handymen') {
      return {
        total: handymen.length,
        active: handymen.filter(h => h.status === 'active').length,
        blocked: handymen.filter(h => h.is_blocked).length,
        pending: handymen.filter(h => h.status === 'pending_approval').length,
      };
    } else {
      return {
        total: customers.length,
        active: customers.filter(c => c.status === 'active').length,
        blocked: customers.filter(c => c.is_blocked).length,
        pending: 0,
      };
    }
  }, [activeTab, providers, handymen, customers]);

  const isLoading = activeTab === 'providers' ? providersLoading : activeTab === 'handymen' ? handymenLoading : customersLoading;

  return (
    <div className="space-y-6 text-zinc-300 relative">
      {/* Toast Banner */}
      {toast && (
        <div className="fixed top-5 right-5 z-[100] flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200 bg-[#1c1c1e] border-zinc-800">
          {toast.type === 'success' ? (
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-450 border border-emerald-500/30">
              <Check className="w-3.5 h-3.5" />
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-455 border border-rose-500/30">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
          )}
          <span className="text-xs font-semibold text-zinc-200">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-zinc-550 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="w-5.5 h-5.5 text-[#5E5CE6]" />
            User Management
          </h1>
          <p className="text-zinc-500 text-xs mt-0.5">
            Admin God-Mode control panel to verify, approve, block users, and manage custom provider commissions.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleOpenRuleForm(null)}
            className="bg-[#5E5CE6]/10 hover:bg-[#5E5CE6]/25 border border-[#5E5CE6]/30 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4 text-[#5E5CE6]" />
            Add Commission Rule
          </button>
          <button
            onClick={() => setIsRulesListModalOpen(true)}
            className="bg-[#5E5CE6] hover:bg-[#5E5CE6]/90 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-lg shadow-[#5E5CE6]/15 transition-all"
          >
            <Settings className="w-4 h-4" />
            Manage Commission Rules
          </button>
        </div>
      </div>

      {/* Dynamic Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1c1c1e]/60 border border-zinc-800 p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#5E5CE6]/10 border border-[#5E5CE6]/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-[#5E5CE6]" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-550 uppercase tracking-wider block font-bold">Total {activeTab}</span>
            <span className="text-lg font-bold text-white leading-none">{stats.total}</span>
          </div>
        </div>

        <div className="bg-[#1c1c1e]/60 border border-zinc-800 p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-emerald-450" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-555 uppercase tracking-wider block font-bold">Active</span>
            <span className="text-lg font-bold text-white leading-none">{stats.active}</span>
          </div>
        </div>

        <div className="bg-[#1c1c1e]/60 border border-zinc-800 p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
            <Ban className="w-5 h-5 text-rose-455" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-555 uppercase tracking-wider block font-bold">Blocked</span>
            <span className="text-lg font-bold text-white leading-none">{stats.blocked}</span>
          </div>
        </div>

        <div className="bg-[#1c1c1e]/60 border border-zinc-800 p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-amber-455" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-555 uppercase tracking-wider block font-bold">Pending Approval</span>
            <span className="text-lg font-bold text-white leading-none">{stats.pending}</span>
          </div>
        </div>
      </div>

      {/* Tabs Selection */}
      <div className="flex border-b border-zinc-800/85">
        <button
          onClick={() => { router.push('/dashboard/admin/users/providers'); setSearchQuery(''); setStatusFilter('all'); setVerifyFilter('all'); }}
          className={`px-5 py-3 text-xs font-bold transition-all relative border-b-2 ${
            activeTab === 'providers' ? 'text-white border-[#5E5CE6]' : 'text-zinc-500 border-transparent hover:text-zinc-300'
          }`}
        >
          Partner Providers
        </button>
        <button
          onClick={() => { router.push('/dashboard/admin/users/handymen'); setSearchQuery(''); setStatusFilter('all'); setVerifyFilter('all'); }}
          className={`px-5 py-3 text-xs font-bold transition-all relative border-b-2 ${
            activeTab === 'handymen' ? 'text-white border-[#5E5CE6]' : 'text-zinc-500 border-transparent hover:text-zinc-300'
          }`}
        >
          Independent Handymen
        </button>
        <button
          onClick={() => { router.push('/dashboard/admin/users/customers'); setSearchQuery(''); setStatusFilter('all'); }}
          className={`px-5 py-3 text-xs font-bold transition-all relative border-b-2 ${
            activeTab === 'customers' ? 'text-white border-[#5E5CE6]' : 'text-zinc-500 border-transparent hover:text-zinc-300'
          }`}
        >
          Customers Base
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-zinc-900/60 border border-zinc-800/80 p-3 rounded-xl">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#121214] border border-zinc-800/60 text-xs text-zinc-400 rounded-lg px-3 h-8.5 focus:outline-none"
          >
            <option value="all">Filter Status: All</option>
            <option value="active">Active</option>
            <option value="inactive">Blocked / Inactive</option>
            {activeTab !== 'customers' && <option value="pending_approval">Pending Approval</option>}
          </select>

          {/* Verification Status Filter (not for customers) */}
          {activeTab !== 'customers' && (
            <select
              value={verifyFilter}
              onChange={(e) => setVerifyFilter(e.target.value)}
              className="bg-[#121214] border border-zinc-800/60 text-xs text-zinc-400 rounded-lg px-3 h-8.5 focus:outline-none"
            >
              <option value="all">Filter Verification: All</option>
              <option value="verified">Verified Only</option>
              <option value="unverified">Unverified Only</option>
            </select>
          )}
        </div>

        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder={`Search ${activeTab} by name or email...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8.5 pl-9 pr-4 bg-[#121214] border border-zinc-800/60 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#5E5CE6]/60 transition-colors"
          />
        </div>
      </div>

      {/* Main Table Content */}
      {isLoading ? (
        <div className="flex items-center justify-center p-12 bg-[#18181b] border border-zinc-850 rounded-xl">
          <Loader2 className="w-6 h-6 text-[#5E5CE6] animate-spin" />
        </div>
      ) : activeTab === 'providers' ? (
        // Providers View
        providers.length === 0 ? (
          <div className="border border-zinc-850 rounded-xl p-12 text-center bg-[#18181b] text-zinc-500 text-xs">
            No partner providers matched the search/filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-800/50">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-[#5E5CE6]/90">
                  <th className="py-3 px-4 text-[11px] font-bold text-white uppercase tracking-wider">Provider Details</th>
                  <th className="py-3 px-4 text-[11px] font-bold text-white uppercase tracking-wider">Wallet Balance</th>
                  <th className="py-3 px-4 text-[11px] font-bold text-white uppercase tracking-wider">Shops</th>
                  <th className="py-3 px-4 text-[11px] font-bold text-white uppercase tracking-wider">Verification</th>
                  <th className="py-3 px-4 text-[11px] font-bold text-white uppercase tracking-wider">Block Status</th>
                  <th className="py-3 px-4 text-[11px] font-bold text-white uppercase tracking-wider text-right">Approve</th>
                </tr>
              </thead>
              <tbody>
                {providers.map((p) => {
                  const isVerified = p.verification_status === 'verified';
                  return (
                    <tr key={p.id} className="bg-[#18181b] border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {p.profile_image ? (
                            <img
                              src={p.profile_image}
                              alt={p.display_name}
                              className="w-9 h-9 rounded-full object-cover border border-zinc-800/80"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-800/80 flex items-center justify-center text-xs font-bold text-zinc-400">
                              {p.display_name?.charAt(0) || 'P'}
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-semibold text-white leading-tight">{p.display_name}</div>
                            <div className="text-[10px] text-zinc-550 leading-tight mt-0.5">{p.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-zinc-300 font-semibold">
                        ${p.wallet_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          title={`${p.shop_count} registered shops`}
                          className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#5E5CE6]/10 text-[#5E5CE6] border border-[#5E5CE6]/25 hover:bg-[#5E5CE6]/20 cursor-default transition-all"
                        >
                          {p.shop_count} Shops
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleVerify(p.id, p.verification_status)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                            isVerified
                              ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-450 hover:bg-emerald-500/20'
                              : 'bg-zinc-800/50 border-zinc-700/60 text-zinc-505 hover:bg-zinc-800'
                          }`}
                        >
                          {isVerified ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                          {isVerified ? 'Verified' : 'Unverified'}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleBlock(p.id, p.is_blocked)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            p.is_blocked ? 'bg-red-600' : 'bg-zinc-800'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              p.is_blocked ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {p.status === 'pending_approval' ? (
                          <button
                            onClick={() => handleApprove(p.id)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg transition-colors shadow shadow-emerald-500/20"
                          >
                            Approve
                          </button>
                        ) : (
                          <span className="text-[10px] text-zinc-600 font-medium">Approved</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      ) : activeTab === 'handymen' ? (
        // Handymen View
        handymen.length === 0 ? (
          <div className="border border-zinc-850 rounded-xl p-12 text-center bg-[#18181b] text-zinc-500 text-xs">
            No independent handymen matched the search/filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-800/50">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-[#5E5CE6]/90">
                  <th className="py-3 px-4 text-[11px] font-bold text-white uppercase tracking-wider">Handyman Details</th>
                  <th className="py-3 px-4 text-[11px] font-bold text-white uppercase tracking-wider">Parent Provider</th>
                  <th className="py-3 px-4 text-[11px] font-bold text-white uppercase tracking-wider">Verification</th>
                  <th className="py-3 px-4 text-[11px] font-bold text-white uppercase tracking-wider">Block Status</th>
                  <th className="py-3 px-4 text-[11px] font-bold text-white uppercase tracking-wider text-right">Approve</th>
                </tr>
              </thead>
              <tbody>
                {handymen.map((h) => {
                  const isVerified = h.verification_status === 'verified';
                  return (
                    <tr key={h.id} className="bg-[#18181b] border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {h.profile_image ? (
                            <img
                              src={h.profile_image}
                              alt={h.display_name}
                              className="w-9 h-9 rounded-full object-cover border border-zinc-800/80"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-800/80 flex items-center justify-center text-xs font-bold text-zinc-400">
                              {h.display_name?.charAt(0) || 'H'}
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-semibold text-white leading-tight">{h.display_name}</div>
                            <div className="text-[10px] text-zinc-550 leading-tight mt-0.5">{h.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {h.provider ? (
                          <div className="flex items-center gap-2">
                            {h.provider.avatar ? (
                              <img
                                src={h.provider.avatar}
                                alt={h.provider.name}
                                className="w-6 h-6 rounded-full object-cover border border-zinc-800/60"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-850 flex items-center justify-center text-[8px] font-bold text-zinc-400 uppercase">
                                {h.provider.name.charAt(0)}
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className="text-xs font-semibold text-zinc-300 leading-tight">{h.provider.name}</span>
                              <span className="text-[9px] text-zinc-550 leading-tight">{h.provider.email}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-zinc-600 font-medium">Independent</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleVerify(h.id, h.verification_status)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                            isVerified
                              ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-450 hover:bg-emerald-500/20'
                              : 'bg-zinc-800/50 border-zinc-700/60 text-zinc-505 hover:bg-zinc-800'
                          }`}
                        >
                          {isVerified ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                          {isVerified ? 'Verified' : 'Unverified'}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleBlock(h.id, h.is_blocked)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            h.is_blocked ? 'bg-red-650' : 'bg-zinc-800'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              h.is_blocked ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {h.status === 'pending_approval' ? (
                          <button
                            onClick={() => handleApprove(h.id)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg transition-colors shadow shadow-emerald-500/20"
                          >
                            Approve
                          </button>
                        ) : (
                          <span className="text-[10px] text-zinc-600 font-medium">Approved</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      ) : (
        // Customers View
        customers.length === 0 ? (
          <div className="border border-zinc-850 rounded-xl p-12 text-center bg-[#18181b] text-zinc-500 text-xs">
            No customers matched the search/filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-800/50">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-[#5E5CE6]/90">
                  <th className="py-3 px-4 text-[11px] font-bold text-white uppercase tracking-wider">Customer Details</th>
                  <th className="py-3 px-4 text-[11px] font-bold text-white uppercase tracking-wider">Points Balance</th>
                  <th className="py-3 px-4 text-[11px] font-bold text-white uppercase tracking-wider">Wallet Balance</th>
                  <th className="py-3 px-4 text-[11px] font-bold text-white uppercase tracking-wider text-right">Block Status</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => {
                  return (
                    <tr key={c.id} className="bg-[#18181b] border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {c.profile_image ? (
                            <img
                              src={c.profile_image}
                              alt={c.display_name}
                              className="w-9 h-9 rounded-full object-cover border border-zinc-800/80"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-800/80 flex items-center justify-center text-xs font-bold text-zinc-400">
                              {c.display_name?.charAt(0) || 'C'}
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-semibold text-white leading-tight">{c.display_name}</div>
                            <div className="text-[10px] text-zinc-550 leading-tight mt-0.5">{c.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-amber-500 font-semibold">
                          <Award className="w-4 h-4 text-amber-500" />
                          <span>{c.current_points} / {c.total_points} PTS</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-zinc-300 font-semibold">
                        ${c.wallet_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleToggleBlock(c.id, c.is_blocked)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            c.is_blocked ? 'bg-red-600' : 'bg-zinc-800'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              c.is_blocked ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* MODAL: Commission Rules List Manager */}
      {isRulesListModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1c1c1e] border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-[#1c1c1e]">
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <DollarSign className="w-4.5 h-4.5 text-[#5E5CE6]" />
                Provider Commission Rules
              </h3>
              <button onClick={() => setIsRulesListModalOpen(false)} className="text-zinc-550 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[350px] overflow-y-auto">
              {commissionRules.length === 0 ? (
                <div className="text-zinc-500 text-xs text-center py-8">
                  No commission rules configured. Click "Create Rule" to define one.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {commissionRules.map((rule) => (
                    <div
                      key={rule.id}
                      className="flex items-center justify-between p-3.5 bg-zinc-900/60 border border-zinc-800/80 rounded-xl"
                    >
                      <div>
                        <div className="text-sm font-bold text-white leading-tight">{rule.name}</div>
                        <div className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1.5">
                          <span className="font-semibold text-zinc-400 uppercase">{rule.commission_type} Commission</span>
                          <span>•</span>
                          <span className={`${rule.status === 1 ? 'text-emerald-450' : 'text-zinc-500'} font-bold`}>
                            {rule.status === 1 ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-bold text-[#5E5CE6]">
                            {rule.commission_type === 'Percent' ? `${rule.commission_value}%` : `$${rule.commission_value}`}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 border-l border-zinc-800 pl-3">
                          <button
                            onClick={() => handleOpenRuleForm(rule)}
                            className="text-blue-400 hover:text-blue-300 p-1 hover:bg-zinc-800 rounded transition-all"
                            title="Edit Rule"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRule(rule.id)}
                            className="text-red-500 hover:text-red-400 p-1 hover:bg-rose-950/20 rounded transition-all"
                            title="Delete Rule"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2.5 px-5 py-3.5 bg-zinc-900/30 border-t border-zinc-800">
              <button
                onClick={() => handleOpenRuleForm(null)}
                className="h-8.5 px-4 bg-[#5E5CE6] hover:bg-[#5E5CE6]/90 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Create New Rule
              </button>
              <button
                onClick={() => setIsRulesListModalOpen(false)}
                className="h-8.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Create/Edit Commission Rule Form */}
      {isRuleFormModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1c1c1e] border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-[#1c1c1e]">
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <DollarSign className="w-4.5 h-4.5 text-[#5E5CE6]" />
                {editingRule ? 'Edit Commission Rule' : 'Create Commission Rule'}
              </h3>
              <button onClick={() => setIsRuleFormModalOpen(false)} className="text-zinc-550 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRule}>
              <div className="p-5 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Rule Name</label>
                  <input
                    type="text"
                    required
                    value={ruleName}
                    onChange={(e) => setRuleName(e.target.value)}
                    placeholder="e.g. Premium Provider Rate"
                    className="w-full h-9.5 px-3 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-[#5E5CE6]/60"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Commission Type</label>
                    <select
                      value={ruleType}
                      onChange={(e) => setRuleType(e.target.value)}
                      className="w-full h-9.5 px-3 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-[#5E5CE6]/60"
                    >
                      <option value="Percent">Percent (%)</option>
                      <option value="Flat">Flat Fee ($)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Value</label>
                    <input
                      type="number"
                      step="any"
                      required
                      min="0"
                      value={ruleValue}
                      onChange={(e) => setRuleValue(Number(e.target.value))}
                      placeholder="e.g. 15"
                      className="w-full h-9.5 px-3 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-[#5E5CE6]/60"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Status</label>
                  <select
                    value={ruleStatus}
                    onChange={(e) => setRuleStatus(Number(e.target.value))}
                    className="w-full h-9.5 px-3 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-[#5E5CE6]/60"
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 px-5 py-3.5 bg-zinc-900/30 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsRuleFormModalOpen(false)}
                  className="h-8.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-8.5 px-4 bg-[#5E5CE6] hover:bg-[#5E5CE6]/90 text-white text-xs font-bold rounded-lg transition-colors"
                >
                  {editingRule ? 'Save Changes' : 'Create Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
