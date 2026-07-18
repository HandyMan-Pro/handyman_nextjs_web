import os

filepath = 'src/app/dashboard/bookings/page.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# 1. Page Header & Glows
old_header = """  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>"""
new_header = """  return (
    <div className="space-y-8 relative">
      {/* Background ambient glows */}
      <div className="fixed top-0 left-[20%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-[10%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">Bookings</h1>"""
content = content.replace(old_header, new_header)

# 2. View Mode Toggle
old_view = """            /* View Mode Toggle for Admin */
            <div className="flex bg-zinc-900 border border-zinc-800 p-0.75 rounded-xl">"""
new_view = """            /* View Mode Toggle for Admin */
            <div className="flex bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/10 p-1 rounded-xl shadow-lg">"""
content = content.replace(old_view, new_view)

# 3. List view / Calendar view buttons
content = content.replace("viewMode === 'list' ? 'bg-primary text-zinc-950' : 'text-zinc-400 hover:text-zinc-950'", "viewMode === 'list' ? 'bg-white/10 text-white shadow-sm' : 'text-zinc-500 hover:text-white'")
content = content.replace("viewMode === 'calendar' ? 'bg-primary text-zinc-950' : 'text-zinc-400 hover:text-zinc-950'", "viewMode === 'calendar' ? 'bg-white/10 text-white shadow-sm' : 'text-zinc-500 hover:text-white'")


# 4. Refresh Button
old_refresh = """          <button
            onClick={fetchBookingsAndPartners}
            className="flex items-center justify-center gap-2 h-10 px-4 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>"""
new_refresh = """          <button
            onClick={fetchBookingsAndPartners}
            className="group flex items-center justify-center gap-2.5 h-10 px-5 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white rounded-xl transition-all shadow-[0_0_20px_rgba(0,0,0,0.2)] active:scale-95 font-semibold"
          >
            <RefreshCw className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors animate-spin-hover" />
            Refresh
          </button>"""
content = content.replace(old_refresh, new_refresh)

# 5. Admin Search & Filter Bar
old_admin_search = """          {/* Search & Filter Bar */}
          <div className="flex flex-col xl:flex-row gap-4 border-b border-zinc-800/60 pb-6 items-stretch xl:items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search bookings by customer, service or handyman..."
                className="w-full h-11 pl-10 pr-4 bg-zinc-900/40 border border-zinc-850 rounded-xl text-sm text-zinc-300 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all"
              />
            </div>
            
            {/* Filter Tab Bar */}
            <div className="flex bg-zinc-950/60 border border-zinc-850 p-1 rounded-xl gap-1 overflow-x-auto w-full xl:w-auto scrollbar-none">"""
new_admin_search = """          {/* Search & Filter Bar */}
          <div className="flex flex-col xl:flex-row gap-4 pb-6 items-stretch xl:items-center justify-between relative z-10">
            <div className="relative flex-1 w-full group">
              <div className="absolute inset-0 bg-primary/20 blur-md rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-primary transition-colors z-10" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search bookings by customer, service or handyman..."
                className="relative z-10 w-full h-12 pl-11 pr-4 bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/10 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 transition-all shadow-lg"
              />
            </div>
            
            {/* Filter Tab Bar */}
            <div className="flex bg-[#0a0a0c]/60 backdrop-blur-xl border border-white/10 p-1.5 rounded-xl gap-1.5 overflow-x-auto w-full xl:w-auto scrollbar-none shadow-lg z-10">"""
content = content.replace(old_admin_search, new_admin_search)

# 6. Admin Filter Pills
old_filter_pill = """                      statusFilter === status
                        ? 'bg-primary text-zinc-950 shadow-lg shadow-primary/20'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'"""
new_filter_pill = """                      statusFilter === status
                        ? 'bg-primary/10 text-primary border border-primary/30 shadow-[0_0_15px_rgba(228,253,151,0.2)]'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'"""
content = content.replace(old_filter_pill, new_filter_pill)

# Make the pill button taller and uppercase
old_pill_button = "className={`flex items-center gap-1.5 h-8.5 px-4 rounded-lg text-xs font-semibold transition-all shrink-0 ${"
new_pill_button = "className={`flex items-center justify-center h-9 px-5 rounded-lg text-xs font-bold transition-all shrink-0 ${"
content = content.replace(old_pill_button, new_pill_button)


# 7. Admin Table Wrapper
old_table_wrapper = """          ) : (
            <div className="overflow-x-auto rounded-2xl border border-zinc-800/40 bg-zinc-900/20 backdrop-blur-md shadow-xl">
              <table className="w-full text-left border-collapse text-sm min-w-[900px]">
                <thead>
                  <tr className="bg-zinc-950/40 border-b border-zinc-800/80">"""
new_table_wrapper = """          ) : (
            <div className="overflow-x-auto rounded-[28px] border border-white/5 bg-[#0a0a0c]/60 backdrop-blur-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] relative z-10">
              <table className="w-full text-left border-collapse text-sm min-w-[900px]">
                <thead>
                  <tr className="border-b border-white/5">"""
content = content.replace(old_table_wrapper, new_table_wrapper)

# 8. Row hover effect
content = content.replace('<tr key={b.id} className="hover:bg-zinc-800/25 transition-colors group">', '<tr key={b.id} className="hover:bg-white/5 transition-colors group border-b border-white/5 last:border-0">')

# 9. Status override dropdown
old_select = "className={`h-8 px-2 bg-zinc-950/60 border rounded-lg text-xs font-semibold focus:outline-none transition-colors cursor-pointer ${getStatusStyle(b.status)}`}"
new_select = "className={`h-9 px-3 bg-[#0a0a0c]/90 border border-white/10 rounded-xl text-xs font-bold focus:outline-none focus:border-white/30 transition-all cursor-pointer shadow-lg ${getStatusStyle(b.status)}`}"
content = content.replace(old_select, new_select)


with open(filepath, 'w') as f:
    f.write(content)

print("UI upgraded successfully.")
