import { MUMBAI_LOCALITIES } from '../data/mumbaiNeighborhoodData';

export const PREFERENCE_SLIDERS = [
  { id: 'school', label: 'School Quality', icon: 'GraduationCap', key: 'schoolScore', source: 'UDISE+ & OSM Data' },
  { id: 'hospital', label: 'Hospital Access', icon: 'Stethoscope', key: 'hospitalScore', source: 'BMC/OpenCity & OSM' },
  { id: 'market', label: 'Market Access', icon: 'ShoppingBag', key: 'marketScore', source: 'Overpass API POIs' },
  { id: 'safety', label: 'Safety & Low Crime', icon: 'ShieldCheck', key: 'safetyScore', source: 'Mumbai Police & NCRB' },
  { id: 'connectivity', label: 'City Transit Access', icon: 'Train', key: 'connectivityScore', source: 'OSM & MMRDA Metro' },
  { id: 'airQuality', label: 'Clean Air Quality', icon: 'Wind', key: 'airQualityScore', source: 'CPCB & MPCB Stations' },
  { id: 'floodSafety', label: 'Monsoon Flood Safety', icon: 'Umbrella', key: 'floodSafetyScore', source: 'ISRO Bhuvan GIS' },
  { id: 'affordability', label: 'Budget Affordability', icon: 'IndianRupee', key: 'priceScore', source: '70K+ Housing Dataset' },
  { id: 'water', label: 'Water Reliability', icon: 'Droplets', key: 'waterScore', source: 'BMC Municipal Water' },
  { id: 'power', label: 'Power Grid Stability', icon: 'Zap', key: 'powerScore', source: 'MSEDCL & Mahavitaran' },
  { id: 'futureInfrastructure', label: 'Future Infrastructure', icon: 'Construction', key: 'futureInfrastructureScore', source: 'MMRDA GIS Projects' }
];

export const PREFERENCE_OPTIONS = PREFERENCE_SLIDERS;

/**
 * Calculates dynamic match score for a locality across 11 features using 1-10 user slider weights & budget ceiling.
 */
