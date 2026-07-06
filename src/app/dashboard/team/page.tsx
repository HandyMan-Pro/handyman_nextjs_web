'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/apiClient';
import {
  Users, Plus, Search, X, Loader2, Mail, Phone,
  CheckCircle2, AlertTriangle, Key, Copy, Check, Info, ShieldAlert
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
}

export default function TeamPage() {
  const [team, setTeam] = useState<Handyman[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Invite Modal
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  // Credentials presentation screen after invite
  const [credentials, setCredentials] = useState<{
    username: string;
    email: string;
    tempPass: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/provider/handymen/list');
      setTeam(res.data?.data || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to retrieve handymen team.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInviteModal = () => {
    setUsername('');
    setEmail('');
    setFirstName('');
    setLastName('');
    setContactNumber('');
    setCredentials(null);
    setCopied(false);
    setIsInviteModalOpen(true);
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !firstName.trim() || !lastName.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const payload = {
        username: username.trim(),
        email: email.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        contact_number: contactNumber.trim() || null
      };

      const res = await apiClient.post('/provider/handymen/invite', payload);
      const data = res.data?.data;

      // Show credentials screen inside modal
      setCredentials({
        username: data.username,
        email: data.email,
        tempPass: data.temp_password
      });

      // Refresh list
      fetchTeam();
      setSuccessMsg(`Handyman "${data.display_name}" invited successfully.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to invite handyman.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!credentials) return;
    const text = `Handyman Account Credentials:\nUsername: ${credentials.username}\nEmail: ${credentials.email}\nTemporary Password: ${credentials.tempPass}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredTeam = team.filter(h =>
    h.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.username.toLowerCase().includes(searchQuery.toLowerCase())
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
            Invite staff members, view their task occupancy, and manage your operational work assignments.
          </p>
        </div>
        <button
          onClick={handleOpenInviteModal}
          className="flex items-center justify-center gap-2 h-10 px-4 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all shadow-md shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          Invite Team Member
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

      {/* Search Bar */}
      <div className="flex items-center gap-4 border-b border-zinc-800 pb-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search handymen by name, email, or username..."
            className="w-full h-10 pl-9 pr-4 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-300 placeholder:text-zinc-650 focus:outline-none focus:ring-1 focus:ring-primary/45 transition-all"
          />
        </div>
        <div className="text-xs text-zinc-400 font-semibold bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-lg flex gap-3">
          <span>Total: {team.length}</span>
          <span className="border-l border-zinc-800 pl-3 text-emerald-400">Available: {team.filter(h => h.status === 'Available').length}</span>
          <span className="border-l border-zinc-800 pl-3 text-amber-400">On Task: {team.filter(h => h.status === 'On Task').length}</span>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-zinc-900 border border-zinc-850 rounded-2xl" />
          ))}
        </div>
      ) : filteredTeam.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900/40 border border-zinc-800/65 rounded-2xl p-6">
          <Users className="w-12 h-12 text-zinc-605 mx-auto mb-3" />
          <h3 className="text-md font-bold text-zinc-300">No team members found</h3>
          <p className="text-zinc-550 text-sm mt-1 max-w-sm mx-auto">
            You haven't invited any handymen yet, or your search query did not yield any matches.
          </p>
          <button
            onClick={handleOpenInviteModal}
            className="mt-4 inline-flex items-center gap-2 h-9 px-4 bg-zinc-805 hover:bg-zinc-705 text-zinc-200 text-xs font-semibold rounded-lg transition-colors border border-zinc-700/50"
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
              className="bg-zinc-900/65 border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-zinc-700/60 transition-all duration-300 shadow-lg shadow-black/10"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700/40 flex items-center justify-center text-sm font-bold text-zinc-300">
                      {member.first_name[0]}{member.last_name[0]}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-zinc-100">{member.display_name}</h3>
                      <p className="text-xs text-zinc-505 mt-0.5">@{member.username}</p>
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
                {credentials ? 'Account Created' : 'Invite Team Member'}
              </h3>
              <button onClick={() => setIsInviteModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-2.5 text-xs flex items-center gap-2 mb-4 animate-fade-in">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {credentials ? (
              // Credentials screen (successful invite)
              <div className="space-y-4">
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl p-3.5 text-xs flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
                  <div>
                    <span className="font-bold">Registration Successful!</span>
                    <p className="mt-0.5 text-[11px] text-emerald-505">The handyman sub-account is now active in your business team.</p>
                  </div>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                    <Key className="w-4 h-4 text-primary" />
                    <span>Copy Login Credentials</span>
                  </div>
                  
                  <div className="space-y-2 text-xs border-t border-zinc-900 pt-3">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Username:</span>
                      <span className="font-semibold text-zinc-300">{credentials.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Email:</span>
                      <span className="font-semibold text-zinc-300">{credentials.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Temporary Password:</span>
                      <span className="font-mono font-bold text-primary-light bg-primary/10 px-2 py-0.5 rounded">{credentials.tempPass}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-850/40 border border-zinc-800 rounded-xl p-3 text-[10px] text-zinc-450 flex items-start gap-2">
                  <Info className="w-4 h-4 flex-shrink-0 text-zinc-500 mt-0.5" />
                  <p>
                    Please share these credentials with the team member. They can log in to the Handyman mobile application. They will be prompted to change their password on first login.
                  </p>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    onClick={handleCopyCredentials}
                    className="flex-1 h-11 bg-zinc-800 hover:bg-zinc-755 text-zinc-200 font-semibold rounded-xl border border-zinc-700/30 flex items-center justify-center gap-2 transition-all"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy to Clipboard</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setIsInviteModalOpen(false)}
                    className="flex-1 h-11 bg-primary hover:bg-primary/95 text-white font-semibold rounded-xl transition-all"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              // Form screen
              <form onSubmit={handleInviteSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 block">First Name *</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. John"
                      className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-150 focus:outline-none focus:ring-1 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 block">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Doe"
                      className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-150 focus:outline-none focus:ring-1 focus:ring-primary/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 block">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. john.doe@handyman.com"
                    className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-150 focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 block">Username *</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. john_doe"
                    className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-150 focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 block">Contact Number</label>
                  <input
                    type="tel"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="e.g. +1234567890"
                    className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-150 focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(false)}
                    className="flex-1 h-11 bg-zinc-800 hover:bg-zinc-755 text-zinc-350 font-semibold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 h-11 bg-primary hover:bg-primary/95 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Invite Staff
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
