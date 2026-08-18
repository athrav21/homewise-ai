import { MUMBAI_LOCALITIES } from '../data/mumbaiNeighborhoodData';

export const PREFERENCE_OPTIONS = [
  { id: 'schools', label: 'Top Schools & Academies', icon: 'GraduationCap', key: 'schoolScore' },
  { id: 'hospitals', label: 'Hospitals & Healthcare', icon: 'Stethoscope', key: 'hospitalScore' },
  { id: 'markets', label: 'Markets & Shopping', icon: 'ShoppingBag', key: 'marketScore' },
  { id: 'crimeRisk', label: 'Low Crime Risk (High Safety)', icon: 'ShieldCheck', key: 'crimeRiskScore' },
  { id: 'connectivity', label: 'City Connectivity (Metro/Train)', icon: 'Train', key: 'connectivityScore' },
  { id: 'affordablePrice', label: 'Budget Fit / Affordability', icon: 'IndianRupee', key: 'price' },
  { id: 'airQuality', label: 'Clean Air Quality', icon: 'Wind', key: 'airQualityScore' },
  { id: 'floodSafety', label: 'Monsoon Flood Safety', icon: 'Umbrella', key: 'floodSafetyScore' },
  { id: 'futureInfra', label: 'Future Infrastructure Growth', icon: 'TrendingUp', key: 'futureDevelopmentScore' }
];

/**
 * Calculates match score for a given locality based on user preferences and budget range.
 */
export function calculateLocalityMatch(locality, preferences = {}, budgetMin = 1.0, budgetMax = 4.0) {
  const activePrefs = Object.keys(preferences).filter(k => preferences[k] === true);
  
  // Base default weights if no preference selected
  let weights = {
    schoolScore: 0.12,
    hospitalScore: 0.12,
    marketScore: 0.10,
    crimeRiskScore: 0.15,
    connectivityScore: 0.15,
    airQualityScore: 0.12,
    floodSafetyScore: 0.12,
    futureDevelopmentScore: 0.12,
    priceFit: 0.0
  };

  if (activePrefs.length > 0) {
    // Reset weights and assign dynamically based on active selection
    weights = {
      schoolScore: preferences.schools ? 0.20 : 0.05,
      hospitalScore: preferences.hospitals ? 0.20 : 0.05,
      marketScore: preferences.markets ? 0.15 : 0.04,
      crimeRiskScore: preferences.crimeRisk ? 0.22 : 0.06,
      connectivityScore: preferences.connectivity ? 0.22 : 0.06,
      airQualityScore: preferences.airQuality ? 0.18 : 0.04,
      floodSafetyScore: preferences.floodSafety ? 0.18 : 0.04,
      futureDevelopmentScore: preferences.futureInfra ? 0.18 : 0.04,
      priceFit: preferences.affordablePrice ? 0.25 : 0.08
    };
  }

  // Calculate Price Fit Score (0-100)
  const price = locality.averagePriceCr;
  let priceFitScore = 80;

  if (price >= budgetMin && price <= budgetMax) {
    // Perfect fit within budget
    priceFitScore = 98;
  } else if (price < budgetMin) {
    // Under budget - great value!
    priceFitScore = 92;
  } else {
    // Over budget - penalize proportional to excess
    const excessPct = (price - budgetMax) / budgetMax;
    priceFitScore = Math.max(20, Math.round(90 - excessPct * 120));
  }

  // Compute weighted sum
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  
  const weightedSum =
    (locality.schoolScore * weights.schoolScore) +
    (locality.hospitalScore * weights.hospitalScore) +
    (locality.marketScore * weights.marketScore) +
    (locality.crimeRiskScore * weights.crimeRiskScore) +
    (locality.connectivityScore * weights.connectivityScore) +
    (locality.airQualityScore * weights.airQualityScore) +
    (locality.floodSafetyScore * weights.floodSafetyScore) +
    (locality.futureDevelopmentScore * weights.futureDevelopmentScore) +
    (priceFitScore * weights.priceFit);

  const matchScore = Math.min(99, Math.max(45, Math.round(weightedSum / totalWeight)));

  // Generate "Why Recommended" justification text
  const topStrengths = [];
  if (locality.schoolScore >= 88 && preferences.schools) topStrengths.push("high school accessibility");
  if (locality.hospitalScore >= 88 && preferences.hospitals) topStrengths.push("top healthcare density");
  if (locality.connectivityScore >= 90 && preferences.connectivity) topStrengths.push("excellent railway & metro connectivity");
  if (locality.crimeRiskScore >= 88 && preferences.crimeRisk) topStrengths.push("superior safety rating");
  if (locality.airQualityScore >= 78 && preferences.airQuality) topStrengths.push("cleaner air quality");
  if (locality.floodSafetyScore >= 78 && preferences.floodSafety) topStrengths.push("strong monsoon flood resistance");
  if (locality.futureDevelopmentScore >= 90 && preferences.futureInfra) topStrengths.push("high future infrastructure growth");
  if (priceFitScore >= 90) topStrengths.push(`price of ₹${locality.averagePriceCr} Cr fits your ₹${budgetMin}–₹${budgetMax} Cr budget`);

  let whyText = "";
  if (topStrengths.length >= 2) {
    whyText = `Strong match because of its ${topStrengths.slice(0, 3).join(", ")}.`;
  } else {
    whyText = `Well-balanced locality offering ₹${locality.averagePriceCr} Cr property pricing, ${locality.connectivityScore}/100 connectivity, and ${locality.schoolScore}/100 school accessibility.`;
  }

  return {
    locality,
    matchScore,
    priceFitScore,
    whyText,
    isWithinBudget: price <= budgetMax
  };
}

/**
 * Ranks all 40 Mumbai locations and returns the Top 5 recommendations.
 */
export function getTopRecommendations(preferences = {}, budgetMin = 1.0, budgetMax = 4.0) {
  const scored = MUMBAI_LOCALITIES.map((loc) => calculateLocalityMatch(loc, preferences, budgetMin, budgetMax));
  
  // Sort descending by matchScore
  scored.sort((a, b) => b.matchScore - a.matchScore);

  return scored.slice(0, 5);
}
