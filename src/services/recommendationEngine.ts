import { Accommodation, RecommendationResult, SustainabilityMetrics, UserPreferences } from '../types';

/**
 * Calculates the total EcoScore (0-100) based on weighted sustainability pillars:
 * 25% Renewable/Energy (Solar, etc.)
 * 20% Water Conservation
 * 20% Waste Management
 * 15% Energy Efficiency
 * 10% Local Community Support
 * 10% Green Construction
 */
export function calculateEcoScore(s: SustainabilityMetrics): number {
  const score =
    (s.solar || 0) * 0.25 +
    (s.water_conservation || 0) * 0.20 +
    (s.waste_management || 0) * 0.20 +
    (s.energy_efficiency || 0) * 0.15 +
    (s.local_support || 0) * 0.10 +
    (s.green_construction || 0) * 0.10;

  return Math.round(score);
}

/**
 * Letter grade helper based on EcoScore
 */
export function getEcoScoreGrade(score: number): { grade: string; color: string; bg: string; text: string } {
  if (score >= 90) return { grade: 'A+', color: '#1B5E20', bg: '#E8F5E9', text: 'text-green-800' };
  if (score >= 80) return { grade: 'A', color: '#2E7D32', bg: '#E8F5E9', text: 'text-green-700' };
  if (score >= 70) return { grade: 'B', color: '#558B2F', bg: '#F1F8E9', text: 'text-lime-700' };
  if (score >= 60) return { grade: 'C', color: '#F57F17', bg: '#FFFDE7', text: 'text-amber-700' };
  return { grade: 'D', color: '#D84315', bg: '#FBE9E7', text: 'text-orange-700' };
}

/**
 * Explainable Recommendation Engine
 * Ranks accommodations using weighted multi-factor scoring:
 * Final Score = 0.40 * Sustainability + 0.25 * Preference + 0.15 * Location + 0.10 * Budget + 0.10 * Rating
 */
export function generateRecommendations(
  accommodations: Accommodation[],
  preferences: UserPreferences
): RecommendationResult[] {
  return accommodations
    .filter(acc => acc.status === 'active')
    .map(acc => {
      const sustainabilityScore = calculateEcoScore(acc.sustainability);
      const matchReasons: string[] = [];

      // 1. Preference Match Score (0 - 100)
      const selectedPriorities = Object.entries(preferences.priorities).filter(([_, active]) => active);
      let preferenceScore = 80; // default baseline if no specific priorities selected

      if (selectedPriorities.length > 0) {
        let matchedPoints = 0;
        selectedPriorities.forEach(([key]) => {
          switch (key) {
            case 'solar':
              if (acc.sustainability.solar >= 75) {
                matchedPoints += 100;
                matchReasons.push('100% powered by renewable solar & clean energy');
              } else {
                matchedPoints += acc.sustainability.solar;
              }
              break;
            case 'water':
              if (acc.sustainability.water_conservation >= 75) {
                matchedPoints += 100;
                matchReasons.push('Advanced rainwater harvesting & greywater recycling');
              } else {
                matchedPoints += acc.sustainability.water_conservation;
              }
              break;
            case 'waste':
              if (acc.sustainability.waste_management >= 75) {
                matchedPoints += 100;
                matchReasons.push('Zero single-use plastic & organic composting');
              } else {
                matchedPoints += acc.sustainability.waste_management;
              }
              break;
            case 'energy':
              if (acc.sustainability.energy_efficiency >= 75) {
                matchedPoints += 100;
                matchReasons.push('Smart energy conservation & passive climate design');
              } else {
                matchedPoints += acc.sustainability.energy_efficiency;
              }
              break;
            case 'community':
              if (acc.sustainability.local_support >= 75) {
                matchedPoints += 100;
                matchReasons.push('Direct support to local indigenous community & organic cuisine');
              } else {
                matchedPoints += acc.sustainability.local_support;
              }
              break;
            case 'construction':
              if (acc.sustainability.green_construction >= 75) {
                matchedPoints += 100;
                matchReasons.push('Built with vernacular bamboo, clay & IGBC-certified materials');
              } else {
                matchedPoints += acc.sustainability.green_construction;
              }
              break;
          }
        });
        preferenceScore = Math.round(matchedPoints / selectedPriorities.length);
      }

      // 2. Location Match Score (0 - 100)
      let locationScore = 100;
      if (preferences.destination && preferences.destination.trim() !== '') {
        const dest = preferences.destination.toLowerCase().trim();
        const loc = acc.location.toLowerCase();
        const country = acc.country.toLowerCase();
        const name = acc.name.toLowerCase();

        if (loc.includes(dest) || country.includes(dest)) {
          locationScore = 100;
          matchReasons.push(`Exact location match for "${preferences.destination}"`);
        } else if (name.includes(dest)) {
          locationScore = 90;
        } else {
          locationScore = 30; // Not direct match
        }
      }

      // 3. Budget Match Score (0 - 100)
      let budgetScore = 100;
      if (preferences.maxBudget && preferences.maxBudget > 0) {
        if (acc.price_per_night <= preferences.maxBudget) {
          const ratio = acc.price_per_night / preferences.maxBudget;
          budgetScore = Math.round(100 - (ratio * 15)); // Good value within budget
          if (acc.price_per_night <= preferences.maxBudget * 0.75) {
            matchReasons.push(`Great value: well within your ₹${preferences.maxBudget.toLocaleString('en-IN')} budget`);
          }
        } else {
          const overageRatio = (acc.price_per_night - preferences.maxBudget) / preferences.maxBudget;
          budgetScore = Math.max(0, Math.round(100 - (overageRatio * 100)));
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

      // Composite Weighted Score Formula (PDF Spec)
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
        matchReasons: matchReasons.slice(0, 3), // Top 3 reasons
        preferenceMatchScore: preferenceScore,
        locationMatchScore: locationScore,
        budgetMatchScore: budgetScore,
        ratingScore
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}
