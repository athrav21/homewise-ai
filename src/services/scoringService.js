/**
 * Scoring Service & Prototype GenAI Synthesis Engine for Mumbai Metropolitan Region
 * Synthesizes dynamic, contextual natural-language AI Insights based on user preferences and selected locality.
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
    airQualityScore,
    floodSafetyScore,
    futureDevelopmentScore
  } = locality;

  const activePrefKeys = Object.keys(preferences).filter(k => preferences[k] === true);

  // Analyze top strengths
  const strengths = [];
  if (schoolScore >= 85) strengths.push(`school accessibility (${schoolScore}/100)`);
  if (hospitalScore >= 85) strengths.push(`healthcare access (${hospitalScore}/100)`);
  if (connectivityScore >= 88) strengths.push(`city transit connectivity (${connectivityScore}/100)`);
  if (crimeRiskScore >= 88) strengths.push(`high safety rating (${crimeRiskScore}/100)`);
  if (airQualityScore >= 75) strengths.push(`cleaner air quality (${airQualityScore}/100)`);
  if (floodSafetyScore >= 75) strengths.push(`monsoon flood safety (${floodSafetyScore}/100)`);
  if (futureDevelopmentScore >= 88) strengths.push(`future infrastructure expansion (${futureDevelopmentScore}/100)`);

  // Pricing analysis
  let priceNote = "";
  if (averagePriceCr <= budgetMax) {
    priceNote = `Its average property price of ₹${averagePriceCr} Cr falls comfortably within your ₹${budgetMin}–₹${budgetMax} Cr budget range.`;
  } else {
    priceNote = `Its average property price of ₹${averagePriceCr} Cr is higher than your maximum ₹${budgetMax} Cr budget threshold. Consider neighboring alternatives like Mulund or Kandivali if affordability becomes a higher priority.`;
  }

  // Synthesize paragraph
  let summaryParagraph = `${name} is a strong contender for your selected home-buying priorities in the Mumbai Metropolitan Region. `;
  
  if (strengths.length > 0) {
    summaryParagraph += `Its strongest synthetic indicators in this prototype are ${strengths.join(", ")}. `;
  } else {
    summaryParagraph += `It offers balanced suburban livability across school, healthcare, and market factors. `;
  }

  summaryParagraph += `${priceNote}`;

  // Verdict & Caveats
  const verdictText = averagePriceCr <= budgetMax && (schoolScore >= 80 || connectivityScore >= 80)
    ? `Highly recommended for site inspection in ${name}. Fits budget and matches core lifestyle priorities.`
    : `Suitable location to compare against alternative MMR options.`;

  const caveatText = `Verify peak-hour train/highway commute times, local water supply hours, monsoon waterlogging history on your specific street, and society maintenance charges prior to booking.`;

  return {
    summary: summaryParagraph,
    verdict: verdictText,
    caveat: caveatText,
    generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}
