'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { apiClient } from '../../../../lib/apiClient';
import {
  Search, Trash2, Edit2, Clock, Loader2, AlertCircle, CheckCircle, X, Store, Briefcase, Plus, Check
} from 'lucide-react';

interface ProviderInfo {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Shop {
  id: string;
  name: string;
  email: string;
  contact_number: string;
  city: string;
  address?: string;
  logo?: string;
  status: boolean | number; // Support boolean or integer
  provider_id: string;
  provider?: ProviderInfo;
}

interface ProviderUser {
  id: string;
  display_name: string;
  email: string;
}

// Global cache for SWR
const swrCache: { [key: string]: any } = {};

function useSimpleSWR<T>(key: string | null, fetcher: (url: string) => Promise<T>) {
  const [data, setData] = useState<T | undefined>(key ? swrCache[key] : undefined);
  const [error, setError] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);

  const revalidate = useCallback(async () => {
    if (!key) return;
    setIsValidating(true);
    try {
      const result = await fetcher(key);
      swrCache[key] = result;
      setData(result);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsValidating(false);
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

  return {
    data,
    error,
    isLoading: !data && !error,
    isValidating,
    mutate
  };
}

function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function AdminShopsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);

  // Form inputs
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formLogo, setFormLogo] = useState('');
  const [formProviderId, setFormProviderId] = useState('');

  // Dropdown list of providers
  const [providers, setProviders] = useState<ProviderUser[]>([]);

  // Bulk actions and selections
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Feedback notifications (mocking react-hot-toast error and success)
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  // Fetcher helper
  const shopsFetcher = useCallback(async (url: string) => {
    const res = await apiClient.get(url);
    return res.data as Shop[];
  }, []);

