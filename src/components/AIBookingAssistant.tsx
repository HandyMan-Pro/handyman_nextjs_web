'use client';

import { useState } from 'react';
import { Sparkles, Loader2, X, AlertCircle, RefreshCw, Send, Check } from 'lucide-react';
import { apiClient } from '../lib/apiClient';

interface AIBookingAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (structuredText: string) => void;
}

export default function AIBookingAssistant({ isOpen, onClose, onApply }: AIBookingAssistantProps) {
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) return;

    setLoading(true);
    setError('');
    setResult('');

    try {
      const response = await apiClient.post('/customer/ai-describe', {
        raw_description: rawText
      });
      const desc = response.data?.structured_description || '';
      setResult(desc);
    } catch (err: any) {
      console.error('AI describe error:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to analyze description.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    onApply(result);
    // Reset state
    setRawText('');
    setResult('');
    setError('');
    onClose();
  };

  const handleQuickExample = (text: string) => {
    setRawText(text);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-2xl overflow-y-auto max-h-[85vh] animate-scale-in">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-zinc-850 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/25">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">AI Description Assistant</h3>
              <p className="text-[10px] text-zinc-500 mt-0.5">Let AI structure your service request professionally.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {!result ? (
          <form onSubmit={handleGenerate} className="space-y-4">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-450 rounded-xl p-3 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-405 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">Describe the issue in your own words</label>
              <textarea
                required
                rows={4}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="e.g. My washroom sink is leaking. Water is accumulating on the floor. I think the pipe underneath is cracked. Plz send plumber soon..."
                className="w-full p-3 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-primary/60 focus:border-primary/60 resize-none"
              />
            </div>

            {/* Quick Examples */}
            <div>
              <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-wider mb-2 block">Quick Examples (English / Banglish)</span>
              <div className="space-y-1.5">
                {[
                  "kitchen call e pani jomche tap ta nosto, crack hoye gese",
                  "AC not cooling at all, making strange clicking noise",
                  "light switch board hot water wall shortcut short circuit light bondho"
                ].map((eg, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickExample(eg)}
                    className="w-full text-left p-2 rounded-lg bg-zinc-950/40 border border-zinc-850 hover:border-zinc-700 text-[10px] text-zinc-450 hover:text-zinc-300 transition-all truncate"
                  >
                    "{eg}"
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-9 bg-zinc-855 hover:bg-zinc-800 text-zinc-350 font-semibold rounded-xl text-xs transition-all border border-zinc-750"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !rawText.trim()}
                className="flex-1 h-9 bg-primary hover:bg-primary/95 text-black font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-98 disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Structuring...
                  </>
                ) : (
                  <>
                    <Send className="w-3 h-3" />
                    AI Assist
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Result Review */
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">AI Suggested Description</label>
              <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-zinc-305 font-mono whitespace-pre-line leading-relaxed max-h-[220px] overflow-y-auto">
                {result}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setResult('')}
                className="flex-1 h-9 bg-zinc-855 hover:bg-zinc-800 text-zinc-350 font-semibold rounded-xl text-xs transition-all border border-zinc-750 flex items-center justify-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Rewrite
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="flex-1 h-9 bg-primary hover:bg-primary/95 text-black font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md"
              >
                <Check className="w-3.5 h-3.5" />
                Use Description
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
