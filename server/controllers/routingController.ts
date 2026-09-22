import { Request, Response } from 'express';
import { isValidCoordinate } from '../utils/geoUtils';
import { routingService } from '../services/routingService';

export async function getRouteDistance(req: Request, res: Response): Promise<void> {
  try {
    const { startLat, startLng, endLat, endLng } = req.query;

    if (!isValidCoordinate(startLat, startLng) || !isValidCoordinate(endLat, endLng)) {
      res.status(400).json({
        success: false,
        error: 'Invalid coordinates. Both start and destination coordinates (startLat, startLng, endLat, endLng) are required.'
      });
      return;
    }

    const sLat = parseFloat(startLat as string);
    const sLng = parseFloat(startLng as string);
    const eLat = parseFloat(endLat as string);
    const eLng = parseFloat(endLng as string);

    const route = await routingService.getRoute(sLat, sLng, eLat, eLng);

    res.json({
      success: true,
      data: route
    });
  } catch (error: any) {
    console.error('getRouteDistance error:', error);
    res.status(500).json({
      success: false,
      error: 'Routing calculation failed'
    });
  }
}
