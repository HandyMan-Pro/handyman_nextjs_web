import os

filepath = 'src/app/dashboard/admin/system/templates/page.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Fix the map undefined errors
content = content.replace(
    '{tpl.channels.map((ch) => (',
    '{(tpl.channels || []).map((ch) => ('
)
content = content.replace(
    '{tpl.variables.map((v) => (',
    '{(tpl.variables || []).map((v) => ('
)

# 1. Outer Layout & Header
content = content.replace(
    '<div className="p-6 space-y-6 bg-[#09090b] min-h-screen text-zinc-100">',
    '''<div className="p-6 space-y-8 relative min-h-screen text-zinc-100">
      {/* Background ambient glows */}
      <div className="fixed top-0 left-[20%] w-[600px] h-[600px] bg-[#5E5CE6]/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-[10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10" />'''
)

content = content.replace(
    '<h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">',
    '<h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 flex items-center gap-3">'
)

content = content.replace(
    '<ShieldCheck className="w-6 h-6 text-[#5E5CE6]" />',
    '<ShieldCheck className="w-8 h-8 text-[#5E5CE6]" />'
)

# 3. Main Glassmorphic Panel (Table)
content = content.replace(
    '<div className="bg-zinc-900/50 border border-zinc-800/60 backdrop-blur-md rounded-xl overflow-hidden">',
    '<div className="bg-[#0a0a0c]/60 border border-white/5 backdrop-blur-2xl rounded-[28px] overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] relative z-10">'
)

# 4. Table Header & Row
content = content.replace(
    '<tr className="bg-[#5E5CE6]/90 text-[11px] font-bold text-white uppercase tracking-wider">',
    '<tr className="bg-white/5 border-b border-white/5 text-white text-[11px] font-extrabold uppercase tracking-widest">'
)
content = content.replace(
    '<tr key={tpl.id} className="bg-[#18181b] border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">',
    '<tr key={tpl.id} className="hover:bg-white/5 transition-colors group border-b border-white/5 last:border-0 hover:shadow-lg">'
)

# 5. Empty State
content = content.replace(
    '<div className="p-12 text-center text-zinc-500 text-xs">',
    '<div className="p-16 text-center text-zinc-400 font-medium text-sm bg-[#0a0a0c]/40">'
)

with open(filepath, 'w') as f:
    f.write(content)

print("Templates UI upgraded successfully.")
