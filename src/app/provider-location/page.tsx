'use client';

import { useState } from 'react';
import { updateProviderLocation, getCurrentPosition } from '../../lib/geoApi';

interface FormState {
  latitude: string;
  longitude: string;
}

export default function ProviderLocationPage() {
  const [form, setForm] = useState<FormState>({ latitude: '', longitude: '' });
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setMessage(null);
  };

  const handleUseGPS = async () => {
    setGpsLoading(true);
    setMessage(null);
    try {
      const pos = await getCurrentPosition();
      setForm({
        latitude: pos.latitude.toFixed(6),
        longitude: pos.longitude.toFixed(6),
      });
    } catch (err: unknown) {
      setMessage({ type: 'error', text: (err as Error).message });
    } finally {
      setGpsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(form.latitude);
    const lng = parseFloat(form.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      setMessage({ type: 'error', text: 'Please enter valid numeric coordinates.' });
      return;
    }
    if (lat < -90 || lat > 90) {
      setMessage({ type: 'error', text: 'Latitude must be between -90 and 90.' });
      return;
    }
    if (lng < -180 || lng > 180) {
      setMessage({ type: 'error', text: 'Longitude must be between -180 and 180.' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const res = await updateProviderLocation({ latitude: lat, longitude: lng });
      setMessage({ type: 'success', text: res.message ?? 'Location updated successfully!' });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        (err as Error)?.message ??
        'Failed to update location.';
      setMessage({ type: 'error', text: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Update Your Location</h1>
        <p className="text-sm text-gray-500 mb-6">
          Customers nearby will be able to find you based on this location.
        </p>

        <button
          type="button"
          onClick={handleUseGPS}
          disabled={gpsLoading}
          className="w-full mb-5 flex items-center justify-center gap-2 rounded-xl border-2 border-blue-500 text-blue-600 font-semibold py-3 hover:bg-blue-50 transition disabled:opacity-50"
        >
          {gpsLoading ? (
            <span className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
            </svg>
          )}
          {gpsLoading ? 'Detecting location…' : 'Use My Current GPS Location'}
        </button>

        <div className="relative mb-5">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs text-gray-400 uppercase">
            <span className="bg-white px-2">or enter manually</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="latitude">
              Latitude
            </label>
            <input
              id="latitude"
              name="latitude"
              type="number"
              step="any"
              placeholder="e.g. 22.5726"
              value={form.latitude}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="longitude">
              Longitude
            </label>
            <input
              id="longitude"
              name="longitude"
              type="number"
              step="any"
              placeholder="e.g. 88.3639"
              value={form.longitude}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {message && (
            <div
              className={`rounded-xl px-4 py-3 text-sm font-medium ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 text-white font-semibold py-3 hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && (
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            )}
            {loading ? 'Saving…' : 'Save Location'}
          </button>
        </form>

        {form.latitude && form.longitude && (
          <p className="mt-4 text-xs text-center text-gray-400">
            Pinned at {parseFloat(form.latitude).toFixed(5)}, {parseFloat(form.longitude).toFixed(5)}
          </p>
        )}
      </div>
    </main>
  );
}
