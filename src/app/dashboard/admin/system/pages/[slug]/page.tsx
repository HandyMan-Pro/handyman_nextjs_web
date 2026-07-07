'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiClient } from '../../../../../../lib/apiClient';
import {
  FileText, Loader2, AlertCircle, Save, ArrowLeft, ToggleLeft, ToggleRight, Sparkles, Languages, Eye
} from 'lucide-react';

export default function CMSPageEditor() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [language, setLanguage] = useState('english');
  const [htmlContent, setHtmlContent] = useState('');
  const [status, setStatus] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    apiClient.get(`/admin/system/pages/${slug}`)
      .then((res) => {
        setHtmlContent(res.data.html_content || '');
        setLanguage(res.data.language || 'english');
        setStatus(res.data.status !== false);
        setFetchError(null);
      })
      .catch((err) => {
        console.error('Error fetching CMS page:', err);
        setFetchError('Failed to fetch page data.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [slug]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiClient.put(`/admin/system/pages/${slug}`, {
        html_content: htmlContent,
        language,
        status
      });
      router.push('/dashboard/admin/system/pages');
    } catch (err) {
      console.error('Failed to save CMS page:', err);
      alert('Error saving CMS page. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const insertTag = (tag: string, closingTag?: string) => {
    const textarea = document.getElementById('wysiwyg-textarea') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = closingTag 
      ? `<${tag}>${selected || 'Text'}</${closingTag}>`
      : `<${tag} />`;
    setHtmlContent(text.substring(0, start) + replacement + text.substring(end));
    textarea.focus();
  };

  const languagesList = [
    { code: 'english', label: 'English', flag: '🇬🇧' },
    { code: 'spanish', label: 'Español', flag: '🇪🇸' },
    { code: 'french', label: 'Français', flag: '🇫🇷' },
    { code: 'german', label: 'Deutsch', flag: '🇩🇪' }
  ];

  return (
    <div className="p-6 space-y-6 bg-[#09090b] min-h-screen text-zinc-100">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/dashboard/admin/system/pages')}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#5E5CE6]" />
              EDIT CMS PAGE
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Editing: <span className="text-zinc-200 font-mono">{slug}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Toggle */}
          <button
            onClick={() => setStatus(!status)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 transition-colors"
          >
            <span className="text-[10px] uppercase font-bold text-zinc-400">Status</span>
            {status ? (
              <ToggleRight className="w-5 h-5 text-[#5E5CE6]" />
            ) : (
              <ToggleLeft className="w-5 h-5 text-zinc-650" />
            )}
          </button>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#5E5CE6] hover:bg-[#5E5CE6]/90 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-[#5E5CE6]/20"
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            Save Changes
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-[#5E5CE6] animate-spin" />
          <span className="text-xs text-zinc-500">Loading page content...</span>
        </div>
      ) : fetchError ? (
        <div className="p-12 flex flex-col items-center justify-center gap-3 text-red-400">
          <AlertCircle className="w-8 h-8" />
          <span className="text-xs">{fetchError}</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor Side */}
          <div className="space-y-4">
            {/* Language Selection Tab */}
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                Language Translation
              </label>
              <div className="flex gap-2">
                {languagesList.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      language === lang.code
                        ? 'bg-zinc-800 text-white border border-zinc-700'
                        : 'bg-zinc-950/40 text-zinc-500 border border-zinc-900 hover:text-zinc-300'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* WYSIWYG Toolbar & Edit Area */}
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl overflow-hidden flex flex-col min-h-[450px]">
              {/* WYSIWYG Toolbar */}
              <div className="p-2 bg-zinc-950/80 border-b border-zinc-800/80 flex flex-wrap gap-1.5 items-center">
                <button
                  type="button"
                  onClick={() => insertTag('h1', 'h1')}
                  className="px-2 py-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-[10px] font-bold text-zinc-300 rounded"
                >
                  H1
                </button>
                <button
                  type="button"
                  onClick={() => insertTag('h2', 'h2')}
                  className="px-2 py-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-[10px] font-bold text-zinc-300 rounded"
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => insertTag('p', 'p')}
                  className="px-2 py-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-[10px] font-bold text-zinc-300 rounded"
                >
                  Paragraph
                </button>
                <div className="w-[1px] h-4 bg-zinc-800 mx-1" />
                <button
                  type="button"
                  onClick={() => insertTag('strong', 'strong')}
                  className="px-2 py-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-[10px] font-bold text-zinc-300 rounded"
                >
                  Bold
                </button>
                <button
                  type="button"
                  onClick={() => insertTag('em', 'em')}
                  className="px-2 py-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-[10px] font-bold text-zinc-300 rounded"
                >
                  Italic
                </button>
                <button
                  type="button"
                  onClick={() => insertTag('u', 'u')}
                  className="px-2 py-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-[10px] font-bold text-zinc-300 rounded"
                >
                  Underline
                </button>
                <div className="w-[1px] h-4 bg-zinc-800 mx-1" />
                <button
                  type="button"
                  onClick={() => insertTag('ul', 'ul')}
                  className="px-2 py-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-[10px] font-bold text-zinc-300 rounded"
                >
                  Unordered List
                </button>
                <button
                  type="button"
                  onClick={() => insertTag('li', 'li')}
                  className="px-2 py-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-[10px] font-bold text-zinc-300 rounded"
                >
                  List Item
                </button>
                <button
                  type="button"
                  onClick={() => insertTag('br')}
                  className="px-2 py-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-[10px] font-bold text-zinc-300 rounded"
                >
                  Line Break
                </button>
              </div>

              {/* Text Area */}
              <textarea
                id="wysiwyg-textarea"
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                placeholder="Write your HTML page contents here..."
                className="flex-1 bg-transparent p-4 text-xs font-mono text-zinc-200 placeholder-zinc-650 focus:outline-none resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Live Preview Side */}
          <div className="space-y-4">
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3 flex items-center justify-between">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#5E5CE6]" />
                Live HTML Output Preview
              </label>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="text-[10px] font-bold text-[#5E5CE6] hover:underline"
              >
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
            </div>

            {showPreview && (
              <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-6 min-h-[450px] overflow-y-auto max-h-[600px] prose prose-invert prose-xs">
                {htmlContent ? (
                  <div 
                    dangerouslySetInnerHTML={{ __html: htmlContent }} 
                    className="leading-relaxed space-y-3"
                  />
                ) : (
                  <div className="text-zinc-600 text-xs italic">
                    Start typing in the editor to see a real-time output preview here.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
