'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/apiClient';
import { getUserData } from '../../../lib/auth';
import { useLanguage } from '../../../contexts/LanguageContext';
import {
  Store, Plus, Trash2, Edit3, MapPin, Mail, Phone,
  X, Loader2, Search, AlertCircle, CheckCircle, Power,
  Building2, Image, ExternalLink
} from 'lucide-react';

interface StorefrontShop {
  id: string;
  name: string;
  email: string;
  contact_number: string;
  city: string;
  address?: string;
  logo?: string;
  status: number; // 1: Active, 0: Inactive
  provider_id: string;
  created_at: string;
  updated_at: string;
}

export default function ShopsPage() {
  const { t } = useLanguage();
  const [shops, setShops] = useState<StorefrontShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all'); // all, active, inactive

  // Modal Controls
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editShopId, setEditShopId] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formContactNumber, setFormContactNumber] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formLogo, setFormLogo] = useState('');
  const [formStatus, setFormStatus] = useState<number>(1);
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/provider/shops');
      const fetchedShops = res.data || [];
      setShops(fetchedShops);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch shops.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setIsEditMode(false);
    setEditShopId(null);
    setFormName('');
    setFormEmail('');
    setFormContactNumber('');
    setFormCity('');
    setFormAddress('');
    setFormLogo('');
    setFormStatus(1);
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (shop: StorefrontShop, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditMode(true);
    setEditShopId(shop.id);
    setFormName(shop.name);
    setFormEmail(shop.email);
    setFormContactNumber(shop.contact_number);
    setFormCity(shop.city);
    setFormAddress(shop.address || '');
    setFormLogo(shop.logo || '');
    setFormStatus(shop.status);
    setFormError('');
    setModalOpen(true);
  };

  const handleSaveShop = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Client-side validations
    if (!formName.trim()) {
      setFormError('Shop name is required.');
      return;
    }
    if (!formEmail.trim() || !/\S+@\S+\.\S+/.test(formEmail)) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (!formContactNumber.trim()) {
      setFormError('Contact number is required.');
      return;
    }
    if (!formCity.trim()) {
      setFormError('City is required.');
      return;
    }

    setFormSaving(true);

    const payload = {
      name: formName.trim(),
      email: formEmail.trim(),
      contact_number: formContactNumber.trim(),
      city: formCity.trim(),
      address: formAddress.trim() || undefined,
      logo: formLogo.trim() || undefined,
      status: formStatus,
    };

    const previousShops = [...shops];

    try {
      if (isEditMode && editShopId) {
        // Optimistic UI update
        setShops(prev => prev.map(s => s.id === editShopId ? {
          ...s,
          ...payload,
          updated_at: new Date().toISOString()
        } : s));

        await apiClient.put(`/provider/shops/${editShopId}`, payload);
        setSuccess('Storefront updated successfully!');
      } else {
        const res = await apiClient.post('/provider/shops/', payload);
        const createdShop = res.data;
        if (createdShop) {
          setShops(prev => [createdShop, ...prev]);
        }
        setSuccess('Storefront registered successfully!');
      }
      setModalOpen(false);
      fetchShops(); // Refresh database state
    } catch (err: any) {
      setShops(previousShops);
      setFormError(err.response?.data?.detail || err.message || 'Failed to save shop storefront.');
    } finally {
      setFormSaving(false);
    }
  };

  const handleDeactivateShop = async (shopId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to deactivate this storefront? (Soft delete)')) {
      return;
    }

    const previousShops = [...shops];
    setShops(prev => prev.map(s => s.id === shopId ? { ...s, status: 0 } : s));

    try {
      await apiClient.delete(`/provider/shops/${shopId}`);
      setSuccess('Storefront deactivated successfully!');
    } catch (err: any) {
      setShops(previousShops);
      setError(err.response?.data?.detail || err.message || 'Failed to deactivate storefront.');
    }
  };

  const handleReactivateShop = async (shop: StorefrontShop, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const previousShops = [...shops];
    setShops(prev => prev.map(s => s.id === shop.id ? { ...s, status: 1 } : s));

    try {
      await apiClient.put(`/provider/shops/${shop.id}`, {
        name: shop.name,
        email: shop.email,
        contact_number: shop.contact_number,
        city: shop.city,
        status: 1
      });
      setSuccess('Storefront reactivated successfully!');
    } catch (err: any) {
      setShops(previousShops);
      setError(err.response?.data?.detail || err.message || 'Failed to reactivate storefront.');
    }
  };

  // Filter storefronts
  const filteredShops = shops.filter(shop => {
    const matchesSearch = 
      shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'active' && shop.status === 1) ||
      (statusFilter === 'inactive' && shop.status === 0);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
            <Store className="w-6 h-6 text-primary" />
            {t('Storefront Manager')}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5 font-medium">
            {t('Manage your material shops, inventory contacts, and business storefront locations.')}
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          id="btn-create-shop"
          className="h-11 px-5 bg-primary hover:bg-primary/95 text-zinc-950 font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/10 hover:shadow-primary/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          {t('Register Storefront')}
        </button>
      </div>

      {/* Feedback Alerts */}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl px-4 py-3 text-sm animate-fade-in flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4.5 h-4.5 text-emerald-500" />
            <span className="font-medium">{success}</span>
          </div>
          <button onClick={() => setSuccess('')} className="text-zinc-450 hover:text-zinc-600 dark:hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl px-4 py-3 text-sm animate-fade-in flex justify-between items-center">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4.5 h-4.5 text-rose-500" />
            <span className="font-medium">{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-zinc-450 hover:text-zinc-650 dark:hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/60 p-4 rounded-2xl">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-450 dark:text-zinc-500" />
          <input
            type="text"
            placeholder={t('Search storefront name or city...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-4 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-850 rounded-xl text-sm text-zinc-800 dark:text-zinc-300 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all"
          />
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-xs text-zinc-550 shrink-0 font-bold uppercase tracking-wider">{t('Status')}:</span>
          {(['all', 'active', 'inactive'] as const).map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`h-8 px-4 rounded-full text-xs font-bold transition-all shrink-0 capitalize ${
                statusFilter === f
                  ? 'bg-primary text-zinc-950 shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
              }`}
            >
              {t(f)}
            </button>
          ))}
        </div>
      </div>

      {/* Shop Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-855 rounded-2xl overflow-hidden animate-pulse h-64 flex flex-col justify-between p-5 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
                  <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6" />
                <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-4/6" />
              </div>
              <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded-xl w-full" />
            </div>
          ))}
        </div>
      ) : filteredShops.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-850 rounded-2xl p-6">
          <Store className="w-12 h-12 text-zinc-400 dark:text-zinc-650 mx-auto mb-3" />
          <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-300">No Storefronts Registered</h3>
          <p className="text-zinc-500 text-sm mt-1 max-w-xs mx-auto">
            Get started by registering your first retail or material storefront location.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShops.map(shop => (
            <div
              key={shop.id}
              className={`group bg-white dark:bg-zinc-900/40 border transition-all duration-300 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md ${
                shop.status === 0
                  ? 'border-zinc-200 dark:border-zinc-850 opacity-70 hover:opacity-100'
                  : 'border-zinc-200 dark:border-zinc-800/60 hover:border-primary/45 dark:hover:border-primary/45'
              }`}
            >
              <div className="p-5 space-y-4">
                {/* Shop logo & details header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {shop.logo ? (
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 shrink-0">
                        <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/30 text-primary flex items-center justify-center border border-primary/20 shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                    )}

                    <div className="min-w-0">
                      <h2 className="text-base font-bold text-zinc-850 dark:text-zinc-100 leading-tight truncate group-hover:text-primary transition-colors">
                        {shop.name}
                      </h2>
                      <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 text-xs mt-0.5 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span className="truncate">{shop.city}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 shadow-sm ${
                    shop.status === 1
                      ? 'bg-emerald-500/15 border border-emerald-550/20 text-emerald-600 dark:text-emerald-400'
                      : 'bg-zinc-150 border border-zinc-250 text-zinc-600 dark:bg-zinc-800 dark:border-zinc-750 dark:text-zinc-400'
                  }`}>
                    {shop.status === 1 ? t('Active') : t('Inactive')}
                  </span>
                </div>

                {/* Body Contact details */}
                <div className="space-y-2 pt-2 text-sm border-t border-zinc-150 dark:border-zinc-850">
                  {shop.address && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed break-words">
                      {shop.address}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-350">
                    <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span className="truncate">{shop.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-350">
                    <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span>{shop.contact_number}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons footer */}
              <div className="px-5 py-3.5 bg-zinc-50 dark:bg-zinc-900/60 rounded-b-2xl border-t border-zinc-150 dark:border-zinc-850 flex items-center justify-end gap-2.5">
                <button
                  onClick={(e) => handleOpenEditModal(shop, e)}
                  title={t('Edit Details')}
                  className="w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-zinc-800 hover:bg-primary/20 dark:hover:bg-primary/20 hover:text-primary transition-all text-zinc-500 border border-zinc-200 dark:border-zinc-700/80 shadow-sm"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                {shop.status === 1 ? (
                  <button
                    onClick={(e) => handleDeactivateShop(shop.id, e)}
                    title={t('Deactivate')}
                    className="w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-zinc-800 hover:bg-rose-500/20 dark:hover:bg-rose-500/20 hover:text-rose-500 transition-all text-zinc-500 border border-zinc-200 dark:border-zinc-700/80 shadow-sm"
                  >
                    <Power className="w-4 h-4 text-rose-550" />
                  </button>
                ) : (
                  <button
                    onClick={(e) => handleReactivateShop(shop, e)}
                    title={t('Reactivate')}
                    className="w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-zinc-800 hover:bg-emerald-500/20 dark:hover:bg-emerald-500/20 hover:text-emerald-500 transition-all text-zinc-500 border border-zinc-200 dark:border-zinc-700/80 shadow-sm"
                  >
                    <Power className="w-4 h-4 text-emerald-555" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-150 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
              <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                <Store className="w-5 h-5 text-primary" />
                {isEditMode ? t('Update Storefront Details') : t('Register Storefront')}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white w-7 h-7 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleSaveShop} className="p-6 space-y-4">
              {formError && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl px-4 py-3 text-sm flex items-center gap-1.5 animate-pulse">
                  <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0" />
                  <span className="font-semibold">{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-450 uppercase tracking-wider mb-1.5 block">
                    {t('Storefront Name')} <span className="text-rose-550">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Chicago Material Hub"
                    className="w-full h-11 px-3 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary/60 transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-455 uppercase tracking-wider mb-1.5 block">
                    {t('Email Address')} <span className="text-rose-550">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="e.g. shop@provider.com"
                    className="w-full h-11 px-3 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary/60 transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-455 uppercase tracking-wider mb-1.5 block">
                    {t('Contact Number')} <span className="text-rose-550">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formContactNumber}
                    onChange={(e) => setFormContactNumber(e.target.value)}
                    placeholder="e.g. +1 555-123-4567"
                    className="w-full h-11 px-3 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary/60 transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-455 uppercase tracking-wider mb-1.5 block">
                    {t('City')} <span className="text-rose-550">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    placeholder="e.g. Chicago"
                    className="w-full h-11 px-3 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary/60 transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-455 uppercase tracking-wider mb-1.5 block">
                    {t('Status')}
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(Number(e.target.value))}
                    className="w-full h-11 px-3 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-primary/60 transition-all"
                  >
                    <option value={1}>{t('Active')}</option>
                    <option value={0}>{t('Inactive')}</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-455 uppercase tracking-wider mb-1.5 block">
                    {t('Logo Image URL')}
                  </label>
                  <div className="relative">
                    <Image className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="url"
                      value={formLogo}
                      onChange={(e) => setFormLogo(e.target.value)}
                      placeholder="e.g. https://images.unsplash.com/logo-image"
                      className="w-full h-11 pl-10 pr-3 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary/60 transition-all"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-455 uppercase tracking-wider mb-1.5 block">
                    {t('Full Address')}
                  </label>
                  <textarea
                    rows={3}
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    placeholder="e.g. 100 Main St, Suite 400, Chicago, IL"
                    className="w-full p-3 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary/60 resize-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-zinc-150 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-900/20 mt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="h-10 px-5 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-bold text-xs rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  {t('Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={formSaving}
                  className="h-10 px-6 bg-primary hover:bg-primary/95 text-zinc-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {formSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {isEditMode ? t('Save Changes') : t('Create Storefront')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
