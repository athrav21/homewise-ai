/**
 * Scoring Service & Prototype GenAI Synthesis Engine for Mumbai Metropolitan Region
 * Synthesizes dynamic, contextual natural-language AI Insights across all 12 feature models.
 */

export function generateMumbaiAiInsight(locality, preferences = {}, budgetMin = 1.0, budgetMax = 4.0) {
  const {
    name,
    averagePriceCr,
    schoolScore,
    hospitalScore,
    marketScore,
    connectivityScore,
    crimeRiskScore,
    safetyScore,
    airQualityScore,
    floodSafetyScore,
    waterScore,
    powerScore,
    futureDevelopmentScore,
    futureInfrastructureScore,
    livabilityScore
  } = locality;

  const safetyVal = safetyScore || crimeRiskScore || 80;
  const futureInfraVal = futureInfrastructureScore || futureDevelopmentScore || 80;
  const waterVal = waterScore || 85;
  const powerVal = powerScore || 90;
  const livabilityVal = livabilityScore || 85;

  // Analyze top strengths across all 12 features
  const strengths = [];
  if (schoolScore >= 85) strengths.push(`school quality (${schoolScore}/100)`);
  if (hospitalScore >= 85) strengths.push(`healthcare access (${hospitalScore}/100)`);
  if (marketScore >= 85) strengths.push(`market POI density (${marketScore}/100)`);
  if (connectivityScore >= 88) strengths.push(`transit connectivity (${connectivityScore}/100)`);
  if (safetyVal >= 88) strengths.push(`safety rating (${safetyVal}/100)`);
  if (airQualityScore >= 75) strengths.push(`clean air index (${airQualityScore}/100)`);
  if (floodSafetyScore >= 75) strengths.push(`monsoon flood safety (${floodSafetyScore}/100)`);
  if (waterVal >= 88) strengths.push(`BMC water supply reliability (${waterVal}/100)`);
  if (powerVal >= 90) strengths.push(`power grid stability (${powerVal}/100)`);
  if (futureInfraVal >= 88) strengths.push(`MMRDA infrastructure growth (${futureInfraVal}/100)`);
  if (livabilityVal >= 85) strengths.push(`overall livability score (${livabilityVal}/100)`);

  // Pricing analysis
  let priceNote = "";
  if (averagePriceCr <= budgetMax) {
    priceNote = `Its average property price of ₹${averagePriceCr} Cr falls comfortably within your ₹${budgetMin}–₹${budgetMax} Cr budget range.`;
  } else {
    priceNote = `Its average property price of ₹${averagePriceCr} Cr exceeds your maximum ₹${budgetMax} Cr budget limit. Consider adjacent MMR localities for better affordability.`;
  }

  // Synthesize paragraph
  let summaryParagraph = `${name} scores an overall livability rating of ${livabilityVal}/100. `;
  
  if (strengths.length > 0) {
    summaryParagraph += `Its primary model indicators highlight ${strengths.slice(0, 4).join(", ")}. `;
  } else {
    summaryParagraph += `It offers balanced suburban performance across educational, healthcare, water, and grid infrastructure. `;
  }

  summaryParagraph += `${priceNote}`;

  // Verdict & Caveats
  const verdictText = averagePriceCr <= budgetMax && (schoolScore >= 80 || connectivityScore >= 80 || livabilityVal >= 80)
    ? `Highly recommended for property site visits in ${name}. Fits budget and matches core lifestyle priorities.`
    : `Suitable location to compare against alternative MMR options.`;

  const caveatText = `Verify peak-hour Metro/highway transit times, local BMC water supply pressure schedules, monsoon flood history on your specific lane, and society maintenance charges prior to booking.`;

  return {
    summary: summaryParagraph,
    verdict: verdictText,
    caveat: caveatText,
    generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}

