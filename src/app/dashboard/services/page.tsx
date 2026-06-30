'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/apiClient';
import {
  Wrench, Folder, Plus, Edit2, Trash2, Search,
  X, Check, AlertTriangle, Layers, Clock, DollarSign,
  Upload, Eye, EyeOff, Loader2, IndianRupee
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
  status: number; // 1 = Active, 0 = Inactive
}

export default function ServicesPage() {
  const [activeTab, setActiveTab] = useState<'services' | 'categories'>('services');
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, svcRes] = await Promise.all([
        apiClient.get('/categories'),
        apiClient.get('/services')
      ]);
      setCategories(catRes.data || []);
      setServices(svcRes.data || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
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
      setError('Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // CATEGORY CRUD
  const openCategoryModal = (category: Category | null = null) => {
    if (category) {
      setEditingCategory(category);
      setCatName(category.name);
      setCatDesc(category.description || '');
      setCatImage(category.category_image || '');
      setCatStatus(category.status);
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
    if (!catName.trim()) return;

    const payload = {
      name: catName,
      description: catDesc,
      category_image: catImage,
      status: catStatus
    };

    try {
      if (editingCategory) {
        await apiClient.put(`/categories/${editingCategory.id}`, payload);
        showSuccess('Category updated successfully!');
      } else {
        await apiClient.post('/categories', payload);
        showSuccess('Category created successfully!');
      }
      setIsCategoryModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? This might affect services linked to it.')) return;
    try {
      await apiClient.delete(`/categories/${id}`);
      showSuccess('Category deleted successfully!');
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete category');
    }
  };

  // SERVICE CRUD
  const openServiceModal = (service: Service | null = null) => {
    if (service) {
      setEditingService(service);
      setSvcName(service.name);
      setSvcDesc(service.description || '');
      setSvcCategory(service.category);
      setSvcPrice(service.base_price);
      setSvcDuration(service.duration);
      setSvcImage(service.service_image || '');
      setSvcStatus(service.status);
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
    if (!svcName.trim()) return;

    const payload = {
      name: svcName,
      description: svcDesc,
      category: svcCategory,
      base_price: Number(svcPrice),
      duration: Number(svcDuration),
      service_image: svcImage,
      status: svcStatus
    };

    try {
      if (editingService) {
        await apiClient.put(`/services/${editingService.id}`, payload);
        showSuccess('Service updated successfully!');
      } else {
        await apiClient.post('/services', payload);
        showSuccess('Service created successfully!');
      }
      setIsServiceModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save service');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      await apiClient.delete(`/services/${id}`);
      showSuccess('Service deleted successfully!');
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete service');
    }
  };

  // Filter lists based on search query
  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Service Catalog</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Manage category hierarchy and service details.</p>
        </div>
        <button
          onClick={() => activeTab === 'services' ? openServiceModal() : openCategoryModal()}
          className="flex items-center justify-center gap-2 h-10 px-4 bg-primary hover:bg-primary/95 text-white font-semibold rounded-xl transition-all shadow-md shadow-primary/20"
        >
          <Plus className="w-4.5 h-4.5" />
          {activeTab === 'services' ? 'Add Service' : 'Add Category'}
        </button>
      </div>

      {/* Toast Messages */}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-4 py-3 text-sm animate-fade-in flex items-center gap-2">
          <Check className="w-4 h-4" />
          {successMsg}
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm animate-fade-in flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
          <button onClick={() => setError('')} className="text-zinc-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
                          : 'bg-zinc-800 text-zinc-500 border-zinc-700/40'
                      }`}>
                        {svc.status === 1 ? 'Active' : 'Inactive'}
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

      {/* --- CATEGORY MODAL --- */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setIsCategoryModalOpen(false)} />
          
          <div className="relative z-10 w-full max-w-md bg-zinc-900 border border-zinc-800/80 rounded-2xl p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Folder className="w-5 h-5 text-primary" />
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Category Name</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Home Cleaning, Repair"
                  className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Description</label>
                <textarea
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Provide a brief description of the services within this category..."
                  rows={3}
                  className="w-full p-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                />
              </div>

              {/* Category Image */}
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Category Image</label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={catImage}
                      onChange={(e) => setCatImage(e.target.value)}
                      placeholder="Image URL or upload a file"
                      className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary/50"
                    />
                  </div>
                  <label className="h-11 px-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/50 rounded-xl flex items-center justify-center cursor-pointer text-sm font-medium gap-2 transition-all">
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-zinc-400" />
                        <span>Upload</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'category')} disabled={uploading} />
                  </label>
                </div>
              </div>

              {/* Status */}
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
                  className="flex-1 h-11 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 bg-primary hover:bg-primary/95 text-white font-semibold rounded-xl transition-all"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- SERVICE MODAL --- */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setIsServiceModalOpen(false)} />
          
          <div className="relative z-10 w-full max-w-lg bg-zinc-900 border border-zinc-800/80 rounded-2xl p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Wrench className="w-5 h-5 text-primary" />
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h3>
              <button onClick={() => setIsServiceModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleServiceSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Service Name</label>
                  <input
                    type="text"
                    required
                    value={svcName}
                    onChange={(e) => setSvcName(e.target.value)}
                    placeholder="e.g. Deep Cleaning, Fan Repairing"
                    className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Description</label>
                  <textarea
                    value={svcDesc}
                    onChange={(e) => setSvcDesc(e.target.value)}
                    placeholder="Provide a list of deliverables included under this service..."
                    rows={2}
                    className="w-full p-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Category</label>
                  <select
                    value={svcCategory}
                    onChange={(e) => setSvcCategory(e.target.value)}
                    className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary/50"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                    {categories.length === 0 && (
                      <option value="General">General</option>
                    )}
                  </select>
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
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Base Price (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500 font-semibold">₹</span>
                    <input
                      type="number"
                      required
                      min={0}
                      value={svcPrice}
                      onChange={(e) => setSvcPrice(Number(e.target.value))}
                      className="w-full h-11 pl-7 pr-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Est. Duration (hrs)</label>
                  <input
                    type="number"
                    required
                    min={0.5}
                    step={0.5}
                    value={svcDuration}
                    onChange={(e) => setSvcDuration(Number(e.target.value))}
                    className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>
              </div>

              {/* Service Image */}
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Service Image</label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={svcImage}
                      onChange={(e) => setSvcImage(e.target.value)}
                      placeholder="Image URL or upload a file"
                      className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary/50"
                    />
                  </div>
                  <label className="h-11 px-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/50 rounded-xl flex items-center justify-center cursor-pointer text-sm font-medium gap-2 transition-all">
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-zinc-400" />
                        <span>Upload</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'service')} disabled={uploading} />
                  </label>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="flex-1 h-11 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 bg-primary hover:bg-primary/95 text-white font-semibold rounded-xl transition-all"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
