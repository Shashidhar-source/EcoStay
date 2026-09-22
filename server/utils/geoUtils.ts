/**
 * Geo Utilities for distance calculation, bounding box derivation, and coordinate validation.
 */

// Validate latitude and longitude
export function isValidCoordinate(lat: unknown, lng: unknown): boolean {
  const numLat = Number(lat);
  const numLng = Number(lng);
  return (
    !isNaN(numLat) &&
    !isNaN(numLng) &&
    numLat >= -90 &&
    numLat <= 90 &&
    numLng >= -180 &&
    numLng <= 180
  );
}

// Calculate great-circle distance between two points using Haversine formula (in meters and km)
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): { distanceMeters: number; distanceKm: number; formatted: string } {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceMeters = Math.round(R * c);
  const distanceKm = parseFloat((distanceMeters / 1000).toFixed(2));

  let formatted = `${distanceMeters} m`;
  if (distanceMeters >= 1000) {
    formatted = `${distanceKm} km`;
  }

  return { distanceMeters, distanceKm, formatted };
}

// Estimate approximate driving/walking travel time based on average speeds
export function estimateTravelTime(distanceMeters: number): {
  drivingMinutes: number;
  walkingMinutes: number;
  formattedDriving: string;
} {
  const avgDrivingSpeedKmh = 35; // typical Indian urban/hilly speed
  const avgWalkingSpeedKmh = 4.5;

  const drivingHours = (distanceMeters / 1000) / avgDrivingSpeedKmh;
  const walkingHours = (distanceMeters / 1000) / avgWalkingSpeedKmh;

  const drivingMinutes = Math.max(1, Math.round(drivingHours * 60));
  const walkingMinutes = Math.max(1, Math.round(walkingHours * 60));

  let formattedDriving = `${drivingMinutes} mins`;
  if (drivingMinutes >= 60) {
    const hrs = Math.floor(drivingMinutes / 60);
    const mins = drivingMinutes % 60;
    formattedDriving = mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  }

  return { drivingMinutes, walkingMinutes, formattedDriving };
}
