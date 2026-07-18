import os

filepath = 'src/app/dashboard/notifications/page.tsx'
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
    '<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">',
    '<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">'
)

content = content.replace(
    '<h1 className="text-2xl font-bold tracking-tight">Push Notifications</h1>',
    '<h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">Push Notifications</h1>'
)

# 2. Refresh Button
old_refresh = """        <button
          onClick={fetchNotificationLogs}
          className="flex items-center justify-center gap-2 h-10 px-4 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-all"
        >
          <RefreshCw className="w-4 h-4" />"""
new_refresh = """        <button
          onClick={fetchNotificationLogs}
          className="group flex items-center justify-center gap-2.5 h-10 px-5 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white rounded-xl transition-all shadow-[0_0_20px_rgba(0,0,0,0.2)] active:scale-95 font-semibold"
        >
          <RefreshCw className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors animate-spin-hover" />"""
content = content.replace(old_refresh, new_refresh)

# 3. Form Card
content = content.replace(
    '<div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5 shadow-xl space-y-4">',
    '<div className="bg-[#0a0a0c]/60 backdrop-blur-xl border border-white/5 rounded-[24px] p-6 shadow-2xl space-y-6 relative z-10">'
)

# 4. History Log Card
content = content.replace(
    '<div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5 shadow-xl lg:col-span-2 space-y-4">',
    '<div className="bg-[#0a0a0c]/60 backdrop-blur-xl border border-white/5 rounded-[24px] p-6 shadow-2xl lg:col-span-2 space-y-6 relative z-10">'
)

# 5. Inputs
content = content.replace(
    'bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary/50',
    'bg-[#0a0a0c]/90 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-primary/50 shadow-inner'
)
content = content.replace(
    'bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:ring-1 focus:ring-primary/50',
    'bg-[#0a0a0c]/90 border border-white/10 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 shadow-inner'
)

# 6. Form Button
old_btn = 'className="w-full h-11 bg-primary hover:bg-primary/95 text-zinc-950 font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-primary/20 hover:shadow-primary/35"'
new_btn = 'className="group w-full h-12 bg-primary hover:bg-primary/90 text-zinc-950 font-extrabold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(228,253,151,0.3)] hover:shadow-[0_0_25px_rgba(228,253,151,0.5)] hover:-translate-y-0.5 active:scale-95"'
content = content.replace(old_btn, new_btn)

# 7. History items
content = content.replace(
    '<div key={log.id} className="bg-zinc-800/30 border border-zinc-800/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3">',
    '<div key={log.id} className="group bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-all hover:-translate-y-0.5">'
)
content = content.replace(
    '<h4 className="font-bold text-sm text-zinc-200">{log.title}</h4>',
    '<h4 className="font-bold text-base text-white group-hover:text-primary transition-colors">{log.title}</h4>'
)

# 8. Empty History
old_empty = """            {logs.length === 0 && (
              <div className="text-center py-20">
                <MessageSquare className="w-10 h-10 text-zinc-650 mx-auto mb-2" />
                <p className="text-xs text-zinc-500">No push notification broadcasts sent yet.</p>
              </div>
            )}"""
new_empty = """            {logs.length === 0 && (
              <div className="text-center py-20 bg-[#0a0a0c]/40 rounded-[20px] border border-white/5">
                <MessageSquare className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white tracking-tight">No broadcasts sent yet</h3>
                <p className="text-sm text-zinc-500 mt-1">When you send push notifications, they will appear here.</p>
              </div>
            )}"""
content = content.replace(old_empty, new_empty)

with open(filepath, 'w') as f:
    f.write(content)

print("Notifications UI upgraded successfully.")
