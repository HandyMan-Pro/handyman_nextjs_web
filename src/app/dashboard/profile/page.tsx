'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/apiClient';
import { getUserData, setUserData } from '../../../lib/auth';
import {
  User, Mail, Phone, MapPin, ShieldAlert,
  Loader2, Sparkles, CheckCircle, X, Upload
} from 'lucide-react';

export default function UserProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form Fields
  const [userId, setUserId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [address, setAddress] = useState('');
  const [profileImage, setProfileImage] = useState('');

  useEffect(() => {
    fetchProfileDetails();
  }, []);

  const fetchProfileDetails = async () => {
    setLoading(true);
    setError('');
    const u = getUserData();
    if (!u) {
      setError('Failed to resolve authenticated session.');
      setLoading(false);
      return;
    }

    try {
      const res = await apiClient.get(`/user-detail?id=${u.id}`);
      const data = res.data?.data || res.data;
      if (data) {
        setUserId(data.id || u.id);
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
        setUsername(data.username || '');
        setEmail(data.email || '');
        setContactNumber(data.contact_number || '');
        setAddress(data.address || '');
        setProfileImage(data.profile_image || '');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch profile details.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await apiClient.post('/register/upload-profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data?.url) {
        setProfileImage(res.data.url);
        setSuccessMsg('Profile image uploaded successfully! Press Save to commit changes.');
      } else {
        throw new Error('Image URL was not returned by the server.');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to upload profile image.');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMsg('');

    try {
      const payload = {
        id: userId,
        first_name: firstName,
        last_name: lastName,
        username: username,
        email: email,
        contact_number: contactNumber,
        address: address,
        display_name: `${firstName} ${lastName}`,
        profile_image: profileImage || undefined
      };

      const res = await apiClient.post('/update-profile', payload);
      setSuccessMsg('Profile updated successfully!');
      
      // Update local storage session
      if (res.data?.data) {
        setUserData(res.data.data);
      }
      
      // Refresh the page data
      fetchProfileDetails();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
          <User className="w-6 h-6 text-indigo-500" />
          My Profile
        </h1>
        <p className="text-zinc-400 text-sm mt-0.5 font-medium">Manage your personal profile details, contact numbers, and service addresses.</p>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-4 py-3 text-sm animate-fade-in flex justify-between items-center">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="text-zinc-550 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-4 py-3 text-sm animate-fade-in flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-zinc-550 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="bg-zinc-900/40 border border-zinc-850 rounded-2xl p-6 space-y-6 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-zinc-800 rounded-full" />
            <div className="space-y-2">
              <div className="h-4 bg-zinc-800 rounded w-28" />
              <div className="h-3 bg-zinc-800 rounded w-20" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-zinc-800 rounded-xl" />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-6 shadow-xl max-w-3xl">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Profile Avatar Edit Section */}
            <div className="flex flex-col sm:flex-row items-center gap-5 border-b border-zinc-850 pb-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-zinc-800 border-2 border-indigo-500/20 flex items-center justify-center font-bold text-indigo-400 text-3xl select-none">
                  {profileImage ? (
                    <img src={profileImage} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{firstName.charAt(0) || 'U'}</span>
                  )}
                </div>
                {uploading && (
                  <div className="absolute inset-0 bg-black/75 rounded-full flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                  </div>
                )}
                <label className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-[10px] font-bold text-white uppercase tracking-wider">
                  <Upload className="w-4 h-4 mr-1" />
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="text-center sm:text-left space-y-1">
                <h3 className="text-base font-bold text-zinc-200">Profile Picture</h3>
                <p className="text-xs text-zinc-500">Supports JPEG, PNG or WebP images up to 2MB.</p>
              </div>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Rahul"
                  className="w-full h-11 px-3 bg-zinc-850/50 border border-zinc-800/80 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-650 focus:outline-none focus:ring-1 focus:ring-indigo-500/60"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Kumar"
                  className="w-full h-11 px-3 bg-zinc-850/50 border border-zinc-800/80 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-655 focus:outline-none focus:ring-1 focus:ring-indigo-500/60"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. rahul_kumar"
                  className="w-full h-11 px-3 bg-zinc-850/50 border border-zinc-800/80 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-655 focus:outline-none focus:ring-1 focus:ring-indigo-500/60"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. rahul@example.com"
                    className="w-full h-11 pl-10 pr-3 bg-zinc-850/50 border border-zinc-800/80 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-655 focus:outline-none focus:ring-1 focus:ring-indigo-500/60"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">Contact Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="tel"
                    required
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full h-11 pl-10 pr-3 bg-zinc-850/50 border border-zinc-800/80 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-655 focus:outline-none focus:ring-1 focus:ring-indigo-500/60"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">Service Address / Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Salt Lake, Sector V, Kolkata"
                    className="w-full h-11 pl-10 pr-3 bg-zinc-850/50 border border-zinc-800/80 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-655 focus:outline-none focus:ring-1 focus:ring-indigo-500/60"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="h-11 px-8 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-indigo-650/15"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
