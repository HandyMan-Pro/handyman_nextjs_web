import os

filepath = 'src/app/dashboard/blogs/page.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# 1. Outer Layout & Header
content = content.replace(
    '<div className="space-y-6">',
    '''<div className="space-y-8 relative">
      {/* Background ambient glows */}
      <div className="fixed top-0 left-[20%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-[10%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />'''
)

content = content.replace(
    '<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">',
    '<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">'
)

content = content.replace(
    '''<h1 className="text-2xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary" />''',
    '''<h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 flex items-center gap-2">
            <MessageSquare className="w-8 h-8 text-primary" />'''
)

# 2. Create Post button
old_btn = 'className="h-11 px-5 bg-primary hover:bg-primary/95 text-zinc-950 dark:text-zinc-950 font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/10 hover:shadow-primary/20 shrink-0"'
new_btn = 'className="group h-11 px-5 bg-primary hover:bg-primary/90 text-zinc-950 font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(228,253,151,0.3)] hover:shadow-[0_0_25px_rgba(228,253,151,0.5)] hover:-translate-y-0.5 active:scale-95 shrink-0"'
content = content.replace(old_btn, new_btn)

# 3. Search Input
old_search = """        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-450 dark:text-zinc-500" />
          <input
            type="text"
            placeholder={t('Search Blogs')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-4 bg-white dark:bg-zinc-900/60 border border-zinc-250 dark:border-zinc-800/60 rounded-xl text-sm text-zinc-800 dark:text-zinc-300 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all"
          />
        </div>"""
new_search = """        <div className="relative w-full md:max-w-xs group z-10">
          <div className="absolute inset-0 bg-primary/20 blur-md rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-primary transition-colors z-10" />
          <input
            type="text"
            placeholder={t('Search Blogs')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="relative z-10 w-full h-12 pl-11 pr-4 bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/10 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 transition-all shadow-lg"
          />
        </div>"""
content = content.replace(old_search, new_search)

# 4. Filter Tags
content = content.replace(
    '<div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-thin">',
    '<div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-thin z-10">'
)

content = content.replace(
    '<span className="text-xs text-zinc-500 shrink-0 font-semibold uppercase tracking-wider">{t(\'Tags\')}:</span>',
    '<span className="text-xs text-zinc-500 shrink-0 font-bold uppercase tracking-widest">{t(\'Tags\')}:</span>'
)

old_pill_active = "selectedTag === null\n                ? 'bg-primary text-zinc-950'\n                : 'bg-zinc-200 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-800'"
new_pill_active = "selectedTag === null ? 'bg-primary/10 text-primary border-primary/30 shadow-[0_0_15px_rgba(228,253,151,0.2)]' : 'text-zinc-400 hover:text-white hover:bg-white/5 border-transparent'"
content = content.replace(old_pill_active, new_pill_active)

old_pill_btn = "className={`h-8 px-3 rounded-full text-xs font-semibold transition-all shrink-0 ${"
new_pill_btn = "className={`h-9 px-4 rounded-full text-xs font-bold transition-all shrink-0 border ${"
content = content.replace(old_pill_btn, new_pill_btn)

old_pill_map_active = "selectedTag === tag\n                  ? 'bg-primary text-zinc-950'\n                  : 'bg-zinc-200 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-800'"
new_pill_map_active = "selectedTag === tag ? 'bg-primary/10 text-primary border-primary/30 shadow-[0_0_15px_rgba(228,253,151,0.2)]' : 'text-zinc-400 hover:text-white hover:bg-white/5 border-transparent'"
content = content.replace(old_pill_map_active, new_pill_map_active)

# 5. Empty State
old_empty = """        <div className="text-center py-16 bg-white dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-850 rounded-2xl p-6">
          <MessageSquare className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-zinc-850 dark:text-zinc-300">No Posts Found</h3>"""
new_empty = """        <div className="text-center py-16 bg-[#0a0a0c]/60 backdrop-blur-2xl border border-white/5 rounded-[28px] p-6 shadow-2xl relative z-10">
          <MessageSquare className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white tracking-tight">No Posts Found</h3>"""
content = content.replace(old_empty, new_empty)

# 6. Blog Article Card
old_article = 'className="group cursor-pointer bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/60 hover:border-primary/40 dark:hover:border-primary/40 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"'
new_article = 'className="group cursor-pointer bg-[#0a0a0c]/60 backdrop-blur-xl border border-white/5 hover:border-white/15 rounded-[24px] overflow-hidden shadow-xl hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.8)] hover:-translate-y-1 transition-all duration-500 flex flex-col relative z-10"'
content = content.replace(old_article, new_article)

# Fix dark:text-zinc-300 overriding text-white inside article text parts
content = content.replace('text-zinc-850 dark:text-zinc-200', 'text-white')
content = content.replace('text-zinc-800 dark:text-zinc-200', 'text-zinc-200 group-hover:text-primary transition-colors')

with open(filepath, 'w') as f:
    f.write(content)
print("Blogs UI upgraded successfully.")
