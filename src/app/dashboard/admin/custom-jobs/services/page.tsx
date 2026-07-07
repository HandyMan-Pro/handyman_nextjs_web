'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../../../lib/apiClient';
import {
  Search, Trash2, Loader2, AlertCircle, CheckCircle, X, ClipboardList, Layers
} from 'lucide-react';

interface CreatorUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface CategoryDetail {
  id: string;
  name: string;
  icon?: string;
}

interface CustomJobService {
  id: string;
  name: string;
  description: string;
  status: boolean;
  user: CreatorUser;
  category: CategoryDetail;
}

export default function AdminCustomJobServicesPage() {
  const [services, setServices] = useState<CustomJobService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/admin/custom-jobs/services');
      setServices(res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch custom job services.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this custom job service?')) return;
    setError('');
    setSuccess('');
    try {
      await apiClient.delete(`/admin/custom-jobs/services/${id}`);
      setSuccess('Custom job service deleted successfully.');
      setServices(prev => prev.filter(s => s.id !== id));
      setSelectedIds(prev => prev.filter(item => item !== id));
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to delete custom job service.');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setTogglingId(id);
    setError('');
    setSuccess('');
    const newStatus = !currentStatus;
    try {
      await apiClient.put(`/admin/custom-jobs/services/${id}/toggle`, {
        field: 'status',
        value: newStatus
      });
      setSuccess(`Custom job service status updated to ${newStatus ? 'Active' : 'Inactive'}.`);
      setServices(prev =>
        prev.map(s => (s.id === id ? { ...s, status: newStatus } : s))
      );
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to toggle status.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredServices.map(s => s.id));
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

  const filteredServices = services.filter(srv =>
    srv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    srv.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    srv.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    srv.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    srv.category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-zinc-300">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Layers className="w-5.5 h-5.5 text-[#5E5CE6]" />
            Job Service List
          </h1>
          <p className="text-zinc-500 text-xs mt-0.5">
            Manage and audit user-created custom service requests for custom job bidding.
          </p>
        </div>
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
          <select className="bg-[#121214] border border-zinc-800/60 text-xs text-zinc-400 rounded-lg px-3 h-8.5 focus:outline-none">
            <option>All Types</option>
            <option>Active Only</option>
            <option>Inactive Only</option>
          </select>
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search custom service name, user, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8.5 pl-9 pr-4 bg-[#121214] border border-zinc-800/60 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#5E5CE6]/60 transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center p-12 bg-[#18181b] border border-zinc-850 rounded-xl">
          <Loader2 className="w-6 h-6 text-[#5E5CE6] animate-spin" />
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="border border-zinc-850 rounded-xl p-12 text-center bg-[#18181b] text-zinc-500 text-xs">
          No custom job services found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-800/50">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-[#5E5CE6]/90">
                <th className="py-3 px-4 text-[11px] font-bold text-white uppercase tracking-wider w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredServices.length && filteredServices.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-zinc-600 bg-zinc-800 text-[#5E5CE6] focus:ring-[#5E5CE6] h-3.5 w-3.5"
                  />
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-white uppercase tracking-wider">Name</th>
                <th className="py-3 px-4 text-[11px] font-bold text-white uppercase tracking-wider">User</th>
                <th className="py-3 px-4 text-[11px] font-bold text-white uppercase tracking-wider">Category</th>
                <th className="py-3 px-4 text-[11px] font-bold text-white uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-[11px] font-bold text-white uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map((srv) => (
                <tr key={srv.id} className="bg-[#18181b] border-b border-zinc-800/50 hover:bg-zinc-900/40 transition-colors">
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(srv.id)}
                      onChange={(e) => handleSelectOne(srv.id, e.target.checked)}
                      className="rounded border-zinc-700 bg-zinc-800 text-[#5E5CE6] focus:ring-[#5E5CE6] h-3.5 w-3.5"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <span className="font-semibold text-white text-xs">{srv.name}</span>
                      <p className="text-zinc-500 text-[10px] mt-0.5 line-clamp-1 max-w-[250px]">{srv.description}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {srv.user.avatar ? (
                        <img
                          src={srv.user.avatar}
                          alt={srv.user.name}
                          className="w-7 h-7 rounded-full object-cover border border-zinc-800"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-800 flex items-center justify-center text-[10px] text-zinc-500 font-bold uppercase">
                          {srv.user.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-white leading-tight">{srv.user.name}</span>
                        <span className="text-[10px] text-zinc-400 leading-tight">{srv.user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      {srv.category.icon ? (
                        <img
                          src={srv.category.icon}
                          alt={srv.category.name}
                          className="w-5 h-5 object-cover rounded border border-zinc-800 bg-zinc-900"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded bg-zinc-800 border border-zinc-800 flex items-center justify-center text-[9px] text-zinc-500 font-bold uppercase">
                          C
                        </div>
                      )}
                      <span className="text-zinc-300 font-medium">{srv.category.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      disabled={togglingId === srv.id}
                      onClick={() => handleToggleStatus(srv.id, srv.status)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        srv.status ? 'bg-[#5E5CE6]' : 'bg-zinc-800'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          srv.status ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDelete(srv.id)}
                      title="Delete service"
                      className="text-rose-500 hover:text-rose-400 p-1 hover:bg-rose-950/30 rounded transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
