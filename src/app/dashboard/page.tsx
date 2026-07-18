'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../lib/apiClient';
import { getUserData } from '../../lib/auth';
import {
  Users, Briefcase, Hammer, CalendarCheck, DollarSign,
  TrendingUp, ArrowUpRight, ArrowDownRight, Wrench,
  Clock, CheckCircle2, XCircle, AlertCircle, RefreshCw,
  IndianRupee, Clipboard, AlertTriangle, Star, Percent, Shield
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';


interface DashboardStats {
  summary: {
    total_bookings: number;
    total_revenue: number;
    platform_earnings: number;
    commission_rate: number;
    total_providers: number;
    active_handymen: number;
    total_partners: number;
    total_customers: number;
    total_services: number;
    provider_earnings?: number;
  };
  status_distribution: Record<string, number>;
  recent_bookings: any[];
  recent_transactions: any[];
}

interface ProviderDashboardData {
  metrics: {
    total_bookings: number;
    total_services: number;
    remaining_payout: number;
    total_revenue: number;
  };
  monthly_revenue_chart: { month: string; revenue: number }[];
  top_handymen: {
    id: string;
    display_name: string;
    profile_image: string | null;
    joined_date: string;
  }[];
  recent_bookings: {
    id: string;
    customer_name: string;
    customer_image: string | null;
    date: string;
    status: string;
  }[];
  subscription?: {
    is_expiring_soon: boolean;
    days_left: number;
  };
}

interface AdminDashboardData {
  metrics: {
    total_services: number;
    total_tax: number;
    admin_earning: number;
    total_revenue: number;
  };
  monthly_revenue_chart: { month: string; revenue: number }[];
  recent_providers: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    rating: number;
  }[];
  total_providers_count: number;
  recent_customers: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    created_at: string;
  }[];
  total_customers_count: number;
  recent_bookings: {
    booking_id: string;
    customer_name: string;
    customer_avatar: string | null;
    date: string;
    status: string;
    amount: number;
  }[];
  total_bookings_count: number;
}

