'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../../lib/apiClient';
import {
  Grid, List, Plus, Edit2, Trash2, HelpCircle, Search,
  X, Loader2, AlertCircle, CheckCircle, Image as ImageIcon,
  Check, ToggleLeft, ToggleRight, Sparkles, FolderOpen
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  image?: string;
  description?: string;
  featured: boolean;
  status: boolean;
}

export default function AdminCategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/admin/categories');
      setCategories(res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch categories.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string, field: 'status' | 'featured', currentValue: boolean) => {
    const newValue = !currentValue;
    // Optimistic UI update
    setCategories(prev =>
      prev.map(cat => (cat.id === id ? { ...cat, [field]: newValue } : cat))
    );

    try {
      await apiClient.put(`/admin/categories/${id}/toggle`, {
        field,
        value: newValue
      });
      setSuccess(`Category ${field} updated successfully!`);
    } catch (err: any) {
      // Revert on error
      setCategories(prev =>
        prev.map(cat => (cat.id === id ? { ...cat, [field]: currentValue } : cat))
      );
      setError(err.response?.data?.detail || err.message || 'Failed to update toggle.');
    }
  };

  const handleOpenModal = () => {
    setName('');
    setDescription('');
    setImageUrl('');
    setFeatured(false);
    setStatus(true);
    setFormError('');
    setModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!name.trim()) {
      setFormError('Category name is required.');
      return;
    }

    setFormSaving(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        image: imageUrl.trim() || undefined,
        featured,
        status
      };
      await apiClient.post('/admin/categories', payload);
      setSuccess('Category created successfully!');
      setModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || err.message || 'Failed to save category.');
    } finally {
      setFormSaving(false);
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cat.description && cat.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8 relative">
      {/* Background ambient glows */}
      <div className="fixed top-0 left-[20%] w-[600px] h-[600px] bg-[#5E5CE6]/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-[10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />
      {/* Page Header */}
      <div className="flex items-center justify-between relative z-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 flex items-center gap-2">
            <FolderOpen className="w-8 h-8 text-[#5E5CE6]" />
            Categories Management
          </h1>
          <p className="text-zinc-500 text-xs mt-0.5">
            Create, configure, and curate parent categories for all handyman service catalog offerings.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="group h-11 px-5 bg-[#5E5CE6] hover:bg-[#5E5CE6]/90 text-white font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(94,92,230,0.3)] hover:shadow-[0_0_25px_rgba(94,92,230,0.5)] hover:-translate-y-0.5 active:scale-95 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Alerts */}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-4 py-2.5 text-xs flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold">{success}</span>
          </div>
          <button onClick={() => setSuccess('')} className="text-zinc-500 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-4 py-2.5 text-xs flex justify-between items-center">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <span className="font-semibold">{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-zinc-500 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Search Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pb-4 relative z-10">
        <div className="relative w-full sm:max-w-sm group">
          <div className="absolute inset-0 bg-[#5E5CE6]/20 blur-md rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-[#5E5CE6] transition-colors z-10" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="relative z-10 w-full h-12 pl-11 pr-4 bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/10 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#5E5CE6]/50 transition-all shadow-lg"
          />
        </div>
        <div className="text-sm text-zinc-400 font-bold bg-[#0a0a0c]/60 backdrop-blur-xl px-4 py-2 border border-white/5 rounded-xl">
          Found <span className="text-white">{filteredCategories.length}</span> categories
        </div>
      </div>

      {/* Grid List representation */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-zinc-850 rounded-2xl p-5 bg-[#18181b] animate-pulse space-y-4">
              <div className="h-32 bg-zinc-800 rounded-xl w-full" />
              <div className="h-4 bg-zinc-800 rounded w-2/3" />
              <div className="h-3 bg-zinc-800 rounded w-full" />
            </div>
          ))}
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-16 bg-[#0a0a0c]/60 backdrop-blur-2xl border border-white/5 rounded-[28px] p-6 shadow-2xl relative z-10">
          <FolderOpen className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white tracking-tight">No Categories Found</h3>
          <p className="text-sm text-zinc-500 mt-1">Click "Add Category" to create one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map(cat => (
            <div key={cat.id} className="group cursor-pointer bg-[#0a0a0c]/60 backdrop-blur-xl border border-white/5 hover:border-white/15 rounded-[24px] overflow-hidden shadow-xl hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.8)] hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between relative z-10">
              <div>
                {/* Category Image Header */}
                <div className="h-36 relative bg-zinc-950/80 flex items-center justify-center border-b border-white/5 relative group-hover:scale-[1.02] transition-transform duration-500">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-zinc-650">
                      <ImageIcon className="w-8 h-8" />
                      <span className="text-[10px]">No image uploaded</span>
                    </div>
                  )}
                  {cat.featured && (
                    <span className="absolute top-3 right-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      Featured
                    </span>
                  )}
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="text-base font-bold text-white tracking-tight group-hover:text-[#5E5CE6] transition-colors">{cat.name}</h3>
                  <p className="text-zinc-400 text-xs line-clamp-2 leading-relaxed">
                    {cat.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              {/* Action / Toggle Footer */}
              <div className="p-5 border-t border-white/5 bg-white/5 flex items-center justify-between text-xs backdrop-blur-md">
                {/* Status Toggle */}
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 font-semibold">Active Status</span>
                  <button
                    onClick={() => handleToggle(cat.id, 'status', cat.status)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-all duration-300 focus:outline-none ${
                      cat.status ? 'bg-[#5E5CE6]' : 'bg-zinc-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                      cat.status ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* Featured Toggle */}
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 font-semibold">Featured</span>
                  <button
                    onClick={() => handleToggle(cat.id, 'featured', cat.featured)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-all duration-300 focus:outline-none ${
                      cat.featured ? 'bg-amber-500' : 'bg-zinc-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                      cat.featured ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#0a0a0c]/90 backdrop-blur-3xl border border-white/10 rounded-[28px] max-w-md w-full shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden text-zinc-300 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-[#5E5CE6]/10 to-transparent pointer-events-none" />
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-white/5 relative z-10">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Plus className="w-4.5 h-4.5 text-[#5E5CE6]" />
                Create New Category
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-zinc-500 hover:text-white w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-5 relative z-10">
              {formError && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-4 py-2.5 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span className="font-semibold">{formError}</span>
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Smart Cleaning"
                  className="relative z-10 w-full h-12 px-4 bg-[#0a0a0c]/60 border border-white/10 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#5E5CE6]/60 transition-all shadow-inner"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">
                  Image URL
                </label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-650" />
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="relative z-10 w-full h-12 pl-11 pr-4 bg-[#0a0a0c]/60 border border-white/10 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#5E5CE6]/60 transition-all shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize what services fall under this category..."
                  className="relative z-10 w-full p-4 bg-[#0a0a0c]/60 border border-white/10 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#5E5CE6]/60 transition-all shadow-inner resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="modal-status"
                    checked={status}
                    onChange={(e) => setStatus(e.target.checked)}
                    className="accent-[#5E5CE6] w-4 h-4 rounded"
                  />
                  <label htmlFor="modal-status" className="text-xs font-semibold text-zinc-300 cursor-pointer">
                    Enable Status by Default
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="modal-featured"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="accent-amber-500 w-4 h-4 rounded"
                  />
                  <label htmlFor="modal-featured" className="text-xs font-semibold text-zinc-300 cursor-pointer">
                    Mark as Featured
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-850 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="h-9 px-4 border border-zinc-800 text-zinc-450 hover:text-white font-bold text-xs rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSaving}
                  className="h-9 px-5 bg-[#5E5CE6] hover:bg-[#5E5CE6]/90 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  {formSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
