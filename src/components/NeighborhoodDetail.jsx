import React from 'react';
import {
  GraduationCap,
  Stethoscope,
  ShoppingBag,
  Train,
  ShieldCheck,
  Wind,
  Umbrella,
  TrendingUp,
  IndianRupee,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Heart,
  ArrowLeft,
  Bot,
  Sparkles
} from 'lucide-react';
import AiInsightCard from './AiInsightCard';
import { generateMumbaiAiInsight } from '../services/scoringService';
import RoadmapFooter from './RoadmapFooter';

export default function NeighborhoodDetail({
  locality,
  preferences,
  budgetMin,
  budgetMax,
  onBackToMap
}) {
  const {
    name,
    city,
    latitude,
    longitude,
    averagePriceCr,
    schoolScore,
    hospitalScore,
    marketScore,
    connectivityScore,
    crimeRiskScore,
    airQualityScore,
    floodSafetyScore,
    infrastructureScore,
    futureDevelopmentScore,
    nearestSchoolKm,
    nearestHospitalKm,
    nearestMarketKm,
    summary
  } = locality;

  // Synthesize dynamic AI Insight
  const aiInsight = generateMumbaiAiInsight(locality, preferences, budgetMin, budgetMax);

  // Generate "Why consider this location", "Potential concerns", "Best suited for"
  const whyConsider = [
    `Strong connectivity score of ${connectivityScore}/100 with easy access to major commercial hubs.`,
    `High educational infrastructure (${schoolScore}/100) with top institutions within ${nearestSchoolKm} km.`,
    `Excellent medical access (${hospitalScore}/100) with nearest emergency center at ${nearestHospitalKm} km.`,
    `Safety rating of ${crimeRiskScore}/100 ensuring peace of mind for residents.`
  ];

  const potentialConcerns = [];
  if (averagePriceCr > budgetMax) potentialConcerns.push(`Property price of ₹${averagePriceCr} Cr exceeds your budget ceiling of ₹${budgetMax} Cr.`);
  if (floodSafetyScore < 70) potentialConcerns.push(`Monsoon flood safety score is ${floodSafetyScore}/100; low-lying areas may experience temporary waterlogging.`);
  if (airQualityScore < 65) potentialConcerns.push(`Air quality index score is ${airQualityScore}/100 due to traffic density on major arterial corridors.`);
  if (connectivityScore < 85) potentialConcerns.push(`Requires feeder transport to reach primary suburban railway hubs.`);
  if (potentialConcerns.length === 0) potentialConcerns.push(`Higher initial capital investment compared to outer MMR suburban options.`);

  let bestSuitedFor = "Families, working professionals, and long-term home buyers seeking reliable suburban livability.";
  if (schoolScore >= 90) bestSuitedFor = "Families with school-going children prioritizing elite educational institutions and safe community parks.";
  else if (connectivityScore >= 94) bestSuitedFor = "Working professionals needing rapid daily commute via Metro, Western Express Highway, or Central Railway.";
  else if (futureDevelopmentScore >= 94) bestSuitedFor = "Real estate investors seeking high capital appreciation driven by upcoming infrastructure projects.";

  return (
    <div className="detail-page-container">
      {/* Navigation & Header Banner */}
      <div className="detail-top-nav">
        <button className="btn-back" onClick={onBackToMap}>
          <ArrowLeft size={18} />
          <span>Back to Recommendations & Map</span>
        </button>

        <div className="detail-title-group">
          <div className="flex items-center gap-2">
            <MapPin size={22} className="text-primary" />
            <h2 className="detail-locality-name">{name}</h2>
            <span className="locality-city-tag">{city}</span>
          </div>
          <p className="detail-coords-text">
            Coordinates: {latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E
          </p>
        </div>
      </div>

      {/* Hero Overview Grid */}
      <div className="detail-hero-card">
        <div className="hero-left">
          <div className="price-hero-box">
            <span className="price-label">Average Property Price</span>
            <div className="price-amount-row">
              <IndianRupee size={28} className="text-emerald" />
              <span className="price-amount">₹{averagePriceCr} Cr</span>
            </div>
            <span className="price-sub">Synthetic demonstration valuation for 2-3 BHK baseline</span>
          </div>

          <p className="locality-summary-text">{summary}</p>
        </div>

        <div className="hero-right">
          <div className="distance-stats-grid">
            <div className="dist-box">
              <GraduationCap size={18} className="text-emerald" />
              <span className="dist-val">{nearestSchoolKm} km</span>
              <span className="dist-lbl">Nearest School</span>
            </div>
            <div className="dist-box">
              <Stethoscope size={18} className="text-primary" />
              <span className="dist-val">{nearestHospitalKm} km</span>
              <span className="dist-lbl">Nearest Hospital</span>
            </div>
            <div className="dist-box">
              <ShoppingBag size={18} className="text-amber" />
              <span className="dist-val">{nearestMarketKm} km</span>
              <span className="dist-lbl">Nearest Market</span>
            </div>
          </div>
        </div>
      </div>

      {/* Prototype AI Neighborhood Insight Card */}
      <AiInsightCard aiInsight={aiInsight} />

      {/* Comprehensive Factor Score Cards Grid */}
      <div className="detail-factors-section">
        <h3 className="section-heading mb-3">Comprehensive Locality Factor Scores (0–100)</h3>

        <div className="detail-factors-grid">
          <div className="factor-tile">
            <div className="tile-top">
              <GraduationCap className="text-emerald" size={20} />
              <span className="tile-title">School Accessibility</span>
            </div>
            <div className="tile-score text-emerald">{schoolScore}/100</div>
            <div className="progress-track"><div className="progress-fill bg-emerald" style={{ width: `${schoolScore}%` }} /></div>
          </div>

          <div className="factor-tile">
            <div className="tile-top">
              <Stethoscope className="text-primary" size={20} />
              <span className="tile-title">Hospital Accessibility</span>
            </div>
            <div className="tile-score text-primary">{hospitalScore}/100</div>
            <div className="progress-track"><div className="progress-fill bg-emerald" style={{ width: `${hospitalScore}%` }} /></div>
          </div>

          <div className="factor-tile">
            <div className="tile-top">
              <ShoppingBag className="text-amber" size={20} />
              <span className="tile-title">Market Accessibility</span>
            </div>
            <div className="tile-score text-amber">{marketScore}/100</div>
            <div className="progress-track"><div className="progress-fill bg-emerald" style={{ width: `${marketScore}%` }} /></div>
          </div>

          <div className="factor-tile">
            <div className="tile-top">
              <Train className="text-indigo" size={20} />
              <span className="tile-title">City Connectivity</span>
            </div>
            <div className="tile-score text-indigo">{connectivityScore}/100</div>
            <div className="progress-track"><div className="progress-fill bg-emerald" style={{ width: `${connectivityScore}%` }} /></div>
          </div>

          <div className="factor-tile">
            <div className="tile-top">
              <ShieldCheck className="text-emerald" size={20} />
              <span className="tile-title">Crime Safety (Higher = Safer)</span>
            </div>
            <div className="tile-score text-emerald">{crimeRiskScore}/100</div>
            <div className="progress-track"><div className="progress-fill bg-emerald" style={{ width: `${crimeRiskScore}%` }} /></div>
          </div>

          <div className="factor-tile">
            <div className="tile-top">
              <Wind className="text-amber" size={20} />
              <span className="tile-title">Air Quality Score</span>
            </div>
            <div className="tile-score text-amber">{airQualityScore}/100</div>
            <div className="progress-track"><div className="progress-fill bg-emerald" style={{ width: `${airQualityScore}%` }} /></div>
          </div>

          <div className="factor-tile">
            <div className="tile-top">
              <Umbrella className="text-primary" size={20} />
              <span className="tile-title">Flood Safety</span>
            </div>
            <div className="tile-score text-primary">{floodSafetyScore}/100</div>
            <div className="progress-track"><div className="progress-fill bg-emerald" style={{ width: `${floodSafetyScore}%` }} /></div>
          </div>

          <div className="factor-tile">
            <div className="tile-top">
              <TrendingUp className="text-indigo" size={20} />
              <span className="tile-title">Future Infrastructure</span>
            </div>
            <div className="tile-score text-indigo">{futureDevelopmentScore}/100</div>
            <div className="progress-track"><div className="progress-fill bg-emerald" style={{ width: `${futureDevelopmentScore}%` }} /></div>
          </div>
        </div>
      </div>

      {/* Why Consider, Potential Concerns, Best Suited For Grid */}
      <div className="qualitative-insights-grid">
        <div className="qual-card card-why">
          <div className="qual-header">
            <CheckCircle2 size={18} className="text-emerald" />
            <h4>Why consider this location?</h4>
          </div>
          <ul className="qual-list">
            {whyConsider.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="qual-card card-concerns">
          <div className="qual-header">
            <AlertTriangle size={18} className="text-amber" />
            <h4>Potential concerns</h4>
          </div>
          <ul className="qual-list">
            {potentialConcerns.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="qual-card card-suited">
          <div className="qual-header">
            <Heart size={18} className="text-rose" />
            <h4>Best suited for</h4>
          </div>
          <p className="suited-text">{bestSuitedFor}</p>
        </div>
      </div>
    </div>
  );
}
