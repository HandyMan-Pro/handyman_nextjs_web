'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/apiClient';
import { getUserData } from '../../../lib/auth';
import { useLanguage } from '../../../contexts/LanguageContext';
import {
  MessageSquare, Loader2, X, Plus, Trash2, Edit3,
  Calendar, User, Image, Search, Tag, Eye
} from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  tags: string[];
  author_id: string;
  author_name: string;
  author_role: string;
  created_at: string;
  updated_at: string;
}

export default function BlogsPage() {
  const { t, language } = useLanguage();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Current user info
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Modal Controls
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editBlogId, setEditBlogId] = useState<string | null>(null);
  
  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formTagsString, setFormTagsString] = useState('');
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Selected post view modal
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    const u = getUserData();
    setCurrentUser(u);
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/blogs');
      // Backend returns either { data: [...] } or direct list
      const fetchedBlogs = res.data?.data || res.data || [];
      setBlogs(fetchedBlogs);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch blog posts.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setIsEditMode(false);
    setEditBlogId(null);
    setFormTitle('');
    setFormContent('');
    setFormImageUrl('');
    setFormTagsString('');
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (blog: BlogPost, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditMode(true);
    setEditBlogId(blog.id);
    setFormTitle(blog.title);
    setFormContent(blog.content);
    setFormImageUrl(blog.image_url || '');
    setFormTagsString(blog.tags.join(', '));
    setFormError('');
    setModalOpen(true);
  };

  const handleSaveBlogPost = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Client-side validations
    if (formTitle.length < 5 || formTitle.length > 100) {
      setFormError('Title must be between 5 and 100 characters.');
      return;
    }
    if (formContent.length < 10 || formContent.length > 5000) {
      setFormError('Content must be between 10 and 5000 characters.');
      return;
    }

    setFormSaving(true);
    const tagsArray = formTagsString
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const payload = {
      title: formTitle,
      content: formContent,
      image_url: formImageUrl || undefined,
      tags: tagsArray,
    };

    // Optimistic UI updates
    const previousBlogs = [...blogs];

    try {
      if (isEditMode && editBlogId) {
        // Optimistically update
        setBlogs(prev => prev.map(b => b.id === editBlogId ? {
          ...b,
          ...payload,
          updated_at: new Date().toISOString()
        } : b));

        await apiClient.put(`/blogs/${editBlogId}`, payload);
        setSuccess('Blog post updated successfully!');
      } else {
        // For creation, we wait for server to get full response (including ID and author information)
        const res = await apiClient.post('/blogs', payload);
        const createdPost = res.data?.data || res.data;
        if (createdPost) {
          setBlogs(prev => [createdPost, ...prev]);
        }
        setSuccess('Blog post published successfully!');
      }
      setModalOpen(false);
      fetchBlogs(); // reload to sync exactly
    } catch (err: any) {
      // Revert on error
      setBlogs(previousBlogs);
      setFormError(err.response?.data?.detail || err.message || 'Failed to save blog post.');
    } finally {
      setFormSaving(false);
    }
  };

  const handleDeleteBlogPost = async (blogId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this blog post?')) {
      return;
    }

    // Optimistic UI update
    const previousBlogs = [...blogs];
    setBlogs(prev => prev.filter(b => b.id !== blogId));

    try {
      await apiClient.delete(`/blogs/${blogId}`);
      setSuccess('Blog post deleted successfully!');
    } catch (err: any) {
      // Revert on error
      setBlogs(previousBlogs);
      setError(err.response?.data?.detail || err.message || 'Failed to delete blog post.');
    }
  };

  // Filter posts
  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = 
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTag = selectedTag ? blog.tags.includes(selectedTag) : true;

    return matchesSearch && matchesTag;
  });

  // Extract all unique tags
  const allTags = Array.from(
    new Set(blogs.flatMap(blog => blog.tags))
  );

  const canCreate = currentUser?.user_type === 'provider' || currentUser?.user_type === 'admin' || currentUser?.user_type === 'demo_admin';

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary" />
            {t('Blogs')}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5 font-medium">
            {t('Read the latest updates, tips, and service tutorials from experts.')}
          </p>
        </div>

        {canCreate && (
          <button
            onClick={handleOpenCreateModal}
            id="btn-create-blog"
            className="h-11 px-5 bg-primary hover:bg-primary/95 text-zinc-950 dark:text-zinc-950 font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/10 hover:shadow-primary/20 shrink-0"
          >
            <Plus className="w-4 h-4" />
            {t('Create Post')}
          </button>
        )}
      </div>

      {/* Feedback Alerts */}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl px-4 py-3 text-sm animate-fade-in flex justify-between items-center">
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl px-4 py-3 text-sm animate-fade-in flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-zinc-400 hover:text-zinc-650 dark:hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-450 dark:text-zinc-500" />
          <input
            type="text"
            placeholder={t('Search Blogs')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-4 bg-white dark:bg-zinc-900/60 border border-zinc-250 dark:border-zinc-800/60 rounded-xl text-sm text-zinc-800 dark:text-zinc-300 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all"
          />
        </div>

        {/* Tags quick filter */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-thin">
          <span className="text-xs text-zinc-500 shrink-0 font-semibold uppercase tracking-wider">{t('Tags')}:</span>
          <button
            onClick={() => setSelectedTag(null)}
            className={`h-8 px-3 rounded-full text-xs font-semibold transition-all shrink-0 ${
              selectedTag === null
                ? 'bg-primary text-zinc-950'
                : 'bg-zinc-200 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-800'
            }`}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`h-8 px-3 rounded-full text-xs font-semibold transition-all shrink-0 ${
                selectedTag === tag
                  ? 'bg-primary text-zinc-950'
                  : 'bg-zinc-200 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-800'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Blog Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-850 rounded-2xl overflow-hidden animate-pulse h-96 flex flex-col justify-between p-5 space-y-4">
              <div className="w-full h-40 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
              <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2" />
              <div className="flex items-center gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-850">
                <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                <div className="space-y-1 flex-1">
                  <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-20" />
                  <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-850 rounded-2xl p-6">
          <MessageSquare className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-zinc-850 dark:text-zinc-300">No Posts Found</h3>
          <p className="text-zinc-500 text-sm mt-1 max-w-xs mx-auto">
            Try matching a different search term, selecting a different tag, or check back later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map(blog => {
            const isAuthor = currentUser?.id === blog.author_id;
            const isAdmin = currentUser?.user_type === 'admin' || currentUser?.user_type === 'demo_admin';
            const canEdit = isAuthor;
            const canDelete = isAuthor || isAdmin;

            return (
              <article
                key={blog.id}
                onClick={() => setSelectedPost(blog)}
                className="group cursor-pointer bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/60 hover:border-primary/40 dark:hover:border-primary/40 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
              >
                {/* Cover Image */}
                <div className="relative w-full h-48 bg-zinc-100 dark:bg-zinc-850 overflow-hidden flex-shrink-0">
                  {blog.image_url ? (
                    <img
                      src={blog.image_url}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-850">
                      <Image className="w-8 h-8 mb-1" />
                      <span className="text-xs">No Cover Image</span>
                    </div>
                  )}

                  {/* Badges overlay */}
                  <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 flex flex-wrap gap-1.5">
                    {blog.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Content body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h2 className="text-lg font-bold text-zinc-850 dark:text-zinc-100 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                      {blog.title}
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm line-clamp-3 leading-relaxed">
                      {blog.content}
                    </p>
                  </div>

                  {/* Card footer */}
                  <div className="pt-4 border-t border-zinc-150 dark:border-zinc-850 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-zinc-150 dark:bg-zinc-800 flex items-center justify-center font-bold text-primary text-xs shrink-0 select-none">
                        {blog.author_name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">{blog.author_name}</p>
                        <p className="text-[10px] text-zinc-500 truncate capitalize">{blog.author_role}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                      {canEdit && (
                        <button
                          onClick={(e) => handleOpenEditModal(blog, e)}
                          title="Edit Post"
                          className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 hover:bg-primary/20 dark:hover:bg-primary/20 hover:text-primary transition-all text-zinc-500"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={(e) => handleDeleteBlogPost(blog.id, e)}
                          title="Delete Post"
                          className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-500/20 dark:hover:bg-rose-500/20 hover:text-rose-500 transition-all text-zinc-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedPost(blog)}
                        title="View Details"
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all text-zinc-550"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Post Details Dialog / Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-4 right-4 rtl:left-4 rtl:right-auto w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 flex items-center justify-center text-zinc-500 dark:text-zinc-400 z-10 transition-colors"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            {selectedPost.image_url && (
              <div className="w-full h-64 bg-zinc-100 dark:bg-zinc-850 relative">
                <img
                  src={selectedPost.image_url}
                  alt={selectedPost.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-6 space-y-4">
              {/* Author and Date Meta info */}
              <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-500 border-b border-zinc-150 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">{selectedPost.author_name}</span>
                  <span className="bg-zinc-100 dark:bg-zinc-800 text-[10px] text-zinc-500 px-2 py-0.5 rounded capitalize">
                    {selectedPost.author_role}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(selectedPost.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-zinc-850 dark:text-zinc-100 leading-tight">
                {selectedPost.title}
              </h2>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {selectedPost.tags.map(tag => (
                  <span
                    key={tag}
                    className="bg-primary/10 border border-primary/20 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Content */}
              <p className="text-zinc-650 dark:text-zinc-300 text-base leading-relaxed whitespace-pre-wrap">
                {selectedPost.content}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Editor Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-2xl max-w-xl w-full shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-150 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-850 dark:text-zinc-100">
                {isEditMode ? t('Edit Post') : t('Create Post')}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBlogPost} className="p-6 space-y-4">
              {formError && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl px-4 py-3 text-sm flex items-center gap-1.5">
                  <span className="font-bold">⚠️</span> {formError}
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 block">
                  {t('Title')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. 5 Maintenance Tips for AC"
                  className="w-full h-11 px-3 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary/60"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 block">
                  {t('Cover Image URL')}
                </label>
                <div className="relative">
                  <Image className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="url"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="e.g. https://images.unsplash.com/..."
                    className="w-full h-11 pl-10 pr-3 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary/60"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 block">
                  {t('Tags (comma separated)')}
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    value={formTagsString}
                    onChange={(e) => setFormTagsString(e.target.value)}
                    placeholder="e.g. ac, cooling, tutorial"
                    className="w-full h-11 pl-10 pr-3 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary/60"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 block">
                  {t('Content')} <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={6}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Type the blog body content here..."
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary/60 resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-zinc-150 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="h-10 px-5 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-semibold text-xs rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  {t('Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={formSaving}
                  className="h-10 px-6 bg-primary hover:bg-primary/95 text-zinc-950 dark:text-zinc-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  {formSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {isEditMode ? t('Save') : t('Publish')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
