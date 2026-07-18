import os

filepath = 'src/app/page.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# 1. Background
content = content.replace(
    '<section id="home" className="relative py-12 md:py-20 px-4 md:px-12 overflow-hidden bg-slate-100/50 dark:bg-zinc-950 transition-colors duration-300">',
    '<section id="home" className="relative py-12 md:py-24 px-4 md:px-12 overflow-hidden bg-[#0a0a0c] transition-colors duration-300">\n          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#5E5CE615,transparent_50%)] pointer-events-none"></div>'
)
content = content.replace(
    '<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>',
    '<div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>'
)
content = content.replace(
    '<div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>',
    '<div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen"></div>'
)

# 2. Hero Text
content = content.replace(
    '<h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-800 dark:text-white leading-[1.1] tracking-tight">',
    '<h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight drop-shadow-2xl">'
)
content = content.replace(
    '<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-500 dark:from-indigo-400 dark:to-purple-400">Perfect Handyman</span>',
    '<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-[#5E5CE6] to-purple-400 relative inline-block"><span className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 blur-2xl opacity-20 -z-10"></span>Perfect Handyman</span>'
)
content = content.replace(
    '<p className="text-base md:text-lg text-slate-600 dark:text-zinc-400 max-w-xl mx-auto lg:mx-0 font-medium">',
    '<p className="text-lg md:text-xl text-zinc-400 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">'
)

# 3. Search Box Container
content = content.replace(
    '<div className="bg-white/85 dark:bg-zinc-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-850 rounded-[28px] p-2 md:p-2.5 shadow-2xl shadow-indigo-500/5 dark:shadow-black/60 flex flex-col md:flex-row gap-2 max-w-2xl mx-auto lg:mx-0 transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500/40">',
    '<div className="bg-[#121217]/80 backdrop-blur-3xl border border-white/10 rounded-[32px] p-3 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] flex flex-col md:flex-row gap-3 max-w-2xl mx-auto lg:mx-0 transition-all duration-500 hover:shadow-[0_25px_50px_-12px_rgba(94,92,230,0.25)] focus-within:ring-2 focus-within:ring-[#5E5CE6]/30 focus-within:border-white/20 relative z-20 group">'
)
content = content.replace(
    'className="flex flex-col justify-center gap-1.5 px-2.5 py-1.5 flex-1 border-b md:border-b-0 md:border-r border-slate-200/60 dark:border-zinc-800/60 group/loc relative min-w-0"',
    'className="flex flex-col justify-center gap-1.5 px-4 py-2 flex-1 border-b md:border-b-0 md:border-r border-white/10 group/loc relative min-w-0 bg-white/5 rounded-2xl md:rounded-r-none md:bg-transparent"'
)

# Search Input Text
content = content.replace(
    'className="bg-transparent text-xs sm:text-sm text-slate-800 dark:text-zinc-100 outline-none w-full font-bold placeholder-slate-400 dark:placeholder-zinc-600 pr-2"',
    'className="bg-transparent text-sm sm:text-base text-white outline-none w-full font-bold placeholder-zinc-500 pr-2"'
)
content = content.replace(
    'className="bg-transparent text-sm text-slate-800 dark:text-zinc-100 outline-none w-full font-bold placeholder-slate-400 dark:placeholder-zinc-650"',
    'className="bg-transparent text-sm sm:text-base text-white outline-none w-full font-bold placeholder-zinc-500"'
)

# Search Button
content = content.replace(
    'className="bg-gradient-to-r from-indigo-600 to-purple-650 hover:from-indigo-500 hover:to-purple-550 text-white font-extrabold text-sm px-7 py-3.5 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-indigo-600/15 cursor-pointer shrink-0"',
    'className="bg-gradient-to-r from-[#5E5CE6] to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-base px-8 py-4 rounded-[20px] hover:-translate-y-1 active:scale-95 transition-all shadow-[0_0_20px_rgba(94,92,230,0.4)] hover:shadow-[0_10px_30px_rgba(94,92,230,0.6)] cursor-pointer shrink-0"'
)

# Tags
content = content.replace(
    'className="px-3.5 py-1.5 bg-slate-200/50 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-all border border-slate-300/30 dark:border-zinc-700/50"',
    'className="px-4 py-1.5 bg-white/5 hover:bg-[#5E5CE6]/20 hover:text-indigo-300 text-zinc-300 rounded-full transition-all border border-white/10 hover:border-[#5E5CE6]/50 shadow-sm backdrop-blur-md"'
)

# 4. Handyman Cards
old_card = 'w-[150px] md:w-[170px] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[28px] overflow-hidden shadow-2xl z-10 transition-transform duration-500 hover:scale-[1.05] hover:z-20'
new_card = 'w-[150px] md:w-[170px] bg-[#0a0a0c]/80 backdrop-blur-2xl border border-white/10 rounded-[32px] overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8)] z-10 transition-all duration-500 hover:scale-[1.08] hover:shadow-[0_30px_60px_-15px_rgba(94,92,230,0.3)] hover:z-20 hover:border-white/20'
content = content.replace(old_card, new_card)

# Card Text Area
content = content.replace(
    'className="p-3 text-center bg-zinc-950 dark:bg-zinc-900 text-white border-t border-zinc-900"',
    'className="p-4 text-center bg-gradient-to-t from-[#0a0a0c] to-[#0a0a0c]/80 text-white border-t border-white/5"'
)

# Save
with open(filepath, 'w') as f:
    f.write(content)

print("Hero UI upgraded successfully.")
