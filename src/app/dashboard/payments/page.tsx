'use client';

export default function ComingSoonPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 bg-zinc-900/40 rounded-2xl border border-zinc-800/60 shadow-xl">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
        <span className="text-2xl">🚀</span>
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-zinc-100 mb-2">Coming Soon</h1>
      <p className="text-zinc-500 text-sm max-w-sm">
        This feature is under active development. Stay tuned for upgrades!
      </p>
    </div>
  );
}
