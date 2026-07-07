'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../../lib/apiClient';
import {
  Plus, Search, X, Loader2, AlertCircle, CheckCircle,
  Image as ImageIcon, Sparkles, FolderTree, ArrowRight
} from 'lucide-react';

interface Subcategory {
  id: string;
  name: string;
  parent_category_id: string;
  parent_category_name: string;
  image?: string;
  description?: string;
  featured: boolean;
  status: boolean;
}

interface Category {
  id: string;
  name: string;
}

export default function AdminSubcategoryPage() {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
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
  const [parentCategoryId, setParentCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [subRes, catRes] = await Promise.all([
        apiClient.get('/admin/subcategories'),
        apiClient.get('/admin/categories')
      ]);
      setSubcategories(subRes.data || []);
      setCategories(catRes.data || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch subcategories.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string, field: 'status' | 'featured', currentValue: boolean) => {
    const newValue = !currentValue;
    // Optimistic UI update
    setSubcategories(prev =>
      prev.map(sub => (sub.id === id ? { ...sub, [field]: newValue } : sub))
    );

    try {
      await apiClient.put(`/admin/categories/${id}/toggle`, {
        field,
        value: newValue
      });
      setSuccess(`Subcategory ${field} updated successfully!`);
    } catch (err: any) {
      // Revert
      setSubcategories(prev =>
        prev.map(sub => (sub.id === id ? { ...sub, [field]: currentValue } : sub))
      );
      setError(err.response?.data?.detail || err.message || 'Failed to update toggle.');
    }
  };

  const handleOpenModal = () => {
    setName('');
    setParentCategoryId(categories[0]?.id || '');
    setDescription('');
    setImageUrl('');
    setFeatured(false);
    setStatus(true);
    setFormError('');
    setModalOpen(true);
  };

  const handleSaveSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!name.trim()) {
      setFormError('Subcategory name is required.');
      return;
    }
    if (!parentCategoryId) {
      setFormError('Parent Category is required.');
      return;
    }

    setFormSaving(true);
    try {
      const payload = {
        name: name.trim(),
        parent_category_id: parentCategoryId,
        description: description.trim() || undefined,
        image: imageUrl.trim() || undefined,
        featured,
        status
      };
      await apiClient.post('/admin/subcategories', payload);
      setSuccess('Subcategory created successfully!');
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || err.message || 'Failed to save subcategory.');
    } finally {
      setFormSaving(false);
    }
  };

  const filteredSubcategories = subcategories.filter(sub =>
    sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.parent_category_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (sub.description && sub.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 text-zinc-300">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <FolderTree className="w-5.5 h-5.5 text-[#5E5CE6]" />
            Subcategories Management
          </h1>
          <p className="text-zinc-500 text-xs mt-0.5">
            Organize secondary service hierarchies linking specialized catalog nodes to parent categories.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          disabled={categories.length === 0}
          className="h-9 px-4 bg-[#5E5CE6] hover:bg-[#5E5CE6]/90 disabled:bg-zinc-700 disabled:opacity-40 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 text-xs shadow-md shadow-[#5E5CE6]/10"
        >
          <Plus className="w-4 h-4" />
          Add Subcategory
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
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-zinc-900/60 border border-zinc-800/80 p-3 rounded-xl">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search subcategories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8.5 pl-9 pr-4 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white placeholder:text-zinc-650 focus:outline-none focus:border-[#5E5CE6]/60 transition-colors"
          />
        </div>
        <div className="text-xs text-zinc-500 font-semibold">
          Found {filteredSubcategories.length} subcategories
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
      ) : filteredSubcategories.length === 0 ? (
        <div className="border border-zinc-850 rounded-xl p-12 text-center bg-[#18181b] text-zinc-500 text-xs">
          No subcategories found. Click "Add Subcategory" to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubcategories.map(sub => (
            <div key={sub.id} className="border border-zinc-850 rounded-2xl bg-[#18181b] overflow-hidden flex flex-col justify-between hover:border-zinc-700/80 transition-all duration-300 shadow-md">
              <div>
                {/* Category Image Header */}
                <div className="h-36 relative bg-zinc-900 flex items-center justify-center border-b border-zinc-850">
                  {sub.image ? (
                    <img src={sub.image} alt={sub.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-zinc-650">
                      <ImageIcon className="w-8 h-8" />
                      <span className="text-[10px]">No image uploaded</span>
                    </div>
                  )}
                  {sub.featured && (
                    <span className="absolute top-3 right-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      Featured
                    </span>
                  )}
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                    <span>{sub.parent_category_name}</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                  <h3 className="text-sm font-bold text-white tracking-tight">{sub.name}</h3>
                  <p className="text-zinc-400 text-xs line-clamp-2 leading-relaxed">
                    {sub.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              {/* Action / Toggle Footer */}
              <div className="p-4 border-t border-zinc-850 bg-zinc-900/40 flex items-center justify-between text-xs">
                {/* Status Toggle */}
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 font-semibold">Active Status</span>
                  <button
                    onClick={() => handleToggle(sub.id, 'status', sub.status)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-all duration-300 focus:outline-none ${
                      sub.status ? 'bg-[#5E5CE6]' : 'bg-zinc-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                      sub.status ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* Featured Toggle */}
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 font-semibold">Featured</span>
                  <button
                    onClick={() => handleToggle(sub.id, 'featured', sub.featured)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-all duration-300 focus:outline-none ${
                      sub.featured ? 'bg-amber-500' : 'bg-zinc-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                      sub.featured ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Subcategory Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#1c1c1e] border border-zinc-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden text-zinc-300">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-850 bg-[#121214]">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4.5 h-4.5 text-[#5E5CE6]" />
                Create New Subcategory
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-zinc-500 hover:text-white w-7 h-7 rounded-full hover:bg-zinc-800 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSubcategory} className="p-5 space-y-4">
              {formError && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-4 py-2.5 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span className="font-semibold">{formError}</span>
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">
                  Parent Category *
                </label>
                <select
                  value={parentCategoryId}
                  onChange={(e) => setParentCategoryId(e.target.value)}
                  className="w-full h-10 px-3 bg-[#2c2c2e] border border-zinc-800 rounded-xl text-xs text-white focus:outline-none"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">
                  Subcategory Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. AC Filter Wash"
                  className="w-full h-10 px-3 bg-[#2c2c2e] border border-zinc-800 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#5E5CE6]/60 transition-all"
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
                    className="w-full h-10 pl-10 pr-3 bg-[#2c2c2e] border border-zinc-800 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none"
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
                  placeholder="Describe the specialized services under this node..."
                  className="w-full p-3 bg-[#2c2c2e] border border-zinc-800 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none resize-none"
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
