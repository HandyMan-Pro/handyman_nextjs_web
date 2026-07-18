import os

filepath = 'src/app/page.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# 1. Top bar
content = content.replace(
    'className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-zinc-350 text-xs py-2 px-4 md:px-12 flex justify-between items-center select-none font-medium relative z-30 border-b border-slate-800/80"',
    'className="bg-slate-100 dark:bg-gradient-to-r dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 text-slate-600 dark:text-zinc-400 text-xs py-2 px-4 md:px-12 flex justify-between items-center select-none font-medium relative z-30 border-b border-slate-200 dark:border-slate-800/80"'
)

# 2. Hero Background
content = content.replace(
    'className="relative py-12 md:py-24 px-4 md:px-12 overflow-hidden bg-[#0a0a0c] transition-colors duration-300"',
    'className="relative py-12 md:py-24 px-4 md:px-12 overflow-hidden bg-slate-50 dark:bg-[#0a0a0c] transition-colors duration-300"'
)

# 3. Hero Text
content = content.replace(
    'className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight drop-shadow-2xl"',
    'className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight drop-shadow-2xl"'
)
content = content.replace(
    'className="text-lg md:text-xl text-zinc-400 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed"',
    'className="text-lg md:text-xl text-slate-600 dark:text-zinc-400 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed"'
)

# 4. Search Box Container
content = content.replace(
    'className="bg-[#121217]/80 backdrop-blur-3xl border border-white/10 rounded-[32px] p-3 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] flex flex-col md:flex-row gap-3 max-w-2xl mx-auto lg:mx-0 transition-all duration-500 hover:shadow-[0_25px_50px_-12px_rgba(94,92,230,0.25)] focus-within:ring-2 focus-within:ring-[#5E5CE6]/30 focus-within:border-white/20 relative z-20 group"',
    'className="bg-white/80 dark:bg-[#121217]/80 backdrop-blur-3xl border border-slate-200/80 dark:border-white/10 rounded-[32px] p-3 shadow-2xl dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] flex flex-col md:flex-row gap-3 max-w-2xl mx-auto lg:mx-0 transition-all duration-500 hover:shadow-indigo-500/10 dark:hover:shadow-[0_25px_50px_-12px_rgba(94,92,230,0.25)] focus-within:ring-2 focus-within:ring-indigo-500/20 dark:focus-within:ring-[#5E5CE6]/30 focus-within:border-indigo-500/40 dark:focus-within:border-white/20 relative z-20 group"'
)

content = content.replace(
    'className="flex flex-col justify-center gap-1.5 px-4 py-2 flex-1 border-b md:border-b-0 md:border-r border-white/10 group/loc relative min-w-0 bg-white/5 rounded-2xl md:rounded-r-none md:bg-transparent"',
    'className="flex flex-col justify-center gap-1.5 px-4 py-2 flex-1 border-b md:border-b-0 md:border-r border-slate-200/80 dark:border-white/10 group/loc relative min-w-0 bg-slate-100/50 dark:bg-white/5 rounded-2xl md:rounded-r-none md:bg-transparent dark:md:bg-transparent"'
)

content = content.replace(
    'className="bg-transparent text-sm sm:text-base text-white outline-none w-full font-bold placeholder-zinc-500 pr-2"',
    'className="bg-transparent text-sm sm:text-base text-slate-800 dark:text-white outline-none w-full font-bold placeholder-slate-400 dark:placeholder-zinc-500 pr-2"'
)

content = content.replace(
    'className="bg-transparent text-sm sm:text-base text-white outline-none w-full font-bold placeholder-zinc-500"',
    'className="bg-transparent text-sm sm:text-base text-slate-800 dark:text-white outline-none w-full font-bold placeholder-slate-400 dark:placeholder-zinc-500"'
)

# 5. Tags
content = content.replace(
    'className="px-4 py-1.5 bg-white/5 hover:bg-[#5E5CE6]/20 hover:text-indigo-300 text-zinc-300 rounded-full transition-all border border-white/10 hover:border-[#5E5CE6]/50 shadow-sm backdrop-blur-md"',
    'className="px-4 py-1.5 bg-slate-100/50 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-[#5E5CE6]/20 hover:text-indigo-600 dark:hover:text-indigo-300 text-slate-600 dark:text-zinc-300 rounded-full transition-all border border-slate-200/50 dark:border-white/10 hover:border-indigo-300 dark:hover:border-[#5E5CE6]/50 shadow-sm backdrop-blur-md"'
)

# 6. Handyman Cards (3 of them)
old_card = 'w-[150px] md:w-[170px] bg-[#0a0a0c]/80 backdrop-blur-2xl border border-white/10 rounded-[32px] overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8)] z-10 transition-all duration-500 hover:scale-[1.08] hover:shadow-[0_30px_60px_-15px_rgba(94,92,230,0.3)] hover:z-20 hover:border-white/20'
new_card = 'w-[150px] md:w-[170px] bg-white/80 dark:bg-[#0a0a0c]/80 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 rounded-[32px] overflow-hidden shadow-2xl dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8)] z-10 transition-all duration-500 hover:scale-[1.08] hover:shadow-indigo-500/20 dark:hover:shadow-[0_30px_60px_-15px_rgba(94,92,230,0.3)] hover:z-20 hover:border-indigo-500/30 dark:hover:border-white/20'
content = content.replace(old_card, new_card)

# Card text area (3 of them)
old_card_text = 'className="p-4 text-center bg-gradient-to-t from-[#0a0a0c] to-[#0a0a0c]/80 text-white border-t border-white/5"'
new_card_text = 'className="p-4 text-center bg-white dark:bg-gradient-to-t dark:from-[#0a0a0c] dark:to-[#0a0a0c]/80 text-slate-900 dark:text-white border-t border-slate-100 dark:border-white/5"'
content = content.replace(old_card_text, new_card_text)

with open(filepath, 'w') as f:
    f.write(content)

print("Restored dark mode variants to the Hero section.")
