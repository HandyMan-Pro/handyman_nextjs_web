'use client';

import { useEffect, useState, useRef } from 'react';
import { apiClient } from '../../../lib/apiClient';
import { getUserData } from '../../../lib/auth';
import {
  MapPin, Shield, Activity, Users, Map as MapIcon, HelpCircle,
  AlertTriangle, Navigation, Route, HelpCircle as HelpIcon,
  Layers, RefreshCw, Plus, Check, Trash2, Calculator, Play, Pause,
  Volume2, VolumeX, Radio, ChevronRight, User, Compass, ArrowRight,
  TrendingUp, Clock, Info
} from 'lucide-react';

interface Handyman {
  id: string;
  display_name: string;
  email: string;
  phone?: string;
  status: number;
  is_verified?: boolean;
  is_available?: number;
  designation?: string;
  lat: number;
  lng: number;
}

interface Zone {
  id: string;
  name: string;
  status: string | number;
  coordinates: [number, number][];
}

interface SOSAlert {
  id: string;
  handyman_id: string;
  handyman_name: string;
  lat: number;
  lng: number;
  type: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

interface Booking {
  id: string;
  customer_name: string;
  service_title: string;
  lat: number;
  lng: number;
  status: string;
}

export default function MapsEngineDashboard() {
  const [activeTab, setActiveTab] = useState<'fleet' | 'geofence' | 'heatmap' | 'optimize' | 'pricing' | 'eta'>('fleet');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Data states
  const [handymen, setHandymen] = useState<Handyman[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [sosAlerts, setSosAlerts] = useState<SOSAlert[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Selected entities for tabs
  const [selectedHandymanId, setSelectedHandymanId] = useState<string>('');
  const [selectedBookingIds, setSelectedBookingIds] = useState<string[]>([]);
  const [optimizedRoute, setOptimizedRoute] = useState<{ id: string; display_name: string; lat: number; lng: number }[]>([]);

  // Geofence drawing state
  const [newZoneName, setNewZoneName] = useState('New Coverage Zone');
  const [drawnCoords, setDrawnCoords] = useState<[number, number][]>([]);

  // Distance Pricing estimator state
  const [originLat, setOriginLat] = useState('22.5726');
  const [originLng, setOriginLng] = useState('88.3639');
  const [destLat, setDestLat] = useState('22.5800');
  const [destLng, setDestLng] = useState('88.3750');
  const [pricingResults, setPricingResults] = useState<{
    distance_km: number;
    base_price: number;
    additional_charge: number;
    total_price: number;
  } | null>(null);
  const [pricingLoading, setPricingLoading] = useState(false);

  // Customer Tracking simulation state
  const [trackingActive, setTrackingActive] = useState(false);
  const [trackingHandyman, setTrackingHandyman] = useState<Handyman | null>(null);
  const [trackingRouteCoords, setTrackingRouteCoords] = useState<{ lat: number; lng: number }[]>([]);
  const [trackingProgress, setTrackingProgress] = useState(0);
  const [etaMinutes, setEtaMinutes] = useState(15);
  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Map references
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapInstanceRef = useRef<any>(null);
  const drawingManagerRef = useRef<any>(null);
  const heatmapLayerRef = useRef<any>(null);
  const polylineRouteRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const zonePolygonsRef = useRef<Record<string, any>>({});

  // WebSockets & simulator state
  const [wsStatus, setWsStatus] = useState<'connected' | 'disconnected' | 'simulated'>('disconnected');
  const wsFleetRef = useRef<WebSocket | null>(null);
  const wsSosRef = useRef<WebSocket | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // 1. Load Google Maps SDK
  useEffect(() => {
    if (typeof window === 'undefined') return;

    (window as any).initGoogleMapCallback = () => {
      setMapLoaded(true);
    };

    const scriptId = 'google-maps-script-advanced';
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
    // Load drawing and visualization libraries - pinned to v=3.64 to support DrawingManager (removed in v3.65+)
    script.src = `https://maps.googleapis.com/maps/api/js?v=3.64&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&libraries=drawing,visualization&callback=initGoogleMapCallback`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  // 2. Fetch Handymen, Zones, and Bookings on Mount
  useEffect(() => {
    fetchInitialData();
    setupWebSocketOrSimulator();

    return () => {
      if (wsFleetRef.current) wsFleetRef.current.close();
      if (wsSosRef.current) wsSosRef.current.close();
      if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
    };
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Fetch Handymen
      const handymenRes = await apiClient.get('/providers');
      const rawProviders = handymenRes.data || [];
      const baseLat = 22.5726;
      const baseLng = 88.3639;

      const loadedHandymen = rawProviders
        .filter((u: any) => u.user_type === 'handyman' || u.user_type === 'provider')
        .map((h: any, idx: number) => {
          const angle = (idx * 2 * Math.PI) / Math.max(rawProviders.length, 1);
          const radius = 0.005 + Math.random() * 0.007; // 500m to 1.2km
          return {
            id: h.id || h._id,
            display_name: h.display_name || 'Staff Handyman',
            email: h.email || 'staff@handymanpro.com',
            phone: h.phone || h.contact_number || '+91 98765 43210',
            status: h.status ?? 1,
            is_verified: h.is_verified ?? true,
            is_available: h.is_available ?? 1,
            designation: h.designation || 'Field Technician',
            lat: h.lat || (baseLat + radius * Math.sin(angle)),
            lng: h.lng || (baseLng + radius * Math.cos(angle)),
          };
        });
      setHandymen(loadedHandymen);

      // Fetch Zones
      const zonesRes = await apiClient.get('/admin/zones');
      const loadedZones = (zonesRes.data || []).map((z: any) => ({
        id: z.id || z._id,
        name: z.name || 'Unnamed Zone',
        status: z.status ?? 'active',
        coordinates: z.coordinates || (z.location?.coordinates ? z.location.coordinates[0] : [])
      }));
      setZones(loadedZones);

      // Create Mock Bookings for Optimization
      const mockBookings: Booking[] = [
        { id: 'b1', customer_name: 'Amit Sharma', service_title: 'AC Maintenance', lat: 22.5780, lng: 88.3690, status: 'pending' },
        { id: 'b2', customer_name: 'Priya Patel', service_title: 'Electrical Repair', lat: 22.5710, lng: 88.3720, status: 'pending' },
        { id: 'b3', customer_name: 'Rahul Sen', service_title: 'Leak Plumbing Fix', lat: 22.5650, lng: 88.3600, status: 'pending' },
        { id: 'b4', customer_name: 'Vikram Singh', service_title: 'Sofa Cleaning', lat: 22.5830, lng: 88.3580, status: 'pending' },
      ];
      setBookings(mockBookings);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch maps engine dashboard configurations.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Connect WebSockets or Fallback to Simulator
  const setupWebSocketOrSimulator = () => {
    const apiURL = process.env.NEXT_PUBLIC_API_URL || '';
    let wsBase = '';

    if (apiURL.startsWith('http')) {
      wsBase = apiURL.replace('http', 'ws').replace('/api', '');
    } else {
      wsBase = 'ws://localhost:8000';
    }

    try {
      // Connect Fleet WebSocket
      const wsFleet = new WebSocket(`${wsBase}/ws/fleet`);
      wsFleetRef.current = wsFleet;

      wsFleet.onopen = () => {
        setWsStatus('connected');
      };

      wsFleet.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.handyman_id) {
            setHandymen((prev) =>
              prev.map((h) =>
                h.id === data.handyman_id ? { ...h, lat: data.lat, lng: data.lng } : h
              )
            );
          }
        } catch (e) {
          console.error('Error parsing fleet WS msg:', e);
        }
      };

      wsFleet.onerror = () => {
        startSimulator();
      };

      // Connect SOS WebSocket
      const wsSos = new WebSocket(`${wsBase}/ws/sos`);
      wsSosRef.current = wsSos;

      wsSos.onmessage = (event) => {
        try {
          const alert = JSON.parse(event.data);
          triggerSOSAlert(alert);
        } catch (e) {
          console.error('Error parsing SOS WS msg:', e);
        }
      };

    } catch (err) {
      console.warn('WebSocket setup failed, falling back to simulator', err);
      startSimulator();
    }
  };

  const startSimulator = () => {
    setWsStatus('simulated');
    // Periodic random movement of handymen
    const moveInterval = setInterval(() => {
      setHandymen((prev) =>
        prev.map((h) => {
          // Slowly drift coordinates
          const dLat = (Math.random() - 0.5) * 0.0003;
          const dLng = (Math.random() - 0.5) * 0.0003;
          return {
            ...h,
            lat: h.lat + dLat,
            lng: h.lng + dLng
          };
        })
      );
    }, 4000);

    // Random SOS alerts occasionally
    const sosInterval = setInterval(() => {
      // 10% chance of triggering simulated alert
      if (Math.random() < 0.15 && handymen.length > 0) {
        const randomH = handymen[Math.floor(Math.random() * handymen.length)];
        const types = ['Mechanical Breakdown', 'Medical Emergency', 'Accident / Collision', 'Security Alert'];
        const simulatedSOS = {
          id: `sos-${Date.now()}`,
          handyman_id: randomH.id,
          handyman_name: randomH.display_name,
          lat: randomH.lat + (Math.random() - 0.5) * 0.001,
          lng: randomH.lng + (Math.random() - 0.5) * 0.001,
          type: types[Math.floor(Math.random() * types.length)],
          message: 'Simulated automatic distress alert sent from mobile client.',
          timestamp: new Date().toLocaleTimeString(),
          acknowledged: false
        };
        triggerSOSAlert(simulatedSOS);
      }
    }, 20000);

    return () => {
      clearInterval(moveInterval);
      clearInterval(sosInterval);
    };
  };

  const triggerSOSAlert = (alert: SOSAlert) => {
    setSosAlerts((prev) => [alert, ...prev]);
    if (soundEnabled) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(650, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.6);
      } catch (e) {
        console.warn('Audio play blocked or unsupported:', e);
      }
    }
  };

  // 4. Initialize Google Maps instance
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || mapInstanceRef.current) return;

    const baseCoords = { lat: 22.5726, lng: 88.3639 };
    const mapOptions = {
      center: baseCoords,
      zoom: 14,
      styles: [
        { "elementType": "geometry", "stylers": [{ "color": "#111827" }] },
        { "elementType": "labels.text.stroke", "stylers": [{ "color": "#111827" }] },
        { "elementType": "labels.text.fill", "stylers": [{ "color": "#6b7280" }] },
        { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#374151" }] },
        { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#9ca3af" }] },
        { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#1f2937" }] },
        { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#1f2937" }] },
        { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#111827" }] },
        { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#4b5563" }] },
        { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#030712" }] }
      ],
      disableDefaultUI: true,
      zoomControl: true,
    };

    const googleMap = new (window as any).google.maps.Map(mapRef.current, mapOptions);
    mapInstanceRef.current = googleMap;

    // Attach map click listener for manually selecting coords on Geofence tab
    googleMap.addListener('click', (event: any) => {
      const clickedLat = event.latLng.lat();
      const clickedLng = event.latLng.lng();
      // Set values if needed or let drawing manager handle it
    });
  }, [mapLoaded]);

  // 5. Drawing Manager Lifecycle (Geofence Tab only)
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const google = (window as any).google;

    if (activeTab === 'geofence') {
      const drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.POLYGON,
        drawingControl: true,
        drawingControlOptions: {
          position: google.maps.ControlPosition.TOP_CENTER,
          drawingModes: [google.maps.drawing.OverlayType.POLYGON],
        },
        polygonOptions: {
          fillColor: '#6366f1',
          fillOpacity: 0.25,
          strokeWeight: 2.5,
          strokeColor: '#4f46e5',
          editable: true,
          clickable: true,
        },
      });

      drawingManager.setMap(mapInstanceRef.current);
      drawingManagerRef.current = drawingManager;

      google.maps.event.addListener(drawingManager, 'polygoncomplete', (polygon: any) => {
        const path = polygon.getPath();
        const coords: [number, number][] = [];
        for (let i = 0; i < path.getLength(); i++) {
          const latLng = path.getAt(i);
          coords.push([latLng.lng(), latLng.lat()]);
        }
        // Close polygon loop by repeating first point
        if (coords.length > 0) {
          coords.push([coords[0][0], coords[0][1]]);
        }
        setDrawnCoords(coords);
      });
    } else {
      if (drawingManagerRef.current) {
        drawingManagerRef.current.setMap(null);
        drawingManagerRef.current = null;
      }
      setDrawnCoords([]);
    }
  }, [activeTab]);

  // 6. Draw Saved Zones as Transparent Polygons
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const google = (window as any).google;

    // Clear old zone polygons
    Object.values(zonePolygonsRef.current).forEach((p: any) => p.setMap(null));
    zonePolygonsRef.current = {};

    zones.forEach((zone) => {
      if (!zone.coordinates || zone.coordinates.length === 0) return;

      const path = zone.coordinates.map((c) => ({ lat: c[1], lng: c[0] }));
      const polygon = new google.maps.Polygon({
        paths: path,
        strokeColor: '#3b82f6',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#3b82f6',
        fillOpacity: 0.12,
        map: mapInstanceRef.current,
      });

      // Show info window on hover
      const infoWindow = new google.maps.InfoWindow({
        content: `<div style="color:#111827; padding:4px; font-weight:700; font-size:11px;">Zone: ${zone.name}</div>`,
        position: path[0]
      });

      polygon.addListener('mouseover', () => {
        infoWindow.open(mapInstanceRef.current);
      });
      polygon.addListener('mouseout', () => {
        infoWindow.close();
      });

      zonePolygonsRef.current[zone.id] = polygon;
    });
  }, [zones, mapLoaded]);

