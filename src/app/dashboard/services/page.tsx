'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/apiClient';
import { getUserData } from '../../../lib/auth';
import {
  Wrench, Folder, Plus, Edit2, Trash2, Search,
  X, Check, AlertTriangle, Layers, Clock, DollarSign,
  Upload, Eye, EyeOff, Loader2, IndianRupee, Star, Settings, CheckCircle2
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description?: string;
  category_image?: string;
  status: number; // 1 = Active, 0 = Inactive
  created_at?: string;
}

interface Service {
  id: string;
  name: string;
  description?: string;
  category: string; // Category name or ID
  base_price: number;
  duration: number; // in hours or minutes
  service_image?: string;
  status: number; // 1 = Active, 0 = Inactive, 2 = Pending Review
}

interface ProviderService {
  id?: string;
  provider_id: string;
  service_id: string;
  name: string;
  category: string;
  price: number;
  status: number;
}

export default function ServicesPage() {
  const [role, setRole] = useState<'admin' | 'provider' | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Tabs (only for Admin)
  const [activeTab, setActiveTab] = useState<'services' | 'categories'>('services');
  
  // Data lists
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [providerServices, setProviderServices] = useState<ProviderService[]>([]);
  
  // Custom price changes on UI
  const [customPrices, setCustomPrices] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
  
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [uploading, setUploading] = useState(false);

  // Form States - Category
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catImage, setCatImage] = useState('');
  const [catStatus, setCatStatus] = useState<number>(1);

  // Form States - Service
  const [svcName, setSvcName] = useState('');
  const [svcDesc, setSvcDesc] = useState('');
  const [svcCategory, setSvcCategory] = useState('');
  const [svcPrice, setSvcPrice] = useState(0);
  const [svcDuration, setSvcDuration] = useState(1);
  const [svcImage, setSvcImage] = useState('');
  const [svcStatus, setSvcStatus] = useState<number>(1);

  // Form States - Suggest a Service
  const [suggestName, setSuggestName] = useState('');
  const [suggestDesc, setSuggestDesc] = useState('');
  const [suggestCategory, setSuggestCategory] = useState('General');
  const [suggestPrice, setSuggestPrice] = useState('');
  const [submittingSuggestion, setSubmittingSuggestion] = useState(false);

  useEffect(() => {
    const user = getUserData();
    setCurrentUser(user);
    const userRole = (user?.user_type === 'provider' ? 'provider' : 'admin') as 'admin' | 'provider';
    setRole(userRole);
    fetchData(userRole, user?.id);
  }, []);

  const fetchData = async (userRole: 'admin' | 'provider', userId?: string) => {
    setLoading(true);
    try {
      if (userRole === 'provider') {
        const [catRes, svcRes, provSvcRes] = await Promise.all([
          apiClient.get('/categories'),
          apiClient.get('/services'),
          apiClient.get(`/provider-services?provider_id=${userId}`)
        ]);
        setCategories(catRes.data || []);
        
        // Providers only see Approved (status: 1) or their own Suggested services (if any) in the list
        setServices(svcRes.data || []);
        
        const optServices = provSvcRes.data?.data || [];
        setProviderServices(optServices);

        // Prepopulate custom price inputs
        const pricesMap: Record<string, string> = {};
        optServices.forEach((ps: ProviderService) => {
          pricesMap[ps.service_id] = ps.price.toString();
        });
        setCustomPrices(pricesMap);
      } else {
        const [catRes, svcRes] = await Promise.all([
          apiClient.get('/categories'),
          apiClient.get('/services')
        ]);
        setCategories(catRes.data || []);
        setServices(svcRes.data || []);
      }
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to load services data');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Image Upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'category' | 'service') => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await apiClient.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const url = res.data.url || res.data.file_path;
      if (type === 'category') {
        setCatImage(url);
      } else {
        setSvcImage(url);
      }
      showSuccess('Image uploaded successfully!');
    } catch (err: any) {
      setError('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Provider Service Opt-in / Opt-out
  const handleProviderServiceToggle = async (svc: Service, checked: boolean) => {
    try {
      if (checked) {
        // Opt-in
        const inputPrice = customPrices[svc.id] ? parseFloat(customPrices[svc.id]) : svc.base_price;
        await apiClient.post('/provider-services', {
          service_id: svc.id,
          price: inputPrice,
          status: 1
        });
        
        // Update local map with default base price if not already set
        if (!customPrices[svc.id]) {
          setCustomPrices(prev => ({ ...prev, [svc.id]: svc.base_price.toString() }));
        }
      } else {
        // Opt-out
        await apiClient.delete(`/provider-services/${svc.id}`);
      }

      // Refresh list
      const res = await apiClient.get(`/provider-services?provider_id=${currentUser?.id}`);
      setProviderServices(res.data?.data || []);
      showSuccess(`Service "${svc.name}" subscription status updated!`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update subscription');
    }
  };

  const handleSaveCustomPrice = async (svcId: string) => {
    const rawPrice = customPrices[svcId];
    if (!rawPrice || isNaN(parseFloat(rawPrice))) {
      setError('Please enter a valid price');
      return;
    }

    try {
      await apiClient.post('/provider-services', {
        service_id: svcId,
        price: parseFloat(rawPrice),
        status: 1
      });
      showSuccess('Custom price saved successfully!');
      
      // Refresh list
      const res = await apiClient.get(`/provider-services?provider_id=${currentUser?.id}`);
      setProviderServices(res.data?.data || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save custom price');
    }
  };

  const handleSuggestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestName.trim() || !suggestPrice || isNaN(parseFloat(suggestPrice))) {
      setError('Please fill in required service details with valid price');
      return;
    }

    setSubmittingSuggestion(true);
    setError('');
    try {
      const payload = {
        name: suggestName.trim(),
        description: suggestDesc.trim() || 'Suggested by provider',
        category: suggestCategory,
        base_price: parseFloat(suggestPrice),
        price: parseFloat(suggestPrice),
        duration: 1.0,
        status: 2 // Status: 2 = Pending Review by Admin
      };

      await apiClient.post('/services', payload);
      showSuccess(`Service "${suggestName}" suggested and sent to Admin for review!`);
      setIsSuggestModalOpen(false);
      
      // Reset form
      setSuggestName('');
      setSuggestDesc('');
      setSuggestCategory('General');
      setSuggestPrice('');

      // Refresh services
      fetchData('provider', currentUser?.id);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit service suggestion');
    } finally {
      setSubmittingSuggestion(false);
    }
  };

  // ─── ADMIN SERVICE HANDLERS ──────────────────────────────────────────────────
  const openServiceModal = (svc: Service | null = null) => {
    if (svc) {
      setEditingService(svc);
      setSvcName(svc.name);
      setSvcDesc(svc.description || '');
      setSvcCategory(svc.category);
      setSvcPrice(svc.base_price);
      setSvcDuration(svc.duration);
      setSvcImage(svc.service_image || '');
      setSvcStatus(svc.status);
    } else {
      setEditingService(null);
      setSvcName('');
      setSvcDesc('');
      setSvcCategory(categories[0]?.name || 'General');
      setSvcPrice(0);
      setSvcDuration(1);
      setSvcImage('');
      setSvcStatus(1);
    }
    setIsServiceModalOpen(true);
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!svcName.trim()) {
      setError('Service name is required');
      return;
    }

    try {
      const payload = {
        name: svcName.trim(),
        description: svcDesc.trim(),
        category: svcCategory,
        base_price: Number(svcPrice),
        duration: Number(svcDuration),
        service_image: svcImage,
        status: svcStatus
      };

      if (editingService) {
        await apiClient.put(`/services/${editingService.id}`, payload);
        showSuccess(`Service "${svcName}" updated successfully!`);
      } else {
        await apiClient.post('/services', payload);
        showSuccess(`Service "${svcName}" created successfully!`);
      }
      setIsServiceModalOpen(false);
      fetchData('admin');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save service');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      await apiClient.delete(`/services/${id}`);
      showSuccess('Service deleted successfully');
      fetchData('admin');
    } catch (err: any) {
      setError('Failed to delete service');
    }
  };

  // ─── ADMIN CATEGORY HANDLERS ─────────────────────────────────────────────────
  const openCategoryModal = (cat: Category | null = null) => {
    if (cat) {
      setEditingCategory(cat);
      setCatName(cat.name);
      setCatDesc(cat.description || '');
      setCatImage(cat.category_image || '');
      setCatStatus(cat.status);
    } else {
      setEditingCategory(null);
      setCatName('');
      setCatDesc('');
      setCatImage('');
      setCatStatus(1);
    }
    setIsCategoryModalOpen(true);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      const payload = {
        name: catName.trim(),
        description: catDesc.trim(),
        category_image: catImage,
        status: catStatus
      };

      if (editingCategory) {
        await apiClient.put(`/categories/${editingCategory.id}`, payload);
        showSuccess(`Category "${catName}" updated successfully!`);
      } else {
        await apiClient.post('/categories', payload);
        showSuccess(`Category "${catName}" created successfully!`);
      }
      setIsCategoryModalOpen(false);
      fetchData('admin');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await apiClient.delete(`/categories/${id}`);
      showSuccess('Category deleted successfully');
      fetchData('admin');
    } catch (err: any) {
      setError('Failed to delete category');
    }
  };

  // Filter lists based on search queries
  const filteredServices = services.filter(s =>
    (s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (role === 'admin' || s.status === 1) // Providers only see approved catalog services
  );

  const pendingApprovalServices = services.filter(s => s.status === 2);

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isSubscribed = (svcId: string) => {
    return providerServices.some(ps => ps.service_id === svcId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {role === 'provider' ? 'My Services Catalog' : 'Service Catalog & Hierarchy'}
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            {role === 'provider'
              ? 'Select services you offer, configure your custom pricing, and propose custom service listings.'
              : 'Manage main categories, define official base prices, and approve/reject provider service suggestions.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {role === 'provider' ? (
            <button
              onClick={() => setIsSuggestModalOpen(true)}
              className="flex items-center justify-center gap-2 h-10 px-4 bg-primary hover:bg-primary/95 text-white font-semibold rounded-xl transition-all shadow-md shadow-primary/20"
            >
              <Plus className="w-4 h-4" />
              Suggest a Service
            </button>
          ) : (
            <button
              onClick={() => activeTab === 'services' ? openServiceModal() : openCategoryModal()}
              className="flex items-center justify-center gap-2 h-10 px-4 bg-primary hover:bg-primary/95 text-white font-semibold rounded-xl transition-all shadow-md shadow-primary/20"
            >
              <Plus className="w-4 h-4" />
              {activeTab === 'services' ? 'Add Service' : 'Add Category'}
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-4 py-3 text-sm animate-fade-in flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm animate-fade-in flex justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-zinc-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ADMIN VIEW OR PROVIDER VIEW */}
      {role === 'provider' ? (
        // ─── PROVIDER INTERFACE ────────────────────────────────────────────────
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4 border-b border-zinc-800/60 pb-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search catalog by service or category name..."
                className="w-full h-10 pl-9 pr-4 bg-zinc-900/60 border border-zinc-800/50 rounded-xl text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all"
              />
            </div>
            <div className="text-xs text-zinc-500 font-semibold bg-zinc-900/60 border border-zinc-800/50 px-3 py-1.5 rounded-lg">
              Subscribed: {providerServices.length} Service{providerServices.length !== 1 ? 's' : ''}
            </div>
          </div>

          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-zinc-900/50 border border-zinc-800/30 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid gap-6">
              {categories.map((cat) => {
                const catServices = filteredServices.filter(s => s.category === cat.name);
                if (catServices.length === 0) return null;

                return (
                  <div key={cat.id} className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700/50 flex items-center justify-center">
                        {cat.category_image ? (
                          <img src={cat.category_image} alt={cat.name} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <Folder className="w-5 h-5 text-zinc-500" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-md font-bold text-zinc-200">{cat.name}</h3>
                        <p className="text-xs text-zinc-500 line-clamp-1">{cat.description || 'Category'}</p>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {catServices.map((svc) => {
                        const active = isSubscribed(svc.id);
                        return (
                          <div
                            key={svc.id}
                            className={`border rounded-xl p-4 transition-all duration-300 flex flex-col justify-between gap-3 ${
                              active
                                ? 'bg-primary/5 border-primary/40 shadow-lg shadow-primary/5'
                                : 'bg-zinc-900/60 border-zinc-800/60 hover:border-zinc-700/60'
                            }`}
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="text-sm font-semibold text-zinc-100 line-clamp-1">{svc.name}</h4>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={active}
                                    onChange={(e) => handleProviderServiceToggle(svc, e.target.checked)}
                                    className="sr-only peer"
                                  />
                                  <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary peer-checked:after:bg-white peer-checked:after:border-transparent"></div>
                                </label>
                              </div>
                              <p className="text-xs text-zinc-500 line-clamp-2 min-h-[2rem]">
                                {svc.description || 'No description provided.'}
                              </p>
                            </div>

                            <div className="pt-2 border-t border-zinc-800/40 flex items-center justify-between gap-3">
                              <div>
                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Base Price</span>
                                <span className="text-xs font-semibold text-zinc-400">₹{svc.base_price}</span>
                              </div>
                              
                              {active && (
                                <div className="flex items-center gap-1.5">
                                  <div className="relative max-w-[80px]">
                                    <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500" />
                                    <input
                                      type="number"
                                      value={customPrices[svc.id] ?? ''}
                                      onChange={(e) => setCustomPrices(prev => ({ ...prev, [svc.id]: e.target.value }))}
                                      className="w-full h-8 pl-6 pr-1 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-bold text-zinc-200 focus:outline-none focus:ring-1 focus:ring-primary/50"
                                      placeholder={svc.base_price.toString()}
                                    />
                                  </div>
                                  <button
                                    onClick={() => handleSaveCustomPrice(svc.id)}
                                    title="Save Price"
                                    className="h-8 px-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg text-[10px] font-bold transition-all border border-zinc-700/30"
                                  >
                                    Save
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        // ─── ADMIN INTERFACE ──────────────────────────────────────────────────
        <>
          {/* Tabs & Search controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/60 pb-4">
            {/* Navigation tabs */}
            <div className="flex bg-zinc-900/80 p-1 rounded-xl border border-zinc-800/40 max-w-fit">
              <button
                onClick={() => { setActiveTab('services'); setSearchQuery(''); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'services' ? 'bg-primary text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Wrench className="w-4 h-4" />
                Services ({services.length})
              </button>
              <button
                onClick={() => { setActiveTab('categories'); setSearchQuery(''); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'categories' ? 'bg-primary text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Folder className="w-4 h-4" />
                Categories ({categories.length})
              </button>
            </div>

            {/* Search input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeTab === 'services' ? "Search services..." : "Search categories..."}
                className="w-full h-10 pl-9 pr-4 bg-zinc-900/60 border border-zinc-800/50 rounded-xl text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Pending Approval section (Only visible to admin when services has status 2) */}
          {activeTab === 'services' && pendingApprovalServices.length > 0 && (
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 mb-6 space-y-4">
              <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Pending Provider Service Suggestions ({pendingApprovalServices.length})
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {pendingApprovalServices.map((svc) => (
                  <div key={svc.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col justify-between gap-3 shadow-md">
                    <div>
                      <h4 className="text-sm font-bold text-zinc-200">{svc.name}</h4>
                      <p className="text-xs text-zinc-500 mt-1">{svc.description}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-medium">
                          Category: {svc.category}
                        </span>
                        <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-medium">
                          Suggested Base Price: ₹{svc.base_price}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-zinc-850">
                      <button
                        onClick={() => {
                          if (confirm(`Approve service "${svc.name}"?`)) {
                            apiClient.put(`/services/${svc.id}`, { ...svc, status: 1 }).then(() => {
                              showSuccess(`Service "${svc.name}" approved & active.`);
                              fetchData('admin');
                            });
                          }
                        }}
                        className="flex-1 h-8 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors"
                      >
                        Approve & List
                      </button>
                      <button
                        onClick={() => handleDeleteService(svc.id)}
                        className="h-8 px-3 bg-zinc-800 hover:bg-zinc-700 text-red-400 text-xs rounded-lg transition-colors border border-red-950/20"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Services Tab view */}
          {activeTab === 'services' && (
            <div className="bg-zinc-900/80 border border-zinc-800/60 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-zinc-800/60 bg-zinc-900/40">
                      <th className="text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">Service Name</th>
                      <th className="text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">Category</th>
                      <th className="text-right text-[11px] font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">Base Price</th>
                      <th className="text-center text-[11px] font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">Duration</th>
                      <th className="text-center text-[11px] font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">Status</th>
                      <th className="text-center text-[11px] font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {filteredServices.map((svc) => (
                      <tr key={svc.id} className="hover:bg-zinc-800/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700/50 overflow-hidden flex-shrink-0 flex items-center justify-center">
                              {svc.service_image ? (
                                <img src={svc.service_image} alt={svc.name} className="w-full h-full object-cover" />
                              ) : (
                                <Wrench className="w-5 h-5 text-zinc-600" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-zinc-100">{svc.name}</p>
                              <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5">{svc.description || 'No description'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-zinc-400">
                          <span className="bg-zinc-800 border border-zinc-700/30 px-2 py-1 rounded-lg text-xs font-medium text-zinc-300">
                            {svc.category}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm font-semibold text-right text-zinc-200">
                          ₹{Number(svc.base_price).toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-4 text-sm text-center text-zinc-400">
                          {svc.duration} hr{svc.duration > 1 ? 's' : ''}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            svc.status === 1
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : svc.status === 2
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-zinc-800 text-zinc-500 border-zinc-700/40'
                          }`}>
                            {svc.status === 1 ? 'Active' : svc.status === 2 ? 'Pending Review' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openServiceModal(svc)}
                              className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors flex items-center justify-center"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteService(svc.id)}
                              className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors flex items-center justify-center"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredServices.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-sm text-zinc-500">
                          No services found matching your query
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Categories Tab view */}
          {activeTab === 'categories' && (
            <div className="bg-zinc-900/80 border border-zinc-800/60 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-zinc-800/60 bg-zinc-900/40">
                      <th className="text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">Category Name</th>
                      <th className="text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">Description</th>
                      <th className="text-center text-[11px] font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">Status</th>
                      <th className="text-center text-[11px] font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {filteredCategories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-zinc-800/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700/50 overflow-hidden flex-shrink-0 flex items-center justify-center">
                              {cat.category_image ? (
                                <img src={cat.category_image} alt={cat.name} className="w-full h-full object-cover" />
                              ) : (
                                <Folder className="w-5 h-5 text-zinc-600" />
                              )}
                            </div>
                            <p className="text-sm font-semibold text-zinc-100">{cat.name}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-zinc-400 max-w-xs truncate">
                          {cat.description || 'No description provided'}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            cat.status === 1
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-zinc-800 text-zinc-500 border-zinc-700/40'
                          }`}>
                            {cat.status === 1 ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openCategoryModal(cat)}
                              className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors flex items-center justify-center"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors flex items-center justify-center"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredCategories.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-12 text-sm text-zinc-500">
                          No categories found matching your query
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Suggest a Service Modal (Providers only) */}
      {isSuggestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setIsSuggestModalOpen(false)} />
          <div className="relative z-10 w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Wrench className="w-5 h-5 text-primary" />
                Suggest New Service
              </h3>
              <button onClick={() => setIsSuggestModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSuggestSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase mb-1 block">Service Name *</label>
                <input
                  type="text"
                  required
                  value={suggestName}
                  onChange={(e) => setSuggestName(e.target.value)}
                  placeholder="e.g. Smart Lock Installation"
                  className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase mb-1 block">Category *</label>
                <select
                  value={suggestCategory}
                  onChange={(e) => setSuggestCategory(e.target.value)}
                  className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary/50"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase mb-1 block">Suggested Base Price (₹) *</label>
                <input
                  type="number"
                  required
                  value={suggestPrice}
                  onChange={(e) => setSuggestPrice(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase mb-1 block">Description</label>
                <textarea
                  value={suggestDesc}
                  onChange={(e) => setSuggestDesc(e.target.value)}
                  placeholder="Describe the service scope, requirements, etc."
                  rows={3}
                  className="w-full p-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsSuggestModalOpen(false)}
                  className="flex-1 h-11 bg-zinc-800 hover:bg-zinc-755 text-zinc-350 font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingSuggestion}
                  className="flex-1 h-11 bg-primary hover:bg-primary/95 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {submittingSuggestion && <Loader2 className="w-4 h-4 animate-spin" />}
                  Submit Suggestion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setIsCategoryModalOpen(false)} />
          <div className="relative z-10 w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Folder className="w-5 h-5 text-primary" />
                {editingCategory ? 'Edit Category' : 'Create Main Category'}
              </h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase mb-1 block">Category Name *</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Cleaning"
                  className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase mb-1 block">Description</label>
                <textarea
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Category scope and overview"
                  rows={3}
                  className="w-full p-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase mb-1 block">Category Banner Image</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={catImage}
                    onChange={(e) => setCatImage(e.target.value)}
                    placeholder="URL or Upload"
                    className="flex-1 h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none"
                  />
                  <label className="h-11 px-3 bg-zinc-850 hover:bg-zinc-800 border border-zinc-700/40 rounded-xl flex items-center justify-center cursor-pointer text-zinc-400 hover:text-white transition-all text-xs font-semibold gap-1.5">
                    <Upload className="w-4 h-4" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'category')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Status</label>
                <select
                  value={catStatus}
                  onChange={(e) => setCatStatus(Number(e.target.value))}
                  className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary/50"
                >
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="flex-1 h-11 bg-zinc-800 hover:bg-zinc-755 text-zinc-350 font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 bg-primary hover:bg-primary/95 text-white font-semibold rounded-xl transition-all"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Service Modal */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setIsServiceModalOpen(false)} />
          <div className="relative z-10 w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Wrench className="w-5 h-5 text-primary" />
                {editingService ? 'Edit Service' : 'Create Catalog Service'}
              </h3>
              <button onClick={() => setIsServiceModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleServiceSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase mb-1 block">Service Name *</label>
                <input
                  type="text"
                  required
                  value={svcName}
                  onChange={(e) => setSvcName(e.target.value)}
                  placeholder="e.g. Deep Home Cleaning"
                  className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase mb-1 block">Category *</label>
                <select
                  value={svcCategory}
                  onChange={(e) => setSvcCategory(e.target.value)}
                  className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary/50"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                  <option value="General">General</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-400 uppercase mb-1 block">Base Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={svcPrice}
                    onChange={(e) => setSvcPrice(Number(e.target.value))}
                    placeholder="e.g. 299"
                    className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-400 uppercase mb-1 block">Est. Duration (hrs) *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={svcDuration}
                    onChange={(e) => setSvcDuration(Number(e.target.value))}
                    placeholder="e.g. 1.5"
                    className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase mb-1 block">Description</label>
                <textarea
                  value={svcDesc}
                  onChange={(e) => setSvcDesc(e.target.value)}
                  placeholder="Scope of work and details"
                  rows={3}
                  className="w-full p-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase mb-1 block">Service Banner Image</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={svcImage}
                    onChange={(e) => setSvcImage(e.target.value)}
                    placeholder="URL or Upload"
                    className="flex-1 h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none"
                  />
                  <label className="h-11 px-3 bg-zinc-850 hover:bg-zinc-800 border border-zinc-700/40 rounded-xl flex items-center justify-center cursor-pointer text-zinc-400 hover:text-white transition-all text-xs font-semibold gap-1.5">
                    <Upload className="w-4 h-4" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'service')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Status</label>
                <select
                  value={svcStatus}
                  onChange={(e) => setSvcStatus(Number(e.target.value))}
                  className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary/50"
                >
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                  <option value={2}>Pending Review</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="flex-1 h-11 bg-zinc-800 hover:bg-zinc-755 text-zinc-350 font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 bg-primary hover:bg-primary/95 text-white font-semibold rounded-xl transition-all"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
