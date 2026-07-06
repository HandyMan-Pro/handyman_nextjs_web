'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../lib/apiClient';
import { getUserData } from '../../lib/auth';
import {
  Users, Briefcase, Hammer, CalendarCheck, DollarSign,
  TrendingUp, ArrowUpRight, ArrowDownRight, Wrench,
  Clock, CheckCircle2, XCircle, AlertCircle, RefreshCw,
  IndianRupee, Clipboard, AlertTriangle
} from 'lucide-react';

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
    total_handymen: number;
    monthly_earnings: number;
  };
  chart_data: { month: string; revenue: number }[];
  subscription: {
    days_left: number;
    is_expiring_soon: boolean;
  };
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
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.map(d => d.revenue), 100);
  const yTicksCount = 4;
  const roundedMax = Math.ceil(maxVal / 100) * 100;
  const height = 220;
  const width = 500;
  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const points = data.map((d, index) => {
    const x = paddingLeft + (index / (data.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - (d.revenue / roundedMax) * chartHeight;
    return { x, y, month: d.month, revenue: d.revenue };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`
    : '';

  return (
    <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6 relative shadow-xl overflow-hidden group">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-50" />
      <h3 className="text-sm font-semibold mb-4 text-zinc-300 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-indigo-400" />
        Monthly Revenue Trend
      </h3>
      <div className="w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(99, 102, 241)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="rgb(99, 102, 241)" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          {/* Grid Lines */}
          {[...Array(yTicksCount + 1)].map((_, i) => {
            const yVal = paddingTop + (i / yTicksCount) * chartHeight;
            const tickValue = Math.round(roundedMax - (i / yTicksCount) * roundedMax);
            return (
              <g key={i}>
                <line
                  x1={paddingLeft}
                  y1={yVal}
                  x2={width - paddingRight}
                  y2={yVal}
                  stroke="rgb(39, 39, 42)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 10}
                  y={yVal + 4}
                  fill="rgb(113, 113, 122)"
                  fontSize="10"
                  textAnchor="end"
                >
                  ₹{tickValue}
                </text>
              </g>
            );
          })}

          {/* Area under the line */}
          {areaPath && <path d={areaPath} fill="url(#areaGradient)" />}

          {/* Line */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="rgb(99, 102, 241)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Chart Dots & Hover Interaction */}
          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r={activeIdx === i ? 6 : 4}
                fill="rgb(99, 102, 241)"
                stroke="rgb(24, 24, 27)"
                strokeWidth="2"
                className="transition-all cursor-pointer"
                onMouseEnter={() => setActiveIdx(i)}
                onMouseLeave={() => setActiveIdx(null)}
              />
              {/* X Axis Labels */}
              <text
                x={p.x}
                y={height - 10}
                fill="rgb(113, 113, 122)"
                fontSize="10"
                textAnchor="middle"
              >
                {p.month}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Hover Tooltip display */}
      {activeIdx !== null && points[activeIdx] && (
        <div className="absolute top-16 right-6 bg-zinc-950/90 border border-zinc-800 px-3.5 py-2 rounded-xl shadow-xl backdrop-blur-md animate-fade-in text-xs">
          <p className="text-zinc-500 font-medium">{points[activeIdx].month}</p>
          <p className="text-white font-semibold mt-0.5">Revenue: ₹{points[activeIdx].revenue.toLocaleString('en-IN')}</p>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [providerData, setProviderData] = useState<ProviderDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [role, setRole] = useState<'admin' | 'provider' | 'handyman' | 'user' | null>(null);
  const [user, setUser] = useState<any>(null);

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
      } else {
        const response = await apiClient.get('/admin/stats');
        setStats(response.data);
      }
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
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
    const { metrics, chart_data, subscription } = providerData;
    
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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            {
              label: 'Total Bookings',
              value: metrics.total_bookings,
              icon: Clipboard,
              gradient: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-400',
            },
            {
              label: 'Active Services',
              value: metrics.total_services,
              icon: Wrench,
              gradient: 'from-violet-500/20 to-purple-500/20 border-violet-500/30 text-purple-400',
            },
            {
              label: 'Total Handymen',
              value: metrics.total_handymen,
              icon: Users,
              gradient: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400',
            },
            {
              label: 'Monthly Earnings',
              value: `₹${(metrics.monthly_earnings || 0).toLocaleString('en-IN')}`,
              icon: IndianRupee,
              gradient: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400',
            },
          ].map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className={`relative bg-zinc-900/60 backdrop-blur-md border border-zinc-800/40 rounded-2xl p-5 hover:border-zinc-700/60 transition-all duration-300 shadow-md group animate-fade-in-up`}
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-zinc-900 border flex items-center justify-center shadow-inner ${card.gradient}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                    <ArrowUpRight className="w-3 h-3" />
                    <span>+8%</span>
                  </div>
                </div>
                <p className="text-2xl font-bold tracking-tight text-white">{card.value}</p>
                <p className="text-zinc-400 text-xs mt-1 font-medium">{card.label}</p>
              </div>
            );
          })}
        </div>

        {/* Revenue Line Chart */}
        <ProviderRevenueChart data={chart_data} />
      </div>
    );
  }

  // --- RENDER ADMIN HOME (Default Fallback) ---
  if (!stats) return null;
  const { summary } = stats;

  const statCards = [
    {
      label: 'Total Customers',
      value: summary.total_customers,
      icon: Users,
      gradient: 'from-blue-500 to-cyan-500',
      shadowColor: 'shadow-blue-500/10',
    },
    {
      label: 'Service Providers',
      value: summary.total_providers,
      icon: Briefcase,
      gradient: 'from-violet-500 to-purple-500',
      shadowColor: 'shadow-violet-500/10',
    },
    {
      label: 'Active Handymen',
      value: summary.active_handymen,
      icon: Hammer,
      gradient: 'from-amber-500 to-orange-500',
      shadowColor: 'shadow-amber-500/10',
    },
    {
      label: 'Platform Earnings',
      value: `₹${summary.platform_earnings.toLocaleString('en-IN')}`,
      subtext: `${summary.commission_rate}% of ₹${summary.total_revenue.toLocaleString('en-IN')}`,
      icon: IndianRupee,
      gradient: 'from-emerald-500 to-teal-500',
      shadowColor: 'shadow-emerald-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Welcome back! Here&apos;s what&apos;s happening today.</p>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-3.5 py-2 bg-zinc-900/80 border border-zinc-800/60 rounded-xl text-sm text-zinc-400 hover:text-white hover:border-zinc-700 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
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
              <p className="text-zinc-500 text-xs mt-1">{card.label}</p>
              {card.subtext && (
                <p className="text-zinc-600 text-[10px] mt-0.5">{card.subtext}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Bookings', value: summary.total_bookings, icon: CalendarCheck },
          { label: 'Total Revenue', value: `₹${summary.total_revenue.toLocaleString('en-IN')}`, icon: DollarSign },
          { label: 'Active Services', value: summary.total_services, icon: Wrench },
          { label: 'Total Partners', value: summary.total_partners, icon: Users },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="bg-zinc-900/50 border border-zinc-800/40 rounded-xl p-4 animate-fade-in-up"
              style={{ animationDelay: `${(idx + 4) * 60}ms` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-[11px] text-zinc-500">{item.label}</span>
              </div>
              <p className="text-lg font-semibold text-white">{item.value}</p>
            </div>
          );
        })}
      </div>

      {/* Booking Status Distribution + Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Booking Status Distribution */}
        <div className="bg-zinc-900/80 border border-zinc-800/50 rounded-2xl p-5 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <h3 className="text-sm font-semibold mb-4 text-white flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-indigo-400" />
            Booking Status
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.status_distribution).map(([statusName, count]) => {
              const config = STATUS_CONFIG[statusName] || STATUS_CONFIG['Pending'];
              const Icon = config.icon;
              const total = summary.total_bookings || 1;
              const percentage = Math.round((count / total) * 100);
              return (
                <div key={statusName} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                      <span className="text-xs text-zinc-400">{statusName}</span>
                    </div>
                    <span className="text-xs font-medium text-white">{count}</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        statusName === 'Completed' ? 'bg-emerald-500' :
                        statusName === 'Ongoing' ? 'bg-blue-500' :
                        statusName === 'Pending' ? 'bg-amber-500' :
                        statusName === 'Cancelled' ? 'bg-red-500' : 'bg-zinc-600'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Bookings Table */}
        <div className="lg:col-span-2 bg-zinc-900/80 border border-zinc-800/50 rounded-2xl p-5 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-indigo-400" />
              Recent Bookings
            </h3>
            <span className="text-[11px] text-zinc-500">Last {stats.recent_bookings.length} bookings</span>
          </div>

          <div className="overflow-x-auto -mx-5">
            <table className="w-full min-w-[580px]">
              <thead>
                <tr className="border-b border-zinc-800/60">
                  <th className="text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wider px-5 pb-3">Customer</th>
                  <th className="text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wider px-3 pb-3">Service</th>
                  <th className="text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wider px-3 pb-3">Provider</th>
                  <th className="text-right text-[11px] font-medium text-zinc-500 uppercase tracking-wider px-3 pb-3">Amount</th>
                  <th className="text-center text-[11px] font-medium text-zinc-500 uppercase tracking-wider px-5 pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {stats.recent_bookings.map((booking, idx) => {
                  const config = STATUS_CONFIG[booking.status] || STATUS_CONFIG['Pending'];
                  return (
                    <tr key={booking.id || idx} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-5 py-3">
                        <p className="text-sm font-medium text-white">{booking.customer_name || '—'}</p>
                        <p className="text-[11px] text-zinc-500">{booking.date || ''}</p>
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-sm text-zinc-300">{booking.service_name || '—'}</p>
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-sm text-zinc-400">{booking.handyman_name || '—'}</p>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <p className="text-sm font-medium text-white">₹{(booking.amount || 0).toLocaleString('en-IN')}</p>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${config.bgColor} ${config.color}`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {stats.recent_bookings.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-sm text-zinc-500 py-10">
                      No bookings yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-zinc-900/80 border border-zinc-800/50 rounded-2xl p-5 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
        <h3 className="text-sm font-semibold mb-4 text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-400" />
          Recent Transactions
        </h3>
        <div className="overflow-x-auto -mx-5">
          <table className="w-full min-w-[520px]">
            <thead>
              <tr className="border-b border-zinc-800/60">
                <th className="text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wider px-5 pb-3">Customer</th>
                <th className="text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wider px-3 pb-3">Type</th>
                <th className="text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wider px-3 pb-3">Method</th>
                <th className="text-right text-[11px] font-medium text-zinc-500 uppercase tracking-wider px-3 pb-3">Amount</th>
                <th className="text-center text-[11px] font-medium text-zinc-500 uppercase tracking-wider px-5 pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {stats.recent_transactions.map((tx, idx) => (
                <tr key={tx.id || idx} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-white">{tx.customer_name || '—'}</td>
                  <td className="px-3 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${tx.type === 'Payment' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-sm text-zinc-400">{tx.payment_method || 'UPI'}</td>
                  <td className="px-3 py-3 text-right text-sm font-medium text-white">₹{(tx.amount || 0).toLocaleString('en-IN')}</td>
                  <td className="px-5 py-3 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
              {stats.recent_transactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-sm text-zinc-500 py-10">
                    No transactions yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
