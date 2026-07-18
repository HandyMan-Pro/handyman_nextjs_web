'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '../../../lib/apiClient';
import { getUserData } from '../../../lib/auth';
import FavoriteButton from '../../../components/FavoriteButton';
import AIBookingAssistant from '../../../components/AIBookingAssistant';
import {
  Heart, Star, ShieldCheck, Mail, Calendar, Clock,
  MapPin, Tag, Shield, Loader2, Sparkles,
  CheckCircle, Wrench, X, Plus, Minus, AlertCircle, Compass
} from 'lucide-react';

interface FavoriteProvider {
  id: string;
  full_name: string;
  email: string;
  profile_picture?: string;
  provider_type?: string;
  designation?: string;
  average_rating?: number;
  favorited_at: string;
}

interface ProviderService {
  service_id: string;
  name: string;
  category: string;
  price: number;
  status: number;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Booking Modal State
  const [selectedProvider, setSelectedProvider] = useState<FavoriteProvider | null>(null);
  const [providerServices, setProviderServices] = useState<ProviderService[]>([]);
  const [selectedService, setSelectedService] = useState<ProviderService | null>(null);
  const [loadingServices, setLoadingServices] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const [bookingDate, setBookingDate] = useState('');
  const [bookingTimeSlot, setBookingTimeSlot] = useState('10:00 AM');
  const [bookingQuantity, setBookingQuantity] = useState(1);
  const [bookingAddress, setBookingAddress] = useState('');
  const [bookingDesc, setBookingDesc] = useState('');
  const [bookingSubmitLoading, setBookingSubmitLoading] = useState(false);
  const [isAIAssistOpen, setIsAIAssistOpen] = useState(false);