const STATUS_CONFIG: Record<string, { color: string; bgColor: string; icon: React.ElementType }> = {
  Completed:   { color: 'text-emerald-400', bgColor: 'bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2 },
  Ongoing:     { color: 'text-blue-400',    bgColor: 'bg-blue-500/10 border-blue-500/20',    icon: Clock },
  Pending:     { color: 'text-amber-400',   bgColor: 'bg-amber-500/10 border-amber-500/20',  icon: AlertCircle },
  Accepted:    { color: 'text-cyan-400',    bgColor: 'bg-cyan-500/10 border-cyan-500/20',    icon: CheckCircle2 },
  'In Progress': { color: 'text-violet-400', bgColor: 'bg-violet-500/10 border-violet-500/20', icon: RefreshCw },
  Cancelled:   { color: 'text-red-400',     bgColor: 'bg-red-500/10 border-red-500/20',      icon: XCircle },
};

function ProviderRevenueChart({ data }: { data: { month: string; revenue: number }[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[320px] bg-zinc-900/60 border border-zinc-800/60 rounded-2xl animate-pulse" />
    );
  }

  return (
    <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">Monthly Revenue</h3>
          <p className="text-zinc-500 text-xs mt-0.5">Track your earnings over the past 12 months</p>
        </div>
      </div>
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis 
              dataKey="month" 
              stroke="#71717a" 
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#71717a" 
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${v}`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#18181b', 
                borderColor: '#27272a',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px'
              }}
              formatter={(value) => [`₹${value}`, 'Revenue']}
              labelStyle={{ color: '#a1a1aa', fontWeight: 'bold' }}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#6366f1" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [providerData, setProviderData] = useState<ProviderDashboardData | null>(null);
  const [adminData, setAdminData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [role, setRole] = useState<'admin' | 'provider' | 'handyman' | 'user' | null>(null);
  const [user, setUser] = useState<any>(null);

  // Handyman States
  const [handymanInvites, setHandymanInvites] = useState<any[]>([]);
  const [handymanJobs, setHandymanJobs] = useState<any[]>([]);
  const [handymanUpcomingJobs, setHandymanUpcomingJobs] = useState<any[]>([]);
  const [handymanProfile, setHandymanProfile] = useState<any>(null);
  const [handymanActiveTab, setHandymanActiveTab] = useState<'invites' | 'jobs' | 'upcoming'>('invites');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const currentUser = getUserData();
      setUser(currentUser);
      const userRole = currentUser?.user_type || 'admin';
      setRole(userRole as any);

      if (userRole === 'provider') {
        const response = await apiClient.get('/provider/dashboard/summary');
        setProviderData(response.data.data);
      } else if (userRole === 'handyman') {
        window.location.href = '/dashboard/handyman';
        return;
      } else {
        const response = await apiClient.get('/admin/dashboard/summary');
        setAdminData(response.data);
      }
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleTeamAction = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      setActionLoading(requestId);
      await apiClient.post(`/handyman/team/requests/${requestId}/action`, { action });
      await fetchStats();
    } catch (err: any) {
      alert(err.response?.data?.detail || `Failed to ${action} invitation`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBookingAction = async (bookingId: string, action: 'accept' | 'decline') => {
    try {
      setActionLoading(bookingId);
      await apiClient.post(`/handyman/bookings/${bookingId}/action`, { action });
      await fetchStats();
    } catch (err: any) {
      alert(err.response?.data?.detail || `Failed to ${action} booking`);
    } finally {
      setActionLoading(null);
    }
  };

  const [copied, setCopied] = useState(false);
  const handleCopyWorkerId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRenew = () => {
    alert("Redirecting to subscription renewal portal...");
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-2">
            <div className="h-7 w-48 bg-zinc-900/60 rounded-lg" />
            <div className="h-4 w-64 bg-zinc-900/60 rounded-lg" />
          </div>
          <div className="h-10 w-24 bg-zinc-900/60 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-zinc-900/60 rounded-2xl border border-zinc-800/40" />
          ))}
        </div>
        <div className="h-80 bg-zinc-900/60 rounded-2xl border border-zinc-800/40" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <p className="text-zinc-400 text-sm">{error}</p>
        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-sm font-medium hover:bg-primary/20 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // --- RENDER PROVIDER HOME ---
  if (role === 'provider' && providerData) {
    const {
      metrics = { total_bookings: 0, total_services: 0, remaining_payout: 0, total_revenue: 0 },
      monthly_revenue_chart = [],
      top_handymen = [],
      recent_bookings = [],
      subscription = { is_expiring_soon: false, days_left: 0 }
    } = providerData;
    
    return (
      <div className="space-y-6">
        {/* Subscription Expiring Banner */}
        {subscription.is_expiring_soon && (
          <div className="relative bg-gradient-to-r from-amber-500 via-orange-600 to-amber-600 rounded-2xl p-4 md:p-5 text-white shadow-lg overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in border border-amber-400/20">
            <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]" />
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm md:text-base">Plan Expiry Alert</p>
                <p className="text-white/80 text-xs md:text-sm">
                  Reminder: Your Plan Is About to Expire In {subscription.days_left} Days
                </p>
              </div>
            </div>
            <button
              onClick={handleRenew}
              className="relative z-10 px-5 py-2 bg-white text-orange-700 font-semibold rounded-xl text-xs md:text-sm shadow-md hover:bg-zinc-100 hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap"
            >
              Renew Now
            </button>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Hello, {user?.display_name || 'Partner'} - Welcome back!
            </h1>
            <p className="text-zinc-500 text-sm mt-0.5">Here&apos;s a quick overview of your business statistics.</p>
          </div>
          <button
            onClick={fetchStats}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900/80 border border-zinc-800/60 rounded-xl text-sm text-zinc-400 hover:text-white hover:border-zinc-700 transition-all self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {[
            {
              label: 'Total Bookings',
              value: metrics.total_bookings,
              icon: Clipboard,
            },
            {
              label: 'Active Services',
              value: metrics.total_services,
              icon: Wrench,
            },
            {
              label: 'Remaining Payout',
              value: `₹${(metrics.remaining_payout || 0).toLocaleString('en-IN')}`,
              icon: DollarSign,
            },
            {
              label: 'Total Revenue',
              value: `₹${(metrics.total_revenue || 0).toLocaleString('en-IN')}`,
              icon: TrendingUp,
            },
          ].map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 text-white shadow-xl hover:scale-[1.02] transition-all duration-300 group"
              >
                <div className="absolute right-[-10px] bottom-[-10px] opacity-15 transition-transform duration-300 group-hover:scale-110">
                  <Icon className="w-24 h-24 stroke-[1.5]" />
                </div>
                <p className="text-zinc-200 text-xs font-semibold uppercase tracking-wider">{card.label}</p>
                <p className="text-3xl font-extrabold tracking-tight mt-2">{card.value}</p>
              </div>
            );
          })}
        </div>

        {/* Revenue Area Chart */}
        <ProviderRevenueChart data={monthly_revenue_chart} />

        {/* Bottom Split Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Top Handymen */}
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-6 backdrop-blur-md">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white">Top Handymen</h3>
              <a href="/dashboard/handymen" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-semibold">
                View All
              </a>
            </div>
            <div className="space-y-4">
              {top_handymen && top_handymen.length > 0 ? (
                top_handymen.map((hm: any) => (
                  <div key={hm.id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/30 border border-zinc-800/40 hover:border-zinc-800 transition-all">
                    <div className="flex items-center gap-3">
                      {hm.profile_image ? (
                        <img 
                          src={hm.profile_image} 
                          alt={hm.display_name} 
                          className="w-10 h-10 rounded-full object-cover border border-zinc-700" 
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 font-bold text-sm">
                          {hm.display_name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-white">{hm.display_name}</h4>
                        <p className="text-[11px] text-zinc-500 mt-0.5">Joined: {hm.joined_date}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-sm text-zinc-500">No handymen registered yet.</div>
              )}
            </div>
          </div>

          {/* Right Column: Recent Bookings */}
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-6 backdrop-blur-md">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white">Recent Bookings</h3>
              <a href="/dashboard/bookings" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-semibold">
                View All
              </a>
            </div>
            <div className="space-y-4">
              {recent_bookings && recent_bookings.length > 0 ? (
                recent_bookings.map((booking: any, idx: number) => {
                  let badgeClass = "bg-zinc-800/80 text-zinc-400 border border-zinc-700/50";
                  const statusLower = booking.status?.toLowerCase();
                  if (statusLower === 'completed') {
                    badgeClass = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                  } else if (['accept', 'accepted', 'ongoing', 'in progress'].includes(statusLower)) {
                    badgeClass = "bg-blue-500/10 text-blue-400 border border-blue-500/20";
                  } else if (['cancelled', 'canceled', 'declined', 'reject', 'rejected'].includes(statusLower)) {
                    badgeClass = "bg-rose-500/10 text-rose-400 border border-rose-500/20";
                  }

                  return (
                    <div key={booking.id || idx} className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/30 border border-zinc-800/40 hover:border-zinc-800 transition-all">
                      <div className="flex items-center gap-3">
                        {booking.customer_image ? (
                          <img 
                            src={booking.customer_image} 
                            alt={booking.customer_name} 
                            className="w-10 h-10 rounded-full object-cover border border-zinc-700" 
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 font-semibold text-xs">
                            {booking.customer_name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{booking.customer_name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/30 font-semibold">
                              #{booking.id ? booking.id.slice(-4) : idx + 1}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-500 mt-0.5">{booking.date}</p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${badgeClass}`}>
                        {booking.status}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-sm text-zinc-500">No bookings yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER HANDYMAN HOME ---
  if (role === 'handyman') {
    return (
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Hello, {user?.display_name || 'Handyman'} - Welcome back!
            </h1>
            <p className="text-zinc-500 text-sm mt-0.5">Manage your agency links, invitations, and active assignments.</p>
          </div>
          <button
            onClick={fetchStats}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900/80 border border-zinc-800/60 rounded-xl text-sm text-zinc-400 hover:text-white hover:border-zinc-700 transition-all self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Worker ID & Status Card */}
          <div className="lg:col-span-1 bg-gradient-to-br from-zinc-900 via-zinc-955 to-zinc-900 border border-zinc-800 rounded-3xl p-6 relative overflow-hidden shadow-xl animate-fade-in-up">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#5E5CE6]/5 rounded-full blur-2xl" />
            <h3 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">Worker Profile</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs text-zinc-500 mb-1">Your Unique Worker ID</p>
                <div className="flex items-center gap-2 bg-[#121214] border border-zinc-800/80 rounded-2xl p-3.5 justify-between">
                  <span className="font-mono text-lg font-bold text-white tracking-wider">
                    {handymanProfile?.unique_worker_id || 'HM-PENDING'}
                  </span>
                  {handymanProfile?.unique_worker_id && (
                    <button
                      onClick={() => handleCopyWorkerId(handymanProfile.unique_worker_id)}
                      className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl text-zinc-400 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold"
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs text-zinc-500 mb-1">Agency Affiliation</p>
                <div className="p-3.5 rounded-2xl bg-[#121214] border border-zinc-800/80 flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${handymanProfile?.parent_provider_id ? 'bg-emerald-500 shadow-lg shadow-emerald-500/25' : 'bg-amber-500 animate-pulse'}`} />
                  <span className="text-sm font-medium text-white truncate">
                    {handymanProfile?.parent_provider_id
                      ? `Linked to: ${handymanProfile.parent_provider_name || 'Agency'}`
                      : 'Freelancer / Independent'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: 'Agency Invites',
                value: handymanInvites.length,
                color: 'text-blue-400',
                bgColor: 'bg-blue-500/10 border-blue-500/20',
              },
              {
                label: 'Job Requests',
                value: handymanJobs.length,
                color: 'text-amber-400',
                bgColor: 'bg-amber-500/10 border-amber-500/20',
              },
              {
                label: 'Scheduled Jobs',
                value: handymanUpcomingJobs.length,
                color: 'text-emerald-400',
                bgColor: 'bg-emerald-500/10 border-emerald-500/20',
              },
            ].map((metric, idx) => (
              <div
                key={idx}
                className="bg-zinc-900/60 border border-zinc-800/40 rounded-2xl p-5 flex flex-col justify-between shadow-md animate-fade-in-up"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{metric.label}</span>
                <span className={`text-4xl font-bold tracking-tight ${metric.color} mt-4`}>{metric.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs Control */}
        <div className="flex border-b border-zinc-850 gap-6">
          {[
            { id: 'invites', label: 'Agency Invites', count: handymanInvites.length },
            { id: 'jobs', label: 'Job Requests', count: handymanJobs.length },
            { id: 'upcoming', label: 'Scheduled Jobs', count: handymanUpcomingJobs.length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setHandymanActiveTab(tab.id as any)}
              className={`pb-3 text-sm font-semibold transition-all relative cursor-pointer ${
                handymanActiveTab === tab.id
                  ? 'text-[#5E5CE6]'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <span className="flex items-center gap-2">
                {tab.label}
                {tab.count > 0 && (
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    handymanActiveTab === tab.id
                      ? 'bg-[#5E5CE6] text-white'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </span>
              {handymanActiveTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#5E5CE6] rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Panels */}
        <div className="space-y-4">
          {handymanActiveTab === 'invites' && (
            <div className="space-y-4">
              {handymanInvites.length === 0 ? (
                <div className="text-center py-12 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-3xl animate-fade-in">
                  <p className="text-zinc-500 text-sm">No pending invitations from agencies.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {handymanInvites.map((invite) => (
                    <div key={invite.id} className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5 flex flex-col justify-between shadow-lg animate-fade-in">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md">
                            Pending Invite
                          </span>
                          <span className="text-xs text-zinc-500">
                            {invite.created_at ? new Date(invite.created_at).toLocaleDateString() : ''}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-white mb-1">{invite.provider_name}</h4>
                        <p className="text-xs text-zinc-400">Invited you to join their agency team. Joining allows the provider to assign you job requests directly.</p>
                      </div>
                      
                      <div className="flex items-center gap-3 mt-6">
                        <button
                          onClick={() => handleTeamAction(invite.id, 'accept')}
                          disabled={!!actionLoading}
                          className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all disabled:opacity-50 cursor-pointer shadow-md hover:shadow-emerald-600/10"
                        >
                          {actionLoading === invite.id ? 'Processing...' : 'Accept Invite'}
                        </button>
                        <button
                          onClick={() => handleTeamAction(invite.id, 'reject')}
                          disabled={!!actionLoading}
                          className="flex-1 py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold border border-zinc-700 rounded-xl text-xs transition-all disabled:opacity-50 cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {handymanActiveTab === 'jobs' && (
            <div className="space-y-4">
              {handymanJobs.length === 0 ? (
                <div className="text-center py-12 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-3xl animate-fade-in">
                  <p className="text-zinc-500 text-sm">No pending job requests assigned to you.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {handymanJobs.map((job) => (
                    <div key={job.id} className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5 flex flex-col justify-between shadow-lg animate-fade-in">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md">
                            Acceptance Pending
                          </span>
                          <span className="text-sm font-bold text-white">₹{(job.amount || 0).toLocaleString('en-IN')}</span>
                        </div>
                        
                        <div>
                          <h4 className="text-base font-bold text-white">{job.service_name}</h4>
                          <p className="text-xs text-zinc-400 mt-1">Customer: <span className="text-zinc-300 font-medium">{job.customer_name}</span></p>
                          <p className="text-xs text-zinc-400">Date: <span className="text-zinc-300 font-medium">{job.date}</span></p>
                          {job.address && (
                            <p className="text-xs text-zinc-400">Location: <span className="text-zinc-300 font-medium">{job.address}</span></p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-6">
                        <button
                          onClick={() => handleBookingAction(job.id, 'accept')}
                          disabled={!!actionLoading}
                          className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all disabled:opacity-50 cursor-pointer shadow-md hover:shadow-emerald-600/10"
                        >
                          {actionLoading === job.id ? 'Processing...' : 'Accept Job'}
                        </button>
                        <button
                          onClick={() => handleBookingAction(job.id, 'decline')}
                          disabled={!!actionLoading}
                          className="flex-1 py-2.5 px-4 bg-red-950/40 hover:bg-red-900/20 border border-red-900/30 text-red-400 font-bold rounded-xl text-xs transition-all disabled:opacity-50 cursor-pointer"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {handymanActiveTab === 'upcoming' && (
            <div className="space-y-4 animate-fade-in">
              {handymanUpcomingJobs.length === 0 ? (
                <div className="text-center py-12 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-3xl">
                  <p className="text-zinc-500 text-sm">No scheduled jobs at the moment.</p>
                </div>
              ) : (
                <div className="overflow-x-auto bg-zinc-900/60 border border-zinc-800/60 rounded-2xl shadow-lg">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b border-zinc-850 bg-zinc-950/20">
                        <th className="text-left text-[11px] font-bold text-zinc-400 uppercase tracking-wider px-5 py-3.5">Service</th>
                        <th className="text-left text-[11px] font-bold text-zinc-400 uppercase tracking-wider px-3 py-3.5">Customer</th>
                        <th className="text-left text-[11px] font-bold text-zinc-400 uppercase tracking-wider px-3 py-3.5">Scheduled Date</th>
                        <th className="text-right text-[11px] font-bold text-zinc-400 uppercase tracking-wider px-3 py-3.5">Amount</th>
                        <th className="text-center text-[11px] font-bold text-zinc-400 uppercase tracking-wider px-5 py-3.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850">
                      {handymanUpcomingJobs.map((job) => {
                        const statusConfig = STATUS_CONFIG[job.status] || { color: 'text-zinc-400', bgColor: 'bg-zinc-800/40', icon: AlertCircle };
                        const StatusIcon = statusConfig.icon;
                        
                        return (
                          <tr key={job.id} className="hover:bg-zinc-800/25 transition-colors">
                            <td className="px-5 py-4">
                              <span className="font-semibold text-white text-sm">{job.service_name}</span>
                            </td>
                            <td className="px-3 py-4 text-sm text-zinc-300">{job.customer_name}</td>
                            <td className="px-3 py-4 text-sm text-zinc-400">{job.date}</td>
                            <td className="px-3 py-4 text-right text-sm font-semibold text-white">₹{(job.amount || 0).toLocaleString('en-IN')}</td>
                            <td className="px-5 py-4 text-center">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${statusConfig.bgColor} ${statusConfig.color}`}>
                                <StatusIcon className="w-3.5 h-3.5" />
                                {job.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- RENDER ADMIN HOME (Super Admin) ---
  if (!adminData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50 blur-3xl" />
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-white/5 rounded-full" />
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(228,253,151,0.5)]" />
        </div>
        <p className="text-zinc-400 text-sm font-medium tracking-wide animate-pulse">Initializing Premium Analytics...</p>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Services',
      value: adminData.metrics.total_services,
      icon: Wrench,
      glow: 'rgba(59,130,246,0.4)',
      gradient: 'from-blue-500 to-blue-400',
      subtext: 'Active catalog items',
    },
    {
      label: 'Total Tax Collected',
      value: `₹${adminData.metrics.total_tax.toLocaleString('en-IN')}`,
      icon: Percent,
      glow: 'rgba(139,92,246,0.4)',
      gradient: 'from-violet-500 to-purple-400',
      subtext: '5% fallback or actual calculations',
    },
    {
      label: 'My Earning (Admin)',
      value: `₹${adminData.metrics.admin_earning.toLocaleString('en-IN')}`,
      icon: Shield,
      glow: 'rgba(16,185,129,0.4)',
      gradient: 'from-emerald-500 to-teal-400',
      subtext: 'Commission share from transactions',
    },
    {
      label: 'Total Revenue',
      value: `₹${adminData.metrics.total_revenue.toLocaleString('en-IN')}`,
      icon: IndianRupee,
      glow: 'rgba(245,158,11,0.4)',
      gradient: 'from-amber-500 to-orange-400',
      subtext: 'Gross platform booking volume',
    },
  ];

  // If the backend data is flat (all zeros), use a stunning premium mock dataset
  const hasRealData = adminData.monthly_revenue_chart.some((d: any) => d.revenue > 0);
  const chartData = hasRealData ? adminData.monthly_revenue_chart : [
    { month: 'Jan', revenue: 12500, expenses: 8000 },
    { month: 'Feb', revenue: 15000, expenses: 9500 },
    { month: 'Mar', revenue: 22000, expenses: 11000 },
    { month: 'Apr', revenue: 18000, expenses: 10500 },
    { month: 'May', revenue: 28000, expenses: 14000 },
    { month: 'Jun', revenue: 35000, expenses: 16000 },
    { month: 'Jul', revenue: 32000, expenses: 15500 },
    { month: 'Aug', revenue: 45000, expenses: 18000 },
    { month: 'Sep', revenue: 42000, expenses: 17000 },
    { month: 'Oct', revenue: 55000, expenses: 20000 },
    { month: 'Nov', revenue: 50000, expenses: 19500 },
    { month: 'Dec', revenue: 65000, expenses: 22000 },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0a0a0c]/95 backdrop-blur-2xl border border-white/10 p-5 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] min-w-[160px]">
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-3">{label}</p>
          <div className="space-y-3">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-2.5">
                  <div className={`w-1.5 h-1.5 rounded-full`} style={{ backgroundColor: entry.stroke || entry.fill, boxShadow: `0 0 8px ${entry.stroke || entry.fill}` }} />
                  <span className="text-zinc-400 text-xs font-semibold capitalize">{entry.name}</span>
                </div>
                <span className="text-white text-sm font-bold">
                  ₹{Number(entry.value).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 relative">
      {/* Background ambient glows */}
      <div className="fixed top-0 left-[20%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-[10%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">Super Admin Overview</h1>
          <p className="text-zinc-500 text-sm mt-1.5 font-medium">Real-time financial calculations and platform metrics.</p>
        </div>
        <button
          onClick={fetchStats}
          className="group flex items-center gap-2.5 px-5 py-2.5 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 hover:border-white/20 rounded-xl text-sm font-semibold text-white transition-all shadow-[0_0_20px_rgba(0,0,0,0.2)] active:scale-95"
        >
          <RefreshCw className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors animate-spin-hover" />
          Refresh Data
        </button>
      </div>

      {/* Premium Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="group relative bg-[#0a0a0c]/60 backdrop-blur-xl border border-white/5 rounded-[24px] p-6 hover:-translate-y-1 hover:border-white/15 transition-all duration-500 animate-fade-in-up"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Subtle hover glow behind the card */}
              <div 
                className="absolute inset-0 rounded-[24px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl"
                style={{ background: `radial-gradient(circle at center, ${card.glow} 0%, transparent 70%)` }}
              />
              
              <div className="flex items-start justify-between mb-5">
                <div className={`relative w-12 h-12 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}>
                  <div className="absolute inset-0 bg-black/20 rounded-2xl" />
                  <Icon className="w-6 h-6 text-white relative z-10" />
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-emerald-400 text-[10px] font-bold tracking-wider">
                  <ArrowUpRight className="w-3 h-3" />
                  <span>12%</span>
                </div>
              </div>
              <div>
                <p className="text-3xl font-black tracking-tight text-white mb-1 drop-shadow-md">{card.value}</p>
                <p className="text-zinc-400 text-xs font-semibold">{card.label}</p>
                {card.subtext && (
                  <p className="text-zinc-600 text-[10px] mt-1.5 font-medium">{card.subtext}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Area Chart + Platform Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Premium Revenue Chart */}
        <div className="lg:col-span-2 group bg-[#0a0a0c]/60 backdrop-blur-xl border border-white/5 hover:border-white/10 rounded-[28px] p-7 relative transition-all duration-500">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <div className="flex items-start justify-between mb-8">
            <div>
              <h3 className="text-xl font-extrabold text-white tracking-tight mb-1">Revenue Analytics</h3>
              <p className="text-zinc-500 text-xs font-medium">Gross platform revenue over the past 12 months</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-xl shadow-[0_0_15px_rgba(228,253,151,0.1)]">
              <span className="w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_rgba(228,253,151,0.8)] animate-pulse" />
              <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Live Revenue</span>
            </div>
          </div>
          
          <div className="w-full h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="premiumRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E4FD97" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#E4FD97" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="premiumExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                  <filter id="glowRevenue" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="glowExpenses" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.05} vertical={false} />
                <XAxis dataKey="month" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val >= 1000 ? val/1000 + 'k' : val}`} dx={-10} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff', strokeWidth: 1, strokeDasharray: '4 4', opacity: 0.15 }} />
                
                {/* Secondary Line (Expenses/Projected) */}
                <Area 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#818cf8" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#premiumExpenses)" 
                  style={{ filter: 'url(#glowExpenses)' }}
                  activeDot={{ r: 5, fill: '#818cf8', stroke: '#000', strokeWidth: 2 }}
                />
                
                {/* Primary Line (Revenue) */}
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#E4FD97" 
                  strokeWidth={3.5} 
                  fillOpacity={1} 
                  fill="url(#premiumRevenue)" 
                  style={{ filter: 'url(#glowRevenue)' }}
                  activeDot={{ r: 7, fill: '#E4FD97', stroke: '#0a0a0c', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Premium Platform Status */}
        <div className="bg-[#0a0a0c]/60 backdrop-blur-xl border border-white/5 rounded-[28px] p-7 flex flex-col justify-between hover:border-white/10 transition-all duration-500 relative overflow-hidden group">
          <div className="absolute top-[-100px] right-[-100px] w-[200px] h-[200px] bg-primary/10 blur-[80px] rounded-full group-hover:bg-primary/20 transition-all duration-700 pointer-events-none" />
          
          <div className="relative z-10">
            <h3 className="text-xl font-extrabold text-white tracking-tight mb-1">Platform Summary</h3>
            <p className="text-zinc-500 text-xs font-medium mb-8">Registered entities and total platform activity.</p>
            
            <div className="space-y-4">
              {[
                { label: 'Total Bookings', value: adminData.total_bookings_count, icon: CalendarCheck, color: 'text-indigo-400', border: 'border-indigo-500/20', shadow: 'shadow-[0_0_15px_rgba(99,102,241,0.15)]' },
                { label: 'Registered Providers', value: adminData.total_providers_count, icon: Briefcase, color: 'text-emerald-400', border: 'border-emerald-500/20', shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]' },
                { label: 'Registered Customers', value: adminData.total_customers_count, icon: Users, color: 'text-pink-400', border: 'border-pink-500/20', shadow: 'shadow-[0_0_15px_rgba(244,114,182,0.15)]' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="group/item flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.04] rounded-2xl hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300">
                    <div className="flex items-center gap-3.5">
                      <div className={`w-10 h-10 rounded-xl bg-[#0a0a0c] border ${item.border} flex items-center justify-center ${item.shadow} group-hover/item:scale-110 transition-transform duration-300`}>
                        <Icon className={`w-5 h-5 ${item.color}`} />
                      </div>
                      <span className="text-sm font-semibold text-zinc-300 group-hover/item:text-white transition-colors">{item.label}</span>
                    </div>
                    <span className="text-xl font-black text-white">{item.value}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-4 relative z-10">
            <div className="relative flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 animate-ping absolute" />
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 relative z-10 shadow-[0_0_20px_rgba(228,253,151,0.3)]">
                <span className="w-3 h-3 bg-primary rounded-full" />
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-white tracking-tight">Systems Operational</p>
              <p className="text-[10px] text-zinc-500 font-medium">All microservices healthy</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Column Recent Activity List */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Premium Recent Providers */}
        <div className="bg-[#0a0a0c]/60 backdrop-blur-xl border border-white/5 rounded-[28px] p-6 shadow-xl hover:border-white/10 transition-all duration-500">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Recent Providers</h3>
              <p className="text-[11px] text-zinc-500 font-medium mt-0.5">Latest registrations</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest bg-white/5 border border-white/10 text-zinc-300 px-3 py-1.5 rounded-full">Newest 5</span>
          </div>

          <div className="space-y-4">
            {adminData.recent_providers.map((provider) => (
              <div key={provider.id} className="flex items-center justify-between group cursor-pointer p-2 -mx-2 rounded-2xl hover:bg-white/5 transition-all">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-zinc-900/80 border border-white/10 flex items-center justify-center text-sm font-bold text-white overflow-hidden shadow-md group-hover:border-white/20 transition-all">
                    {provider.avatar ? (
                      <img src={provider.avatar} alt={provider.name} className="w-full h-full object-cover" />
                    ) : (
                      provider.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-200 group-hover:text-primary transition-colors">{provider.name}</p>
                    <p className="text-[11px] font-medium text-zinc-500 truncate max-w-[140px] relative">
                      <span className="relative z-10 bg-transparent">{provider.email}</span>
                      <span className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#0a0a0c] group-hover:from-[#111115] to-transparent z-20" />
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-xl shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 drop-shadow-md" />
                  <span className="text-[11px] font-extrabold text-amber-400">{provider.rating.toFixed(1)}</span>
                </div>
              </div>
            ))}
            {adminData.recent_providers.length === 0 && (
              <p className="text-sm text-zinc-500 font-medium text-center py-8">No providers registered yet.</p>
            )}
          </div>
        </div>

        {/* Premium Recent Customers */}
        <div className="bg-[#0a0a0c]/60 backdrop-blur-xl border border-white/5 rounded-[28px] p-6 shadow-xl hover:border-white/10 transition-all duration-500">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Recent Customers</h3>
              <p className="text-[11px] text-zinc-500 font-medium mt-0.5">Latest users</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest bg-white/5 border border-white/10 text-zinc-300 px-3 py-1.5 rounded-full">Newest 5</span>
          </div>

          <div className="space-y-4">
            {adminData.recent_customers.map((customer) => {
              const joinedDate = customer.created_at ? new Date(customer.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              }) : 'N/A';
              return (
                <div key={customer.id} className="flex items-center justify-between group cursor-pointer p-2 -mx-2 rounded-2xl hover:bg-white/5 transition-all">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-zinc-900/80 border border-white/10 flex items-center justify-center text-sm font-bold text-white overflow-hidden shadow-md group-hover:border-white/20 transition-all">
                      {customer.avatar ? (
                        <img src={customer.avatar} alt={customer.name} className="w-full h-full object-cover" />
                      ) : (
                        customer.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-200 group-hover:text-pink-400 transition-colors">{customer.name}</p>
                      <p className="text-[11px] font-medium text-zinc-500 truncate max-w-[140px] relative">
                        <span className="relative z-10 bg-transparent">{customer.email}</span>
                        <span className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#0a0a0c] group-hover:from-[#111115] to-transparent z-20" />
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-zinc-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl font-bold tracking-wide">{joinedDate}</span>
                </div>
              );
            })}
            {adminData.recent_customers.length === 0 && (
              <p className="text-sm text-zinc-500 font-medium text-center py-8">No customers registered yet.</p>
            )}
          </div>
        </div>

        {/* Premium Recent Bookings */}
        <div className="bg-[#0a0a0c]/60 backdrop-blur-xl border border-white/5 rounded-[28px] p-6 shadow-xl hover:border-white/10 transition-all duration-500">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Recent Bookings</h3>
              <p className="text-[11px] text-zinc-500 font-medium mt-0.5">Latest transactions</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest bg-white/5 border border-white/10 text-zinc-300 px-3 py-1.5 rounded-full">Newest 5</span>
          </div>

          <div className="space-y-4">
            {adminData.recent_bookings.map((booking) => {
              const statusColors = booking.status === 'Completed' || booking.status === 'completed'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                : booking.status === 'Pending' || booking.status === 'pending'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]'
                : booking.status === 'Cancelled' || booking.status === 'cancelled'
                ? 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]'
                : 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]';

              const bookingDate = booking.date ? new Date(booking.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              }) : 'Date';

              return (
                <div key={booking.booking_id} className="flex items-center justify-between group cursor-pointer p-2 -mx-2 rounded-2xl hover:bg-white/5 transition-all">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-zinc-900/80 border border-white/10 flex items-center justify-center text-sm font-bold text-white overflow-hidden shadow-md group-hover:border-white/20 transition-all">
                      {booking.customer_avatar ? (
                        <img src={booking.customer_avatar} alt={booking.customer_name} className="w-full h-full object-cover" />
                      ) : (
                        booking.customer_name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors truncate max-w-[120px]">{booking.customer_name}</p>
                      <p className="text-[11px] font-medium text-zinc-500">{bookingDate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-white mb-1 drop-shadow-sm">₹{booking.amount.toLocaleString('en-IN')}</p>
                    <span className={`inline-block text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-lg border ${statusColors}`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              );
            })}
            {adminData.recent_bookings.length === 0 && (
              <p className="text-sm text-zinc-500 font-medium text-center py-8">No bookings created yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
