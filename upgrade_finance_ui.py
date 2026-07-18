import os
import re

filepath = 'src/app/dashboard/finance/page.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# 1. Outer Layout & Header
content = content.replace(
    '<div className="space-y-6">',
    '''<div className="space-y-8 relative">
      {/* Background ambient glows */}
      <div className="fixed top-0 left-[20%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-[10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10" />'''
)

content = content.replace(
    '<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">',
    '<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">'
)

content = content.replace(
    '<h1 className="text-2xl font-bold tracking-tight">Finance Operations</h1>',
    '<h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">Finance Operations</h1>'
)

# 2. Refresh Button
old_refresh = 'className="flex items-center justify-center gap-2 h-10 px-4 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-all"'
new_refresh = 'className="group flex items-center justify-center gap-2.5 h-10 px-5 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white rounded-xl transition-all shadow-[0_0_20px_rgba(0,0,0,0.2)] active:scale-95 font-semibold"'
content = content.replace(old_refresh, new_refresh)

# 3. All Card containers
content = content.replace(
    'className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5 shadow-xl flex items-center justify-between"',
    'className="bg-[#0a0a0c]/60 backdrop-blur-xl border border-white/5 rounded-[24px] p-6 shadow-2xl flex items-center justify-between relative z-10 hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.8)]"'
)
content = content.replace(
    'className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5 shadow-xl space-y-4"',
    'className="bg-[#0a0a0c]/60 backdrop-blur-xl border border-white/5 rounded-[24px] p-6 shadow-2xl space-y-6 relative z-10"'
)

# 4. History list items
content = content.replace(
    'className="bg-zinc-800/30 border border-zinc-800/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3"',
    'className="group bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-all hover:-translate-y-0.5 shadow-sm"'
)

# 5. Form inputs
content = content.replace(
    'bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100',
    'bg-[#0a0a0c]/90 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-primary/50 shadow-inner'
)
content = content.replace(
    'bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-650',
    'bg-[#0a0a0c]/90 border border-white/10 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 shadow-inner'
)

# 6. Buttons
content = content.replace(
    'className="w-full h-11 bg-primary hover:bg-primary/95 text-zinc-950 font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-primary/20"',
    'className="group w-full h-12 bg-primary hover:bg-primary/90 text-zinc-950 font-extrabold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(228,253,151,0.3)] hover:shadow-[0_0_25px_rgba(228,253,151,0.5)] hover:-translate-y-0.5 active:scale-95"'
)

# 7. Table Container
content = content.replace(
    '<div className="bg-zinc-900/80 border border-zinc-800/60 rounded-2xl overflow-hidden shadow-xl">',
    '<div className="overflow-x-auto rounded-[28px] border border-white/5 bg-[#0a0a0c]/60 backdrop-blur-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] relative z-10">'
)

# 8. Table Header & Row
content = content.replace(
    '<tr className="border-b border-zinc-800/60 bg-zinc-900/40 text-left">',
    '<tr className="border-b border-white/5 text-left">'
)
content = content.replace(
    '<tr key={tx.id} className="border-b border-zinc-800/40 hover:bg-zinc-800/30 transition-colors last:border-0">',
    '<tr key={tx.id} className="hover:bg-white/5 transition-colors group border-b border-white/5 last:border-0">'
)

# 9. Search in table
content = content.replace(
    'className="w-full h-9 pl-9 pr-4 bg-zinc-900/60 border border-zinc-800/50 rounded-xl text-xs text-zinc-355 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all"',
    'className="relative z-10 w-full h-11 pl-10 pr-4 bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/10 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 transition-all shadow-lg"'
)

# 10. Stat Cards Title
content = content.replace('text-zinc-500 font-semibold', 'text-zinc-400 font-bold uppercase tracking-widest text-[10px]')
content = content.replace('text-xl font-bold text-zinc-100', 'text-2xl font-extrabold text-white tracking-tight')
content = content.replace('text-2xl font-bold text-zinc-100', 'text-3xl font-extrabold text-white tracking-tight')

# 11. Empty State
content = content.replace(
    '<div className="text-center py-10 bg-zinc-800/20 border border-zinc-800/60 rounded-xl">',
    '<div className="text-center py-12 bg-[#0a0a0c]/40 rounded-[20px] border border-white/5">'
)

with open(filepath, 'w') as f:
    f.write(content)

print("Finance UI upgraded successfully.")
