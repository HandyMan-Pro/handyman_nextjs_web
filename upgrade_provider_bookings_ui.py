import os

filepath = 'src/app/dashboard/bookings/page.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# 1. Provider Table Wrapper
old_provider_table = """          ) : (
            <div className="overflow-x-auto rounded-2xl border border-zinc-800/40 bg-zinc-900/20 backdrop-blur-md shadow-xl">
              <table className="w-full text-left border-collapse text-sm min-w-[900px]">
                <thead>
                  <tr className="bg-zinc-950/40 border-b border-zinc-800/80">"""
new_provider_table = """          ) : (
            <div className="overflow-x-auto rounded-[28px] border border-white/5 bg-[#0a0a0c]/60 backdrop-blur-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] relative z-10">
              <table className="w-full text-left border-collapse text-sm min-w-[900px]">
                <thead>
                  <tr className="border-b border-white/5">"""
content = content.replace(old_provider_table, new_provider_table)

with open(filepath, 'w') as f:
    f.write(content)
print("Provider UI upgraded successfully.")
