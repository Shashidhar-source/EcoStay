import { AccommodationEntity } from '../data/seedAccommodations';
import { accommodationService } from './accommodationService';

export interface BackendUserPreferences {
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  maxBudget?: number;
  propertyType?: string;
  priorities?: {
    solar?: boolean;
    water?: boolean;
    waste?: boolean;
    energy?: boolean;
    community?: boolean;
    construction?: boolean;
  };
}

export interface BackendRecommendationResult {
  accommodation: AccommodationEntity;
  matchScore: number;
  sustainabilityScore: number;
  matchReasons: string[];
  preferenceMatchScore: number;
  locationMatchScore: number;
  budgetMatchScore: number;
  ratingScore: number;
}

export function calculateEcoScore(s: AccommodationEntity['sustainability']): number {
  const score =
    (s.solar || 0) * 0.25 +
    (s.water_conservation || 0) * 0.20 +
    (s.waste_management || 0) * 0.20 +
    (s.energy_efficiency || 0) * 0.15 +
    (s.local_support || 0) * 0.10 +
    (s.green_construction || 0) * 0.10;

  return Math.round(score);
}

export class RecommendationService {
  async getRecommendations(preferences: BackendUserPreferences): Promise<BackendRecommendationResult[]> {
    const accommodations = await accommodationService.getAll();
    const priorities = preferences.priorities || {};

    const results: BackendRecommendationResult[] = accommodations
      .filter(a => a.status === 'active')
      .map(acc => {
        const sustainabilityScore = calculateEcoScore(acc.sustainability);
        const matchReasons: string[] = [];

        // 1. Preference Match Score (0 - 100)
        const selectedPriorities = Object.entries(priorities).filter(([_, v]) => v);
        let preferenceScore = 80;

        if (selectedPriorities.length > 0) {
          let matched = 0;
          selectedPriorities.forEach(([key]) => {
            switch (key) {
              case 'solar':
                if (acc.sustainability.solar >= 75) {
                  matched += 100;
                  matchReasons.push('100% powered by renewable solar & clean energy');
                } else matched += acc.sustainability.solar;
                break;
              case 'water':
                if (acc.sustainability.water_conservation >= 75) {
                  matched += 100;
                  matchReasons.push('Rainwater harvesting & Bawadi water conservation');
                } else matched += acc.sustainability.water_conservation;
                break;
              case 'waste':
                if (acc.sustainability.waste_management >= 75) {
                  matched += 100;
                  matchReasons.push('Zero single-use plastic & organic bio-composting');
                } else matched += acc.sustainability.waste_management;
                break;
              case 'energy':
                if (acc.sustainability.energy_efficiency >= 75) {
                  matched += 100;
                  matchReasons.push('Passive thermal climate design & energy efficiency');
                } else matched += acc.sustainability.energy_efficiency;
                break;
              case 'community':
                if (acc.sustainability.local_support >= 75) {
                  matched += 100;
                  matchReasons.push('Fair local employment & Ayurvedic organic sourcing');
                } else matched += acc.sustainability.local_support;
                break;
              case 'construction':
                if (acc.sustainability.green_construction >= 75) {
                  matched += 100;
                  matchReasons.push('Vernacular bamboo, clay & IGBC-certified materials');
                } else matched += acc.sustainability.green_construction;
                break;
            }
          });
          preferenceScore = Math.round(matched / selectedPriorities.length);
        }

        // 2. Location Match Score (0 - 100)
        let locationScore = 100;
        if (preferences.destination && preferences.destination.trim() !== '') {
          const dest = preferences.destination.toLowerCase().trim();
          const loc = acc.location.toLowerCase();
          const name = acc.name.toLowerCase();

          if (loc.includes(dest)) {
            locationScore = 100;
            matchReasons.push(`Exact location match for "${preferences.destination}"`);
          } else if (name.includes(dest)) {
            locationScore = 90;
          } else {
            locationScore = 30;
          }
        }

        // 3. Budget Match Score (0 - 100)
        let budgetScore = 100;
        if (preferences.maxBudget && preferences.maxBudget > 0) {
          if (acc.price_per_night <= preferences.maxBudget) {
            const ratio = acc.price_per_night / preferences.maxBudget;
            budgetScore = Math.round(100 - ratio * 15);
            if (acc.price_per_night <= preferences.maxBudget * 0.75) {
              matchReasons.push(`Great value: well within your ₹${preferences.maxBudget.toLocaleString('en-IN')} budget`);
            }
          } else {
            const over = (acc.price_per_night - preferences.maxBudget) / preferences.maxBudget;
            budgetScore = Math.max(0, Math.round(100 - over * 100));
          }
        }

        // 4. Rating Score (0 - 100)
        const ratingScore = Math.round((acc.rating / 5) * 100);
        if (acc.rating >= 4.8) {
          matchReasons.push(`Exceptional guest rating (${acc.rating} ★)`);
        }

        if (acc.sustainability.certificationStatus === 'verified') {
          matchReasons.push(`Independently audited by ${acc.sustainability.certificationIssuer || 'National Ecotourism Council'}`);
        }

        // Weighted Composite Formula (PDF Spec)
        const finalScore = Math.round(
          0.40 * sustainabilityScore +
          0.25 * preferenceScore +
          0.15 * locationScore +
          0.10 * budgetScore +
          0.10 * ratingScore
        );

        return {
          accommodation: acc,
          matchScore: Math.min(100, Math.max(0, finalScore)),
          sustainabilityScore,
          matchReasons: matchReasons.slice(0, 3),
          preferenceMatchScore: preferenceScore,
          locationMatchScore: locationScore,
          budgetMatchScore: budgetScore,
          ratingScore
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);

    return results;
  }
}

export const recommendationService = new RecommendationService();
