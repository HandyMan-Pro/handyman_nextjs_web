'use client';

import { useEffect, useState, useRef } from 'react';
import { apiClient } from '../../../lib/apiClient';
import { getUserData } from '../../../lib/auth';
import {
  MapPin, Star, ShieldCheck, Mail, Phone, Calendar, Clock,
  IndianRupee, Tag, Shield, Loader2, Sparkles, Navigation,
  CheckCircle, Wrench, X, Plus, Minus, Search
} from 'lucide-react';
import AIBookingAssistant from '../../../components/AIBookingAssistant';

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
  distance?: number; // Mock distance in km
  lat?: number;
  lng?: number;
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
}

export default function FindNearbyProviderPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Coordinates
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [mapResolvedAddress, setMapResolvedAddress] = useState('');

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
  const [isAIAssistOpen, setIsAIAssistOpen] = useState(false);

  // Google Maps Refs & Script State
  const mapRef = useRef<HTMLDivElement>(null);
  const autocompleteInputRef = useRef<HTMLInputElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const mapInstanceRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const providerMarkersRef = useRef<any[]>([]);
  const scanCirclesRef = useRef<any[]>([]);
  const scanIntervalRef = useRef<any>(null);

  // Load Google Maps SDK with Places library
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Define callback globally
    (window as any).initGoogleMapCallback = () => {
      setMapLoaded(true);
    };

    const scriptId = 'google-maps-script';
    const existingScript = document.getElementById(scriptId);

    if (existingScript) {
      const src = existingScript.getAttribute('src') || '';
      // If the script exists but is missing the places library, remove it
      if (!src.includes('libraries=places')) {
        existingScript.remove();
        try {
          delete (window as any).google;
        } catch (e) {}
      } else {
        // Correct script is present; check if ready, otherwise poll
        if ((window as any).google && (window as any).google.maps && (window as any).google.maps.places) {
          setMapLoaded(true);
        } else {
          const interval = setInterval(() => {
            if ((window as any).google && (window as any).google.maps && (window as any).google.maps.places) {
              setMapLoaded(true);
              clearInterval(interval);
            }
          }, 100);
          return () => clearInterval(interval);
        }
        return;
      }
    }

    // Append script with Places library
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMapCallback`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    // Attempt to automatically get location
    handleGetLocation();
    fetchServices();
  }, []);

  // Reverse Geocoding Coordinates to Address String
  const reverseGeocode = (c: { lat: number; lng: number }) => {
    if (typeof window === 'undefined' || !(window as any).google || !(window as any).google.maps) return;
    const geocoder = new (window as any).google.maps.Geocoder();
    geocoder.geocode({ location: c }, (results: any, status: any) => {
      if (status === 'OK' && results[0]) {
        const address = results[0].formatted_address;
        setMapResolvedAddress(address);
        if (autocompleteInputRef.current) {
          autocompleteInputRef.current.value = address;
        }
      }
    });
  };

  // Initialize Map once
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || typeof window === 'undefined' || mapInstanceRef.current) return;

    const initialCoords = coords || { lat: 22.5726, lng: 88.3639 }; // Default Kolkata
    if (!coords) {
      setCoords(initialCoords);
      reverseGeocode(initialCoords);
      fetchProviders(initialCoords);
    }

    const mapOptions = {
      center: initialCoords,
      zoom: 14,
      styles: [
        { "elementType": "geometry", "stylers": [{ "color": "#18181b" }] },
        { "elementType": "labels.text.stroke", "stylers": [{ "color": "#18181b" }] },
        { "elementType": "labels.text.fill", "stylers": [{ "color": "#71717a" }] },
        { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#27272a" }] },
        { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#a1a1aa" }] },
        { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#141417" }] },
        { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#27272a" }] },
        { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#18181b" }] },
        { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#52525b" }] },
        { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#09090b" }] }
      ],
      disableDefaultUI: true,
      zoomControl: true,
    };

    const googleMap = new (window as any).google.maps.Map(mapRef.current, mapOptions);
    mapInstanceRef.current = googleMap;

    // Create User Marker (Draggable) - Map Pin style
    const userMarker = new (window as any).google.maps.Marker({
      position: initialCoords,
      map: googleMap,
      title: "Your Location (Drag to change)",
      draggable: true,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="36" height="48" viewBox="0 0 36 48"><defs><filter id="s" x="-20%" y="-10%" width="140%" height="130%"><feDropShadow dx="0" dy="1.5" stdDeviation="2" flood-color="#000" flood-opacity="0.3"/></filter></defs><path d="M18 0C8.06 0 0 8.06 0 18c0 14 18 30 18 30s18-16 18-30C36 8.06 27.94 0 18 0z" fill="#EA4335" filter="url(#s)"/><circle cx="18" cy="18" r="7.5" fill="#B72A1F"/><circle cx="18" cy="18" r="5.5" fill="white"/></svg>`),
        scaledSize: new (window as any).google.maps.Size(36, 48),
        anchor: new (window as any).google.maps.Point(18, 48),
      }
    });
    userMarkerRef.current = userMarker;

    // Drag Listener to update location coordinates + restart scan at pin
    userMarker.addListener('dragend', () => {
      const position = userMarker.getPosition();
      if (position) {
        const newCoords = { lat: position.lat(), lng: position.lng() };
        setCoords(newCoords);
        reverseGeocode(newCoords);
        fetchProviders(newCoords);
        // Restart scan centered on the dragged pin position
        startScanAnimation(googleMap, newCoords);
      }
    });

    // --- Radar Scanning Animation (10km pulse) ---
    startScanAnimation(googleMap, initialCoords);

  }, [mapLoaded]);

  // Radar scan animation function
  const startScanAnimation = (map: any, center: { lat: number; lng: number }) => {
    // Clean up previous scan
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    scanCirclesRef.current.forEach(c => c.setMap(null));
    scanCirclesRef.current = [];

    const google = (window as any).google;
    const MAX_RADIUS = 10000; // 10km in meters
    const NUM_WAVES = 2;
    const CYCLE_MS = 8000; // slow 8s full cycle for smooth visual
    const FPS = 24;
    const INTERVAL = 1000 / FPS;

    // Create wave circles
    const waves: { circle: any; phase: number }[] = [];
    for (let i = 0; i < NUM_WAVES; i++) {
      const circle = new google.maps.Circle({
        center,
        radius: 0,
        map,
        strokeColor: '#6366f1',
        strokeOpacity: 0.6,
        strokeWeight: 1.5,
        fillColor: '#6366f1',
        fillOpacity: 0.08,
        clickable: false,
        zIndex: 0,
      });
      waves.push({ circle, phase: i / NUM_WAVES });
      scanCirclesRef.current.push(circle);
    }

    // Static boundary ring at 10km
    const boundaryCircle = new google.maps.Circle({
      center,
      radius: MAX_RADIUS,
      map,
      strokeColor: '#6366f1',
      strokeOpacity: 0.15,
      strokeWeight: 1,
      fillColor: 'transparent',
      fillOpacity: 0,
      clickable: false,
      zIndex: 0,
    });
    scanCirclesRef.current.push(boundaryCircle);

    let t = 0;
    scanIntervalRef.current = setInterval(() => {
      t += INTERVAL;
      const progress = (t % CYCLE_MS) / CYCLE_MS; // 0..1

      waves.forEach(({ circle, phase }) => {
        const waveProgress = (progress + phase) % 1;
        const radius = waveProgress * MAX_RADIUS;
        const opacity = Math.max(0, 0.25 * (1 - waveProgress));
        const strokeOp = Math.max(0, 0.6 * (1 - waveProgress));

        circle.setRadius(radius);
        circle.setOptions({
          fillOpacity: opacity,
          strokeOpacity: strokeOp,
        });
      });
    }, INTERVAL);
  };

  // Handle coordinates changes (centers map, positions user marker, restarts scan)
  useEffect(() => {
    if (!mapInstanceRef.current || !userMarkerRef.current || !coords) return;

    const markerPos = userMarkerRef.current.getPosition();
    if (markerPos) {
      const latDiff = Math.abs(markerPos.lat() - coords.lat);
      const lngDiff = Math.abs(markerPos.lng() - coords.lng);
      // Update only if change is significant to avoid circular loops
      if (latDiff > 0.0001 || lngDiff > 0.0001) {
        userMarkerRef.current.setPosition(coords);
        mapInstanceRef.current.panTo(coords);
        // Restart scanning animation at new position
        startScanAnimation(mapInstanceRef.current, coords);
      }
    }
  }, [coords]);

  // Cleanup scan interval on unmount
  useEffect(() => {
    return () => {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
      scanCirclesRef.current.forEach(c => c.setMap(null));
    };
  }, []);

  // Initialize Places Autocomplete Address input
  useEffect(() => {
    if (!mapLoaded || !autocompleteInputRef.current || typeof window === 'undefined') return;

    const autocomplete = new (window as any).google.maps.places.Autocomplete(autocompleteInputRef.current, {
      types: ['geocode', 'establishment'],
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        const newCoords = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        setCoords(newCoords);
        setMapResolvedAddress(place.formatted_address || '');
        fetchProviders(newCoords);
      }
    });
  }, [mapLoaded]);

  // Update Provider Markers on map
  useEffect(() => {
    if (!mapInstanceRef.current || typeof window === 'undefined') return;

    // Remove old markers
    providerMarkersRef.current.forEach(m => m.setMap(null));
    providerMarkersRef.current = [];

    // Plot new markers
    providers.forEach(p => {
      if (!p.lat || !p.lng) return;

      const marker = new (window as any).google.maps.Marker({
        position: { lat: p.lat, lng: p.lng },
        map: mapInstanceRef.current,
        title: p.display_name,
        icon: {
          path: (window as any).google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: "#10b981",
          fillOpacity: 0.9,
          strokeColor: "#ffffff",
          strokeWeight: 1,
        }
      });

      const infoWindow = new (window as any).google.maps.InfoWindow({
        content: `
          <div style="color: #18181b; padding: 6px; font-family: sans-serif; min-width: 140px;">
            <h4 style="font-weight: 700; margin: 0 0 2px 0; font-size: 13px;">${p.display_name}</h4>
            <p style="font-size: 11px; margin: 0 0 8px 0; color: #4b5563;">${p.distance !== undefined ? `Distance: ${p.distance} km` : 'Nearby provider'}</p>
            <button id="map-book-btn-${p.id}" style="background: #4f46e5; color: #ffffff; border: none; width: 100%; padding: 6px 10px; border-radius: 6px; font-size: 11px; cursor: pointer; font-weight: 600; text-align: center;">
              Book Now
            </button>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, marker);

        // Bind click handler inside window domready
        (window as any).google.maps.event.addListener(infoWindow, 'domready', () => {
          const btn = document.getElementById(`map-book-btn-${p.id}`);
          if (btn) {
            btn.onclick = () => {
              handleOpenBooking(p);
            };
          }
        });
      });

      providerMarkersRef.current.push(marker);
    });
  }, [providers]);

  const handleGetLocation = () => {
    setLocating(true);
    setError('');
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      const fallback = { lat: 22.5726, lng: 88.3639 }; // Default Kolkata
      setCoords(fallback);
      reverseGeocode(fallback);
      fetchProviders(fallback);
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const c = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setCoords(c);
        reverseGeocode(c);
        fetchProviders(c);
        setLocating(false);
      },
      (err) => {
        console.error(err);
        // Fallback coordinates
        const fallbackCoords = { lat: 22.5726, lng: 88.3639 };
        setCoords(fallbackCoords);
        reverseGeocode(fallbackCoords);
        fetchProviders(fallbackCoords);
        setLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const fetchServices = async () => {
    try {
      const res = await apiClient.get('/services');
      setServices(res.data || []);
    } catch (err) {
      console.error('Failed to load services', err);
    }
  };

  const fetchProviders = async (userCoords: { lat: number; lng: number }) => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/providers/nearby?lat=${userCoords.lat}&lng=${userCoords.lng}`);
      const data: any[] = res.data?.data || [];

      const mapped: Provider[] = data.map((p: any) => ({
        ...p,
        lat: p.latitude ?? undefined,
        lng: p.longitude ?? undefined,
        distance: p.distance_km ?? undefined,
      }));

      setProviders(mapped);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to search nearby providers.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBooking = (provider: Provider) => {
    setSelectedProvider(provider);
    if (services.length > 0) {
      setSelectedService(services[0]);
    }
    
    // Use resolved map address if user searched or dragged, otherwise fallback to profile address
    if (mapResolvedAddress) {
      setBookingAddress(mapResolvedAddress);
    } else {
      const u = getUserData();
      if (u && u.address) {
        setBookingAddress(u.address);
      }
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

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Animated Keyframes Injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes radar-sweep {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes radar-pulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.15); opacity: 0.8; }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 10px rgba(99, 102, 241, 0.1); }
          50% { box-shadow: 0 0 25px rgba(99, 102, 241, 0.25); }
        }
        .radar-sweep-line {
          animation: radar-sweep 4s linear infinite;
          transform-origin: bottom right;
        }
        .radar-pulse-1 {
          animation: radar-pulse 2s ease-in-out infinite;
        }
        .radar-pulse-2 {
          animation: radar-pulse 2s ease-in-out infinite 1s;
        }
        .glow-active {
          animation: glow-pulse 3s infinite;
        }
      `}} />

      {/* Header Panel */}
      <div className="bg-gradient-to-r from-zinc-900/60 to-zinc-950/20 border border-zinc-800/80 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-md shadow-lg">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-3 text-white">
            <span className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 flex items-center justify-center">
              <Navigation className="w-5 h-5 rotate-45 fill-indigo-500/20" />
            </span>
            Find Nearby Provider
          </h1>
          <p className="text-zinc-400 text-xs md:text-sm font-medium">
            Locate and connect with active, verified local service professionals in real-time.
          </p>
        </div>
        <button
          onClick={handleGetLocation}
          disabled={locating}
          className="flex items-center justify-center gap-2 h-11 px-5 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] disabled:scale-100 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-indigo-600/15"
        >
          {locating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5 rotate-45" />}
          {locating ? 'GPS Loading...' : 'Recalibrate Geolocation'}
        </button>
      </div>

      {/* Geolocation Info HUD Card */}
      <div className="bg-zinc-955 border border-zinc-850/80 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden group">
        {/* Glow accent */}
        <div className="absolute -top-16 -left-16 w-36 h-36 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-all duration-500" />
        
        <div className="space-y-3.5 z-10 w-full md:w-3/4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              GPS LOCK: ACTIVE
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-widest">
              RADIUS: 5.0 KM
            </span>
          </div>
          
          <h2 className="text-base md:text-lg font-bold text-zinc-100 leading-snug">
            {mapResolvedAddress || (coords ? 'Locating service coordinates...' : 'Waiting for GPS location data...')}
          </h2>
          
          {coords && (
            <div className="flex items-center gap-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3 font-mono text-xs w-fit max-w-full overflow-x-auto">
              <div className="flex items-center gap-1.5 text-zinc-400">
                <span className="text-indigo-400 font-bold">LAT:</span>
                <span>{coords.lat.toFixed(6)}° N</span>
              </div>
              <div className="h-3 w-[1px] bg-zinc-800" />
              <div className="flex items-center gap-1.5 text-zinc-400">
                <span className="text-indigo-400 font-bold">LNG:</span>
                <span>{coords.lng.toFixed(6)}° E</span>
              </div>
              <div className="h-3 w-[1px] bg-zinc-800 sm:block hidden" />
              <div className="text-zinc-500 sm:block hidden">
                Drag marker on map to customize center address
              </div>
            </div>
          )}
        </div>

        {/* Animated Scanning Radar HUD */}
        <div className="z-10 flex-shrink-0">
          <div className="relative w-28 h-28 flex items-center justify-center bg-zinc-950 border border-zinc-800/80 rounded-full overflow-hidden shadow-inner shadow-indigo-950/20">
            {/* Circular grid lines */}
            <div className="absolute inset-2 border border-indigo-500/5 rounded-full" />
            <div className="absolute inset-6 border border-indigo-500/5 rounded-full" />
            <div className="absolute inset-10 border border-indigo-500/5 rounded-full" />
            <div className="absolute inset-14 border border-indigo-500/5 rounded-full" />
            
            {/* Crosshairs */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-indigo-500/5" />
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] bg-indigo-500/5" />
            
            {/* Sweep Scanner line */}
            <div className="absolute top-0 left-0 w-1/2 h-1/2 origin-bottom-right radar-sweep-line bg-gradient-to-tl from-indigo-500/20 to-transparent border-r border-indigo-400/20" />
            
            {/* Core dot */}
            <div className="absolute w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_8px_#6366f1] z-10" />
            
            {/* Dynamic targets */}
            <div className="absolute top-[25%] left-[30%] w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_6px_#10b981] radar-pulse-1" />
            <div className="absolute bottom-[30%] right-[25%] w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_6px_#10b981] radar-pulse-2" />
          </div>
        </div>
      </div>

      {/* Map Search input box */}
      <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-2xl p-5 space-y-3 shadow-md">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest block">Search Area / Landmark Location</label>
          <span className="text-[10px] text-zinc-500 font-medium">Places Autocomplete Active</span>
        </div>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-550 group-focus-within:text-indigo-400 transition-colors" />
          <input
            ref={autocompleteInputRef}
            type="text"
            placeholder="Type area name, pin code, city or street name to center map..."
            className="w-full h-12 pl-12 pr-4 bg-zinc-950 border border-zinc-850 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500/50 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Google Map Display Panel */}
      {coords && (
        <div className="bg-zinc-900/30 border border-zinc-800/65 rounded-3xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 h-[430px] relative overflow-hidden glow-active">
          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/90 z-20 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                <span className="text-xs text-zinc-400 font-medium">Calibrating Satellite Imagery...</span>
              </div>
            </div>
          )}
          <div ref={mapRef} className="w-full h-full rounded-2xl border border-zinc-850" />
        </div>
      )}

      {error && !isBookingModalOpen && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-4 py-3 text-sm animate-fade-in flex justify-between items-center">
          <span className="font-medium">{error}</span>
          <button onClick={() => setError('')} className="text-zinc-500 hover:text-white transition-colors">
            <X className="w-4.5 h-4.5" />
          </button>
        </div>
      )}

      {/* Nearby Providers List */}
      <div className="space-y-4 pt-2">
        <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
          Active Partners in Location ({providers.length})
        </h3>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-28 bg-zinc-900/40 border border-zinc-850 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {providers.map((p) => (
              <div
                key={p.id}
                className="bg-zinc-900/40 border border-zinc-800/70 hover:border-zinc-700/50 hover:bg-zinc-900/60 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition-all duration-300 shadow-md group hover:scale-[1.01]"
              >
                <div className="flex items-start md:items-center gap-4">
                  {/* Dynamic gradient avatar */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/10 to-indigo-700/5 border border-indigo-500/20 flex items-center justify-center font-bold text-indigo-400 text-lg shadow-inner">
                    {p.display_name.charAt(0)}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-base font-bold text-zinc-200 group-hover:text-white transition-colors">
                        {p.display_name}
                      </h3>
                      <div className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold text-amber-400">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{p.rating ?? '5.0'}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-zinc-400">
                      <span className="flex items-center gap-1 text-zinc-455">
                        <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                        {p.address || 'Service Area Hub'}
                      </span>
                      <span className="text-zinc-500">•</span>
                      {p.distance !== undefined ? (
                        <span className="text-emerald-400 font-bold bg-emerald-500/5 border border-emerald-500/10 px-2 py-0.5 rounded-md">
                          {p.distance} km away
                        </span>
                      ) : (
                        <span className="text-zinc-500 font-medium bg-zinc-800/50 border border-zinc-700/30 px-2 py-0.5 rounded-md text-[10px]">
                          Location not set
                        </span>
                      )}
                      {p.is_verified && (
                        <>
                          <span className="text-zinc-500">•</span>
                          <span className="text-indigo-400 font-semibold flex items-center gap-0.5">
                            <ShieldCheck className="w-3.5 h-3.5 fill-indigo-500/10" />
                            Verified Partner
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-5">
                  <div className="hidden lg:flex flex-col text-right text-xs text-zinc-550 font-medium">
                    <span className="flex items-center gap-1.5 justify-end">
                      <Mail className="w-3 h-3 text-indigo-500/70" /> {p.email}
                    </span>
                    {p.phone && (
                      <span className="flex items-center gap-1.5 justify-end mt-1">
                        <Phone className="w-3 h-3 text-indigo-500/70" /> {p.phone}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleOpenBooking(p)}
                    className="w-full md:w-auto h-11 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-95"
                  >
                    <Wrench className="w-4 h-4" />
                    Book Partner
                  </button>
                </div>
              </div>
            ))}

            {providers.length === 0 && (
              <div className="py-16 text-center bg-zinc-900/10 border border-zinc-850 rounded-2xl">
                <Navigation className="w-10 h-10 text-zinc-655 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-zinc-400">No active providers found nearby</h4>
                <p className="text-zinc-500 text-xs mt-1">Try searching a different location or check back later.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Booking Form Dialog Modal */}
      {isBookingModalOpen && selectedProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300" onClick={handleCloseBooking} />
          
          <div className="relative z-10 w-full max-w-lg bg-zinc-900 border border-zinc-800/80 rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh] backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4.5 h-4.5 text-indigo-400" />
                  Schedule Service Appointment
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Booking with <span className="text-indigo-400 font-bold">{selectedProvider.display_name}</span> ({selectedProvider.distance} km away)
                </p>
              </div>
              <button
                onClick={handleCloseBooking}
                className="p-1.5 rounded-lg bg-zinc-855 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {successMsg ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6 animate-pulse" />
                </div>
                <h4 className="text-base font-bold text-zinc-205">Booking Registered!</h4>
                <p className="text-xs text-zinc-400">{successMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleCreateBooking} className="space-y-4">
                {error && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-4 py-2.5 text-xs font-semibold">
                    {error}
                  </div>
                )}

                {/* Service Selection */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 block">Select Service</label>
                  <select
                    value={selectedService?.id || ''}
                    onChange={(e) => {
                      const svc = services.find(s => s.id === e.target.value);
                      if (svc) setSelectedService(svc);
                    }}
                    className="w-full h-11 px-3 bg-zinc-850/60 border border-zinc-800/80 rounded-xl text-xs text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id} className="bg-zinc-900 text-zinc-300">
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
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 block">Preferred Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-550" />
                      <input
                        type="date"
                        required
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full h-11 pl-10 pr-3 bg-zinc-850/60 border border-zinc-800/80 rounded-xl text-xs text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 block">Time Slot</label>
                    <div className="relative">
                      <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-550" />
                      <select
                        value={bookingTimeSlot}
                        onChange={(e) => setBookingTimeSlot(e.target.value)}
                        className="w-full h-11 pl-10 pr-3 bg-zinc-850/60 border border-zinc-800/80 rounded-xl text-xs text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50"
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
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 block">Quantity / Hours Required</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={bookingQuantity <= 1}
                      onClick={() => setBookingQuantity(prev => prev - 1)}
                      className="w-9 h-9 bg-zinc-950 border border-zinc-855 hover:border-zinc-700 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white transition-all disabled:opacity-40"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold text-zinc-200 w-8 text-center">{bookingQuantity}</span>
                    <button
                      type="button"
                      onClick={() => setBookingQuantity(prev => prev + 1)}
                      className="w-9 h-9 bg-zinc-950 border border-zinc-855 hover:border-zinc-700 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Location Address */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 block">Service Address</label>
                  <input
                    type="text"
                    required
                    value={bookingAddress}
                    onChange={(e) => setBookingAddress(e.target.value)}
                    placeholder="Enter block, building, street or house details..."
                    className="w-full h-11 px-3.5 bg-zinc-850/60 border border-zinc-800/80 rounded-xl text-xs text-zinc-200 placeholder:text-zinc-650 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50"
                  />
                </div>

                {/* Description */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Additional instructions</label>
                    <button
                      type="button"
                      onClick={() => setIsAIAssistOpen(true)}
                      className="inline-flex items-center gap-1 text-[10px] font-extrabold text-primary hover:text-white transition-all bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/45 px-2 py-0.5 rounded-lg active:scale-95 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                      <span>AI Assist</span>
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={bookingDesc}
                    onChange={(e) => setBookingDesc(e.target.value)}
                    placeholder="Provide any instructions or service requirements here..."
                    className="w-full p-3.5 bg-zinc-850/60 border border-zinc-800/80 rounded-xl text-xs text-zinc-200 placeholder:text-zinc-650 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 resize-none"
                  />
                </div>

                {/* Payment Option */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 block">Payment Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('COD')}
                      className={`h-11 border rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        paymentMethod === 'COD'
                          ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400 shadow-md shadow-indigo-950/20'
                          : 'bg-zinc-950 border-zinc-850 text-zinc-450 hover:text-white hover:border-zinc-700'
                      }`}
                    >
                      <IndianRupee className="w-3.5 h-3.5" />
                      Cash on Delivery
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Online')}
                      className={`h-11 border rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        paymentMethod === 'Online'
                          ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400 shadow-md shadow-indigo-950/20'
                          : 'bg-zinc-955 border-zinc-850 text-zinc-450 hover:text-white hover:border-zinc-700'
                      }`}
                    >
                      <Tag className="w-3.5 h-3.5" />
                      Pay Online (UPI/Card)
                    </button>
                  </div>
                </div>

                {/* Summary Box */}
                <div className="bg-zinc-955/40 p-4 rounded-2xl border border-zinc-850 space-y-2.5 shadow-inner">
                  <div className="flex justify-between text-[11px] text-zinc-455 font-medium">
                    <span>Base Fare ({selectedService?.name})</span>
                    <span className="font-semibold text-zinc-300">₹{selectedService?.price || 0}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-zinc-455 font-medium">
                    <span>Hours / Quantity</span>
                    <span className="font-semibold text-zinc-300">x{bookingQuantity}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-zinc-455 font-medium border-b border-zinc-850 pb-2.5">
                    <span>Service Fee & Tax (CGST/SGST)</span>
                    <span className="text-emerald-400 font-semibold">Free / Inclusive</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-zinc-150 pt-1">
                    <span>Total Amount</span>
                    <span className="text-indigo-400 text-sm">₹{((selectedService?.price || 0) * bookingQuantity).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={handleCloseBooking}
                    className="flex-1 h-11 bg-zinc-955 border border-zinc-855 hover:border-zinc-700 text-zinc-350 font-semibold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bookingSubmitLoading}
                    className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-95"
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

      {/* AI Booking Assistant Modal */}
      <AIBookingAssistant
        isOpen={isAIAssistOpen}
        onClose={() => setIsAIAssistOpen(false)}
        onApply={(text) => setBookingDesc(text)}
      />
    </div>
  );
}
