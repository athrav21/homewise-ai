import React, { useState } from 'react';
import { Award, IndianRupee, Sparkles, ArrowRight, ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import { PREFERENCE_OPTIONS } from '../services/recommendationService';
import { submitFeedback, getLocalityFeedback } from '../services/feedbackService';

export default function RecommendationDashboard({
  recommendations,
  preferences,
  budgetMin,
  budgetMax,
  currentUser,
  onSelectLocality,
  onBackToSearch
}) {
  const [feedbackStatus, setFeedbackStatus] = useState({});
  const [toastMessage, setToastMessage] = useState('');

  const activePrefLabels = PREFERENCE_OPTIONS
    .filter(opt => preferences[opt.id])
    .map(opt => opt.label);

  const handleFeedback = async (locality, matchScore, feedbackType) => {
    // Optimistic UI update
    setFeedbackStatus(prev => ({
      ...prev,
      [locality.id]: feedbackType
    }));

    setToastMessage(`Feedback recorded for ${locality.name}!`);
    setTimeout(() => setToastMessage(''), 2500);

    await submitFeedback({
      userId: currentUser?.id,
      localityId: locality.id,
      localityName: locality.name,
      matchScore,
      preferences,
      feedback: feedbackType,
      budgetMax
    });
  };

  return (
    <div className="recommendations-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="feedback-toast">
          <Check size={16} className="text-emerald" />
          <span>{toastMessage}</span>
        </div>
      )}

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
          const currentFeedback = feedbackStatus[locality.id] || getLocalityFeedback(locality.id);

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
                  <span className="cell-label">School</span>
                  <span className="cell-val">{locality.schoolScore}</span>
                </div>
                <div className="metric-cell">
                  <span className="cell-label">Hospital</span>
                  <span className="cell-val">{locality.hospitalScore}</span>
                </div>
                <div className="metric-cell">
                  <span className="cell-label">Market</span>
                  <span className="cell-val">{locality.marketScore}</span>
                </div>
                <div className="metric-cell">
                  <span className="cell-label">Safety</span>
                  <span className="cell-val text-emerald">{locality.safetyScore || locality.crimeRiskScore}</span>
                </div>
                <div className="metric-cell">
                  <span className="cell-label">Transit</span>
                  <span className="cell-val">{locality.connectivityScore}</span>
                </div>
                <div className="metric-cell">
                  <span className="cell-label">Clean Air</span>
                  <span className="cell-val">{locality.airQualityScore}</span>
                </div>
                <div className="metric-cell">
                  <span className="cell-label">Flood Safe</span>
                  <span className="cell-val">{locality.floodSafetyScore}</span>
                </div>
                <div className="metric-cell">
                  <span className="cell-label">Water</span>
                  <span className="cell-val">{locality.waterScore || 85}</span>
                </div>
                <div className="metric-cell">
                  <span className="cell-label">Power</span>
                  <span className="cell-val">{locality.powerScore || 90}</span>
                </div>
                <div className="metric-cell">
                  <span className="cell-label">Future Infra</span>
                  <span className="cell-val">{locality.futureInfrastructureScore || locality.futureDevelopmentScore}</span>
                </div>
                <div className="metric-cell highlight-cell">
                  <span className="cell-label fw-bold">Livability</span>
                  <span className="cell-val text-primary fw-bold">{locality.livabilityScore || 85}</span>
                </div>
              </div>

              {/* Why Recommended Explanation */}
              <div className="why-recommended-box">
                <Sparkles size={16} className="text-primary flex-shrink-0" />
                <p className="why-text">
                  <strong>Why recommended:</strong> {whyText}
                </p>
              </div>

              {/* Action Buttons & Feedback Controls */}
              <div className="card-footer-actions">
                <div className="feedback-buttons-group">
                  <span className="feedback-prompt">Helpful match?</span>
                  <button
                    className={`btn-feedback ${currentFeedback === 'like' ? 'active-like' : ''}`}
                    onClick={() => handleFeedback(locality, matchScore, 'like')}
                    title="Helpful recommendation"
                    aria-label="Like recommendation"
                  >
                    <ThumbsUp size={15} />
                    <span>Helpful</span>
                  </button>
                  <button
                    className={`btn-feedback ${currentFeedback === 'dislike' ? 'active-dislike' : ''}`}
                    onClick={() => handleFeedback(locality, matchScore, 'dislike')}
                    title="Not relevant to my needs"
                    aria-label="Dislike recommendation"
                  >
                    <ThumbsDown size={15} />
                    <span>Not for me</span>
                  </button>
                </div>

                <button
                  className="btn-primary-sm"
                  onClick={() => onSelectLocality(locality)}
                >
                  <span>View Full Details</span>
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
