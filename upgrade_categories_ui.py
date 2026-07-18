import os

filepath = 'src/app/dashboard/admin/category/page.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# 1. Outer Layout & Header
content = content.replace(
    '<div className="space-y-6 text-zinc-300">',
    '''<div className="space-y-8 relative">
      {/* Background ambient glows */}
      <div className="fixed top-0 left-[20%] w-[600px] h-[600px] bg-[#5E5CE6]/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-[10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />'''
)

content = content.replace(
    '<div className="flex items-center justify-between">',
    '<div className="flex items-center justify-between relative z-10">'
)

content = content.replace(
    '''<h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <FolderOpen className="w-5.5 h-5.5 text-[#5E5CE6]" />
            Categories Management
          </h1>''',
    '''<h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 flex items-center gap-2">
            <FolderOpen className="w-8 h-8 text-[#5E5CE6]" />
            Categories Management
          </h1>'''
)

# 2. Add Category Button
old_add_btn = 'className="h-9 px-4 bg-[#5E5CE6] hover:bg-[#5E5CE6]/90 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 text-xs shadow-md shadow-[#5E5CE6]/10"'
new_add_btn = 'className="group h-11 px-5 bg-[#5E5CE6] hover:bg-[#5E5CE6]/90 text-white font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(94,92,230,0.3)] hover:shadow-[0_0_25px_rgba(94,92,230,0.5)] hover:-translate-y-0.5 active:scale-95 text-sm"'
content = content.replace(old_add_btn, new_add_btn)

# 3. Search Bar
old_search = """      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-zinc-900/60 border border-zinc-800/80 p-3 rounded-xl">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8.5 pl-9 pr-4 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white placeholder:text-zinc-650 focus:outline-none focus:border-[#5E5CE6]/60 transition-colors"
          />
        </div>
        <div className="text-xs text-zinc-500 font-semibold">
          Found {filteredCategories.length} categories
        </div>
      </div>"""
new_search = """      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pb-4 relative z-10">
        <div className="relative w-full sm:max-w-sm group">
          <div className="absolute inset-0 bg-[#5E5CE6]/20 blur-md rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-[#5E5CE6] transition-colors z-10" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="relative z-10 w-full h-12 pl-11 pr-4 bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/10 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#5E5CE6]/50 transition-all shadow-lg"
          />
        </div>
        <div className="text-sm text-zinc-400 font-bold bg-[#0a0a0c]/60 backdrop-blur-xl px-4 py-2 border border-white/5 rounded-xl">
          Found <span className="text-white">{filteredCategories.length}</span> categories
        </div>
      </div>"""
content = content.replace(old_search, new_search)

# 4. Empty State
old_empty = """      ) : filteredCategories.length === 0 ? (
        <div className="border border-zinc-850 rounded-xl p-12 text-center bg-[#18181b] text-zinc-500 text-xs">
          No categories found. Click "Add Category" to create one.
        </div>"""
new_empty = """      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-16 bg-[#0a0a0c]/60 backdrop-blur-2xl border border-white/5 rounded-[28px] p-6 shadow-2xl relative z-10">
          <FolderOpen className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white tracking-tight">No Categories Found</h3>
          <p className="text-sm text-zinc-500 mt-1">Click "Add Category" to create one.</p>
        </div>"""
content = content.replace(old_empty, new_empty)

# 5. Grid Cards
old_card = 'className="border border-zinc-850 rounded-2xl bg-[#18181b] overflow-hidden flex flex-col justify-between hover:border-zinc-700/80 transition-all duration-300 shadow-md"'
new_card = 'className="group cursor-pointer bg-[#0a0a0c]/60 backdrop-blur-xl border border-white/5 hover:border-white/15 rounded-[24px] overflow-hidden shadow-xl hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.8)] hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between relative z-10"'
content = content.replace(old_card, new_card)

# Card image header
content = content.replace('bg-zinc-900 flex items-center justify-center border-b border-zinc-850', 'bg-zinc-950/80 flex items-center justify-center border-b border-white/5 relative group-hover:scale-[1.02] transition-transform duration-500')

# Card Title text
content = content.replace('text-sm font-bold text-white tracking-tight', 'text-base font-bold text-white tracking-tight group-hover:text-[#5E5CE6] transition-colors')

# 6. Action Footer
old_footer = 'className="p-4 border-t border-zinc-850 bg-zinc-900/40 flex items-center justify-between text-xs"'
new_footer = 'className="p-5 border-t border-white/5 bg-white/5 flex items-center justify-between text-xs backdrop-blur-md"'
content = content.replace(old_footer, new_footer)

# 7. Modal Base
old_modal = """          <div className="bg-[#1c1c1e] border border-zinc-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden text-zinc-300">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-850 bg-[#121214]">"""
new_modal = """          <div className="bg-[#0a0a0c]/90 backdrop-blur-3xl border border-white/10 rounded-[28px] max-w-md w-full shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden text-zinc-300 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-[#5E5CE6]/10 to-transparent pointer-events-none" />
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-white/5 relative z-10">"""
content = content.replace(old_modal, new_modal)

# Modal close btn
content = content.replace('w-7 h-7 rounded-full hover:bg-zinc-800', 'w-8 h-8 rounded-full hover:bg-white/10')
content = content.replace('text-sm font-bold text-white flex items-center gap-2', 'text-base font-extrabold text-white flex items-center gap-2')

# Modal inputs
old_input = 'className="w-full h-10 px-3 bg-[#2c2c2e] border border-zinc-800 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#5E5CE6]/60 transition-all"'
new_input = 'className="relative z-10 w-full h-12 px-4 bg-[#0a0a0c]/60 border border-white/10 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#5E5CE6]/60 transition-all shadow-inner"'
content = content.replace(old_input, new_input)

old_input2 = 'className="w-full h-10 pl-10 pr-3 bg-[#2c2c2e] border border-zinc-800 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none"'
new_input2 = 'className="relative z-10 w-full h-12 pl-11 pr-4 bg-[#0a0a0c]/60 border border-white/10 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#5E5CE6]/60 transition-all shadow-inner"'
content = content.replace(old_input2, new_input2)

old_textarea = 'className="w-full p-3 bg-[#2c2c2e] border border-zinc-800 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none resize-none"'
new_textarea = 'className="relative z-10 w-full p-4 bg-[#0a0a0c]/60 border border-white/10 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#5E5CE6]/60 transition-all shadow-inner resize-none"'
content = content.replace(old_textarea, new_textarea)

# Modal Form container padding
content = content.replace('<form onSubmit={handleSaveCategory} className="p-5 space-y-4">', '<form onSubmit={handleSaveCategory} className="p-6 space-y-5 relative z-10">')

with open(filepath, 'w') as f:
    f.write(content)

print("Categories UI upgraded successfully.")
