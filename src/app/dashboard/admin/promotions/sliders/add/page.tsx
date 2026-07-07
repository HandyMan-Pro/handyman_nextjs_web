'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../../../../lib/apiClient';
import {
  Sliders, ArrowLeft, Loader2, Save, Link, UploadCloud
} from 'lucide-react';

interface Service {
  id: string;
  name: string;
}

export default function AddSliderPage() {
  const router = useRouter();

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [serviceId, setServiceId] = useState('');
  
  // UI states
  const [services, setServices] = useState<Service[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // File upload simulator
  const [isUploading, setIsUploading] = useState(false);

  // Fetch Services for dropdown linkage
  useEffect(() => {
    apiClient.get('/admin/services')
      .then(res => {
        if (Array.isArray(res.data)) {
          setServices(res.data.map((s: any) => ({
            id: s.id || s._id,
            name: s.name
          })));
        }
      })
      .catch(() => {
        // Fallback silently
      });
  }, []);

  const handleSimulatedUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      // Pick a beautiful Unsplash slider landscape placeholder
      const presets = [
        'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop'
      ];
      const randomPreset = presets[Math.floor(Math.random() * presets.length)];
      setImageUrl(randomPreset);
      setIsUploading(false);
    }, 1200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Slider Title is required.');
      return;
    }
    if (!imageUrl.trim()) {
      setErrorMessage('Slider Banner image is required. Upload one or paste a URL.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await apiClient.post('/admin/promotions/sliders', {
        title: title.trim(),
        description: description.trim(),
        image_url: imageUrl.trim(),
        service_id: serviceId || null,
        status: true
      });
      router.push('/dashboard/admin/promotions/sliders/list');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || 'Failed to create homepage slider.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-zinc-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/dashboard/admin/promotions/sliders/list')}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#5E5CE6]" />
              Add Homepage Slider
            </h1>
            <p className="text-zinc-550 text-[10px]">
              Setup a new carousel sliding banner with clickable target links.
            </p>
          </div>
        </div>
      </div>

      {/* Main Form Panel */}
      <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800/60 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/20 text-red-400 text-xs">
              {errorMessage}
            </div>
          )}

          {/* Slider Title */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-white uppercase tracking-wider text-[10px]">Slider Title</label>
            <input
              type="text"
              placeholder="e.g. 50% Off Professional Deep Cleaning"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-zinc-950/60 border border-zinc-800/60 rounded-lg px-4 py-2 text-xs text-white placeholder-zinc-550 focus:outline-none focus:border-[#5E5CE6] transition-colors"
              required
            />
          </div>

          {/* Slider Description */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-white uppercase tracking-wider text-[10px]">Description / Tagline</label>
            <textarea
              placeholder="e.g. Book certified cleaning specialists today. Offer valid this week only."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="bg-zinc-950/60 border border-zinc-800/60 rounded-lg px-4 py-2 text-xs text-white placeholder-zinc-550 focus:outline-none focus:border-[#5E5CE6] transition-colors resize-none"
            />
          </div>

          {/* Banner Image Uploader & Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-white uppercase tracking-wider text-[10px]">Banner Image</label>
              
              {/* File upload simulator box */}
              <div
                onClick={handleSimulatedUpload}
                className="group border border-dashed border-zinc-800 hover:border-[#5E5CE6] rounded-lg p-6 bg-zinc-950/30 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-8 h-8 text-[#5E5CE6] animate-spin" />
                    <span className="text-[10px] text-zinc-500">Uploading preset image...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-8 h-8 text-zinc-550 group-hover:text-[#5E5CE6] transition-colors" />
                    <span className="text-[10px] font-bold text-zinc-400">Click to Upload / Select preset</span>
                    <span className="text-[9px] text-zinc-600">Simulates file browse & upload</span>
                  </>
                )}
              </div>

              {/* URL manual override */}
              <div className="mt-2">
                <span className="text-[9px] text-zinc-500 block mb-1">OR enter direct image URL:</span>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-zinc-950/60 border border-zinc-800/60 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Live Preview Pane */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-white uppercase tracking-wider text-[10px]">Slider Live Preview</label>
              <div className="flex-1 min-h-[120px] rounded-lg border border-zinc-850 bg-zinc-950/50 overflow-hidden relative flex items-center justify-center">
                {imageUrl ? (
                  <>
                    <img src={imageUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent flex flex-col justify-end p-4">
                      <span className="text-white font-bold text-sm tracking-wide drop-shadow-md">{title || 'Slider Title'}</span>
                      <span className="text-zinc-300 text-[10px] mt-0.5 line-clamp-1">{description || 'Slider description...'}</span>
                    </div>
                  </>
                ) : (
                  <span className="text-zinc-600 text-[10px]">Image preview will load here</span>
                )}
              </div>
            </div>
          </div>

          {/* Action Link / Target Service */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-white uppercase tracking-wider text-[10px]">Target Action Link / Service</label>
            <div className="relative">
              <select
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="w-full bg-zinc-950/60 border border-zinc-800/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5E5CE6] transition-colors"
              >
                <option value="">No link (Information banner only)</option>
                {services.map(s => (
                  <option key={s.id} value={s.id}>Open Service: {s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Form Submit buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800/60 mt-6">
            <button
              type="button"
              onClick={() => router.push('/dashboard/admin/promotions/sliders/list')}
              className="px-4 py-2 rounded-lg border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#5E5CE6] hover:bg-[#5E5CE6]/90 disabled:opacity-50 text-white font-bold transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Slider
                </>
              )}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
