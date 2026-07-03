/**
 * Geo-Search API helpers
 * Used by both the Provider location-update page and the Customer search page.
 */
import { apiClient } from './apiClient';

export interface ProviderSearchResult {
  id: string;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  profile_image: string | null;
  provider_type: string | null;
  designation: string | null;
  contact_number: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  distance_km: number;
  is_available: number;
  verification_status: string | null;
  experience_years: number | null;
}

export interface NearbyProvidersResponse {
  data: ProviderSearchResult[];
  radius_used_km: number;
  total_found: number;
  service_name: string | null;
}

export interface LocationUpdatePayload {
  latitude: number;
  longitude: number;
}

/** Customer: find nearby providers for a given service */
export async function searchNearbyProviders(
  customerLat: number,
  customerLng: number,
  serviceId?: string,
): Promise<NearbyProvidersResponse> {
  const params: Record<string, string | number> = {
    customer_lat: customerLat,
    customer_lng: customerLng,
  };
  if (serviceId) params.service_id = serviceId;

  const res = await apiClient.get<NearbyProvidersResponse>('/search/providers', { params });
  return res.data;
}

/** Provider: update their own location (requires Bearer token) */
export async function updateProviderLocation(
  payload: LocationUpdatePayload,
): Promise<{ status: boolean; message: string }> {
  const res = await apiClient.put('/provider/location', payload);
  return res.data;
}

/** Browser Geolocation wrapper — resolves with {latitude, longitude} or rejects */
export function getCurrentPosition(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
      (err) => reject(new Error(err.message)),
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  });
}
