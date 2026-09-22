import { Request, Response } from 'express';
import { isValidCoordinate } from '../utils/geoUtils';
import { providerManager } from '../services/providers/providerManager';
import { ENV } from '../config/env';

export async function getNearbyHotels(req: Request, res: Response): Promise<void> {
  try {
    const { lat, lng, radius, minEcoScore, budgetMax, budgetMin, minRating } = req.query;

    if (!isValidCoordinate(lat, lng)) {
      res.status(400).json({
        success: false,
        error: 'Invalid coordinates. Please provide valid latitude (-90 to 90) and longitude (-180 to 180).'
      });
      return;
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);
    const radiusMeters = radius ? Math.min(parseInt(radius as string, 10), ENV.MAX_SEARCH_RADIUS_METERS) : ENV.DEFAULT_SEARCH_RADIUS_METERS;
    const maxBudget = budgetMax ? parseInt(budgetMax as string, 10) : undefined;
    const minBudget = budgetMin ? parseInt(budgetMin as string, 10) : undefined;
    const ratingThreshold = minRating ? parseFloat(minRating as string) : undefined;

    let hotels = await providerManager.searchHotels({
      lat: latitude,
      lng: longitude,
      radiusMeters,
      budgetMax: maxBudget,
      budgetMin: minBudget,
      minRating: ratingThreshold
    });

    if (minEcoScore) {
      const ecoScoreFilter = parseInt(minEcoScore as string, 10);
      hotels = hotels.filter(h => (h.sustainabilityEcoScore || 0) >= ecoScoreFilter || h.sustainabilityRating === 'verified');
    }

    res.json({
      success: true,
      source: 'Multi-Provider Engine (Google Places + Foursquare + OSM + EcoStay Verified DB)',
      count: hotels.length,
      center: { lat: latitude, lng: longitude },
      radiusMeters,
      filters: {
        budgetMax: maxBudget || null,
        budgetMin: minBudget || null,
        minEcoScore: minEcoScore ? parseInt(minEcoScore as string, 10) : null
      },
      data: hotels
    });
  } catch (error: any) {
    console.error('getNearbyHotels error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch nearby hotels. Please try again.'
    });
  }
}