  const swrKey = useMemo(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) {
      params.append('search', debouncedSearch);
    }
    return `/admin/shops/?${params.toString()}`;
  }, [debouncedSearch]);

  const { data: shops = [], error: fetchError, isLoading, mutate } = useSimpleSWR<Shop[]>(swrKey, shopsFetcher);

  // Fetch providers list
  useEffect(() => {
    const fetchProvidersList = async () => {
      try {
        const res = await apiClient.get('/providers');
        const list = (res.data || []).filter((u: any) => u.user_type === 'provider');
        setProviders(list.map((p: any) => ({
          id: p.id,
          display_name: p.display_name || p.name || 'Unnamed Provider',
          email: p.email
        })));
      } catch (err) {
        console.error('Failed to load providers list', err);
      }
    };
    fetchProvidersList();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingShop(null);
    setFormName('');
    setFormEmail('');
    setFormContact('');
    setFormCity('');
    setFormAddress('');
    setFormLogo('');
    setFormProviderId(providers[0]?.id || '');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (shop: Shop) => {
    setEditingShop(shop);
    setFormName(shop.name);
    setFormEmail(shop.email);
    setFormContact(shop.contact_number);
    setFormCity(shop.city);
    setFormAddress(shop.address || '');
    setFormLogo(shop.logo || '');
    setFormProviderId(shop.provider_id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProviderId) {
      showToast('Please select a valid provider.', 'error');
      return;
    }

    const payload = {
      name: formName,
      email: formEmail,
      contact_number: formContact,
      city: formCity,
      address: formAddress || undefined,
      logo: formLogo || undefined,
      provider_id: formProviderId,
      status: true
    };

    try {
      if (editingShop) {
        await apiClient.put(`/admin/shops/${editingShop.id}`, payload);
        showToast('Shop updated successfully.');
      } else {
        await apiClient.post('/admin/shops/', payload);
        showToast('New shop created successfully.');
      }
      setIsModalOpen(false);
      mutate();
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to save shop.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this shop? This action is permanent.')) return;
    try {
      await apiClient.delete(`/admin/shops/${id}`);
      showToast('Shop deleted successfully.');
      setSelectedIds(prev => prev.filter(item => item !== id));
      mutate();
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to delete shop.', 'error');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean | number) => {
    const isTrue = currentStatus === true || currentStatus === 1;
    const nextStatus = !isTrue;

    // Optimistic UI Update
    const originalShops = [...shops];
    mutate(
      shops.map(s => (s.id === id ? { ...s, status: nextStatus } : s)),
      { revalidate: false }
    );

    try {
      await apiClient.put(`/admin/shops/${id}/toggle`, { status: nextStatus });
      showToast(`Shop status updated to ${nextStatus ? 'Active' : 'Inactive'}.`);
    } catch (err: any) {
      // Revert optimistic update
      mutate(originalShops, { revalidate: false });
      showToast(err.response?.data?.detail || 'Failed to toggle shop status. Reverted change.', 'error');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(shops.map(s => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  return (
    <div className="space-y-6 text-zinc-300 relative">
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[100] flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200 bg-[#1c1c1e] border-zinc-800">
          {toastType === 'success' ? (
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-450 border border-emerald-500/30">
              <Check className="w-3.5 h-3.5" />
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-455 border border-rose-500/30">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
          )}
          <span className="text-xs font-semibold text-zinc-200">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-zinc-550 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Store className="w-5.5 h-5.5 text-[#5E5CE6]" />
            All Shop
          </h1>
          <p className="text-zinc-500 text-xs mt-0.5">
            Admin storefront moderation, active status control, and provider assignment.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="bg-[#5E5CE6] hover:bg-[#5E5CE6]/90 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-lg shadow-[#5E5CE6]/15 transition-all"
        >
          <Plus className="w-4 h-4" />
          New Shop
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-zinc-900/60 border border-zinc-800/80 p-3 rounded-xl">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select className="bg-[#121214] border border-zinc-800/60 text-xs text-zinc-400 rounded-lg px-3 h-8.5 focus:outline-none">
            <option>No Action</option>
            <option>Delete Selected</option>
          </select>
          <button className="bg-[#5E5CE6] hover:bg-[#5E5CE6]/80 text-white font-semibold text-xs px-3 h-8.5 rounded-lg transition-colors">
            Apply
          </button>
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by shop name, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8.5 pl-9 pr-4 bg-[#121214] border border-zinc-800/60 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#5E5CE6]/60 transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center p-12 bg-[#18181b] border border-zinc-850 rounded-xl">
          <Loader2 className="w-6 h-6 text-[#5E5CE6] animate-spin" />
        </div>
      ) : fetchError ? (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-4 py-3 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500" />
          <span>Failed to load shops: {fetchError.message || 'Server error.'}</span>
        </div>
      ) : shops.length === 0 ? (
        <div className="border border-zinc-850 rounded-xl p-12 text-center bg-[#18181b] text-zinc-500 text-xs">
          No shops found. Click "New Shop" to register one.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-800/50">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-[#5E5CE6]/90">
                <th className="py-3 px-4 text-[11px] font-bold text-white uppercase tracking-wider w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === shops.length && shops.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-zinc-600 bg-zinc-800 text-[#5E5CE6] focus:ring-[#5E5CE6] h-3.5 w-3.5"
                  />
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-white uppercase tracking-wider">Shop Name</th>
                <th className="py-3 px-4 text-[11px] font-bold text-white uppercase tracking-wider">Provider</th>
                <th className="py-3 px-4 text-[11px] font-bold text-white uppercase tracking-wider">City</th>
                <th className="py-3 px-4 text-[11px] font-bold text-white uppercase tracking-wider">Contact Number</th>
                <th className="py-3 px-4 text-[11px] font-bold text-white uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-[11px] font-bold text-white uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {shops.map((shop) => {
                const isActive = shop.status === true || shop.status === 1;
                return (
                  <tr key={shop.id} className="bg-[#18181b] border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(shop.id)}
                        onChange={(e) => handleSelectOne(shop.id, e.target.checked)}
                        className="rounded border-zinc-700 bg-zinc-800 text-[#5E5CE6] focus:ring-[#5E5CE6] h-3.5 w-3.5"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {shop.logo ? (
                          <img
                            src={shop.logo}
                            alt={shop.name}
                            className="w-8 h-8 rounded-md object-cover border border-zinc-800/80 bg-zinc-900"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-md bg-zinc-800/60 border border-zinc-800/80 flex items-center justify-center text-zinc-550">
                            <Store className="w-4 h-4 text-zinc-650" />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-white leading-tight">{shop.name}</span>
                          <span className="text-[10px] text-zinc-400 leading-tight">{shop.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {shop.provider ? (
                        <div className="flex items-center gap-2">
                          {shop.provider.avatar ? (
                            <img
                              src={shop.provider.avatar}
                              alt={shop.provider.name}
                              className="w-8 h-8 rounded-full object-cover border border-zinc-800"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-800 flex items-center justify-center text-[10px] text-zinc-500 font-bold uppercase">
                              {shop.provider.name.charAt(0)}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-white leading-tight">{shop.provider.name}</span>
                            <span className="text-[10px] text-zinc-400 leading-tight">{shop.provider.email}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-zinc-600 font-medium">-</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-zinc-300">
                      {shop.city}
                    </td>
                    <td className="py-3 px-4 text-sm text-zinc-300">
                      {shop.contact_number}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleStatus(shop.id, shop.status)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          isActive ? 'bg-[#5E5CE6]' : 'bg-zinc-800'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            isActive ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          title="Operational Log"
                          className="text-emerald-500 hover:text-emerald-450 p-1 hover:bg-zinc-800 rounded transition-all hover:scale-110 duration-200"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(shop)}
                          title="Edit Shop"
                          className="text-blue-400 hover:text-blue-300 p-1 hover:bg-zinc-800 rounded transition-all hover:scale-110 duration-200"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(shop.id)}
                          title="Delete Shop"
                          className="text-red-500 hover:text-red-400 p-1 hover:bg-rose-950/30 rounded transition-all hover:scale-110 duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Glassmorphism Input Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1c1c1e] border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <Store className="w-4.5 h-4.5 text-[#5E5CE6]" />
                {editingShop ? 'Edit Shop Settings' : 'Register New Shop'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-550 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Shop Name</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Ace Tools"
                      className="w-full h-9.5 px-3 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-[#5E5CE6]/60"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="e.g. contact@acetools.com"
                      className="w-full h-9.5 px-3 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-[#5E5CE6]/60"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Contact Number</label>
                    <input
                      type="text"
                      required
                      value={formContact}
                      onChange={(e) => setFormContact(e.target.value)}
                      placeholder="e.g. +12 135750101"
                      className="w-full h-9.5 px-3 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-[#5E5CE6]/60"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">City</label>
                    <input
                      type="text"
                      required
                      value={formCity}
                      onChange={(e) => setFormCity(e.target.value)}
                      placeholder="e.g. Austin"
                      className="w-full h-9.5 px-3 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-[#5E5CE6]/60"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Street Address (Optional)</label>
                  <input
                    type="text"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    placeholder="e.g. 123 Austin Blvd"
                    className="w-full h-9.5 px-3 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-[#5E5CE6]/60"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Logo Image URL (Optional)</label>
                  <input
                    type="text"
                    value={formLogo}
                    onChange={(e) => setFormLogo(e.target.value)}
                    placeholder="e.g. https://images.unsplash.com/..."
                    className="w-full h-9.5 px-3 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-[#5E5CE6]/60"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-zinc-550" />
                    Assign Owner Provider
                  </label>
                  <select
                    required
                    value={formProviderId}
                    onChange={(e) => setFormProviderId(e.target.value)}
                    className="w-full h-9.5 px-3 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-[#5E5CE6]/60"
                  >
                    <option value="" disabled>-- Select Partner Provider --</option>
                    {providers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.display_name} ({p.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 px-5 py-3.5 bg-zinc-900/30 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-8.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-8.5 px-4 bg-[#5E5CE6] hover:bg-[#5E5CE6]/90 text-white text-xs font-bold rounded-lg transition-colors"
                >
                  {editingShop ? 'Save Changes' : 'Register Shop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
