'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/apiClient';
import { getUserData } from '../../../lib/auth';
import {
  Search, Star, ShieldCheck, Mail, Phone, Calendar, Clock,
  MapPin, IndianRupee, Tag, Shield, Loader2, Sparkles,
  CheckCircle, Wrench, X, Plus, Minus, SlidersHorizontal,
  Compass, Map, AlertCircle, RefreshCw
} from 'lucide-react';

interface ProviderService {
  service_id: string;
  name: string;
  category: string;
  price: number;
  status: number;
}

interface Provider {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  display_name?: string;
  email: string;
  contact_number?: string;
  address?: string;
  profile_image?: string;
  provider_type?: string;
  experience_years?: number;
  designation?: string;
  is_available: number;
  verification_status?: string;
  distance_km: number;
  rating: number;
  services: ProviderService[];
}

export default function FindProviderPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  
  // Geolocation & Radius
  const [locateMe, setLocateMe] = useState(false);
  const [locating, setLocating] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState(20);

  // Booking Modal State
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [selectedService, setSelectedService] = useState<ProviderService | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTimeSlot, setBookingTimeSlot] = useState('10:00 AM');
  const [bookingQuantity, setBookingQuantity] = useState(1);
  const [bookingAddress, setBookingAddress] = useState('');
  const [bookingDesc, setBookingDesc] = useState('');
  const [bookingSubmitLoading, setBookingSubmitLoading] = useState(false);

  // Fetch Providers when filters, mode, or coordinates change
  useEffect(() => {
    if (locateMe) {
      if (coords) {
        fetchNearbyProviders(coords.lat, coords.lng);
      } else {
        requestGeolocation();
      }
    } else {
      fetchSearchProviders();
    }
  }, [searchQuery, category, minPrice, maxPrice, locateMe, coords, radiusKm]);

  useEffect(() => {
    // Pre-populate address from user profile
    const u = getUserData();
    if (u && u.address) {
      setBookingAddress(u.address);
    }
  }, []);

  const requestGeolocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLocateMe(false);
      return;
    }

    setLocating(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCoords({ lat, lng });
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        setLocateMe(false);
        setError(`Failed to retrieve location: ${err.message}. Please search manually.`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const fetchSearchProviders = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (searchQuery) params.q = searchQuery;
      if (category) params.category = category;
      if (minPrice !== '') params.min_price = minPrice;
      if (maxPrice !== '') params.max_price = maxPrice;

      const res = await apiClient.get('/customer/search', { params });
      setProviders(res.data || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to search providers.');
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyProviders = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const params: any = {
        lat,
        lng,
        radius_km: radiusKm,
      };
      if (category) params.category = category;

      const res = await apiClient.get('/customer/nearby', { params });
      setProviders(res.data || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to find nearby providers.');
    } finally {
      setLoading(false);
    }
  };

  // Safe client-side filters for locating mode (since coordinates endpoint filters category, but not price range/q)
  const getFilteredProvidersList = () => {
    if (!locateMe) return providers;
    
    return providers.filter(p => {
      // Keyword filter
      if (searchQuery) {
        const qLower = searchQuery.toLowerCase();
        const matchesProvider = 
          p.display_name?.toLowerCase().includes(qLower) ||
          p.first_name.toLowerCase().includes(qLower) ||
          p.last_name.toLowerCase().includes(qLower) ||
          p.designation?.toLowerCase().includes(qLower) ||
          p.address?.toLowerCase().includes(qLower);
        
        const matchesService = p.services.some(s => 
          s.name.toLowerCase().includes(qLower) || s.category.toLowerCase().includes(qLower)
        );

        if (!matchesProvider && !matchesService) return false;
      }

      // Price filter
      if (minPrice !== '') {
        const hasMin = p.services.some(s => s.price >= minPrice);
        if (!hasMin) return false;
      }
      if (maxPrice !== '') {
        const hasMax = p.services.some(s => s.price <= maxPrice);
        if (!hasMax) return false;
      }

      return true;
    });
  };

  const handleOpenBooking = (provider: Provider) => {
    setSelectedProvider(provider);
    if (provider.services && provider.services.length > 0) {
      setSelectedService(provider.services[0]);
    } else {
      setSelectedService(null);
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

  const handleToggleLocateMe = () => {
    if (!locateMe) {
      setLocateMe(true);
    } else {
      setLocateMe(false);
      setCoords(null);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setLocateMe(false);
    setCoords(null);
    setError('');
  };

  const filteredProvidersList = getFilteredProvidersList();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-850 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-zinc-100">
            <Compass className="w-6 h-6 text-primary" />
            Find Service Providers
          </h1>
          <p className="text-zinc-400 text-sm mt-0.5">
            Search for certified handymen or discover local providers nearby using GPS location.
          </p>
        </div>
        
        {/* Mode Indicator badge */}
        <div className="flex items-center gap-2">
          {locateMe && coords ? (
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-medium animate-pulse">
              <Map className="w-3.5 h-3.5" />
              Nearby Mode (Active)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full text-xs font-medium border border-zinc-700/30">
              <Search className="w-3.5 h-3.5" />
              Global Directory Mode
            </span>
          )}
        </div>
      </div>

      {/* Main content grid */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Filter panel sidebar */}
        <div className="w-full lg:w-80 shrink-0 bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-5 space-y-6 shadow-xl sticky top-24">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-zinc-350 flex items-center gap-2 uppercase tracking-wider">
              <SlidersHorizontal className="w-4 h-4 text-primary" />
              Refine Search
            </h2>
            {(searchQuery || category || minPrice !== '' || maxPrice !== '' || locateMe) && (
              <button 
                onClick={handleResetFilters}
                className="text-xs text-primary hover:underline font-semibold"
              >
                Reset All
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Search query */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-400">Keyword Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Service, name, category..."
                  className="w-full h-10 pl-9 pr-8 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-zinc-250 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary/60 focus:border-primary/60 transition-all"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Category selection */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-400">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-primary/60 focus:border-primary/60"
              >
                <option value="">All Categories</option>
                <option value="Plumbing">Plumbing</option>
                <option value="AC Repair">AC Repair & Service</option>
                <option value="Electrical">Electrical Work</option>
                <option value="Cleaning">Cleaning & Sanitization</option>
                <option value="Carpentry">Carpentry</option>
                <option value="Painting">Painting & Wallpaper</option>
                <option value="Appliance">Appliance Repair</option>
              </select>
            </div>

            {/* Locate Me (Nearby) toggle switch */}
            <div className="pt-3 border-t border-zinc-850 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-zinc-300 font-sans">Locate Me (Nearby)</span>
                  <p className="text-[10px] text-zinc-500">Discover providers in your area</p>
                </div>
                <button
                  onClick={handleToggleLocateMe}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    locateMe ? 'bg-primary' : 'bg-zinc-800'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-zinc-950 shadow ring-0 transition duration-200 ease-in-out ${
                      locateMe ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Locate Me status & radius slider */}
              {locateMe && (
                <div className="space-y-3 p-3 bg-zinc-950/60 rounded-xl border border-zinc-850 animate-scale-in">
                  {locating ? (
                    <div className="flex items-center gap-2 text-xs text-zinc-400 py-1">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                      <span>Pinpointing coordinates...</span>
                    </div>
                  ) : coords ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-[10px] text-emerald-450 font-semibold">
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        <span>GPS locked successfully</span>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-zinc-400">
                          <span>Search Radius</span>
                          <span className="font-bold text-primary">{radiusKm} km</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="100"
                          step="5"
                          value={radiusKm}
                          onChange={(e) => setRadiusKm(Number(e.target.value))}
                          className="w-full accent-primary h-1 bg-zinc-850 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={requestGeolocation}
                      className="w-full h-8 bg-zinc-850 hover:bg-zinc-800 border border-zinc-805 text-[11px] font-semibold text-zinc-350 rounded-lg flex items-center justify-center gap-1.5 transition-all"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Retry Request
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Price limits */}
            <div className="pt-3 border-t border-zinc-850 space-y-2">
              <label className="text-[11px] font-bold text-zinc-400">Price Range (₹)</label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-500">Min price</span>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Min"
                    className="w-full h-9 px-2 bg-zinc-950 border border-zinc-850 rounded-lg text-xs text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-primary/60 focus:border-primary/60"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-500">Max price</span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Max"
                    className="w-full h-9 px-2 bg-zinc-950 border border-zinc-850 rounded-lg text-xs text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-primary/60 focus:border-primary/60"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results layout */}
        <div className="flex-1 w-full space-y-4">
          {/* Error Banner */}
          {error && !isBookingModalOpen && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-4 py-3 text-xs animate-scale-in flex justify-between items-center">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-450 shrink-0" />
                <span>{error}</span>
              </div>
              <button onClick={() => setError('')} className="text-zinc-550 hover:text-white shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Active search tags summary */}
          {(searchQuery || category || minPrice !== '' || maxPrice !== '' || locateMe) && (
            <div className="flex flex-wrap items-center gap-1.5 bg-zinc-900/20 border border-zinc-800/40 rounded-xl p-2 px-3 text-xs text-zinc-400">
              <span className="text-[10px] uppercase font-bold text-zinc-500 mr-1 tracking-wider">Filters:</span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-lg text-[10px] text-zinc-300">
                  "{searchQuery}"
                  <X className="w-2.5 h-2.5 text-zinc-500 hover:text-white cursor-pointer" onClick={() => setSearchQuery('')} />
                </span>
              )}
              {category && (
                <span className="inline-flex items-center gap-1 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-lg text-[10px] text-zinc-300">
                  {category}
                  <X className="w-2.5 h-2.5 text-zinc-500 hover:text-white cursor-pointer" onClick={() => setCategory('')} />
                </span>
              )}
              {(minPrice !== '' || maxPrice !== '') && (
                <span className="inline-flex items-center gap-1 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-lg text-[10px] text-zinc-300">
                  ₹{minPrice || 0} - ₹{maxPrice || '∞'}
                  <X className="w-2.5 h-2.5 text-zinc-500 hover:text-white cursor-pointer" onClick={() => { setMinPrice(''); setMaxPrice(''); }} />
                </span>
              )}
              {locateMe && (
                <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-lg text-[10px]">
                  Within {radiusKm}km
                  <X className="w-2.5 h-2.5 text-emerald-550 hover:text-emerald-300 cursor-pointer" onClick={() => { setLocateMe(false); setCoords(null); }} />
                </span>
              )}
            </div>
          )}

          {loading ? (
            /* Skeleton grid */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 animate-pulse">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-zinc-900/30 border border-zinc-850 rounded-2xl p-5 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="w-12 h-12 rounded-xl bg-zinc-800" />
                      <div className="w-20 h-5 bg-zinc-800 rounded-lg" />
                    </div>
                    <div className="h-5 bg-zinc-800 rounded-md w-3/4" />
                    <div className="h-3 bg-zinc-800 rounded-md w-1/2" />
                  </div>
                  <div className="h-9 bg-zinc-800 rounded-xl w-full" />
                </div>
              ))}
            </div>
          ) : filteredProvidersList.length > 0 ? (
            /* Provider Card grid */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProvidersList.map((p) => {
                const providerName = p.display_name || `${p.first_name} ${p.last_name}`;
                return (
                  <div
                    key={p.id}
                    className="group relative bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-5 hover:border-primary/40 hover:bg-zinc-900/70 transition-all duration-300 flex flex-col justify-between shadow-lg"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        {p.profile_image ? (
                          <img 
                            src={p.profile_image} 
                            alt={providerName} 
                            className="w-12 h-12 rounded-xl object-cover border border-zinc-850" 
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-900/20 to-indigo-650/10 border border-indigo-500/20 flex items-center justify-center font-bold text-primary text-sm group-hover:scale-105 transition-transform duration-300">
                            {providerName.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        
                        <div className="flex flex-col items-end gap-1.5">
                          <div className="flex gap-1 items-center">
                            <div className="inline-flex items-center gap-0.5 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-lg text-[10px] font-semibold text-amber-400">
                              <Star className="w-3 h-3 fill-current" />
                              <span>{p.rating > 0 ? p.rating : '5.0'}</span>
                            </div>
                            {p.verification_status?.toLowerCase() === 'verified' && (
                              <span className="bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded-lg text-[10px] font-semibold flex items-center gap-0.5">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Verified
                              </span>
                            )}
                          </div>
                          
                          {/* Distance indicator */}
                          {(locateMe || p.distance_km > 0) && (
                            <span className="text-[10px] text-zinc-500 font-medium flex items-center gap-0.5">
                              <Compass className="w-3 h-3 text-zinc-650 shrink-0" />
                              {p.distance_km} km away
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-4">
                        <h3 className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors line-clamp-1">
                          {providerName}
                        </h3>
                        <p className="text-zinc-500 text-[11px] mt-0.5">{p.designation || p.provider_type || 'Certified Professional'}</p>
                        <p className="text-zinc-400 text-[11px] mt-2.5 flex items-center gap-1 line-clamp-1">
                          <MapPin className="w-3.5 h-3.5 text-zinc-650 shrink-0" />
                          {p.address || 'Address not listed'}
                        </p>
                      </div>

                      {/* Provider services pills */}
                      {p.services && p.services.length > 0 && (
                        <div className="mt-4 border-t border-zinc-850 pt-3 space-y-1.5">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-550">Active Services:</span>
                          <div className="flex flex-wrap gap-1">
                            {p.services.slice(0, 3).map((s) => (
                              <span 
                                key={s.service_id} 
                                className="inline-flex items-center gap-1 bg-zinc-950 border border-zinc-850 px-2 py-0.5 rounded-md text-[10px] text-zinc-350"
                              >
                                <Tag className="w-2.5 h-2.5 text-primary shrink-0" />
                                <span className="truncate max-w-[100px]">{s.name}</span>
                                <span className="text-zinc-500 font-semibold">₹{s.price}</span>
                              </span>
                            ))}
                            {p.services.length > 3 && (
                              <span className="inline-flex items-center bg-zinc-950 border border-zinc-850 px-1.5 py-0.5 rounded-md text-[9px] text-zinc-500 font-bold">
                                +{p.services.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-5">
                      <button
                        onClick={() => handleOpenBooking(p)}
                        className="w-full h-9 bg-primary hover:bg-primary/95 text-black font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-98"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        Book Now
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="py-16 text-center bg-zinc-900/10 border border-zinc-850 rounded-2xl space-y-3">
              <Compass className="w-12 h-12 text-zinc-700 mx-auto animate-pulse-slow" />
              <h3 className="text-sm font-bold text-zinc-300">No Providers Found</h3>
              <p className="text-zinc-500 text-xs max-w-sm mx-auto leading-relaxed px-4">
                {locateMe 
                  ? `We couldn't find any certified providers within a ${radiusKm}km radius of your location. Try widening the search radius or selecting a different category.`
                  : "No service providers matched your filters. Try clearing your search keyword, adjusting the price thresholds, or switching category."
                }
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 h-9 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 font-semibold rounded-xl text-xs border border-zinc-750 transition-all"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Booking Form Dialog Modal */}
      {isBookingModalOpen && selectedProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={handleCloseBooking} />
          
          <div className="relative z-10 w-full max-w-lg bg-zinc-900 border border-zinc-800/85 rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh] animate-scale-in">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-4 mb-4">
              <div>
                <h3 className="text-sm font-bold text-zinc-150 flex items-center gap-2 uppercase tracking-wide">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Schedule Service Appointment
                </h3>
                <p className="text-xs text-zinc-450 mt-0.5">Booking partner: {selectedProvider.display_name || `${selectedProvider.first_name} ${selectedProvider.last_name}`}</p>
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
                <h4 className="text-base font-bold text-zinc-200">Appointment Requested!</h4>
                <p className="text-sm text-zinc-400">{successMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleCreateBooking} className="space-y-4">
                {error && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-450 rounded-xl px-4 py-2.5 text-xs flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Service Selection */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">Select Service</label>
                  <select
                    value={selectedService?.service_id || ''}
                    onChange={(e) => {
                      const svc = selectedProvider.services.find(s => s.service_id === e.target.value);
                      if (svc) setSelectedService(svc);
                    }}
                    className="w-full h-11 px-3 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-primary/60 focus:border-primary/60"
                  >
                    {selectedProvider.services.map((s) => (
                      <option key={s.service_id} value={s.service_id} className="bg-zinc-900">
                        {s.name} (₹{s.price})
                      </option>
                    ))}
                    {(!selectedProvider.services || selectedProvider.services.length === 0) && (
                      <option value="">No services cataloged</option>
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
                        className="w-full h-11 pl-10 pr-3 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-zinc-250 focus:outline-none focus:ring-1 focus:ring-primary/60"
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
                      className="w-10 h-10 bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white transition-all disabled:opacity-40"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-bold text-zinc-200 w-8 text-center">{bookingQuantity}</span>
                    <button
                      type="button"
                      onClick={() => setBookingQuantity(prev => prev + 1)}
                      className="w-10 h-10 bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white transition-all"
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
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">Instructions & Notes</label>
                  <textarea
                    rows={2}
                    value={bookingDesc}
                    onChange={(e) => setBookingDesc(e.target.value)}
                    placeholder="Describe issue details or special access instructions..."
                    className="w-full p-3 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-primary/60 focus:border-primary/60 resize-none"
                  />
                </div>

                {/* Payment Option - Fixed to Razorpay Post-Service OTP completion */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">Payment Method</label>
                  <div className="h-11 border border-primary/20 rounded-xl text-xs font-semibold flex items-center justify-start px-4 gap-2 bg-primary/5 text-primary">
                    <Shield className="w-4 h-4 text-primary shrink-0" />
                    <span>Razorpay Split Payment (Secured, pay after OTP service check)</span>
                  </div>
                </div>

                {/* Booking summary billing calculations */}
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 space-y-2">
                  <div className="flex justify-between text-[11px] text-zinc-400">
                    <span>Base Fare ({selectedService?.name || 'Service'})</span>
                    <span>₹{selectedService?.price || 0}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-zinc-400">
                    <span>Quantity</span>
                    <span>x{bookingQuantity}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-zinc-400 border-b border-zinc-850 pb-2">
                    <span>GST (CGST/SGST) & Booking Fees</span>
                    <span className="text-emerald-450 font-medium">Included</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-zinc-200 pt-1">
                    <span>Estimated Final Total</span>
                    <span className="text-primary font-sans text-sm">₹{((selectedService?.price || 0) * bookingQuantity).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={handleCloseBooking}
                    className="flex-1 h-11 bg-zinc-850 hover:bg-zinc-800 text-zinc-350 font-semibold rounded-xl text-xs transition-all border border-zinc-750"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bookingSubmitLoading}
                    className="flex-1 h-11 bg-primary hover:bg-primary/95 text-black font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-98"
                  >
                    {bookingSubmitLoading && <Loader2 className="w-4 h-4 animate-spin text-black" />}
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
