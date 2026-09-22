import { Request, Response } from 'express';
import { isValidCoordinate } from '../utils/geoUtils';
import { providerManager } from '../services/providers/providerManager';
import { ENV } from '../config/env';

export async function getNearbyPlaces(req: Request, res: Response): Promise<void> {
  try {
    const { lat, lng, radius, type } = req.query;

    if (!isValidCoordinate(lat, lng)) {
      res.status(400).json({
        success: false,
        error: 'Invalid or missing latitude/longitude coordinates'
      });
      return;
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);
    const radiusMeters = radius ? Math.min(parseInt(radius as string, 10), ENV.MAX_SEARCH_RADIUS_METERS) : ENV.DEFAULT_SEARCH_RADIUS_METERS;
    const placeType = (type as string)?.toLowerCase() || 'all';

    let hotels: any[] = [];
    let restaurants: any[] = [];

    if (placeType === 'hotel' || placeType === 'accommodation' || placeType === 'all' || placeType === 'stay') {
      hotels = await providerManager.searchHotels({
        lat: latitude,
        lng: longitude,
        radiusMeters
      });
    }

    if (placeType === 'restaurant' || placeType === 'cafe' || placeType === 'food' || placeType === 'all' || placeType === 'dining') {
      restaurants = await providerManager.searchRestaurants({
        lat: latitude,
        lng: longitude,
        radiusMeters
      });
    }

    const totalCount = hotels.length + restaurants.length;

    res.json({
      success: true,
      source: 'Multi-Provider Engine (Google Places + Foursquare + OSM + EcoStay DB)',
      center: { lat: latitude, lng: longitude },
      radiusMeters,
      count: totalCount,
      data: {
        hotels,
        restaurants,
        all: [...hotels, ...restaurants].sort((a, b) => (a.distance?.meters || 0) - (b.distance?.meters || 0))
      }
    });
  } catch (error: any) {
    console.error('getNearbyPlaces error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch nearby places. Please try again later.'
    });
  }
}
