import re

filepath = 'src/app/page.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Replace the Category cards in src/app/page.tsx to match the ultra-premium ones
# and make them link to /categories/[name]

old_cards_section = """
              {displayCategories.map((cat: any) => (
                <div 
                  key={cat.id || cat.name}
                  onClick={() => { setSelectedCategoryFilter(cat.name); }}
                  className={`cursor-pointer p-6 rounded-3xl text-center border transition-all duration-300 ${
                    selectedCategoryFilter === cat.name
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-lg shadow-indigo-600/5'
                      : 'border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-850/30 hover:scale-[1.03] hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                    {cat.name.includes("AC") ? "❄️" : cat.name.includes("Plumb") ? "🪠" : cat.name.includes("Security") ? "🛡️" : "⚙️"}
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-white truncate">{cat.name}</h3>
                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{cat.description || "Browse all service listings"}</p>
                </div>
              ))}
"""

new_cards_section = """
              {displayCategories.map((cat: any) => (
                <div 
                  key={cat.id || cat.name}
                  onClick={() => { router.push(`/categories/${encodeURIComponent(cat.name)}`); }}
                  className="group cursor-pointer relative bg-white/50 dark:bg-white/5 backdrop-blur-3xl border border-slate-200/50 dark:border-white/10 rounded-3xl p-6 shadow-sm hover:shadow-2xl dark:hover:shadow-[0_20px_40px_-15px_rgba(94,92,230,0.3)] transition-all duration-500 hover:-translate-y-1 hover:border-indigo-500/30 dark:hover:border-white/20 text-center"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-500 shadow-inner border border-indigo-500/10">
                    {cat.name.includes("AC") ? <Wind className="w-6 h-6" /> : cat.name.includes("Clean") || cat.name.includes("Sanitiz") ? <Sparkles className="w-6 h-6" /> : cat.name.includes("Wire") || cat.name.includes("Electric") ? <Zap className="w-6 h-6" /> : cat.name.includes("Guard") || cat.name.includes("Secur") ? <Shield className="w-6 h-6" /> : <Wrench className="w-6 h-6" />}
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{cat.name}</h3>
                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{cat.description || "Browse all service listings"}</p>
                </div>
              ))}
"""

if old_cards_section.strip() in content:
    content = content.replace(old_cards_section.strip(), new_cards_section.strip())
else:
    print("Could not find the exact old cards section to replace.")

with open(filepath, 'w') as f:
    f.write(content)

print("Updated homepage category cards to premium.")
