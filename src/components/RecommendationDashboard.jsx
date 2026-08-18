import React from 'react';
import { Award, MapPin, IndianRupee, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, GraduationCap, Stethoscope, ShoppingBag, Train, Wind, Umbrella, TrendingUp } from 'lucide-react';
import { PREFERENCE_OPTIONS } from '../services/recommendationService';

export default function RecommendationDashboard({
  recommendations,
  preferences,
  budgetMin,
  budgetMax,
  onSelectLocality,
  onBackToSearch
}) {
  const activePrefLabels = PREFERENCE_OPTIONS
    .filter(opt => preferences[opt.id])
    .map(opt => opt.label);

  return (
    <div className="recommendations-container">
      {/* Top Banner / Summary Header */}
      <div className="rec-summary-banner">
        <div className="rec-banner-left">
          <div className="badge-rank-icon">
            <Award size={24} className="text-emerald" />
          </div>
          <div>
            <h2 className="rec-banner-heading">Best Locations For You in Mumbai MMR</h2>
            <p className="rec-banner-sub">
              Ranked dynamically across 40 localities based on your preferences & target budget range.
            </p>
          </div>
        </div>

        <button className="btn-secondary" onClick={onBackToSearch}>
          <span>Modify Preferences & Budget</span>
        </button>
      </div>

      {/* Selected Filters Summary Pill Bar */}
      <div className="active-filters-bar">
        <div className="filter-group">
          <span className="filter-label">Selected Preferences:</span>
          <div className="filter-pills">
            {activePrefLabels.length > 0 ? (
              activePrefLabels.map((lbl, idx) => (
                <span key={idx} className="active-filter-chip">{lbl}</span>
              ))
            ) : (
              <span className="active-filter-chip">Balanced Overview (Default)</span>
            )}
          </div>
        </div>

        <div className="filter-group">
          <span className="filter-label">Target Budget:</span>
          <span className="budget-tag-pill">
            ₹{budgetMin.toFixed(2)} Cr – ₹{budgetMax.toFixed(2)} Cr
          </span>
        </div>
      </div>

      {/* Top 5 Recommendation Cards List */}
      <div className="top-recommendations-grid">
        {recommendations.map((rec, index) => {
          const { locality, matchScore, whyText, isWithinBudget } = rec;
          const rank = index + 1;

          return (
            <div key={locality.id} className={`recommendation-card rank-${rank}`}>
              <div className="card-rank-badge">
                #{rank} MATCH
              </div>

              <div className="card-top-header">
                <div>
                  <div className="locality-title-row">
                    <h3 className="locality-name">{locality.name}</h3>
                    <span className="locality-city-tag">{locality.city}</span>
                  </div>
                  <div className="price-tag-row">
                    <IndianRupee size={16} className="text-emerald" />
                    <span className="price-val">₹{locality.averagePriceCr} Cr</span>
                    <span className={`budget-status-pill ${isWithinBudget ? 'in-budget' : 'over-budget'}`}>
                      {isWithinBudget ? 'Within Budget' : 'Above Target Budget'}
                    </span>
                  </div>
                </div>

                <div className="match-score-circle">
                  <span className="match-num">{matchScore}</span>
                  <span className="match-denom">/100</span>
                </div>
              </div>

              {/* Key Factor Scores Grid */}
              <div className="rec-metrics-grid">
                <div className="metric-cell">
                  <span className="cell-label">Schools</span>
                  <span className="cell-val">{locality.schoolScore}</span>
                </div>
                <div className="metric-cell">
                  <span className="cell-label">Hospitals</span>
                  <span className="cell-val">{locality.hospitalScore}</span>
                </div>
                <div className="metric-cell">
                  <span className="cell-label">Markets</span>
                  <span className="cell-val">{locality.marketScore}</span>
                </div>
                <div className="metric-cell">
                  <span className="cell-label">Transit</span>
                  <span className="cell-val">{locality.connectivityScore}</span>
                </div>
                <div className="metric-cell">
                  <span className="cell-label">Safety</span>
                  <span className="cell-val text-emerald">{locality.crimeRiskScore}</span>
                </div>
                <div className="metric-cell">
                  <span className="cell-label">Air Quality</span>
                  <span className="cell-val">{locality.airQualityScore}</span>
                </div>
              </div>

              {/* Why Recommended Explanation */}
              <div className="why-recommended-box">
                <Sparkles size={16} className="text-primary flex-shrink-0" />
                <p className="why-text">
                  <strong>Why recommended:</strong> {whyText}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="card-footer-actions">
                <button
                  className="btn-primary-sm"
                  onClick={() => onSelectLocality(locality)}
                >
                  <span>View Full Neighborhood Details</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
