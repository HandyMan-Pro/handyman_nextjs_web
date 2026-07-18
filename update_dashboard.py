import os

filepath = 'src/app/dashboard/page.tsx'
with open(filepath, 'r') as f:
    content = f.read()

split_marker = '  // --- RENDER ADMIN HOME (Super Admin) ---'
parts = content.split(split_marker)

if len(parts) == 2:
    new_admin_code = """  // --- RENDER ADMIN HOME (Super Admin) ---
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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0a0a0c]/95 backdrop-blur-2xl border border-white/10 p-4 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)]">
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1.5">{label}</p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-primary rounded-full shadow-[0_0_8px_rgba(228,253,151,0.6)]" />
            <p className="text-white text-xl font-bold tracking-tight">
              ₹{Number(payload[0].value).toLocaleString('en-IN')}
            </p>
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
              <AreaChart data={adminData.monthly_revenue_chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="premiumRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E4FD97" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#E4FD97" stopOpacity={0.0} />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.05} vertical={false} />
                <XAxis dataKey="month" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} dx={-10} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E4FD97', strokeWidth: 1, strokeDasharray: '4 4', opacity: 0.5 }} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#E4FD97" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#premiumRevenue)" 
                  style={{ filter: 'url(#glow)' }}
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
"""
    final_content = parts[0] + new_admin_code
    with open(filepath, 'w') as f:
        f.write(final_content)
    print('Updated admin dashboard UI!')
else:
    print('Error: Could not find split marker')
