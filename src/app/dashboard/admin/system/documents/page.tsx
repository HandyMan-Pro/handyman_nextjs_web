'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../../../lib/apiClient';
import {
  FileText, Plus, Loader2, AlertCircle, Edit3, Trash2, ShieldCheck, CheckSquare, Square
} from 'lucide-react';

interface KYCDocument {
  id: string;
  title: string;
  type: string; // "pdf" | "image"
  required: boolean;
  status: boolean;
}

export default function KYCDocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<KYCDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('pdf');
  const [required, setRequired] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/admin/system/documents');
      setDocuments(res.data || []);
      setFetchError(null);
    } catch (err) {
      console.error(err);
      setFetchError('Failed to fetch KYC document specifications.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleToggleStatus = async (docId: string) => {
    try {
      const res = await apiClient.put(`/admin/system/documents/${docId}/toggle`);
      setDocuments(prev =>
        prev.map(d => (d.id === docId ? { ...d, status: res.data.status } : d))
      );
    } catch (err) {
      console.error('Failed to toggle document status:', err);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this KYC document requirement?')) return;
    try {
      await apiClient.delete(`/admin/system/documents/${docId}`);
      setDocuments(prev => prev.filter(d => d.id !== docId));
    } catch (err) {
      console.error('Failed to delete document requirement:', err);
    }
  };

  const handleEditClick = (doc: KYCDocument) => {
    setEditingDocId(doc.id);
    setTitle(doc.title);
    setType(doc.type);
    setRequired(doc.required);
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSubmitting(true);

    const payload = { title, type, required };

    try {
      if (editingDocId) {
        const res = await apiClient.put(`/admin/system/documents/${editingDocId}`, payload);
        setDocuments(prev => prev.map(d => (d.id === editingDocId ? res.data : d)));
      } else {
        const res = await apiClient.post('/admin/system/documents', payload);
        setDocuments(prev => [...prev, res.data]);
      }
      // reset form
      setTitle('');
      setType('pdf');
      setRequired(true);
      setEditingDocId(null);
      setShowAddForm(false);
    } catch (err) {
      console.error('Failed to save document:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { name: 'Help Desk', href: '/dashboard/admin/system/helpdesk', active: false },
    { name: 'CMS Pages', href: '/dashboard/admin/system/pages', active: false },
    { name: 'Plans', href: '/dashboard/admin/system/plans', active: false },
    { name: 'Taxes', href: '/dashboard/admin/system/taxes', active: false },
    { name: 'KYC Documents', href: '/dashboard/admin/system/documents', active: true },
    { name: 'Blogs', href: '/dashboard/admin/system/blogs', active: false },
    { name: 'Templates', href: '/dashboard/admin/system/templates', active: false },
    { name: 'Settings', href: '/dashboard/admin/system/settings', active: false },
    { name: 'Push Notifications', href: '/dashboard/admin/system/push-notifications', active: false },
  ];

  return (
    <div className="p-6 space-y-6 bg-[#09090b] min-h-screen text-zinc-100">
      {/* Header section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-[#5E5CE6]" />
              SYSTEM MANAGEMENT
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Configure global application parameters, CMS pages, support, plans, and notifications.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingDocId(null);
              setTitle('');
              setType('pdf');
              setRequired(true);
              setShowAddForm(!showAddForm);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#5E5CE6] hover:bg-[#5E5CE6]/90 text-white text-xs font-bold transition-all shadow-md shadow-[#5E5CE6]/20"
          >
            <Plus className="w-4 h-4" />
            Add KYC Requirement
          </button>
        </div>

        {/* Tab Row */}
        <div className="flex border-b border-zinc-800/80 overflow-x-auto whitespace-nowrap scrollbar-none">
          {tabs.map((t) => (
            <button
              key={t.name}
              onClick={() => router.push(t.href)}
              className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 -mb-[2px] ${
                t.active
                  ? 'border-[#5E5CE6] text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-4 bg-zinc-900/60 border border-zinc-850 rounded-xl max-w-md space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            {editingDocId ? 'Edit KYC Requirement' : 'Create KYC Requirement'}
          </h3>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-[10px] text-zinc-500 font-bold block mb-1">Document Name / Title</label>
              <input
                type="text"
                placeholder="e.g. Trade License, ID Document"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-[#5E5CE6]"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-zinc-500 font-bold block mb-1">Expected Format</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#5E5CE6]"
                >
                  <option value="pdf">PDF File Only</option>
                  <option value="image">Image File (PNG, JPG)</option>
                </select>
              </div>
              <div className="flex items-end pb-1.5">
                <button
                  type="button"
                  onClick={() => setRequired(!required)}
                  className="flex items-center gap-2 text-xs font-medium text-zinc-300 hover:text-white"
                >
                  {required ? (
                    <CheckSquare className="w-4 h-4 text-[#5E5CE6]" />
                  ) : (
                    <Square className="w-4 h-4 text-zinc-600" />
                  )}
                  Mandatory to submit
                </button>
              </div>
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setEditingDocId(null);
              }}
              className="px-3 py-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-[10px] font-bold text-zinc-400 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-3 py-1 bg-[#5E5CE6] hover:bg-[#5E5CE6]/90 disabled:opacity-50 text-[10px] font-bold text-white rounded"
            >
              {isSubmitting ? 'Saving...' : 'Save Requirement'}
            </button>
          </div>
        </form>
      )}

      {/* Documents List Table */}
      <div className="bg-zinc-900/50 border border-zinc-800/60 backdrop-blur-md rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#5E5CE6] animate-spin" />
            <span className="text-xs text-zinc-500">Loading KYC parameters...</span>
          </div>
        ) : fetchError ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-red-400">
            <AlertCircle className="w-8 h-8" />
            <span className="text-xs">{fetchError}</span>
          </div>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-xs">
            No KYC documents requirements configured yet. Add one above.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#5E5CE6]/90 text-[11px] font-bold text-white uppercase tracking-wider">
                <th className="py-3 px-4 rounded-tl-xl">Document Name</th>
                <th className="py-3 px-4">Expected Format</th>
                <th className="py-3 px-4">Submission requirement</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 rounded-tr-xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50 text-xs">
              {documents.map((doc) => (
                <tr key={doc.id} className="bg-[#18181b] border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                  <td className="py-4 px-4 font-bold text-zinc-200">{doc.title}</td>
                  <td className="py-4 px-4 uppercase text-zinc-400 font-mono text-[10px]">{doc.type}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      doc.required 
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                        : 'bg-zinc-850 text-zinc-550 border border-zinc-800'
                    }`}>
                      {doc.required ? 'Mandatory' : 'Optional'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => handleToggleStatus(doc.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border transition-all ${
                        doc.status
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                      }`}
                    >
                      {doc.status ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td className="py-4 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleEditClick(doc)}
                      className="px-2 py-1 bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 rounded text-[10px] text-zinc-300 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="px-2 py-1 bg-red-950/40 hover:bg-red-950/60 border border-red-900/50 rounded text-[10px] text-red-400 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
