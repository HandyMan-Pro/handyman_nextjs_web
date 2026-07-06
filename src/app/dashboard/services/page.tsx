'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/apiClient';
import { getUserData } from '../../../lib/auth';
import {
  Wrench, Folder, Plus, Edit2, Search, Trash2,
  X, AlertTriangle, Layers, Clock,
  Upload, Loader2, IndianRupee, CheckCircle2,
  Package, Info, Eye, EyeOff
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description?: string;
  category_image?: string;
  status: number; // 1 = Active, 0 = Inactive
}

interface CustomService {
  id: string;
  provider_id: string;
  name: string;
  description?: string;
  type: 'single' | 'package';
  price: number;
  duration?: string;
  included_services: string[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function ServicesPage() {
  const [role, setRole] = useState<'admin' | 'provider' | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Admin states
  const [activeTab, setActiveTab] = useState<'services' | 'categories'>('services');
  const [categories, setCategories] = useState<Category[]>([]);
  const [adminServices, setAdminServices] = useState<any[]>([]);

  // Provider custom services states
  const [providerServices, setProviderServices] = useState<CustomService[]>([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<CustomService | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Service form states
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formType, setFormType] = useState<'single' | 'package'>('single');
  const [formPrice, setFormPrice] = useState('');
  const [formDuration, setFormDuration] = useState('1 hour');
  const [formIncludedServices, setFormIncludedServices] = useState<string[]>([]);
  const [formIsActive, setFormIsActive] = useState(true);
  const [submittingService, setSubmittingService] = useState(false);

  // Category form states
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catImage, setCatImage] = useState('');
  const [catStatus, setCatStatus] = useState<number>(1);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const user = getUserData();
    setCurrentUser(user);
    const userRole = (user?.user_type === 'provider' ? 'provider' : 'admin') as 'admin' | 'provider';
    setRole(userRole);
    fetchData(userRole);
  }, []);

