'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/apiClient';
import {
  Megaphone, Send, RefreshCw, X, Loader2, Info,
  Users, Briefcase, Hammer, Clock, MessageSquare, AlertCircle
} from 'lucide-react';

interface NotificationLog {
  id: string;
  title: string;
  message: string;
  user_type: string; // all | user | provider | handyman
  recipient_count: number;
  sent: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [userType, setUserType] = useState('all'); // all | user | provider | handyman
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchNotificationLogs();
  }, []);

  const fetchNotificationLogs = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/notification-logs');
      setLogs(res.data || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch notification logs');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    setSending(true);
    try {
      const res = await apiClient.post('/admin/send-notification', {
        title,
        message,
        user_type: userType
      });
      setSuccessMsg(res.data.message || 'Bulk push notification sent successfully!');
      setTitle('');
      setMessage('');
      fetchNotificationLogs();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send bulk notification');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* Background ambient glows */}
      <div className="fixed top-0 left-[20%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-[10%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">Push Notifications</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Send real-time bulk alerts & announcements to mobile application users.</p>
        </div>
        <button
          onClick={fetchNotificationLogs}
          className="group flex items-center justify-center gap-2.5 h-10 px-5 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white rounded-xl transition-all shadow-[0_0_20px_rgba(0,0,0,0.2)] active:scale-95 font-semibold"
        >
          <RefreshCw className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors animate-spin-hover" />
          Refresh Log
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-4 py-3 text-sm">
          {successMsg}
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-zinc-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Send Broadcast form */}
        <div className="bg-[#0a0a0c]/60 backdrop-blur-xl border border-white/5 rounded-[24px] p-6 shadow-2xl space-y-6 relative z-10">
          <h2 className="text-base font-bold flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-primary" />
            Send Bulk Alert
          </h2>
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Target Audience</label>
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                className="w-full h-11 px-3 bg-[#0a0a0c]/90 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-primary/50 shadow-inner"
              >
                <option value="all">All Users & Partners</option>
                <option value="user">Customers Only</option>
                <option value="provider">Service Providers Only</option>
                <option value="handyman">Handymen Only</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Notification Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Festival Season discount!"
                className="w-full h-11 px-3 bg-[#0a0a0c]/90 border border-white/10 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 shadow-inner"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Message Description</label>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Write your push notification message details here..."
                className="w-full p-3 bg-[#0a0a0c]/90 border border-white/10 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 shadow-inner"
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="group w-full h-12 bg-primary hover:bg-primary/90 text-zinc-950 font-extrabold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(228,253,151,0.3)] hover:shadow-[0_0_25px_rgba(228,253,151,0.5)] hover:-translate-y-0.5 active:scale-95"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send Broadcast Push
            </button>
          </form>
        </div>

        {/* History log */}
        <div className="bg-[#0a0a0c]/60 backdrop-blur-xl border border-white/5 rounded-[24px] p-6 shadow-2xl lg:col-span-2 space-y-6 relative z-10">
          <h2 className="text-base font-bold flex items-center gap-2 text-zinc-200">
            <Clock className="w-5 h-5 text-primary" />
            Broadcast Log History
          </h2>
          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {logs.map((log) => (
              <div key={log.id} className="group bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-all hover:-translate-y-0.5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-base text-white group-hover:text-primary transition-colors">{log.title}</h4>
                    <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border ${
                      log.user_type === 'all' ? 'bg-primary/10 text-primary border-primary/20' :
                      log.user_type === 'user' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      log.user_type === 'provider' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-purple-500/10 text-purple-400 border-purple-500/20'
                    }`}>
                      {log.user_type}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">{log.message}</p>
                  <span className="text-[10px] text-zinc-500 flex items-center gap-1 mt-1">
                    Sent to {log.recipient_count} recipients • {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="shrink-0 self-end sm:self-auto">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    log.sent ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {log.sent ? 'Dispatched' : 'Queued/Failed'}
                  </span>
                </div>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="text-center py-20 bg-[#0a0a0c]/40 rounded-[20px] border border-white/5">
                <MessageSquare className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white tracking-tight">No broadcasts sent yet</h3>
                <p className="text-sm text-zinc-500 mt-1">When you send push notifications, they will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
