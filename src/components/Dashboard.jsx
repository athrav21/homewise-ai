import React, { useState, useMemo } from 'react';
import OverallScoreCard from './OverallScoreCard';
import BuyerProfileSelector from './BuyerProfileSelector';
import AiInsightCard from './AiInsightCard';
import { SchoolFactorCard, HospitalFactorCard, AirQualityFactorCard, InfrastructureFactorCard } from './FactorCard';
import RoadmapFooter from './RoadmapFooter';
import { getNeighborhoodMetrics } from '../data/mockNeighborhoodData';
import { calculateScore, generatePrototypeAiInsight } from '../services/scoringService';
import { MapPin, ArrowLeft, RefreshCw, Sparkles } from 'lucide-react';

export default function Dashboard({ lat, lng, address, onBackToMap }) {
  const [selectedProfileKey, setSelectedProfileKey] = useState('balanced');

  // Compute metrics deterministically from coordinates
  const metrics = useMemo(() => {
    return getNeighborhoodMetrics(lat, lng, address);
  }, [lat, lng, address]);

  // Compute score based on metrics and selected profile
  const scoreResult = useMemo(() => {
    return calculateScore(metrics, selectedProfileKey);
  }, [metrics, selectedProfileKey]);

  // Compute dynamic AI insight
  const aiInsight = useMemo(() => {
    return generatePrototypeAiInsight(metrics, scoreResult, address);
  }, [metrics, scoreResult, address]);

  return (
    <div className="dashboard-container">
      {/* Top Context Navigation Bar */}
      <div className="dashboard-nav-bar">
        <button className="btn-back" onClick={onBackToMap}>
          <ArrowLeft size={18} />
          <span>Change Location</span>
        </button>

        <div className="selected-location-badge">
          <MapPin size={16} className="pin" />
          <span className="address-name">{address}</span>
          <span className="coords-name">({lat.toFixed(4)}, {lng.toFixed(4)})</span>
        </div>
      </div>

      {/* Main Grid: Overall Score & Buyer Profile Selector */}
      <div className="dashboard-hero-grid">
        <OverallScoreCard scoreResult={scoreResult} />
        <BuyerProfileSelector
          selectedProfileKey={selectedProfileKey}
          onSelectProfile={setSelectedProfileKey}
        />
      </div>

      {/* Prototype AI Neighborhood Insight Card */}
      <AiInsightCard aiInsight={aiInsight} />

      {/* 4 Factor Score Cards Grid */}
      <div className="factor-cards-section">
        <div className="section-title-row">
          <h3 className="section-heading">Neighborhood Accessibility & Livability Factors</h3>
          <span className="section-tag">4 Key Prototype Metrics Analyzed</span>
        </div>

        <div className="factor-grid">
          <SchoolFactorCard data={metrics.schools} />
          <HospitalFactorCard data={metrics.hospitals} />
          <AirQualityFactorCard data={metrics.airQuality} />
          <InfrastructureFactorCard data={metrics.infrastructure} />
        </div>
      </div>

      {/* Roadmap & Scalability Architecture Preview */}
      <RoadmapFooter roadmapFactors={metrics.futureRoadmapFactors} />
    </div>
  );
}