  const fetchData = async (userRole: 'admin' | 'provider') => {
    setLoading(true);
    try {
      if (userRole === 'provider') {
        const res = await apiClient.get('/provider/services');
        setProviderServices(res.data?.data || []);
      } else {
        const [catRes, svcRes] = await Promise.all([
          apiClient.get('/categories'),
          apiClient.get('/services')
        ]);
        setCategories(catRes.data || []);
        setAdminServices(svcRes.data || []);
      }
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to load catalog data');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Image Upload handler for Category
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setCatImage(url);
      showSuccess('Image uploaded successfully!');
    } catch (err: any) {
      setError('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  // ─── CUSTOM SERVICE FORM HANDLERS (PROVIDER) ────────────────────────────────
  const openServiceModal = (svc: CustomService | null = null) => {
    if (svc) {
      setEditingService(svc);
      setFormName(svc.name);
      setFormDescription(svc.description || '');
      setFormType(svc.type);
      setFormPrice(svc.price.toString());
      setFormDuration(svc.duration || '1 hour');
      setFormIncludedServices(svc.included_services || []);
      setFormIsActive(svc.is_active);
    } else {
      setEditingService(null);
      setFormName('');
      setFormDescription('');
      setFormType('single');
      setFormPrice('');
      setFormDuration('1 hour');
      setFormIncludedServices([]);
      setFormIsActive(true);
    }
    setIsServiceModalOpen(true);
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPrice || isNaN(parseFloat(formPrice))) {
      setError('Please provide a valid service name and price.');
      return;
    }

    if (formType === 'package' && formIncludedServices.length < 2) {
      setError('A service package must bundle at least two individual services.');
      return;
    }

    setSubmittingService(true);
    setError('');
    try {
      const payload = {
        name: formName.trim(),
        description: formDescription.trim(),
        type: formType,
        price: parseFloat(formPrice),
        duration: formDuration,
        included_services: formType === 'package' ? formIncludedServices : [],
        is_active: formIsActive
      };

      if (editingService) {
        await apiClient.put(`/provider/services/${editingService.id}`, payload);
        showSuccess(`Service "${formName}" updated successfully!`);
      } else {
        await apiClient.post('/provider/services/add', payload);
        showSuccess(`Service "${formName}" added successfully!`);
      }

      setIsServiceModalOpen(false);
      fetchData('provider');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save service.');
    } finally {
      setSubmittingService(false);
    }
  };

  const handleToggleServiceStatus = async (svc: CustomService) => {
    try {
      const newStatus = !svc.is_active;
      await apiClient.put(`/provider/services/${svc.id}`, { is_active: newStatus });
      setProviderServices(prev =>
        prev.map(item => item.id === svc.id ? { ...item, is_active: newStatus } : item)
      );
      showSuccess(`"${svc.name}" is now ${newStatus ? 'active' : 'inactive'}.`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to toggle status.');
    }
  };

  const toggleIncludedService = (id: string) => {
    setFormIncludedServices(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // ─── ADMIN CATEGORY & SERVICE HANDLERS ───────────────────────────────────────
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

  // Filter provider services
  const filteredProviderServices = providerServices.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {role === 'provider' ? 'My Services & Packages' : 'Admin Service Catalog'}
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            {role === 'provider'
              ? 'Configure individual services, design packaged offerings, and manage your custom price list.'
              : 'Configure main categories, global service definitions, and manage hierarchy.'}
          </p>
        </div>
        <div>
          {role === 'provider' ? (
            <button
              onClick={() => openServiceModal()}
              className="flex items-center justify-center gap-2 h-10 px-4 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all shadow-md shadow-primary/20"
            >
              <Plus className="w-4 h-4" />
              Add Service / Package
            </button>
          ) : (
            <button
              onClick={() => openCategoryModal()}
              className="flex items-center justify-center gap-2 h-10 px-4 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all shadow-md shadow-primary/20"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-4 py-3 text-sm flex items-center gap-2 animate-fade-in">
          <CheckCircle2Icon className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm flex justify-between items-center gap-2 animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Stats */}
      <div className="flex items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search service name or description..."
            className="w-full h-10 pl-9 pr-4 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-300 placeholder:text-zinc-650 focus:outline-none focus:ring-1 focus:ring-primary/45 transition-all"
          />
        </div>
        {role === 'provider' && (
          <div className="text-xs text-zinc-400 font-semibold bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg flex gap-3">
            <span>Singles: {providerServices.filter(s => s.type === 'single').length}</span>
            <span className="border-l border-zinc-800 pl-3">Packages: {providerServices.filter(s => s.type === 'package').length}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-zinc-900 border border-zinc-800 rounded-2xl" />
          ))}
        </div>
      ) : role === 'provider' ? (
        // ─── PROVIDER UI ───────────────────────────────────────────────────────
        filteredProviderServices.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-6">
            <Wrench className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-md font-bold text-zinc-300">No services configured</h3>
            <p className="text-zinc-500 text-sm mt-1 max-w-sm mx-auto">
              Get started by adding your first service or bundle multiple services into a discounted package.
            </p>
            <button
              onClick={() => openServiceModal()}
              className="mt-4 inline-flex items-center gap-2 h-9 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg transition-colors border border-zinc-700/50"
            >
              <Plus className="w-4 h-4" />
              Add Service
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProviderServices.map((svc) => (
              <div
                key={svc.id}
                className={`border rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all duration-300 ${
                  svc.is_active
                    ? 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700/60 shadow-lg shadow-black/10'
                    : 'bg-zinc-950/40 border-zinc-900/80 opacity-70'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        svc.type === 'package'
                          ? 'bg-purple-500/10 text-purple-400'
                          : 'bg-primary/10 text-primary-light'
                      }`}>
                        {svc.type === 'package' ? (
                          <>
                            <Package className="w-3 h-3" />
                            Package
                          </>
                        ) : (
                          <>
                            <Wrench className="w-3 h-3" />
                            Single
                          </>
                        )}
                      </span>
                      <h3 className="text-sm font-bold text-zinc-100 line-clamp-1">{svc.name}</h3>
                    </div>
                    <button
                      onClick={() => handleToggleServiceStatus(svc)}
                      title={svc.is_active ? 'Mark Inactive' : 'Mark Active'}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all ${
                        svc.is_active
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : 'bg-zinc-850 border-zinc-800 text-zinc-500'
                      }`}
                    >
                      {svc.is_active ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-zinc-500 mt-2 line-clamp-2 min-h-[2rem]">
                    {svc.description || 'No description provided.'}
                  </p>
                  {svc.type === 'package' && svc.included_services?.length > 0 && (
                    <div className="mt-3 bg-zinc-950/50 border border-zinc-900 rounded-lg p-2.5 space-y-1.5">
                      <div className="text-[10px] text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        Bundled Services ({svc.included_services.length}):
                      </div>
                      <div className="space-y-1">
                        {svc.included_services.map(subId => {
                          const subSvc = providerServices.find(s => s.id === subId);
                          return (
                            <div key={subId} className="text-xs text-zinc-400 flex items-center gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-purple-500" />
                              <span className="truncate">{subSvc?.name || 'Loading Service...'}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-zinc-800/40 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Price</span>
                    <span className="text-sm font-bold text-zinc-200 flex items-center">
                      <IndianRupee className="w-3.5 h-3.5 mr-0.5 text-zinc-400" />
                      {svc.price}
                    </span>
                  </div>
                  {svc.duration && (
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Est. Time</span>
                      <span className="text-xs font-semibold text-zinc-400 flex items-center justify-end gap-1">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        {svc.duration}
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() => openServiceModal(svc)}
                    className="h-8 px-3 bg-zinc-850 hover:bg-zinc-800 text-zinc-350 hover:text-white rounded-lg text-xs font-semibold transition-all border border-zinc-700/30 flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        // ─── ADMIN UI ─────────────────────────────────────────────────────────
        <div className="bg-zinc-900 border border-zinc-850 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-zinc-850 flex items-center justify-between">
            <h2 className="text-md font-bold text-zinc-200">Main Categories ({categories.length})</h2>
          </div>
          <div className="divide-y divide-zinc-850">
            {filteredCategories.map((cat) => (
              <div key={cat.id} className="p-4 flex items-center justify-between gap-4 hover:bg-zinc-850/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-zinc-850 border border-zinc-800 overflow-hidden flex items-center justify-center">
                    {cat.category_image ? (
                      <img src={cat.category_image} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                      <Folder className="w-5 h-5 text-zinc-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-200">{cat.name}</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">{cat.description || 'No description'}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openCategoryModal(cat)}
                    className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {filteredCategories.length === 0 && (
              <div className="text-center py-8 text-sm text-zinc-500">No categories found matching query</div>
            )}
          </div>
        </div>
      )}

      {/* Service Add/Edit Modal (Provider) */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setIsServiceModalOpen(false)} />
          <div className="relative z-10 w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                <Wrench className="w-5 h-5 text-primary" />
                {editingService ? 'Edit Service' : 'Add New Service / Package'}
              </h3>
              <button onClick={() => setIsServiceModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleServiceSubmit} className="space-y-4">
              {/* Type Switcher */}
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">Service Type</label>
                <div className="grid grid-cols-2 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setFormType('single')}
                    className={`h-9 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      formType === 'single'
                        ? 'bg-zinc-800 text-white shadow-sm'
                        : 'text-zinc-450 hover:text-zinc-300'
                    }`}
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    Single Service
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType('package')}
                    className={`h-9 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      formType === 'package'
                        ? 'bg-zinc-800 text-white shadow-sm'
                        : 'text-zinc-450 hover:text-zinc-300'
                    }`}
                  >
                    <Package className="w-3.5 h-3.5" />
                    Service Package
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 block">Service Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder={formType === 'single' ? "e.g. Toilet Plumbing Repair" : "e.g. Deluxe Bathroom Plumbing Bundle"}
                  className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-150 focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>

              {/* Price & Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 block">
                    {formType === 'package' ? 'Discounted Price (₹) *' : 'Service Price (₹) *'}
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="number"
                      required
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      placeholder="e.g. 199"
                      className="w-full h-11 pl-9 pr-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-150 focus:outline-none focus:ring-1 focus:ring-primary/50 font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 block">Est. Duration *</label>
                  <input
                    type="text"
                    required
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    placeholder="e.g. 1.5 hours"
                    className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-150 focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>
              </div>

              {/* Dynamic Package Builder (Checklist of existing 'single' services) */}
              {formType === 'package' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Bundle Included Services *</label>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      formIncludedServices.length < 2
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      Selected: {formIncludedServices.length} (Min: 2)
                    </span>
                  </div>
                  {formIncludedServices.length < 2 && (
                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs rounded-xl p-3 flex items-start gap-2">
                      <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>Please select at least 2 individual services to create this package.</span>
                    </div>
                  )}
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 max-h-36 overflow-y-auto space-y-2.5">
                    {providerServices.filter(s => s.type === 'single').length === 0 ? (
                      <p className="text-zinc-600 text-xs text-center py-4">No individual services configured yet. Add them first.</p>
                    ) : (
                      providerServices
                        .filter(s => s.type === 'single')
                        .map(sub => (
                          <label key={sub.id} className="flex items-center gap-2.5 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={formIncludedServices.includes(sub.id)}
                              onChange={() => toggleIncludedService(sub.id)}
                              className="w-4 h-4 rounded border-zinc-800 text-primary focus:ring-primary focus:ring-offset-zinc-950 bg-zinc-900"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-zinc-300 truncate">{sub.name}</p>
                              <p className="text-[10px] text-zinc-505">₹{sub.price} • {sub.duration}</p>
                            </div>
                          </label>
                        ))
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 block">Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe the scope of work, warranty details, or terms..."
                  rows={3}
                  className="w-full p-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-150 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                />
              </div>

              {/* Active Toggle */}
              <label className="flex items-center justify-between gap-3 cursor-pointer select-none py-1">
                <div>
                  <span className="text-xs font-bold text-zinc-300">Catalog Visibility</span>
                  <p className="text-[10px] text-zinc-505 mt-0.5">Toggle whether this item is currently discoverable by customers.</p>
                </div>
                <input
                  type="checkbox"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-checked:after:bg-white peer-checked:after:border-transparent"></div>
              </label>

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
                  disabled={submittingService}
                  className="flex-1 h-11 bg-primary hover:bg-primary/95 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {submittingService && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingService ? 'Save Changes' : 'Create Service'}
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
              <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                <Folder className="w-5 h-5 text-primary" />
                {editingCategory ? 'Edit Category' : 'Create Category'}
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
                  placeholder="e.g. Painting"
                  className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-150 focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase mb-1 block">Description</label>
                <textarea
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Describe category..."
                  rows={3}
                  className="w-full p-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-150 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase mb-1 block">Category Image</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={catImage}
                    onChange={(e) => setCatImage(e.target.value)}
                    placeholder="URL or Upload"
                    className="flex-1 h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-150 focus:outline-none"
                  />
                  <label className="h-11 px-3 bg-zinc-850 hover:bg-zinc-800 border border-zinc-700/40 rounded-xl flex items-center justify-center cursor-pointer text-zinc-400 hover:text-white transition-all text-xs font-semibold gap-1.5">
                    <Upload className="w-4 h-4" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase mb-1 block">Status</label>
                <select
                  value={catStatus}
                  onChange={(e) => setCatStatus(Number(e.target.value))}
                  className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-150 focus:outline-none focus:ring-1 focus:ring-primary/50"
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
    </div>
  );
}

// ─── LOCAL HERO HELPER COMPONENT FOR ICON ────────────────────────────────────
function CheckCircle2Icon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