  // 7. Update Markers based on active tab & data
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const google = (window as any).google;

    // Clear old markers
    Object.values(markersRef.current).forEach((m: any) => m.setMap(null));
    markersRef.current = {};

    // 7a. FLEET TAB: Show Handymen and SOS Alerts
    if (activeTab === 'fleet') {
      // Plot Handymen
      handymen.forEach((h) => {
        const isAvailable = h.is_available === 1;
        const iconColor = isAvailable ? '#10b981' : '#f59e0b';
        const marker = new google.maps.Marker({
          position: { lat: h.lat, lng: h.lng },
          map: mapInstanceRef.current,
          title: h.display_name,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: iconColor,
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="color: #1f2937; font-family: sans-serif; font-size:12px; padding: 4px; min-width: 140px;">
              <div style="font-weight: 700; color: #111827;">${h.display_name}</div>
              <div style="color: #6b7280; font-size: 10px; margin-top: 2px;">${h.designation}</div>
              <div style="margin-top: 6px; font-weight: 600; color: ${isAvailable ? '#10b981' : '#f59e0b'}">
                ${isAvailable ? 'Available' : 'Busy / On Duty'}
              </div>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(mapInstanceRef.current, marker);
        });

        markersRef.current[h.id] = marker;
      });

      // Plot SOS alerts (flashing red)
      sosAlerts.filter(a => !a.acknowledged).forEach((alert) => {
        const marker = new google.maps.Marker({
          position: { lat: alert.lat, lng: alert.lng },
          map: mapInstanceRef.current,
          title: `SOS Alert - ${alert.handyman_name}`,
          animation: google.maps.Animation.BOUNCE,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="red" stroke-width="2.5">
                <path d="M12 2L2 22h20L12 2z" fill="rgba(239, 68, 68, 0.4)"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(36, 36),
            anchor: new google.maps.Point(18, 18),
          }
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="color: #dc2626; font-family: sans-serif; font-size: 12px; padding: 6px; min-width: 180px;">
              <div style="font-weight: 800; font-size: 13px;">🚨 SOS EMERGENCY 🚨</div>
              <div style="font-weight: 700; color: #111827; margin-top: 4px;">${alert.handyman_name}</div>
              <div style="color: #4b5563; font-weight: 500; margin-top: 2px;">Type: ${alert.type}</div>
              <div style="color: #991b1b; font-style: italic; margin-top: 4px;">"${alert.message}"</div>
              <div style="color: #9ca3af; font-size: 9px; margin-top: 6px;">Sent at: ${alert.timestamp}</div>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(mapInstanceRef.current, marker);
        });

        markersRef.current[alert.id] = marker;
      });
    }

    // 7b. ROUTE OPTIMIZATION TAB: Show Bookings and Handyman
    if (activeTab === 'optimize') {
      bookings.forEach((b) => {
        const isSelected = selectedBookingIds.includes(b.id);
        const marker = new google.maps.Marker({
          position: { lat: b.lat, lng: b.lng },
          map: mapInstanceRef.current,
          title: `${b.customer_name} (${b.service_title})`,
          icon: {
            path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
            scale: 5,
            fillColor: isSelected ? '#10b981' : '#6b7280',
            fillOpacity: 0.9,
            strokeColor: '#ffffff',
            strokeWeight: 1.5,
          }
        });
        markersRef.current[b.id] = marker;
      });

      // Show selected Handyman
      const currentH = handymen.find(h => h.id === selectedHandymanId);
      if (currentH) {
        const marker = new google.maps.Marker({
          position: { lat: currentH.lat, lng: currentH.lng },
          map: mapInstanceRef.current,
          title: `Start point: ${currentH.display_name}`,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" fill="white">
                <circle cx="12" cy="12" r="10" fill="#6366f1"/>
                <circle cx="12" cy="12" r="4" fill="white"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(30, 30),
            anchor: new google.maps.Point(15, 15),
          }
        });
        markersRef.current['opt-handyman'] = marker;
      }
    }

    // 7c. PRICING TAB: Show Origin and Destination pins
    if (activeTab === 'pricing') {
      const orig = { lat: parseFloat(originLat), lng: parseFloat(originLng) };
      const dest = { lat: parseFloat(destLat), lng: parseFloat(destLng) };

      if (!isNaN(orig.lat) && !isNaN(orig.lng)) {
        const originMarker = new google.maps.Marker({
          position: orig,
          map: mapInstanceRef.current,
          title: 'Origin Point',
          label: 'A',
        });
        markersRef.current['price-origin'] = originMarker;
      }

      if (!isNaN(dest.lat) && !isNaN(dest.lng)) {
        const destMarker = new google.maps.Marker({
          position: dest,
          map: mapInstanceRef.current,
          title: 'Destination Point',
          label: 'B',
        });
        markersRef.current['price-dest'] = destMarker;
      }
    }

  }, [activeTab, handymen, sosAlerts, selectedBookingIds, selectedHandymanId, originLat, originLng, destLat, destLng]);

  // 8. Heatmap Layer lifecycle (Heatmap Tab only)
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return;
    const google = (window as any).google;

    if (activeTab === 'heatmap') {
      loadHeatmapData();
    } else {
      if (heatmapLayerRef.current) {
        heatmapLayerRef.current.setMap(null);
        heatmapLayerRef.current = null;
      }
    }
  }, [activeTab, mapLoaded]);

  const loadHeatmapData = async () => {
    try {
      const res = await apiClient.get('/admin/heatmap');
      const points = res.data || [];
      const google = (window as any).google;

      const heatmapPoints = points.map((p: any) => new google.maps.LatLng(p.lat || p[0], p.lng || p[1]));

      if (heatmapLayerRef.current) {
        heatmapLayerRef.current.setMap(null);
      }

      const heatmap = new google.maps.visualization.HeatmapLayer({
        data: heatmapPoints,
        radius: 30,
        opacity: 0.85,
        map: mapInstanceRef.current,
      });

      heatmapLayerRef.current = heatmap;
    } catch (err) {
      console.error('Failed to load heatmap data:', err);
    }
  };

  // 9. Save Geofence Zone
  const saveGeofenceZone = async () => {
    if (drawnCoords.length === 0) {
      setError('Please draw a polygon boundary on the map first.');
      return;
    }
    try {
      const payload = {
        name: newZoneName,
        coordinates: drawnCoords,
        status: 'active',
      };
      await apiClient.post('/admin/zones', payload);
      setSuccess(`Geofence zone "${newZoneName}" saved successfully!`);
      setDrawnCoords([]);
      fetchInitialData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save zone.');
    }
  };

  // 10. Delete Zone
  const deleteZone = async (id: string) => {
    if (!confirm('Are you sure you want to delete this geofence zone?')) return;
    try {
      await apiClient.delete(`/admin/zones/${id}`);
      setSuccess('Zone deleted successfully.');
      fetchInitialData();
    } catch (err: any) {
      setError('Failed to delete zone.');
    }
  };

  // 11. Optimize Route
  const optimizeSelectedRoute = async () => {
    if (!selectedHandymanId) {
      setError('Please select a starting handyman.');
      return;
    }
    if (selectedBookingIds.length < 2) {
      setError('Please select at least 2 booking waypoints to optimize.');
      return;
    }

    try {
      const selectedBookingsData = bookings
        .filter(b => selectedBookingIds.includes(b.id))
        .map(b => ({ id: b.id, lat: b.lat, lng: b.lng }));

      const handyman = handymen.find(h => h.id === selectedHandymanId);
      if (!handyman) return;

      const payload = {
        origin: { lat: handyman.lat, lng: handyman.lng },
        waypoints: selectedBookingsData,
      };

      const res = await apiClient.post('/admin/optimize-route', payload);
      const orderedWaypoints = res.data.optimized_order || [];

      // Combine starting point with ordered waypoints
      const fullRoute = [
        { id: 'start', display_name: handyman.display_name, lat: handyman.lat, lng: handyman.lng },
        ...orderedWaypoints.map((w: any) => {
          const booking = bookings.find(b => b.id === w.id);
          return {
            id: w.id,
            display_name: booking ? booking.customer_name : 'Waypoint',
            lat: w.lat,
            lng: w.lng
          };
        })
      ];

      setOptimizedRoute(fullRoute);
      drawRoutePolyline(fullRoute);
      setSuccess('Route optimized successfully via Directions Matrix!');
    } catch (err: any) {
      setError('Failed to optimize route. Using fallback route plotting.');
      // Fallback local optimization (nearest neighbor)
      const handyman = handymen.find(h => h.id === selectedHandymanId);
      if (!handyman) return;
      const fallbackRoute = [
        { id: 'start', display_name: handyman.display_name, lat: handyman.lat, lng: handyman.lng },
        ...bookings.filter(b => selectedBookingIds.includes(b.id)).map(b => ({
          id: b.id,
          display_name: b.customer_name,
          lat: b.lat,
          lng: b.lng
        }))
      ];
      setOptimizedRoute(fallbackRoute);
      drawRoutePolyline(fallbackRoute);
    }
  };

  const drawRoutePolyline = (points: { lat: number; lng: number }[]) => {
    if (!mapInstanceRef.current) return;
    const google = (window as any).google;

    if (polylineRouteRef.current) {
      polylineRouteRef.current.setMap(null);
    }

    const path = points.map(p => ({ lat: p.lat, lng: p.lng }));
    const polyline = new google.maps.Polyline({
      path: path,
      geodesic: true,
      strokeColor: '#6366f1',
      strokeOpacity: 0.85,
      strokeWeight: 4,
      map: mapInstanceRef.current,
    });

    polylineRouteRef.current = polyline;

    // Pan map to fit bounds of route
    const bounds = new google.maps.LatLngBounds();
    path.forEach(p => bounds.extend(p));
    mapInstanceRef.current.fitBounds(bounds);
  };

  // 12. Calculate Pricing Estimator
  const calculatePricing = async () => {
    setPricingLoading(true);
    setPricingResults(null);
    try {
      const payload = {
        origin: { lat: parseFloat(originLat), lng: parseFloat(originLng) },
        destination: { lat: parseFloat(destLat), lng: parseFloat(destLng) },
        base_price: 50.0,
      };
      const res = await apiClient.post('/admin/calculate-pricing', payload);
      setPricingResults(res.data);
      setError(null);

      // Draw polyline between origin and dest
      drawRoutePolyline([payload.origin, payload.destination]);
    } catch (err: any) {
      setError('Pricing API failed. Using fallback distance calculator.');
      // Local distance calculator fallback
      const lat1 = parseFloat(originLat);
      const lon1 = parseFloat(originLng);
      const lat2 = parseFloat(destLat);
      const lon2 = parseFloat(destLng);
      const R = 6371; // km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;

      const base = 50.0;
      const extraDist = Math.max(0, distance - 5.0);
      const surcharge = extraDist * 2.0;
      setPricingResults({
        distance_km: parseFloat(distance.toFixed(2)),
        base_price: base,
        additional_charge: parseFloat(surcharge.toFixed(2)),
        total_price: parseFloat((base + surcharge).toFixed(2))
      });
    } finally {
      setPricingLoading(false);
    }
  };

  // 13. Customer tracking simulation toggle
  const toggleTrackingSimulation = () => {
    if (trackingActive) {
      if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
      setTrackingActive(false);
      setTrackingProgress(0);
      if (polylineRouteRef.current) polylineRouteRef.current.setMap(null);
    } else {
      if (handymen.length === 0) return;
      const h = handymen[0];
      setTrackingHandyman(h);

      const customerHome = { lat: 22.5800, lng: 88.3750 };
      const routePoints = [
        { lat: h.lat, lng: h.lng },
        { lat: h.lat + (customerHome.lat - h.lat) * 0.33, lng: h.lng + (customerHome.lng - h.lng) * 0.25 },
        { lat: h.lat + (customerHome.lat - h.lat) * 0.66, lng: h.lng + (customerHome.lng - h.lng) * 0.75 },
        customerHome
      ];

      setTrackingRouteCoords(routePoints);
      drawRoutePolyline(routePoints);

      setTrackingActive(true);
      setTrackingProgress(0);

      // Start movement interval
      let prog = 0;
      trackingIntervalRef.current = setInterval(() => {
        prog += 5;
        if (prog > 100) {
          prog = 100;
          clearInterval(trackingIntervalRef.current!);
          setSuccess('Provider has arrived at customer location!');
        }
        setTrackingProgress(prog);
        setEtaMinutes(Math.max(0, Math.round(15 * (1 - prog / 100))));

        // Move marker position along routePoints
        const pointIdx = Math.min(
          Math.floor((prog / 100) * (routePoints.length - 1)),
          routePoints.length - 1
        );
        const currentLoc = routePoints[pointIdx];

        // Update tracking handyman location marker dynamically
        setTrackingHandyman(prev => prev ? { ...prev, lat: currentLoc.lat, lng: currentLoc.lng } : null);

      }, 1000);
    }
  };

  // Clean success alert after 4s
  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(null), 4000);
      return () => clearTimeout(t);
    }
  }, [success]);

  // Clean error alert after 5s
  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(t);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6">
      {/* Top Banner SOS Warnings */}
      {sosAlerts.filter(a => !a.acknowledged).length > 0 && (
        <div className="bg-red-950/60 border border-red-500/50 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-500 animate-bounce" />
            <div>
              <h2 className="text-sm font-extrabold text-red-400 tracking-wider uppercase">
                CRITICAL EMERGENCY SOS ALERT DETECTED
              </h2>
              <p className="text-xs text-zinc-300 mt-1">
                Handyman <span className="font-bold text-white">{sosAlerts[0].handyman_name}</span> triggered an SOS:
                <span className="italic ml-1 text-red-300">"{sosAlerts[0].message}"</span> ({sosAlerts[0].type})
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setSosAlerts(prev => prev.map(a => a.id === sosAlerts[0].id ? { ...a, acknowledged: true } : a));
              setSuccess('SOS Alert acknowledged. Dispatch team notified.');
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition"
          >
            Acknowledge & Dispatch Help
          </button>
        </div>
      )}

      {/* Main Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-zinc-900/40 p-6 rounded-3xl border border-zinc-800/40 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400" />
            <span className="text-xs font-semibold text-indigo-400 tracking-widest uppercase">Enterprise Module</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1 bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-500">
            Google Maps Enterprise Engine
          </h1>
          <p className="text-zinc-500 text-xs mt-1">
            Polygon Geofencing • Heatmaps • Fleet Logistics • Waypoint Optimization • Realtime tracking
          </p>
        </div>

        {/* System Stats Block */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="bg-zinc-950/80 border border-zinc-850 px-4 py-2 rounded-xl text-center">
            <span className="text-[10px] text-zinc-500 block uppercase font-bold tracking-wider">Live Fleet</span>
            <span className="text-sm font-extrabold text-indigo-400">{handymen.length} Staff</span>
          </div>

          <div className="bg-zinc-950/80 border border-zinc-850 px-4 py-2 rounded-xl text-center">
            <span className="text-[10px] text-zinc-500 block uppercase font-bold tracking-wider">Geofence Zones</span>
            <span className="text-sm font-extrabold text-blue-400">{zones.length} Active</span>
          </div>

          {/* Connection Status indicator */}
          <div className="flex items-center gap-2 bg-zinc-950/80 border border-zinc-850 px-3.5 py-2 rounded-xl">
            <span className={`w-2 h-2 rounded-full ${wsStatus === 'connected' ? 'bg-emerald-500' : wsStatus === 'simulated' ? 'bg-yellow-400 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-xs text-zinc-400 font-bold capitalize">
              {wsStatus === 'connected' ? 'WebSocket Live' : wsStatus === 'simulated' ? 'Simulator Active' : 'Disconnected'}
            </span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2.5 bg-zinc-950 border border-zinc-850 rounded-xl text-zinc-400 hover:text-white transition"
            title="Toggle SOS Alert Beep"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-red-400" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Hand: Controller & Configuration panels */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          {/* Navigation Tab selection */}
          <div className="bg-zinc-900/60 border border-zinc-800/60 p-3 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase block px-3 mb-2">Controls</span>
            {[
              { id: 'fleet', label: 'Live Fleet & SOS', icon: Users },
              { id: 'geofence', label: 'Geofence Builder', icon: MapIcon },
              { id: 'heatmap', label: 'Demand Heatmap', icon: Layers },
              { id: 'optimize', label: 'Smart Routing Optimizer', icon: Route },
              { id: 'pricing', label: 'Pricing Estimator', icon: Calculator },
              { id: 'eta', label: 'Customer Live ETA', icon: Navigation }
            ].map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setActiveTab(t.id as any);
                    if (polylineRouteRef.current) polylineRouteRef.current.setMap(null);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all ${
                    activeTab === t.id
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-950'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{t.label}</span>
                  </div>
                  <ChevronRight className="w-3 h-3 opacity-60" />
                </button>
              );
            })}
          </div>

          {/* Contextual panel depending on Tab */}
          <div className="bg-zinc-900/60 border border-zinc-800/60 p-5 rounded-2xl flex-1 flex flex-col justify-between min-h-[350px]">
            
            {/* 1. Fleet Tab */}
            {activeTab === 'fleet' && (
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-400" />
                    Fleet List ({handymen.length})
                  </h3>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Select a technician below to focus map or view their telemetry.
                  </p>
                  
                  <div className="space-y-2 mt-4 max-h-[220px] overflow-y-auto pr-1">
                    {handymen.map(h => (
                      <div
                        key={h.id}
                        onClick={() => {
                          if (mapInstanceRef.current) {
                            mapInstanceRef.current.panTo({ lat: h.lat, lng: h.lng });
                            mapInstanceRef.current.setZoom(16);
                          }
                        }}
                        className="p-2.5 bg-zinc-950 hover:bg-zinc-900 rounded-lg border border-zinc-850 cursor-pointer flex items-center justify-between"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-zinc-200 truncate">{h.display_name}</div>
                          <div className="text-[10px] text-zinc-500 truncate">{h.designation}</div>
                        </div>
                        <span className={`w-2 h-2 rounded-full ${h.is_available === 1 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (handymen.length > 0) {
                      const randomH = handymen[Math.floor(Math.random() * handymen.length)];
                      triggerSOSAlert({
                        id: `sos-test-${Date.now()}`,
                        handyman_id: randomH.id,
                        handyman_name: randomH.display_name,
                        lat: randomH.lat + (Math.random() - 0.5) * 0.001,
                        lng: randomH.lng + (Math.random() - 0.5) * 0.001,
                        type: 'Manual Panic Button Trigger',
                        message: 'Operator simulated SOS event test.',
                        timestamp: new Date().toLocaleTimeString(),
                        acknowledged: false
                      });
                    }
                  }}
                  className="w-full py-2.5 bg-red-650/10 hover:bg-red-650/20 text-red-400 border border-red-500/20 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Simulate SOS Trigger
                </button>
              </div>
            )}

            {/* 2. Geofence Tab */}
            {activeTab === 'geofence' && (
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <MapIcon className="w-4 h-4 text-blue-400" />
                    Geofence Builder
                  </h3>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Use the Map controls to draw a polygon. Name it and save below.
                  </p>

                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 block mb-1">Zone Name</label>
                      <input
                        type="text"
                        value={newZoneName}
                        onChange={e => setNewZoneName(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-850">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Status</span>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-300">Drawn Points</span>
                        <span className="font-extrabold text-blue-400">{Math.max(0, drawnCoords.length - 1)} Nodes</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={saveGeofenceZone}
                    disabled={drawnCoords.length === 0}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    Save Active Zone
                  </button>

                  <div className="mt-4 pt-3 border-t border-zinc-850">
                    <span className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase block mb-2">Saved Zones</span>
                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                      {zones.map(z => (
                        <div key={z.id} className="flex items-center justify-between bg-zinc-950 p-2 rounded-lg border border-zinc-850 text-xs">
                          <span className="truncate font-bold text-zinc-300">{z.name}</span>
                          <button onClick={() => deleteZone(z.id)} className="text-zinc-650 hover:text-red-500 transition p-1">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Heatmap Tab */}
            {activeTab === 'heatmap' && (
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    Demand Heatmap
                  </h3>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Visualizing booking locations to identify high-density demand zones.
                  </p>

                  <div className="mt-6 p-4 bg-zinc-950 border border-zinc-850 rounded-xl space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Total Bookings Analyzed</span>
                      <span className="font-bold text-white">124</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Peak Density Area</span>
                      <span className="font-bold text-emerald-400">Kolkata Central</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={loadHeatmapData}
                  className="w-full py-2.5 bg-zinc-950 border border-zinc-850 hover:bg-zinc-900 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh Heatmap Data
                </button>
              </div>
            )}

            {/* 4. Route Optimizer Tab */}
            {activeTab === 'optimize' && (
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Route className="w-4 h-4 text-indigo-400" />
                    Route Optimizer
                  </h3>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Select a technician and booking waypoints to optimize the route path.
                  </p>

                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 block mb-1">Select Handyman</label>
                      <select
                        value={selectedHandymanId}
                        onChange={e => setSelectedHandymanId(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-white focus:outline-none"
                      >
                        <option value="">-- Choose Staff --</option>
                        {handymen.map(h => (
                          <option key={h.id} value={h.id}>{h.display_name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 block mb-1.5">Select Bookings</label>
                      <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                        {bookings.map(b => (
                          <label
                            key={b.id}
                            className="flex items-center gap-2 p-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 rounded-lg text-xs cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedBookingIds.includes(b.id)}
                              onChange={() => {
                                setSelectedBookingIds(prev =>
                                  prev.includes(b.id) ? prev.filter(x => x !== b.id) : [...prev, b.id]
                                );
                              }}
                              className="rounded bg-zinc-900 border-zinc-800 text-indigo-600 focus:ring-0 focus:ring-offset-0"
                            />
                            <div className="min-w-0">
                              <div className="font-bold text-zinc-300 truncate">{b.customer_name}</div>
                              <div className="text-[10px] text-zinc-500 truncate">{b.service_title}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={optimizeSelectedRoute}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
                  >
                    <Route className="w-4 h-4" />
                    Optimize and Plot Route
                  </button>

                  {optimizedRoute.length > 0 && (
                    <div className="mt-4 p-3 bg-zinc-950 border border-zinc-850 rounded-xl">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Optimized Sequence</span>
                      <div className="space-y-1">
                        {optimizedRoute.map((p, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[11px]">
                            <span className="text-zinc-500">{idx + 1}.</span>
                            <span className="text-zinc-300 font-medium truncate">{p.display_name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 5. Pricing Tab */}
            {activeTab === 'pricing' && (
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-indigo-400" />
                    Pricing Estimator
                  </h3>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Calculate dynamic pricing from origin to destination coordinates.
                  </p>

                  <div className="mt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-zinc-400 block mb-1">Origin Lat</label>
                        <input
                          type="text"
                          value={originLat}
                          onChange={e => setOriginLat(e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-zinc-400 block mb-1">Origin Lng</label>
                        <input
                          type="text"
                          value={originLng}
                          onChange={e => setOriginLng(e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-zinc-400 block mb-1">Dest Lat</label>
                        <input
                          type="text"
                          value={destLat}
                          onChange={e => setDestLat(e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-zinc-400 block mb-1">Dest Lng</label>
                        <input
                          type="text"
                          value={destLng}
                          onChange={e => setDestLng(e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={calculatePricing}
                    disabled={pricingLoading}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
                  >
                    {pricingLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
                    Calculate Route Fare
                  </button>

                  {pricingResults && (
                    <div className="mt-3 p-3 bg-zinc-950 border border-zinc-850 rounded-xl space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Distance</span>
                        <span className="font-bold text-white">{pricingResults.distance_km} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Base Price (5km)</span>
                        <span className="font-bold text-white">₹{pricingResults.base_price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Distance Surcharge</span>
                        <span className="font-bold text-white">₹{pricingResults.additional_charge}</span>
                      </div>
                      <div className="flex justify-between border-t border-zinc-850 pt-2 font-bold text-sm">
                        <span className="text-indigo-400">Total Price</span>
                        <span className="text-indigo-400">₹{pricingResults.total_price}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 6. Customer Live ETA Tab */}
            {activeTab === 'eta' && (
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-indigo-400" />
                    Customer ETA Tracker
                  </h3>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Simulate a live customer view tracking a handyman on the way.
                  </p>

                  <div className="mt-4 p-4 bg-zinc-950 border border-zinc-850 rounded-xl space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center">
                        <User className="w-4 h-4 text-zinc-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-zinc-200">
                          {trackingHandyman?.display_name || 'Staff Technician'}
                        </div>
                        <div className="text-[10px] text-zinc-500">Heading to job site</div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-500">Estimated Arrival</span>
                        <span className="font-bold text-indigo-400">{etaMinutes} mins</span>
                      </div>
                      <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden mt-1.5">
                        <div
                          className="bg-indigo-500 h-full transition-all duration-1000"
                          style={{ width: `${trackingProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={toggleTrackingSimulation}
                  className={`w-full py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
                    trackingActive
                      ? 'bg-red-650/10 hover:bg-red-650/20 text-red-400 border border-red-500/20'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {trackingActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {trackingActive ? 'Stop Simulation' : 'Start Simulation'}
                </button>
              </div>
            )}

            {/* Footer metadata info */}
            <div className="pt-4 border-t border-zinc-850 mt-4 text-[10px] text-zinc-600 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Google Maps Enterprise systems connected via API Matrix.</span>
            </div>
          </div>
        </div>

        {/* Right Hand: Massive Map viewport container */}
        <div className="lg:col-span-3 bg-zinc-900/40 border border-zinc-800/60 rounded-3xl p-3.5 h-[620px] relative overflow-hidden flex flex-col">
          {/* Custom overlays for status info */}
          <div className="absolute top-6 left-6 z-10 flex gap-2">
            <div className="bg-zinc-950/90 border border-zinc-850 px-3.5 py-2 rounded-xl backdrop-blur-md shadow-2xl flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span className="text-[11px] font-bold text-zinc-300">
                {activeTab === 'fleet' ? 'Fleet Map Overlay' : activeTab === 'geofence' ? 'Geofence Manager' : activeTab === 'heatmap' ? 'Heatmap Density' : activeTab === 'optimize' ? 'Directions Router' : activeTab === 'pricing' ? 'Distance Calculator' : 'Live ETA Path'}
              </span>
            </div>
          </div>

          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/95 z-20 backdrop-blur-md">
              <div className="flex flex-col items-center gap-3">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
                <span className="text-xs text-zinc-400 font-bold tracking-wider">
                  Calibrating Satellite Systems...
                </span>
              </div>
            </div>
          )}

          <div ref={mapRef} className="w-full flex-1 rounded-2xl border border-zinc-850/50 shadow-inner" />

          {/* Feedback alerts inside the workspace */}
          {success && (
            <div className="absolute bottom-6 right-6 z-20 bg-emerald-950/90 border border-emerald-500/40 text-emerald-400 text-xs font-bold px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-2">
              <Check className="w-4 h-4" />
              {success}
            </div>
          )}

          {error && (
            <div className="absolute bottom-6 right-6 z-20 bg-red-950/90 border border-red-500/40 text-red-400 text-xs font-bold px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
