import React from 'react';
import {
  GraduationCap,
  Stethoscope,
  ShoppingBag,
  Train,
  ShieldCheck,
  Wind,
  Umbrella,
  IndianRupee,
  Droplets,
  Zap,
  Construction,
  Award,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Heart,
  ArrowLeft,
  Sparkles,
  FileText,
  Layers,
  Check,
  X
} from 'lucide-react';
import AiInsightCard from './AiInsightCard';
import DataPipelineStatusPanel from './DataPipelineStatusPanel';
import { generateMumbaiAiInsight } from '../services/scoringService';
import { calculateLocalityMatch } from '../services/recommendationService';

export default function NeighborhoodDetail({
  locality,
  preferences,
  budgetMax,
  backendHealthy,
  onBackToMap,
  onChangePreference,
  onAddToComparison,
  onOpenReport
}) {
  const matchResult = calculateLocalityMatch(locality, preferences, budgetMax);
  const { matchScore, isWithinBudget, priceFitScore } = matchResult;

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
    safetyScore,
    airQualityScore,
    floodSafetyScore,
    waterScore,
    powerScore,
    futureDevelopmentScore,
    futureInfrastructureScore,
    nearestSchoolKm,
    nearestHospitalKm,
    nearestMarketKm,
    summary
  } = locality;

  const safetyVal = safetyScore || crimeRiskScore || 80;
  const futureInfraVal = futureInfrastructureScore || futureDevelopmentScore || 80;
  const waterVal = waterScore || 85;
  const powerVal = powerScore || 90;
  const rawAqi = roundAqi(airQualityScore);

  function roundAqi(airScore) {
    return Math.round((100 - airScore) * 2.2 + 40);
  }

  // Synthesize dynamic AI Insight
  const aiInsight = generateMumbaiAiInsight(locality, preferences, 1.0, budgetMax);

  // Why Consider & Concerns
  const whyConsider = [
    `Personalized HomeWise match score of ${matchScore}/100 tailored to your factor preferences.`,
    `Strong transit connectivity score of ${connectivityScore}/100 to commercial hubs.`,
    `Educational infrastructure score of ${schoolScore}/100 with nearest school at ${nearestSchoolKm} km.`,
    `Reliable water supply score of ${waterVal}/100 and power grid stability of ${powerVal}/100.`
  ];

  const potentialConcerns = [];
  if (!isWithinBudget) potentialConcerns.push(`Property price of ₹${averagePriceCr} Cr exceeds your budget ceiling of ₹${budgetMax} Cr.`);
  if (floodSafetyScore < 75) potentialConcerns.push(`Monsoon flood safety score is ${floodSafetyScore}/100; low-lying lanes may experience temporary waterlogging.`);
  if (airQualityScore < 70) potentialConcerns.push(`Air quality score is ${airQualityScore}/100 (AQI ~${rawAqi}) due to arterial traffic corridors.`);
  if (potentialConcerns.length === 0) potentialConcerns.push(`Higher initial capital investment compared to outer suburban MMR options.`);

  let bestSuitedFor = "Families, working professionals, and long-term home buyers seeking reliable suburban livability.";
  if (schoolScore >= 90) bestSuitedFor = "Families with school-going children prioritizing elite educational institutions and safe community parks.";
  else if (connectivityScore >= 94) bestSuitedFor = "Working professionals needing rapid daily commute via Metro, Western Express Highway, or Central Railway.";
  else if (futureInfraVal >= 94) bestSuitedFor = "Real estate investors seeking high capital appreciation driven by upcoming MMRDA infrastructure projects.";

  return (
    <div className="detail-page-container font-sans">
      {/* Navigation & Header Banner */}
      <div className="detail-top-nav flex items-center justify-between">
        <button className="btn-back" onClick={onBackToMap}>
          <ArrowLeft size={18} />
          <span>Back to Interactive Map</span>
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

        <div className="flex items-center gap-2">
          <button className="btn-secondary-sm flex items-center gap-1" onClick={() => onAddToComparison(locality)}>
            <Layers size={16} />
            <span>Compare Locality</span>
          </button>

          <button className="btn-primary-sm flex items-center gap-1" onClick={() => onOpenReport(locality)}>
            <FileText size={16} />
            <span>Detailed Report</span>
          </button>
        </div>
      </div>

      {/* Hero Overview & Match Score Banner */}
      <div className="detail-hero-card">
        <div className="hero-left">
          <div className="price-hero-box">
            <span className="price-label">Average Property Price</span>
            <div className="price-amount-row">
              <IndianRupee size={28} className="text-emerald" />
              <span className="price-amount">₹{averagePriceCr} Cr</span>
              <span className={`budget-status-pill ${isWithinBudget ? 'in-budget' : 'over-budget'}`}>
                {isWithinBudget ? <><Check size={14} /> Within Budget</> : <><X size={14} /> Above ₹{budgetMax} Cr Budget</>}
              </span>
            </div>
            <span className="price-sub">Baseline residential valuation for 2-3 BHK property</span>
          </div>

          <p className="locality-summary-text">{summary}</p>
        </div>

        <div className="hero-right">
          <div className="match-hero-circle">
            <span className="match-num">{matchScore}</span>
            <span className="match-denom">/100</span>
            <span className="match-label">HomeWise Match Score</span>
          </div>
        </div>
      </div>

      {/* Prototype AI Neighborhood Insight Card */}
      <AiInsightCard aiInsight={aiInsight} />

      {/* Comprehensive 12-Factor Score Cards Grid */}
      <div className="detail-factors-section">
        <h3 className="section-heading mb-3">12 Factor Neighborhood Scores</h3>

        <div className="detail-factors-grid">
          {/* 1. School Quality */}
          <div className="factor-tile">
            <div className="tile-top">
              <GraduationCap className="text-emerald" size={20} />
              <span className="tile-title">1. School Quality</span>
            </div>
            <div className="tile-score text-emerald">{schoolScore}/100</div>
            <div className="progress-track"><div className="progress-fill bg-emerald" style={{ width: `${schoolScore}%` }} /></div>
            <span className="tile-source-tag">UDISE+ / OSM Data</span>
          </div>

          {/* 2. Hospital Access */}
          <div className="factor-tile">
            <div className="tile-top">
              <Stethoscope className="text-primary" size={20} />
              <span className="tile-title">2. Hospital Access</span>
            </div>
            <div className="tile-score text-primary">{hospitalScore}/100</div>
            <div className="progress-track"><div className="progress-fill bg-emerald" style={{ width: `${hospitalScore}%` }} /></div>
            <span className="tile-source-tag">BMC / OpenCity Data</span>
          </div>

          {/* 3. Market Access */}
          <div className="factor-tile">
            <div className="tile-top">
              <ShoppingBag className="text-amber" size={20} />
              <span className="tile-title">3. Market Access</span>
            </div>
            <div className="tile-score text-amber">{marketScore}/100</div>
            <div className="progress-track"><div className="progress-fill bg-emerald" style={{ width: `${marketScore}%` }} /></div>
            <span className="tile-source-tag">Overpass API POIs</span>
          </div>

          {/* 4. Safety */}
          <div className="factor-tile">
            <div className="tile-top">
              <ShieldCheck className="text-emerald" size={20} />
              <span className="tile-title">4. Safety & Low Crime</span>
            </div>
            <div className="tile-score text-emerald">{safetyVal}/100</div>
            <div className="progress-track"><div className="progress-fill bg-emerald" style={{ width: `${safetyVal}%` }} /></div>
            <span className="tile-source-tag">Mumbai Police / NCRB</span>
          </div>

          {/* 5. Connectivity */}
          <div className="factor-tile">
            <div className="tile-top">
              <Train className="text-indigo" size={20} />
              <span className="tile-title">5. City Transit Access</span>
            </div>
            <div className="tile-score text-indigo">{connectivityScore}/100</div>
            <div className="progress-track"><div className="progress-fill bg-emerald" style={{ width: `${connectivityScore}%` }} /></div>
            <span className="tile-source-tag">OSM / MMRDA Transit</span>
          </div>

          {/* 6. Air Quality */}
          <div className="factor-tile">
            <div className="tile-top">
              <Wind className="text-amber" size={20} />
              <span className="tile-title">6. Clean Air Quality</span>
            </div>
            <div className="tile-score text-amber">{airQualityScore}/100 (AQI ~{rawAqi})</div>
            <div className="progress-track"><div className="progress-fill bg-emerald" style={{ width: `${airQualityScore}%` }} /></div>
            <span className="tile-source-tag">CPCB / MPCB Monitors</span>
          </div>

          {/* 7. Flood Safety */}
          <div className="factor-tile">
            <div className="tile-top">
              <Umbrella className="text-primary" size={20} />
              <span className="tile-title">7. Monsoon Flood Safety</span>
            </div>
            <div className="tile-score text-primary">{floodSafetyScore}/100</div>
            <div className="progress-track"><div className="progress-fill bg-emerald" style={{ width: `${floodSafetyScore}%` }} /></div>
            <span className="tile-source-tag">ISRO Bhuvan GIS Data</span>
          </div>

          {/* 8. Property Affordability */}
          <div className="factor-tile">
            <div className="tile-top">
              <IndianRupee className="text-emerald" size={20} />
              <span className="tile-title">8. Property Affordability</span>
            </div>
            <div className="tile-score text-emerald">{priceFitScore}/100</div>
            <div className="progress-track"><div className="progress-fill bg-emerald" style={{ width: `${priceFitScore}%` }} /></div>
            <span className="tile-source-tag">70K+ Housing Dataset</span>
          </div>

          {/* 9. Water Reliability */}
          <div className="factor-tile">
            <div className="tile-top">
              <Droplets className="text-primary" size={20} />
              <span className="tile-title">9. Water Reliability</span>
            </div>
            <div className="tile-score text-primary">{waterVal}/100</div>
            <div className="progress-track"><div className="progress-fill bg-emerald" style={{ width: `${waterVal}%` }} /></div>
            <span className="tile-source-tag">BMC Municipal Water</span>
          </div>

          {/* 10. Power Reliability */}
          <div className="factor-tile">
            <div className="tile-top">
              <Zap className="text-amber" size={20} />
              <span className="tile-title">10. Power Grid Stability</span>
            </div>
            <div className="tile-score text-amber">{powerVal}/100</div>
            <div className="progress-track"><div className="progress-fill bg-emerald" style={{ width: `${powerVal}%` }} /></div>
            <span className="tile-source-tag">MSEDCL Outage Data</span>
          </div>

          {/* 11. Future Infrastructure */}
          <div className="factor-tile">
            <div className="tile-top">
              <Construction className="text-indigo" size={20} />
              <span className="tile-title">11. Future Infra Boost</span>
            </div>
            <div className="tile-score text-indigo">{futureInfraVal}/100</div>
            <div className="progress-track"><div className="progress-fill bg-emerald" style={{ width: `${futureInfraVal}%` }} /></div>
            <span className="tile-source-tag">MMRDA Master Plan</span>
          </div>

          {/* 12. Overall Match Score */}
          <div className="factor-tile highlight-tile">
            <div className="tile-top">
              <Award className="text-emerald" size={20} />
              <span className="tile-title">12. HomeWise Match Score</span>
            </div>
            <div className="tile-score text-emerald fw-bold">{matchScore}/100</div>
            <div className="progress-track"><div className="progress-fill bg-emerald" style={{ width: `${matchScore}%` }} /></div>
            <span className="tile-source-tag">Personalized Weight Layer</span>
          </div>
        </div>
      </div>

      {/* Data Pipeline Status Monitor */}
      <DataPipelineStatusPanel backendHealthy={backendHealthy} />

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

