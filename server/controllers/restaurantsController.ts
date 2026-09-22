import { Request, Response } from 'express';
import { isValidCoordinate } from '../utils/geoUtils';
import { providerManager } from '../services/providers/providerManager';
import { restaurantService } from '../services/restaurantService';
import { ENV } from '../config/env';

export async function getNearbyRestaurants(req: Request, res: Response): Promise<void> {
  try {
    const {
      lat,
      lng,
      radius,
      cuisine,
      foodType,
      vegetarian,
      nonVegetarian,
      budgetLevel,
      budgetMax,
      budgetMin,
      minRating,
      openNow
    } = req.query;

    if (!isValidCoordinate(lat, lng)) {
      res.status(400).json({
        success: false,
        error: 'Invalid coordinates. Please provide valid numeric latitude and longitude.'
      });
      return;
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);
    const radiusMeters = radius ? Math.min(parseInt(radius as string, 10), ENV.MAX_SEARCH_RADIUS_METERS) : ENV.DEFAULT_SEARCH_RADIUS_METERS;
    const maxBudget = budgetMax ? parseInt(budgetMax as string, 10) : undefined;
    const minBudget = budgetMin ? parseInt(budgetMin as string, 10) : undefined;
    const ratingThreshold = minRating ? parseFloat(minRating as string) : undefined;

    const restaurants = await providerManager.searchRestaurants({
      lat: latitude,
      lng: longitude,
      radiusMeters,
      cuisine: cuisine as string,
      foodType: foodType as any,
      vegetarian: vegetarian as any,
      nonVegetarian: nonVegetarian as any,
      budgetMax: maxBudget,
      budgetMin: minBudget,
      minRating: ratingThreshold,
      openNow: openNow === 'true'
    });

    res.json({
      success: true,
      source: 'Multi-Provider Engine (Google Places + Foursquare + OSM + Verified DB)',
      count: restaurants.length,
      center: { lat: latitude, lng: longitude },
      radiusMeters,
      filters: {
        cuisine: cuisine || 'all',
        foodType: foodType || 'all',
        vegetarian: vegetarian || 'any',
        budgetMax: maxBudget || null,
        budgetMin: minBudget || null,
        minRating: ratingThreshold || null
      },
      data: restaurants
    });
  } catch (error: any) {
    console.error('getNearbyRestaurants error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch nearby restaurants. Please check coordinates and try again.'
    });
  }
}

export async function getRestaurantById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const restaurant = await restaurantService.getById(id);

    if (!restaurant) {
      res.status(404).json({
        success: false,
        error: `Restaurant with ID '${id}' not found`
      });
      return;
    }

    res.json({
      success: true,
      data: restaurant
    });
  } catch (error: any) {
    console.error('getRestaurantById error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while retrieving restaurant'
    });
  }
}

export async function getRestaurantMenu(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const menu = await restaurantService.getMenu(id);

    res.json({
      success: true,
      restaurantId: id,
      count: menu.length,
      data: menu
    });
  } catch (error: any) {
    console.error('getRestaurantMenu error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve restaurant menu'
    });
  }
}

export async function addRestaurantMenuItem(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { name, description, priceInr, category, isVegetarian, isVegan } = req.body;

    if (!name || priceInr === undefined || !category) {
      res.status(400).json({
        success: false,
        error: 'Missing required menu item fields (name, priceInr, category)'
      });
      return;
    }

    const created = await restaurantService.addMenuItem(id, {
      name,
      description,
      priceInr: Number(priceInr),
      category,
      isVegetarian: Boolean(isVegetarian),
      isVegan: Boolean(isVegan)
    });

    if (!created) {
      res.status(404).json({
        success: false,
        error: `Restaurant '${id}' not found in local editable database`
      });
      return;
    }

    res.status(201).json({
      success: true,
      data: created
    });
  } catch (err: any) {
    console.error('addRestaurantMenuItem error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to add menu item'
    });
  }
}