export function calculateLocalityMatch(locality, preferences = {}, budgetMax = 3.5) {
  // Extract 1-10 slider values (default to 5 for neutral priority)
  const getImportance = (key) => {
    const val = preferences[key];
    if (val === undefined || val === null) return 5;
    const num = parseFloat(val);
    return isNaN(num) ? 5 : Math.max(1, Math.min(10, num));
  };

  const imp = {
    schoolScore: getImportance('school'),
    hospitalScore: getImportance('hospital'),
    marketScore: getImportance('market'),
    safetyScore: getImportance('safety'),
    connectivityScore: getImportance('connectivity'),
    airQualityScore: getImportance('airQuality'),
    floodSafetyScore: getImportance('floodSafety'),
    priceScore: getImportance('affordability'),
    waterScore: getImportance('water'),
    powerScore: getImportance('power'),
    futureInfrastructureScore: getImportance('futureInfrastructure')
  };

  const totalImportance = Object.values(imp).reduce((a, b) => a + b, 0) || 55;

  // Normalized MCDM Weights (sum up to 1.0)
  const weights = {};
  for (const key in imp) {
    weights[key] = imp[key] / totalImportance;
  }

  // Extract raw locality scores
  const price = locality.averagePriceCr || 3.5;
  const schoolVal = locality.schoolScore || 80;
  const hospitalVal = locality.hospitalScore || 80;
  const marketVal = locality.marketScore || 80;
  const safetyVal = locality.safetyScore || locality.crimeRiskScore || 80;
  const connectivityVal = locality.connectivityScore || 80;
  const airVal = locality.airQualityScore || 70;
  const floodVal = locality.floodSafetyScore || 70;
  const waterVal = locality.waterScore || 85;
  const powerVal = locality.powerScore || 90;
  const futureInfraVal = locality.futureInfrastructureScore || locality.futureDevelopmentScore || 80;

  // Calculate Price Affordability Score (0-100) relative to budgetMax
  let priceFitScore = 80;
  if (price <= budgetMax) {
    const underPct = (budgetMax - price) / budgetMax;
    priceFitScore = Math.min(99, Math.round(85 + underPct * 14));
  } else {
    const excessPct = (price - budgetMax) / budgetMax;
    priceFitScore = Math.max(15, Math.round(80 - excessPct * 130));
  }

  // Weighted Sum Calculation across all 11 factors
  const weightedSum =
    (schoolVal * weights.schoolScore) +
    (hospitalVal * weights.hospitalScore) +
    (marketVal * weights.marketScore) +
    (safetyVal * weights.safetyScore) +
    (connectivityVal * weights.connectivityScore) +
    (airVal * weights.airQualityScore) +
    (floodVal * weights.floodSafetyScore) +
    (priceFitScore * weights.priceScore) +
    (waterVal * weights.waterScore) +
    (powerVal * weights.powerScore) +
    (futureInfraVal * weights.futureInfrastructureScore);

  let matchScore = Math.min(99, Math.max(25, Math.round(weightedSum)));

  // Hard Budget Penalty if price exceeds budget ceiling by over 25%
  if (price > budgetMax * 1.25) {
    matchScore = Math.max(20, Math.round(matchScore * 0.75));
  }

  // Synthesize justification strengths based on high user slider preferences (>= 7)
  const topStrengths = [];
  if (schoolVal >= 88 && imp.schoolScore >= 7) topStrengths.push("high school accessibility");
  if (hospitalVal >= 88 && imp.hospitalScore >= 7) topStrengths.push("top healthcare density");
  if (connectivityVal >= 90 && imp.connectivityScore >= 7) topStrengths.push("excellent transit connectivity");
  if (safetyVal >= 88 && imp.safetyScore >= 7) topStrengths.push("superior safety rating");
  if (airVal >= 75 && imp.airQualityScore >= 7) topStrengths.push("cleaner air quality");
  if (floodVal >= 75 && imp.floodSafetyScore >= 7) topStrengths.push("monsoon flood resistance");
  if (waterVal >= 88 && imp.waterScore >= 7) topStrengths.push("reliable municipal water supply");
  if (powerVal >= 90 && imp.powerScore >= 7) topStrengths.push("stable electrical power grid");
  if (futureInfraVal >= 88 && imp.futureInfrastructureScore >= 7) topStrengths.push("future infrastructure expansion");
  if (price <= budgetMax && imp.priceScore >= 7) topStrengths.push(`property price of ₹${price} Cr fitting your ₹${budgetMax} Cr budget`);

  let whyText = "";
  if (topStrengths.length >= 2) {
    whyText = `Strong match because of its ${topStrengths.slice(0, 3).join(", ")}.`;
  } else {
    whyText = `Balanced location offering ₹${price} Cr property pricing, ${matchScore}/100 match rating, ${waterVal}/100 water reliability, and ${connectivityVal}/100 transit access.`;
  }

  return {
    locality: {
      ...locality,
      livabilityScore: matchScore // Calculated dynamically from factors + user weights
    },
    matchScore,
    priceFitScore,
    whyText,
    isWithinBudget: price <= budgetMax,
    weights
  };
}

/**
 * Ranks all 40 Mumbai locations dynamically based on user 1-10 preferences and budget ceiling.
 */
export function getTopRecommendations(preferences = {}, budgetMax = 3.5) {
  const scored = MUMBAI_LOCALITIES.map((loc) => calculateLocalityMatch(loc, preferences, budgetMax));
  
  // Sort descending by budget eligibility first, then matchScore
  scored.sort((a, b) => {
    if (a.isWithinBudget !== b.isWithinBudget) {
      return a.isWithinBudget ? -1 : 1;
    }
    return b.matchScore - a.matchScore;
  });

  return scored.slice(0, 5);
}


