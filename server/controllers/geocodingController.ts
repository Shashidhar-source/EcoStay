import { Request, Response } from 'express';
import { nominatimService } from '../services/nominatimService';
import { isValidCoordinate } from '../utils/geoUtils';

export async function geocodeLocation(req: Request, res: Response): Promise<void> {
  try {
    const query = (req.query.q as string) || (req.query.address as string) || (req.query.city as string);

    if (!query || !query.trim()) {
      res.status(400).json({
        success: false,
        error: 'Please provide a search query using "?q=city_or_place_name"'
      });
      return;
    }

    const results = await nominatimService.geocode(query);

    if (results.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Location could not be found'
      });
      return;
    }

    res.json({
      success: true,
      query,
      count: results.length,
      data: results
    });
  } catch (error: any) {
    console.error('geocodeLocation error:', error);
    res.status(500).json({
      success: false,
      error: 'Geocoding service unavailable'
    });
  }
}

export async function reverseGeocodeLocation(req: Request, res: Response): Promise<void> {
  try {
    const { lat, lng } = req.query;

    if (!isValidCoordinate(lat, lng)) {
      res.status(400).json({
        success: false,
        error: 'Invalid coordinates provided for reverse geocoding'
      });
      return;
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);

    const result = await nominatimService.reverseGeocode(latitude, longitude);

    if (!result) {
      res.status(404).json({
        success: false,
        error: 'No address found for the given coordinates'
      });
      return;
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('reverseGeocodeLocation error:', error);
    res.status(500).json({
      success: false,
      error: 'Reverse geocoding failed'
    });
  }
}
