import { ENV } from '../config/env';
import { cacheService } from './cacheService';
import { calculateHaversineDistance, estimateTravelTime } from '../utils/geoUtils';

export interface RouteSummary {
  start: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  distanceMeters: number;
  distanceKm: number;
  durationSeconds: number;
  durationMinutes: number;
  formattedDistance: string;
  formattedDuration: string;
  source: 'OSRM' | 'Haversine Estimation';
}

export class RoutingService {
  async getRoute(
    startLat: number,
    startLng: number,
    endLat: number,
    endLng: number
  ): Promise<RouteSummary> {
    const cacheKey = `route_${startLat.toFixed(4)}_${startLng.toFixed(4)}_to_${endLat.toFixed(4)}_${endLng.toFixed(4)}`;
    const cached = cacheService.get<RouteSummary>(cacheKey);
    if (cached) return cached;

    // OSRM format: /route/v1/driving/{lon1},{lat1};{lon2},{lat2}?overview=false
    const url = `${ENV.OSRM_ROUTING_URL}/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=false`;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(url, {
        headers: { 'User-Agent': ENV.NOMINATIM_USER_AGENT },
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json();
        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const distMeters = Math.round(route.distance);
          const durSec = Math.round(route.duration);
          const durMin = Math.max(1, Math.round(durSec / 60));
          const distKm = parseFloat((distMeters / 1000).toFixed(2));

          let formattedDuration = `${durMin} mins`;
          if (durMin >= 60) {
            const hrs = Math.floor(durMin / 60);
            const mins = durMin % 60;
            formattedDuration = mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
          }

          const summary: RouteSummary = {
            start: { lat: startLat, lng: startLng },
            destination: { lat: endLat, lng: endLng },
            distanceMeters: distMeters,
            distanceKm: distKm,
            durationSeconds: durSec,
            durationMinutes: durMin,
            formattedDistance: distMeters >= 1000 ? `${distKm} km` : `${distMeters} m`,
            formattedDuration,
            source: 'OSRM'
          };

          cacheService.set(cacheKey, summary, 86400);
          return summary;
        }
      }
    } catch (err) {
      console.warn('OSRM routing request failed or timed out. Using fallback Haversine distance estimation.');
    }

    // Fallback: Haversine calculation + speed estimation
    const dist = calculateHaversineDistance(startLat, startLng, endLat, endLng);
    const travel = estimateTravelTime(dist.distanceMeters);

    const fallbackSummary: RouteSummary = {
      start: { lat: startLat, lng: startLng },
      destination: { lat: endLat, lng: endLng },
      distanceMeters: dist.distanceMeters,
      distanceKm: dist.distanceKm,
      durationSeconds: travel.drivingMinutes * 60,
      durationMinutes: travel.drivingMinutes,
      formattedDistance: dist.formatted,
      formattedDuration: travel.formattedDriving,
      source: 'Haversine Estimation'
    };

    cacheService.set(cacheKey, fallbackSummary, 86400);
    return fallbackSummary;
  }
}

export const routingService = new RoutingService();
