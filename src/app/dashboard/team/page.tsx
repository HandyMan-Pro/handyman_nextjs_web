'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/apiClient';
import {
  Users, Plus, Search, X, Loader2, Mail, Phone,
  CheckCircle2, AlertTriangle, Key, Copy, Check, Info, ShieldAlert,
  Clock, ArrowUpRight
} from 'lucide-react';

interface Handyman {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  display_name: string;
  contact_number?: string;
  status: 'Available' | 'On Task';
  unique_worker_id?: string;
}

interface PendingInvite {
  id: string;
  provider_id: string;
  provider_name: string;
  handyman_id: string;
  handyman_name: string;
  unique_worker_id: string;
  status: string;
  created_at?: string;
}

export default function TeamPage() {
  const [team, setTeam] = useState<Handyman[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'pending'>('active');

  // Invite Modal
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [workerId, setWorkerId] = useState('');

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    setLoading(true);
    setError('');
    try {
      const [teamRes, invitesRes] = await Promise.all([
        apiClient.get('/provider/handymen/list'),
        apiClient.get('/provider/team/invites')
      ]);
      setTeam(teamRes.data?.data || []);
      setPendingInvites(invitesRes.data?.data || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to retrieve handymen team details.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInviteModal = () => {
    setWorkerId('');
    setError('');
    setIsInviteModalOpen(true);
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workerId.trim()) {
      setError('Please enter a Worker ID.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const payload = {
        unique_worker_id: workerId.trim().toUpperCase()
      };

      const res = await apiClient.post('/provider/team/invite', payload);
      setSuccessMsg(res.data?.message || `Invitation successfully sent to worker ${workerId}.`);
      setIsInviteModalOpen(false);
      setWorkerId('');
      fetchTeam();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to invite handyman.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTeam = team.filter(h =>
    h.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (h.unique_worker_id && h.unique_worker_id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredPending = pendingInvites.filter(p =>
    p.handyman_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.unique_worker_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            My Handymen Team
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Invite workers via their Worker ID, manage pending invitations, and assign tasks to active handymen.
          </p>
        </div>
        <button
          onClick={handleOpenInviteModal}
          className="flex items-center justify-center gap-2 h-10 px-4 bg-primary hover:bg-primary/90 text-zinc-950 font-semibold rounded-xl transition-all shadow-md shadow-primary/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Invite via Worker ID
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-4 py-3 text-sm flex items-center gap-2 animate-fade-in shadow-lg">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {error && !isInviteModalOpen && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm flex justify-between items-center gap-2 animate-fade-in shadow-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 gap-6">
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-3 text-sm font-semibold transition-all relative cursor-pointer ${
            activeTab === 'active' ? 'text-primary' : 'text-zinc-550 hover:text-zinc-300'
          }`}
        >
          <span className="flex items-center gap-2">
            Active Team
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
              activeTab === 'active' ? 'bg-primary text-zinc-950' : 'bg-zinc-800 text-zinc-400'
            }`}>
              {team.length}
            </span>
          </span>
          {activeTab === 'active' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 text-sm font-semibold transition-all relative cursor-pointer ${
            activeTab === 'pending' ? 'text-primary' : 'text-zinc-550 hover:text-zinc-300'
          }`}
        >
          <span className="flex items-center gap-2">
            Pending Invites
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
              activeTab === 'pending' ? 'bg-primary text-zinc-950' : 'bg-zinc-800 text-zinc-400'
            }`}>
              {pendingInvites.length}
            </span>
          </span>
          {activeTab === 'pending' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full" />
          )}
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4 border-b border-zinc-800 pb-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === 'active'
                ? "Search handymen by name, email, worker ID..."
                : "Search pending invites by handyman name, worker ID..."
            }
            className="w-full h-10 pl-9 pr-4 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-300 placeholder:text-zinc-650 focus:outline-none focus:ring-1 focus:ring-primary/45 transition-all"
          />
        </div>
        
        {activeTab === 'active' && (
          <div className="text-xs text-zinc-405 font-semibold bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-lg flex gap-3">
            <span>Total: {team.length}</span>
            <span className="border-l border-zinc-800 pl-3 text-emerald-400">Available: {team.filter(h => h.status === 'Available').length}</span>
            <span className="border-l border-zinc-800 pl-3 text-amber-400">On Task: {team.filter(h => h.status === 'On Task').length}</span>
          </div>
        )}
      </div>

      {/* Content Panels */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-zinc-900 border border-zinc-850 rounded-2xl" />
          ))}
        </div>
      ) : activeTab === 'active' ? (
        filteredTeam.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/40 border border-zinc-800/65 rounded-2xl p-6">
            <Users className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-md font-bold text-zinc-300">No active team members</h3>
            <p className="text-zinc-500 text-sm mt-1 max-w-sm mx-auto">
              No handymen are currently linked to your agency. Invite handymen using their unique Worker ID.
            </p>
            <button
              onClick={handleOpenInviteModal}
              className="mt-4 inline-flex items-center gap-2 h-9 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg transition-colors border border-zinc-700/50 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Invite Handyman
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTeam.map((member) => (
              <div
                key={member.id}
                className="bg-zinc-900/65 border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-zinc-700/60 transition-all duration-300 shadow-lg shadow-black/10 animate-fade-in"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-705 flex items-center justify-center text-sm font-bold text-zinc-300">
                        {member.first_name ? member.first_name[0] : member.display_name[0]}
                        {member.last_name ? member.last_name[0] : ''}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-zinc-100">{member.display_name}</h3>
                        <p className="text-xs text-zinc-500 mt-0.5">@{member.username}</p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        member.status === 'Available'
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        member.status === 'Available' ? 'bg-emerald-400' : 'bg-amber-400'
                      }`} />
                      {member.status}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <Mail className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    {member.contact_number && (
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <Phone className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{member.contact_number}</span>
                      </div>
                    )}
                    {member.unique_worker_id && (
                      <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                        <span>Worker ID:</span>
                        <span className="text-primary font-bold">{member.unique_worker_id}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : filteredPending.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900/40 border border-zinc-800/65 rounded-2xl p-6">
          <Clock className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-md font-bold text-zinc-300">No pending invites</h3>
          <p className="text-zinc-500 text-sm mt-1 max-w-sm mx-auto">
            You don't have any sent invitations currently waiting for handymen acceptance.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPending.map((invite) => (
            <div
              key={invite.id}
              className="bg-zinc-900/65 border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-zinc-700/60 transition-all duration-300 shadow-lg shadow-black/10 animate-fade-in"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-705 flex items-center justify-center text-sm font-bold text-zinc-300">
                      {invite.handyman_name[0]}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-zinc-100">{invite.handyman_name}</h3>
                      <p className="text-xs text-zinc-500 mt-0.5 font-mono">{invite.unique_worker_id}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border bg-blue-500/10 border-blue-500/20 text-blue-400">
                    Pending
                  </span>
                </div>
                
                <div className="mt-4 text-xs text-zinc-500">
                  {invite.created_at && (
                    <p>Sent on: <span className="text-zinc-400">{new Date(invite.created_at).toLocaleDateString()}</span></p>
                  )}
                  <p className="mt-1">Awaiting acceptance by the worker on their Handyman Dashboard.</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invite Handyman Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setIsInviteModalOpen(false)} />
          <div className="relative z-10 w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                <Users className="w-5 h-5 text-primary" />
                Invite Team Member
              </h3>
              <button onClick={() => setIsInviteModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-2.5 text-xs flex items-center gap-2 mb-4 animate-fade-in">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-zinc-550 uppercase tracking-wider mb-1 block">Handyman Worker ID *</label>
                <input
                  type="text"
                  required
                  value={workerId}
                  onChange={(e) => setWorkerId(e.target.value)}
                  placeholder="e.g. HM-LJJPA"
                  className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-150 focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-zinc-600 font-mono tracking-wide uppercase"
                />
              </div>

              <div className="bg-zinc-850/40 border border-zinc-800 rounded-xl p-3 text-[10px] text-zinc-450 flex items-start gap-2">
                <Info className="w-4 h-4 flex-shrink-0 text-zinc-500 mt-0.5" />
                <p>
                  Enter the unique Worker ID displayed on the handyman's dashboard (e.g. HM-LJJPA). The handyman will receive a notification to join your team.
                </p>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="flex-1 h-11 bg-zinc-800 hover:bg-zinc-755 text-zinc-350 font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 h-11 bg-primary hover:bg-primary/95 text-zinc-950 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
