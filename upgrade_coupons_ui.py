import os

filepath = 'src/app/dashboard/admin/promotions/coupons/list/page.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# 1. Outer Layout & Header
content = content.replace(
    '<div className="space-y-6 text-zinc-300">',
    '''<div className="space-y-8 relative text-zinc-300">
      {/* Background ambient glows */}
      <div className="fixed top-0 left-[20%] w-[600px] h-[600px] bg-[#5E5CE6]/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-[10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10" />'''
)

content = content.replace(
    '<h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">',
    '<h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 flex items-center gap-3">'
)

content = content.replace(
    'className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#5E5CE6] hover:bg-[#5E5CE6]/90 text-white font-bold text-xs transition-colors"',
    'className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5E5CE6] hover:bg-[#5E5CE6]/90 text-white font-extrabold text-sm transition-all shadow-[0_0_20px_rgba(94,92,230,0.3)] hover:shadow-[0_0_25px_rgba(94,92,230,0.5)] hover:-translate-y-0.5 active:scale-95"'
)

# 2. Search Box
content = content.replace(
    'className="p-3 bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-md rounded-xl flex items-center gap-3"',
    'className="p-4 bg-[#0a0a0c]/60 backdrop-blur-xl border border-white/5 rounded-2xl flex items-center gap-3 shadow-lg relative z-10"'
)
content = content.replace(
    'className="w-full bg-zinc-950/60 border border-zinc-800/60 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#5E5CE6] transition-colors"',
    'className="w-full bg-[#0a0a0c]/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#5E5CE6]/50 transition-all shadow-inner"'
)

# 3. Main Glassmorphic Panel (Table)
content = content.replace(
    'className="bg-zinc-900/50 border border-zinc-800/60 backdrop-blur-md rounded-xl overflow-hidden"',
    'className="bg-[#0a0a0c]/60 border border-white/5 backdrop-blur-2xl rounded-[28px] overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] relative z-10"'
)

# 4. Table Header & Row
content = content.replace(
    'className="bg-[#5E5CE6]/90 text-white text-[11px] font-extrabold uppercase tracking-wider"',
    'className="bg-white/5 border-b border-white/5 text-white text-[11px] font-extrabold uppercase tracking-widest"'
)
content = content.replace(
    'className="hover:bg-zinc-850/20 transition-colors"',
    'className="hover:bg-white/5 transition-colors group border-b border-white/5 last:border-0 hover:shadow-lg"'
)

# 5. Empty State
content = content.replace(
    'className="p-12 text-center text-zinc-500 text-xs"',
    'className="p-16 text-center text-zinc-400 font-medium text-sm bg-[#0a0a0c]/40"'
)

with open(filepath, 'w') as f:
    f.write(content)

print("Coupons UI upgraded successfully.")
