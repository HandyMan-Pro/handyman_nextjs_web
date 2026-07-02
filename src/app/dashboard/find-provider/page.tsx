'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/apiClient';
import { getUserData } from '../../../lib/auth';
import {
  Search, Star, ShieldCheck, Mail, Phone, Calendar, Clock,
  MapPin, IndianRupee, Tag, Shield, Loader2, Sparkles,
  CheckCircle, Wrench, X, MessageSquare, Plus, Minus
} from 'lucide-react';

interface Provider {
  id: string;
  display_name: string;
  email: string;
  phone?: string;
  status: number;
  is_verified?: boolean;
  rating?: number;
  user_type: string;
  address?: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
}

export default function FindProviderPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');

  // Booking Modal State
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTimeSlot, setBookingTimeSlot] = useState('10:00 AM');
  const [bookingQuantity, setBookingQuantity] = useState(1);
  const [bookingAddress, setBookingAddress] = useState('');
  const [bookingDesc, setBookingDesc] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [bookingSubmitLoading, setBookingSubmitLoading] = useState(false);

  useEffect(() => {
    fetchProvidersAndServices();
    // Pre-populate address from user profile
    const u = getUserData();
    if (u && u.address) {
      setBookingAddress(u.address);
    }
  }, []);

  const fetchProvidersAndServices = async () => {
    setLoading(true);
    try {
      const [provRes, svcRes] = await Promise.all([
        apiClient.get('/providers'),
        apiClient.get('/services')
      ]);

      const activeProviders = (provRes.data || []).filter(
        (p: Provider) => p.user_type === 'provider' && p.status === 1
      );
      setProviders(activeProviders);
      setServices(svcRes.data || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch directory data.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBooking = (provider: Provider) => {
    setSelectedProvider(provider);
    if (services.length > 0) {
      setSelectedService(services[0]);
    }
    setIsBookingModalOpen(true);
  };

  const handleCloseBooking = () => {
    setSelectedProvider(null);
    setSelectedService(null);
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
        service_id: selectedService.id,
        provider_id: selectedProvider.id,
        description: bookingDesc,
        address: bookingAddress,
        date: `${bookingDate} ${bookingTimeSlot}`,
        amount: basePrice,
        quantity: bookingQuantity,
        total_amount: totalAmount,
        type: 'service',
        payment_method: paymentMethod
      };

      await apiClient.post('/booking-save', payload);
      setSuccessMsg('Your booking has been registered successfully!');
      setTimeout(() => {
        handleCloseBooking();
      }, 2500);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to submit booking request.');
    } finally {
      setBookingSubmitLoading(false);
    }
  };

  const filteredProviders = providers.filter(p =>
    p.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.address || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-zinc-100">
            <Sparkles className="w-5 h-5 text-indigo-500 fill-indigo-500/20" />
            Find Service Providers
          </h1>
          <p className="text-zinc-400 text-sm mt-0.5">Browse top-rated professionals and schedule a home service instantly.</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center border-b border-zinc-800/60 pb-5">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by provider name, location..."
            className="w-full h-11 pl-10 pr-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/55 transition-all"
          />
        </div>
      </div>

      {error && !isBookingModalOpen && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-4 py-3 text-sm animate-fade-in flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-zinc-500 hover:text-white">
            <X className="w-4.5 h-4.5" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-zinc-900/40 border border-zinc-850 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.map((p) => (
            <div
              key={p.id}
              className="group relative bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-5 hover:border-zinc-700/50 hover:bg-zinc-900/70 transition-all duration-300 flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex justify-between items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-650/10 border border-indigo-500/20 flex items-center justify-center font-bold text-indigo-400 text-lg group-hover:scale-105 transition-transform duration-300">
                    {p.display_name.charAt(0)}
                  </div>
                  <div className="flex gap-1.5 items-center">
                    <div className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg text-xs font-semibold text-amber-400">
                      <Star className="w-3 h-3 fill-current" />
                      <span>{p.rating ?? '5.0'}</span>
                    </div>
                    {p.is_verified && (
                      <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-lg text-xs font-semibold flex items-center gap-0.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Verified
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-base font-bold text-zinc-150 group-hover:text-white transition-colors">
                    {p.display_name}
                  </h3>
                  <p className="text-zinc-500 text-xs mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {p.address || 'Pan India Service'}
                  </p>
                </div>

                <div className="mt-4 space-y-2 border-t border-zinc-850 pt-4 text-xs text-zinc-400">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{p.email}</span>
                  </div>
                  {p.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{p.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5">
                <button
                  onClick={() => handleOpenBooking(p)}
                  className="w-full h-10 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-indigo-650/10"
                >
                  <Wrench className="w-4 h-4" />
                  Book Partner
                </button>
              </div>
            </div>
          ))}

          {filteredProviders.length === 0 && (
            <div className="col-span-full py-16 text-center bg-zinc-900/20 border border-zinc-800/40 rounded-2xl">
              <Wrench className="w-10 h-10 text-zinc-655 mx-auto mb-3" />
              <p className="text-zinc-500 text-sm">No active service providers match your search.</p>
            </div>
          )}
        </div>
      )}

      {/* Booking Form Dialog Modal */}
      {isBookingModalOpen && selectedProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={handleCloseBooking} />
          
          <div className="relative z-10 w-full max-w-lg bg-zinc-900 border border-zinc-800/80 rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  Schedule Service Appointment
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">Booking with {selectedProvider.display_name}</p>
              </div>
              <button onClick={handleCloseBooking} className="text-zinc-450 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {successMsg ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-zinc-205">Booking Registered!</h4>
                <p className="text-sm text-zinc-400">{successMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleCreateBooking} className="space-y-4">
                {error && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-4 py-2.5 text-xs">
                    {error}
                  </div>
                )}

                {/* Service Selection */}
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">Select Service</label>
                  <select
                    value={selectedService?.id || ''}
                    onChange={(e) => {
                      const svc = services.find(s => s.id === e.target.value);
                      if (svc) setSelectedService(svc);
                    }}
                    className="w-full h-11 px-3 bg-zinc-850/60 border border-zinc-800/80 rounded-xl text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/60"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id} className="bg-zinc-900">
                        {s.name} (₹{s.price})
                      </option>
                    ))}
                    {services.length === 0 && (
                      <option value="">No services cataloged</option>
                    )}
                  </select>
                </div>

                {/* Date & Time slot */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">Preferred Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type="date"
                        required
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full h-11 pl-10 pr-3 bg-zinc-850/60 border border-zinc-800/80 rounded-xl text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/60"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">Time Slot</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <select
                        value={bookingTimeSlot}
                        onChange={(e) => setBookingTimeSlot(e.target.value)}
                        className="w-full h-11 pl-10 pr-3 bg-zinc-850/60 border border-zinc-800/80 rounded-xl text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/60"
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
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">Quantity / Hours</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={bookingQuantity <= 1}
                      onClick={() => setBookingQuantity(prev => prev - 1)}
                      className="w-10 h-10 bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 rounded-lg flex items-center justify-center text-zinc-450 hover:text-white transition-all disabled:opacity-40"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-bold text-zinc-200 w-8 text-center">{bookingQuantity}</span>
                    <button
                      type="button"
                      onClick={() => setBookingQuantity(prev => prev + 1)}
                      className="w-10 h-10 bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 rounded-lg flex items-center justify-center text-zinc-450 hover:text-white transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Location Address */}
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">Service Address</label>
                  <input
                    type="text"
                    required
                    value={bookingAddress}
                    onChange={(e) => setBookingAddress(e.target.value)}
                    placeholder="Enter complete house address/landmark"
                    className="w-full h-11 px-3 bg-zinc-850/60 border border-zinc-800/80 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/60"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">Additional details/Instructions</label>
                  <textarea
                    rows={2}
                    value={bookingDesc}
                    onChange={(e) => setBookingDesc(e.target.value)}
                    placeholder="Describe issues, instructions or requirements..."
                    className="w-full p-3 bg-zinc-850/60 border border-zinc-800/80 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/60 resize-none"
                  />
                </div>

                {/* Payment Option */}
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">Payment Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('COD')}
                      className={`h-11 border rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                        paymentMethod === 'COD'
                          ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400'
                          : 'bg-zinc-850/65 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <IndianRupee className="w-4 h-4" />
                      Cash on Delivery
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Online')}
                      className={`h-11 border rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                        paymentMethod === 'Online'
                          ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400'
                          : 'bg-zinc-850/65 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Tag className="w-4 h-4" />
                      Pay Online (Card/UPI)
                    </button>
                  </div>
                </div>

                {/* Summary Box */}
                <div className="bg-zinc-850/40 p-4 rounded-xl border border-zinc-800/50 space-y-2">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Base Fare ({selectedService?.name})</span>
                    <span>₹{selectedService?.price || 0}</span>
                  </div>
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Quantity</span>
                    <span>x{bookingQuantity}</span>
                  </div>
                  <div className="flex justify-between text-xs text-zinc-400 border-b border-zinc-800/80 pb-2">
                    <span>Service Fee & Tax (CGST/SGST)</span>
                    <span className="text-emerald-500">Free / Inclusive</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-zinc-200 pt-1">
                    <span>Total Amount</span>
                    <span className="text-indigo-400">₹{((selectedService?.price || 0) * bookingQuantity).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={handleCloseBooking}
                    className="flex-1 h-11 bg-zinc-850 hover:bg-zinc-800 text-zinc-350 font-semibold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bookingSubmitLoading}
                    className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-indigo-650/15"
                  >
                    {bookingSubmitLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Confirm Booking
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
