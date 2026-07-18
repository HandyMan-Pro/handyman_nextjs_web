import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-100 p-6">
      <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800/80 flex items-center justify-center mb-6 shadow-xl">
        <ShieldAlert className="w-8 h-8 text-primary" />
      </div>
      <h2 className="text-3xl font-extrabold tracking-tight text-center">404 - Page Not Found</h2>
      <p className="text-zinc-500 text-sm mt-2 text-center max-w-sm">
        The resource you are looking for doesn&apos;t exist or has been relocated in the dashboard.
      </p>
      <Link
        href="/dashboard"
        className="mt-8 px-5 py-2.5 bg-primary hover:bg-primary/90 text-zinc-950 font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/35 transition-all text-sm"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
