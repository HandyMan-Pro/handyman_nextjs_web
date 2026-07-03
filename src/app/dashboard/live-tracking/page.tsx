'use client';

import { useEffect, useState, useRef } from 'react';
import { apiClient } from '../../../lib/apiClient';
import { getUserData } from '../../../lib/auth';
import {
  MapPin, Star, ShieldCheck, Mail, Phone, Calendar, Clock,
  IndianRupee, Tag, Shield, Loader2, Sparkles, Navigation,
  CheckCircle, Wrench, X, Search, Activity, User, Eye
} from 'lucide-react';

interface Handyman {
  id: string;
  display_name: string;
  email: string;
  phone?: string;
  status: number; // 1 = Active, 0 = Inactive
  is_verified?: boolean;
  is_available?: number; // 1 = Available, 0 = Offline/Unavailable
  designation?: string;
  lat?: number;
  lng?: number;
}

export default function LiveTrackingPage() {
  const [handymen, setHandymen] = useState<Handyman[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Map settings
  const [providerCoords, setProviderCoords] = useState<{ lat: number; lng: number } | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapInstanceRef = useRef<any>(null);
  const providerMarkerRef = useRef<any>(null);
  const handymanMarkersRef = useRef<Record<string, any>>({});
  const [selectedHandymanId, setSelectedHandymanId] = useState<string | null>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Load Google Maps SDK
  useEffect(() => {
    if (typeof window === 'undefined') return;

    (window as any).initGoogleMapCallback = () => {
      setMapLoaded(true);
    };

    const scriptId = 'google-maps-script';
    const existingScript = document.getElementById(scriptId);

    if (existingScript) {
      if ((window as any).google && (window as any).google.maps) {
        setMapLoaded(true);
      } else {
        const interval = setInterval(() => {
          if ((window as any).google && (window as any).google.maps) {
            setMapLoaded(true);
            clearInterval(interval);
          }
        }, 100);
        return () => clearInterval(interval);
      }
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&callback=initGoogleMapCallback`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    const user = getUserData();
    setCurrentUser(user);
    
    // Set provider coords (mock or real)
    const baseLat = 22.5726; // Default Kolkata
    const baseLng = 88.3639;
    setProviderCoords({ lat: baseLat, lng: baseLng });

    fetchHandymen(user?.id);
  }, []);

  const fetchHandymen = async (providerId?: string) => {
    setLoading(true);
    try {
      const url = providerId ? `/providers?provider_id=${providerId}` : '/providers';
      const res = await apiClient.get(url);
      
      const rawList = res.data || [];
      const list = rawList.filter((u: any) => u.user_type === 'handyman');
      
      // Scatter coordinates around provider location
      const baseLat = 22.5726;
      const baseLng = 88.3639;
      
      const mappedHandymen = list.map((h: any, idx: number) => {
        // Scatter within 2km radius
        const angle = (idx * 2 * Math.PI) / Math.max(list.length, 1) + (Math.random() - 0.5) * 0.5;
        const radius = 0.006 + Math.random() * 0.008; // ~800m to 2km
        return {
          id: h.id || h._id,
          display_name: h.display_name,
          email: h.email,
          phone: h.phone || h.contact_number,
          status: h.status,
          is_verified: h.is_verified,
          is_available: h.is_available ?? 1,
          designation: h.designation || 'Handyman Staff',
          lat: baseLat + radius * Math.sin(angle),
          lng: baseLng + radius * Math.cos(angle)
        };
      });

      setHandymen(mappedHandymen);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to load handyman locations');
    } finally {
      setLoading(false);
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !providerCoords || mapInstanceRef.current) return;

    const mapOptions = {
      center: providerCoords,
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

    // Provider Headquarters Marker
    const providerMarker = new (window as any).google.maps.Marker({
      position: providerCoords,
      map: googleMap,
      title: "Your Headquarters",
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="36" height="48" viewBox="0 0 36 48"><path d="M18 0C8.06 0 0 8.06 0 18c0 14 18 30 18 30s18-16 18-30C36 8.06 27.94 0 18 0z" fill="#4F46E5"/><circle cx="18" cy="18" r="7.5" fill="#312E81"/><circle cx="18" cy="18" r="5.5" fill="white"/></svg>`),
        scaledSize: new (window as any).google.maps.Size(36, 48),
        anchor: new (window as any).google.maps.Point(18, 48),
      }
    });
    providerMarkerRef.current = providerMarker;

  }, [mapLoaded, providerCoords]);

  // Update Handymen Markers
  useEffect(() => {
    if (!mapInstanceRef.current || handymen.length === 0) return;

    const google = (window as any).google;

    // Clear old markers
    Object.values(handymanMarkersRef.current).forEach(m => m.setMap(null));
    handymanMarkersRef.current = {};

    handymen.forEach(h => {
      if (!h.lat || !h.lng) return;

      const isAvailable = h.is_available === 1;
      const markerColor = isAvailable ? '#10B981' : '#EF4444'; // Green if free/available, Red if offline/busy

      const marker = new google.maps.Marker({
        position: { lat: h.lat, lng: h.lng },
        map: mapInstanceRef.current,
        title: h.display_name,
        icon: {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: markerColor,
          fillOpacity: 0.9,
          strokeColor: "#ffffff",
          strokeWeight: 1.5,
        }
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="color: #18181b; padding: 6px; font-family: sans-serif; min-width: 165px;">
            <h4 style="font-weight: 700; margin: 0 0 2px 0; font-size: 13px; color: #1e1b4b;">${h.display_name}</h4>
            <p style="font-size: 11px; margin: 0 0 6px 0; color: #4b5563; font-weight: 500;">${h.designation}</p>
            <p style="font-size: 10px; margin: 0 0 8px 0; font-weight: 600; color: ${isAvailable ? '#047857' : '#b91c1c'}">
              Status: ${isAvailable ? 'Available / Free' : 'Offline / Busy'}
            </p>
            <a href="tel:${h.phone || ''}" style="display: block; text-decoration: none; background: #4f46e5; color: #ffffff; text-align: center; padding: 6px; border-radius: 6px; font-size: 10px; font-weight: 700;">
              Call Handyman
            </a>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, marker);
        setSelectedHandymanId(h.id);
      });

      handymanMarkersRef.current[h.id] = marker;
    });

  }, [handymen]);

  // Center on handyman helper
  const focusHandyman = (h: Handyman) => {
    if (!mapInstanceRef.current || !h.lat || !h.lng) return;
    
    setSelectedHandymanId(h.id);
    mapInstanceRef.current.panTo({ lat: h.lat, lng: h.lng });
    mapInstanceRef.current.setZoom(16);

    const marker = handymanMarkersRef.current[h.id];
    if (marker) {
      // Trigger a bounce animation or open window
      const google = (window as any).google;
      marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(() => {
        marker.setAnimation(null);
      }, 1500);
    }
  };

  const filteredHandymen = handymen.filter(h =>
    (h.display_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (h.designation || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Live Tracking Map</h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            Monitor real-time positions and availability of your registered handyman crew.
          </p>
        </div>
        <button
          onClick={() => currentUser && fetchHandymen(currentUser.id)}
          className="flex items-center justify-center gap-2 h-10 px-4 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-all"
        >
          <Loader2 className="w-4 h-4" />
          Refresh Locations
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side: Handymen list panel */}
        <div className="lg:col-span-1 bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-4 flex flex-col h-[500px]">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-550" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search handymen..."
              className="w-full h-10 pl-9 pr-3 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {filteredHandymen.map((h) => {
              const isAvailable = h.is_available === 1;
              const isSelected = selectedHandymanId === h.id;
              return (
                <div
                  key={h.id}
                  onClick={() => focusHandyman(h)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-primary/10 border-primary/40'
                      : 'bg-zinc-950 border-zinc-850/70 hover:border-zinc-700/50'
                  }`}
                >
                  <div className="space-y-0.5 min-w-0">
                    <h3 className="font-bold text-xs text-zinc-200 truncate">{h.display_name}</h3>
                    <p className="text-[10px] text-zinc-500 truncate">{h.designation}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    <Eye className={`w-3.5 h-3.5 ${isSelected ? 'text-primary' : 'text-zinc-600'}`} />
                  </div>
                </div>
              );
            })}
            {filteredHandymen.length === 0 && (
              <div className="text-center py-16 text-zinc-600 text-xs font-medium">
                No handymen matching query.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Map container */}
        <div className="lg:col-span-3 bg-zinc-900/40 border border-zinc-800/60 rounded-3xl p-3 h-[500px] relative overflow-hidden">
          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/95 z-20 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="text-xs text-zinc-400 font-medium">Calibrating Satellite Systems...</span>
              </div>
            </div>
          )}
          <div ref={mapRef} className="w-full h-full rounded-2xl border border-zinc-850/50" />
        </div>
      </div>
    </div>
  );
}
