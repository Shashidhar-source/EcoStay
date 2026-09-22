import { Request, Response } from 'express';
import { accommodationService } from '../services/accommodationService';
import { recommendationService } from '../services/recommendationService';

export async function getAllAccommodations(req: Request, res: Response): Promise<void> {
  try {
    const list = await accommodationService.getAll();
    res.json({
      success: true,
      count: list.length,
      data: list
    });
  } catch (error: any) {
    console.error('getAllAccommodations error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch accommodations' });
  }
}

export async function getAccommodationById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const item = await accommodationService.getById(id);

    if (!item) {
      res.status(404).json({
        success: false,
        error: `Accommodation with ID '${id}' not found`
      });
      return;
    }

    res.json({
      success: true,
      data: item
    });
  } catch (error: any) {
    console.error('getAccommodationById error:', error);
    res.status(500).json({ success: false, error: 'Error fetching accommodation details' });
  }
}

export async function generateRecommendations(req: Request, res: Response): Promise<void> {
  try {
    const preferences = req.body || {};
    const results = await recommendationService.getRecommendations(preferences);

    res.json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error: any) {
    console.error('generateRecommendations error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate recommendations' });
  }
}

export async function saveAccommodation(req: Request, res: Response): Promise<void> {
  try {
    const data = req.body;
    if (!data.name || !data.price_per_night) {
      res.status(400).json({ success: false, error: 'Name and price per night are required' });
      return;
    }

    const saved = await accommodationService.save(data);
    res.status(201).json({
      success: true,
      data: saved
    });
  } catch (error: any) {
    console.error('saveAccommodation error:', error);
    res.status(500).json({ success: false, error: 'Failed to save accommodation' });
  }
}

export async function deleteAccommodation(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const deleted = await accommodationService.delete(id);
    res.json({
      success: deleted,
      message: deleted ? 'Accommodation deleted' : 'Not found'
    });
  } catch (error: any) {
    console.error('deleteAccommodation error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete accommodation' });
  }
}

export async function getAdminMetrics(req: Request, res: Response): Promise<void> {
  try {
    const list = await accommodationService.getAll();
    const verified = list.filter(a => a.sustainability?.certificationStatus === 'verified').length;
    const avgScore = list.length > 0
      ? Math.round(list.reduce((acc, a) => acc + (a.calculatedEcoScore || 0), 0) / list.length)
      : 0;

    res.json({
      success: true,
      data: {
        totalAccommodations: list.length,
        verifiedAccommodations: verified,
        averageEcoScore: avgScore,
        totalBookings: 18,
        totalUsers: 142,
        pendingReviewsCount: 0,
        carbonOffsetKg: 8420
      }
    });
  } catch (error: any) {
    console.error('getAdminMetrics error:', error);
    res.status(500).json({ success: false, error: 'Failed to get admin metrics' });
  }
}