  useEffect(() => {
    fetchFavorites();
    
    // Pre-populate address from user profile
    const u = getUserData();
    if (u && u.address) {
      setBookingAddress(u.address);
    }
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/user/favorites');
      setFavorites(res.data || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to load favorite providers.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromView = (providerId: string) => {
    // Gracefully fade out/remove the card from the UI
    setFavorites(prev => prev.filter(p => p.id !== providerId));
  };

  const handleOpenBooking = async (provider: FavoriteProvider) => {
    setSelectedProvider(provider);
    setIsBookingModalOpen(true);
    setLoadingServices(true);
    setProviderServices([]);
    setSelectedService(null);
    setError('');

    try {
      const res = await apiClient.get(`/provider-services?provider_id=${provider.id}`);
      const services = res.data?.data || [];
      // Filter only active catalog services
      const activeServices = services.filter((s: any) => s.status === 1);
      setProviderServices(activeServices);
      if (activeServices.length > 0) {
        setSelectedService(activeServices[0]);
      }
    } catch (err: any) {
      setError('Could not retrieve provider services list. Please try again.');
    } finally {
      setLoadingServices(false);
    }
  };

  const handleCloseBooking = () => {
    setSelectedProvider(null);
    setSelectedService(null);
    setProviderServices([]);
    setIsBookingModalOpen(false);
    setBookingDate('');
    setBookingQuantity(1);
    setBookingDesc('');
    setSuccessMsg('');
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvider || !selectedService) return;
    if (!bookingDate) {
      setError('Please select a preferred date for the booking.');
      return;
    }

    setBookingSubmitLoading(true);
    setError('');

    const basePrice = selectedService.price || 0;
    const totalAmount = basePrice * bookingQuantity;

    try {
      const payload = {
        service_id: selectedService.service_id,
        provider_id: selectedProvider.id,
        description: bookingDesc,
        address: bookingAddress,
        date: `${bookingDate} ${bookingTimeSlot}`,
        amount: basePrice,
        quantity: bookingQuantity,
        total_amount: totalAmount,
        type: 'service',
        payment_method: 'Razorpay'
      };

      await apiClient.post('/booking-save', payload);
      setSuccessMsg('Your booking request has been successfully registered!');
      setTimeout(() => {
        handleCloseBooking();
      }, 2500);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to submit booking request.');
    } finally {
      setBookingSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header section */}
      <div className="border-b border-zinc-850 pb-5">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-zinc-100">
          <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
          My Favorite Providers
        </h1>
        <p className="text-zinc-400 text-sm mt-0.5">
          Access and instantly book your saved handyman specialists.
        </p>
      </div>

      {loading ? (
        /* Loading skeleton state */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-zinc-900/30 border border-zinc-850 rounded-2xl p-5 flex flex-col justify-between animate-pulse">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 rounded-xl bg-zinc-800" />
                  <div className="w-8 h-8 rounded-full bg-zinc-800" />
                </div>
                <div className="h-5 bg-zinc-800 rounded w-2/3" />
                <div className="h-3 bg-zinc-800 rounded w-1/2" />
              </div>
              <div className="h-9 bg-zinc-800 rounded-xl w-full" />
            </div>
          ))}
        </div>
      ) : error && !isBookingModalOpen ? (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-450 rounded-xl px-4 py-3 text-xs flex justify-between items-center">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-zinc-550 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : favorites.length > 0 ? (
        /* Favorites Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((p) => {
            const providerName = p.full_name;
            return (
              <div
                key={p.id}
                className="group relative bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-5 hover:border-primary/40 hover:bg-zinc-900/70 transition-all duration-300 flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    {p.profile_picture ? (
                      <img 
                        src={p.profile_picture} 
                        alt={providerName} 
                        className="w-12 h-12 rounded-xl object-cover border border-zinc-850" 
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-900/20 to-indigo-650/10 border border-indigo-500/20 flex items-center justify-center font-bold text-primary text-sm group-hover:scale-105 transition-transform duration-300">
                        {providerName.slice(0, 2).toUpperCase()}
                      </div>
                    )}

                    <div className="flex items-center gap-1.5">
                      <div className="inline-flex items-center gap-0.5 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-lg text-[10px] font-semibold text-amber-400">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{p.average_rating && p.average_rating > 0 ? p.average_rating : '5.0'}</span>
                      </div>
                      
                      <FavoriteButton
                        providerId={p.id}
                        initialIsFavorited={true}
                        onToggle={(state) => {
                          if (!state) handleRemoveFromView(p.id);
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors line-clamp-1">
                      {providerName}
                    </h3>
                    <p className="text-zinc-550 text-[11px] mt-0.5">{p.designation || p.provider_type || 'Certified Specialist'}</p>
                    <p className="text-zinc-400 text-[11px] mt-3 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-zinc-600" />
                      <span className="truncate">{p.email}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => handleOpenBooking(p)}
                    className="w-full h-9 bg-primary hover:bg-primary/95 text-black font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-98"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    Book Partner
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="py-16 text-center bg-zinc-900/10 border border-zinc-850 rounded-2xl space-y-4 max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mx-auto text-zinc-650">
            <Heart className="w-7 h-7 text-zinc-700" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-zinc-300">No Saved Providers</h3>
            <p className="text-zinc-500 text-xs max-w-sm mx-auto leading-relaxed">
              You haven't added any handymen to your favorites yet. Save your preferred specialists for quick access and instant bookings.
            </p>
          </div>
          <Link
            href="/dashboard/find-provider"
            className="inline-flex h-9 items-center justify-center bg-primary hover:bg-primary/95 text-black font-bold px-4 rounded-xl text-xs transition-all shadow-md"
          >
            Find Providers
          </Link>
        </div>
      )}

      {/* Booking Form Dialog Modal */}
      {isBookingModalOpen && selectedProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={handleCloseBooking} />
          
          <div className="relative z-10 w-full max-w-lg bg-zinc-900 border border-zinc-800/85 rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh] animate-scale-in">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-4 mb-4">
              <div>
                <h3 className="text-sm font-bold text-zinc-150 flex items-center gap-2 uppercase tracking-wide">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Book Saved Specialist
                </h3>
                <p className="text-xs text-zinc-450 mt-0.5">Specialist: {selectedProvider.full_name}</p>
              </div>
              <button onClick={handleCloseBooking} className="text-zinc-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {successMsg ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-405 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-zinc-200">Appointment Booked!</h4>
                <p className="text-sm text-zinc-400">{successMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleCreateBooking} className="space-y-4">
                {error && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-450 rounded-xl px-4 py-2.5 text-xs flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-405 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {loadingServices ? (
                  <div className="py-6 flex flex-col items-center justify-center gap-2 text-zinc-500">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Syncing Partner Catalog...</span>
                  </div>
                ) : (
                  <>
                    {/* Service Selection */}
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">Select Service</label>
                      <select
                        value={selectedService?.service_id || ''}
                        onChange={(e) => {
                          const svc = providerServices.find(s => s.service_id === e.target.value);
                          if (svc) setSelectedService(svc);
                        }}
                        className="w-full h-11 px-3 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-primary/60 focus:border-primary/60"
                      >
                        {providerServices.map((s) => (
                          <option key={s.service_id} value={s.service_id} className="bg-zinc-900">
                            {s.name} (₹{s.price})
                          </option>
                        ))}
                        {providerServices.length === 0 && (
                          <option value="">No services registered by this provider</option>
                        )}
                      </select>
                    </div>

                    {/* Date & Time slot */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">Preferred Date</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-505" />
                          <input
                            type="date"
                            required
                            value={bookingDate}
                            onChange={(e) => setBookingDate(e.target.value)}
                            className="w-full h-11 pl-10 pr-3 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-zinc-250 focus:outline-none focus:ring-1 focus:ring-primary/60 focus:border-primary/60"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">Time Slot</label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-550" />
                          <select
                            value={bookingTimeSlot}
                            onChange={(e) => setBookingTimeSlot(e.target.value)}
                            className="w-full h-11 pl-10 pr-3 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-zinc-250 focus:outline-none focus:ring-1"
                          >
                            <option value="09:00 AM">09:00 AM - 11:00 AM</option>
                            <option value="11:00 AM">11:00 AM - 01:00 PM</option>
                            <option value="01:00 PM">01:00 PM - 03:00 PM</option>
                            <option value="03:00 PM">03:00 PM - 05:00 PM</option>
                            <option value="05:00 PM">05:00 PM - 07:00 PM</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">Quantity / Hours</label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          disabled={bookingQuantity <= 1}
                          onClick={() => setBookingQuantity(prev => prev - 1)}
                          className="w-10 h-10 bg-zinc-950 hover:bg-zinc-900 border border-zinc-855 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white transition-all disabled:opacity-40"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-bold text-zinc-200 w-8 text-center">{bookingQuantity}</span>
                        <button
                          type="button"
                          onClick={() => setBookingQuantity(prev => prev + 1)}
                          className="w-10 h-10 bg-zinc-950 hover:bg-zinc-900 border border-zinc-855 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white transition-all"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Service Address */}
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">Service Address</label>
                      <input
                        type="text"
                        required
                        value={bookingAddress}
                        onChange={(e) => setBookingAddress(e.target.value)}
                        placeholder="Enter complete house address/landmark"
                        className="w-full h-11 px-3 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-primary/60 focus:border-primary/60"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Instructions & Notes</label>
                        <button
                          type="button"
                          onClick={() => setIsAIAssistOpen(true)}
                          className="inline-flex items-center gap-1 text-[10px] font-extrabold text-primary hover:text-zinc-950 transition-all bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/45 px-2 py-0.5 rounded-lg active:scale-95 cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                          <span>AI Assist</span>
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={bookingDesc}
                        onChange={(e) => setBookingDesc(e.target.value)}
                        placeholder="Describe issues or requirements..."
                        className="w-full p-3 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-primary/60 focus:border-primary/60 resize-none"
                      />
                    </div>

                    {/* Payment details */}
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">Payment Method</label>
                      <div className="h-11 border border-primary/25 rounded-xl text-xs font-semibold flex items-center justify-start px-4 gap-2 bg-primary/5 text-primary">
                        <Shield className="w-4 h-4 text-primary shrink-0" />
                        <span>Razorpay Split Payment (Secured, pay after service completion)</span>
                      </div>
                    </div>

                    {/* Billing calculations */}
                    {selectedService && (
                      <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 space-y-2">
                        <div className="flex justify-between text-[11px] text-zinc-400">
                          <span>Base Fare ({selectedService.name})</span>
                          <span>₹{selectedService.price}</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-zinc-400">
                          <span>Quantity</span>
                          <span>x{bookingQuantity}</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-zinc-400 border-b border-zinc-850 pb-2">
                          <span>Taxes & Service Fees</span>
                          <span className="text-emerald-450 font-medium">Included</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-zinc-200 pt-1">
                          <span>Estimated Final Total</span>
                          <span className="text-primary font-sans text-sm">₹{(selectedService.price * bookingQuantity).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    )}

                    <div className="pt-2 flex gap-3">
                      <button
                        type="button"
                        onClick={handleCloseBooking}
                        className="flex-1 h-11 bg-zinc-855 hover:bg-zinc-800 text-zinc-350 font-semibold rounded-xl text-xs transition-all border border-zinc-750"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={bookingSubmitLoading || !selectedService}
                        className="flex-1 h-11 bg-primary hover:bg-primary/95 text-black font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-98 disabled:opacity-40"
                      >
                        {bookingSubmitLoading && <Loader2 className="w-4 h-4 animate-spin text-black" />}
                        Confirm Booking
                      </button>
                    </div>
                  </>
                )}
              </form>
            )}
          </div>
        </div>
      )}

      {/* AI Booking Assistant Modal */}
      <AIBookingAssistant
        isOpen={isAIAssistOpen}
        onClose={() => setIsAIAssistOpen(false)}
        onApply={(text) => setBookingDesc(text)}
      />
    </div>
  );
}
