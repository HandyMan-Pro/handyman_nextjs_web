'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../../../lib/apiClient';
import {
  BookOpen, Loader2, AlertCircle, Search, ShieldCheck
} from 'lucide-react';

interface AuthorInfo {
  name: string;
  email: string;
  avatar: string;
  role: string;
}

interface BlogArticle {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  read_time: string;
  status: number;
  created_at: string;
  author: AuthorInfo;
}

export default function BlogsPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<BlogArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/admin/system/blogs');
      setBlogs(res.data || []);
      setFetchError(null);
    } catch (err) {
      console.error(err);
      setFetchError('Failed to fetch blogs.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (blog.author?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabs = [
    { name: 'Help Desk', href: '/dashboard/admin/system/helpdesk', active: false },
    { name: 'CMS Pages', href: '/dashboard/admin/system/pages', active: false },
    { name: 'Plans', href: '/dashboard/admin/system/plans', active: false },
    { name: 'Taxes', href: '/dashboard/admin/system/taxes', active: false },
    { name: 'KYC Documents', href: '/dashboard/admin/system/documents', active: false },
    { name: 'Blogs', href: '/dashboard/admin/system/blogs', active: true },
    { name: 'Templates', href: '/dashboard/admin/system/templates', active: false },
    { name: 'Settings', href: '/dashboard/admin/system/settings', active: false },
    { name: 'Push Notifications', href: '/dashboard/admin/system/push-notifications', active: false },
  ];

  return (
    <div className="p-6 space-y-6 bg-[#09090b] min-h-screen text-zinc-100">
      {/* Header section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-[#5E5CE6]" />
              SYSTEM MANAGEMENT
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Configure global application parameters, CMS pages, support, plans, and notifications.
            </p>
          </div>
        </div>

        {/* Tab Row */}
        <div className="flex border-b border-zinc-800/80 overflow-x-auto whitespace-nowrap scrollbar-none">
          {tabs.map((t) => (
            <button
              key={t.name}
              onClick={() => router.push(t.href)}
              className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 -mb-[2px] ${
                t.active
                  ? 'border-[#5E5CE6] text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-3 bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-md rounded-xl flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search blogs by title, category, or author name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950/60 border border-zinc-800/60 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#5E5CE6] transition-colors"
          />
        </div>
      </div>

      {/* Blogs List Table */}
      <div className="bg-zinc-900/50 border border-zinc-800/60 backdrop-blur-md rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#5E5CE6] animate-spin" />
            <span className="text-xs text-zinc-500">Loading blogs...</span>
          </div>
        ) : fetchError ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-red-400">
            <AlertCircle className="w-8 h-8" />
            <span className="text-xs">{fetchError}</span>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-xs">
            No blog articles found.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#5E5CE6]/90 text-[11px] font-bold text-white uppercase tracking-wider">
                <th className="py-3 px-4 rounded-tl-xl">Article Title</th>
                <th className="py-3 px-4">Author</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Read Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 rounded-tr-xl text-right">Published Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50 text-xs">
              {filteredBlogs.map((blog) => (
                <tr key={blog.id} className="bg-[#18181b] border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                  <td className="py-4 px-4 font-bold text-zinc-200">
                    <div className="flex items-center gap-3">
                      {blog.image && (
                        <div className="w-12 h-8 rounded overflow-hidden bg-zinc-850 border border-zinc-800 flex-shrink-0">
                          <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div>
                        <div className="text-xs font-bold text-white line-clamp-1">{blog.title}</div>
                        <div className="text-[10px] text-zinc-500 mt-0.5 line-clamp-1">{blog.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center border border-zinc-700 flex-shrink-0">
                        {blog.author?.avatar ? (
                          <img src={blog.author.avatar} alt={blog.author.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[9px] font-bold text-zinc-400 uppercase">{(blog.author?.name || '??').substring(0, 2)}</span>
                        )}
                      </div>
                      <div>
                        <div className="text-zinc-300 font-medium text-[11px]">{blog.author?.name || 'Anonymous'}</div>
                        <div className="text-zinc-650 text-[9px]">{blog.author?.role || 'Author'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-300 border border-zinc-700/50 text-[10px] font-medium">
                      {blog.category}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-zinc-400 text-[11px] font-mono">{blog.read_time || '5 Mins'}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      blog.status === 1
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-zinc-850 text-zinc-500 border border-zinc-800'
                    }`}>
                      {blog.status === 1 ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right text-zinc-500 font-mono text-[10px]">
                    {blog.created_at ? new Date(blog.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
