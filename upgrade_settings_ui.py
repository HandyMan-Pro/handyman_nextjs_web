import os

filepath = 'src/app/dashboard/admin/system/settings/page.tsx'
with open(filepath, 'r') as f:
    content = f.read()

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

# 2. Form Container
content = content.replace(
    '<form onSubmit={handleSave} className="max-w-2xl bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-6 space-y-6 backdrop-blur-md">',
    '<form onSubmit={handleSave} className="max-w-2xl bg-[#0a0a0c]/60 border border-white/5 backdrop-blur-2xl rounded-[28px] p-8 space-y-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] relative z-10 hover:-translate-y-1 transition-all duration-300 hover:shadow-2xl">'
)

# 3. Inputs
old_input = 'bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5E5CE6] transition-colors'
new_input = 'bg-[#0a0a0c]/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#5E5CE6]/50 transition-all shadow-inner'
content = content.replace(old_input, new_input)

# 4. Save Button
old_btn = 'className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#5E5CE6] hover:bg-[#5E5CE6]/90 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-[#5E5CE6]/20"'
new_btn = 'className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-[#5E5CE6] hover:bg-[#5E5CE6]/90 disabled:opacity-50 text-white text-sm font-extrabold transition-all shadow-[0_0_20px_rgba(94,92,230,0.3)] hover:shadow-[0_0_25px_rgba(94,92,230,0.5)] hover:-translate-y-0.5 active:scale-95"'
content = content.replace(old_btn, new_btn)

# 5. Form Header
content = content.replace(
    '<h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">',
    '<h3 className="text-[13px] font-extrabold text-white uppercase tracking-widest flex items-center gap-2.5">'
)
content = content.replace(
    '<div className="border-b border-zinc-800 pb-3">',
    '<div className="border-b border-white/10 pb-5">'
)
content = content.replace(
    '<div className="border-t border-zinc-800 pt-4 flex justify-end">',
    '<div className="border-t border-white/10 pt-6 flex justify-end">'
)

with open(filepath, 'w') as f:
    f.write(content)

print("Settings UI upgraded successfully.")
