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
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-400 text-sm">Loading admin dashboard analytics...</p>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Services',
      value: adminData.metrics.total_services,
      icon: Wrench,
      gradient: 'from-blue-500 to-indigo-500',
      shadowColor: 'shadow-blue-500/10',
      subtext: 'Active catalog items',
    },
    {
      label: 'Total Tax Collected',
      value: `₹${adminData.metrics.total_tax.toLocaleString('en-IN')}`,
      icon: Percent,
      gradient: 'from-violet-500 to-purple-500',
      shadowColor: 'shadow-violet-500/10',
      subtext: '5% fallback or actual calculations',
    },
    {
      label: 'My Earning (Admin)',
      value: `₹${adminData.metrics.admin_earning.toLocaleString('en-IN')}`,
      icon: Shield,
      gradient: 'from-emerald-500 to-teal-500',
      shadowColor: 'shadow-emerald-500/10',
      subtext: 'Commission share from transactions',
    },
    {
      label: 'Total Revenue',
      value: `₹${adminData.metrics.total_revenue.toLocaleString('en-IN')}`,
      icon: IndianRupee,
      gradient: 'from-amber-500 to-orange-500',
      shadowColor: 'shadow-amber-500/10',
      subtext: 'Gross platform booking volume',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Super Admin Overview</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Welcome back, Super Admin! Real-time financial calculations and metrics.</p>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-3.5 py-2 bg-zinc-900/80 border border-zinc-800/60 rounded-xl text-sm text-zinc-400 hover:text-white hover:border-zinc-700 transition-all shadow-md"
        >
          <RefreshCw className="w-3.5 h-3.5 animate-spin-hover" />
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`group relative bg-zinc-900/80 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-5 hover:border-zinc-700/60 transition-all duration-300 shadow-lg ${card.shadowColor} animate-fade-in-up`}
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-md`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
                  <ArrowUpRight className="w-3 h-3" />
                  <span>+12%</span>
                </div>
              </div>
              <p className="text-2xl font-bold tracking-tight text-white">{card.value}</p>
              <p className="text-zinc-400 text-xs font-medium mt-1">{card.label}</p>
              {card.subtext && (
                <p className="text-zinc-600 text-[10px] mt-0.5">{card.subtext}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Area Chart + Platform Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Area Chart */}
        <div className="lg:col-span-2 bg-zinc-900/80 border border-zinc-800/50 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Revenue Analytics</h3>
              <p className="text-zinc-500 text-xs mt-0.5">Gross platform revenue over the past 12 months</p>
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping" />
              <span className="text-[10px] text-indigo-400 font-medium">Completed Bookings</span>
            </div>
          </div>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={adminData.monthly_revenue_chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="adminRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="month" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                  labelStyle={{ color: '#a1a1aa', fontWeight: 'bold' }}
                  itemStyle={{ color: '#ffffff' }}
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#adminRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Status Panel */}
        <div className="bg-zinc-900/80 border border-zinc-800/50 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight mb-1">Platform Summary</h3>
            <p className="text-zinc-500 text-xs mb-6">Overview of registered entities and total activity.</p>
            
            <div className="space-y-4">
              {[
                { label: 'Total Bookings placed', value: adminData.total_bookings_count, icon: CalendarCheck, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
                { label: 'Registered Providers', value: adminData.total_providers_count, icon: Briefcase, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                { label: 'Registered Customers', value: adminData.total_customers_count, icon: Users, color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center justify-between p-3.5 bg-zinc-900/40 border border-zinc-800/40 rounded-xl hover:border-zinc-800 transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg ${item.bg} border flex items-center justify-center`}>
                        <Icon className={`w-4.5 h-4.5 ${item.color}`} />
                      </div>
                      <span className="text-xs text-zinc-400">{item.label}</span>
                    </div>
                    <span className="text-base font-bold text-white">{item.value}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-zinc-800/60 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-white">Platform Health Normal</p>
              <p className="text-[9px] text-zinc-500">All services operational</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Column Recent Activity List */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Providers */}
        <div className="bg-zinc-900/80 border border-zinc-800/50 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800/60">
            <div>
              <h3 className="text-sm font-semibold text-white">Recent Providers</h3>
              <p className="text-[10px] text-zinc-500">Latest provider registrations</p>
            </div>
            <span className="text-[10px] font-semibold bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">Newest 5</span>
          </div>

          <div className="space-y-3.5">
            {adminData.recent_providers.map((provider) => (
              <div key={provider.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-sm font-bold text-white overflow-hidden shadow-inner">
                    {provider.avatar ? (
                      <img src={provider.avatar} alt={provider.name} className="w-full h-full object-cover" />
                    ) : (
                      provider.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white group-hover:text-indigo-400 transition-colors">{provider.name}</p>
                    <p className="text-[10px] text-zinc-500 truncate max-w-[140px]">{provider.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-[10px] font-bold text-amber-400">{provider.rating.toFixed(1)}</span>
                </div>
              </div>
            ))}
            {adminData.recent_providers.length === 0 && (
              <p className="text-xs text-zinc-500 text-center py-6">No providers registered yet.</p>
            )}
          </div>
        </div>

        {/* Recent Customers */}
        <div className="bg-zinc-900/80 border border-zinc-800/50 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800/60">
            <div>
              <h3 className="text-sm font-semibold text-white">Recent Customers</h3>
              <p className="text-[10px] text-zinc-500">Latest user registrations</p>
            </div>
            <span className="text-[10px] font-semibold bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">Newest 5</span>
          </div>

          <div className="space-y-3.5">
            {adminData.recent_customers.map((customer) => {
              const joinedDate = customer.created_at ? new Date(customer.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              }) : 'N/A';
              return (
                <div key={customer.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-sm font-bold text-white overflow-hidden shadow-inner">
                      {customer.avatar ? (
                        <img src={customer.avatar} alt={customer.name} className="w-full h-full object-cover" />
                      ) : (
                        customer.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white group-hover:text-pink-400 transition-colors">{customer.name}</p>
                      <p className="text-[10px] text-zinc-500 truncate max-w-[140px]">{customer.email}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-zinc-500 bg-zinc-900/50 border border-zinc-800/40 px-2.5 py-1 rounded-lg font-medium">{joinedDate}</span>
                </div>
              );
            })}
            {adminData.recent_customers.length === 0 && (
              <p className="text-xs text-zinc-500 text-center py-6">No customers registered yet.</p>
            )}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-zinc-900/80 border border-zinc-800/50 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800/60">
            <div>
              <h3 className="text-sm font-semibold text-white">Recent Bookings</h3>
              <p className="text-[10px] text-zinc-500">Latest platform transactions</p>
            </div>
            <span className="text-[10px] font-semibold bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">Newest 5</span>
          </div>

          <div className="space-y-3.5">
            {adminData.recent_bookings.map((booking) => {
              const statusColors = booking.status === 'Completed' || booking.status === 'completed'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : booking.status === 'Pending' || booking.status === 'pending'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                : booking.status === 'Cancelled' || booking.status === 'cancelled'
                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                : 'bg-blue-500/10 text-blue-400 border-blue-500/20';

              const bookingDate = booking.date ? new Date(booking.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              }) : 'Date';

              return (
                <div key={booking.booking_id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-sm font-bold text-white overflow-hidden shadow-inner">
                      {booking.customer_avatar ? (
                        <img src={booking.customer_avatar} alt={booking.customer_name} className="w-full h-full object-cover" />
                      ) : (
                        booking.customer_name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors truncate max-w-[120px]">{booking.customer_name}</p>
                      <p className="text-[10px] text-zinc-500">{bookingDate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-white">₹{booking.amount.toLocaleString('en-IN')}</p>
                    <span className={`inline-block text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${statusColors}`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              );
            })}
            {adminData.recent_bookings.length === 0 && (
              <p className="text-xs text-zinc-500 text-center py-6">No bookings created yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
