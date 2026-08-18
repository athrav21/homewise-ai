import React from 'react';
import { Award, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function OverallScoreCard({ scoreResult }) {
  const { overallScore, classification, statusColor, breakdown, profileLabel } = scoreResult;

  // Determine badge icon & style
  let StatusIcon = CheckCircle2;
  if (classification === 'Moderate') StatusIcon = AlertTriangle;
  if (classification === 'Poor') StatusIcon = ShieldAlert;

  return (
    <div className="overall-score-card">
      <div className="score-main-section">
        <div className="score-badge-wrapper">
          <div className={`score-circle ${statusColor}`}>
            <span className="score-number">{overallScore}</span>
            <span className="score-denom">/100</span>
          </div>
        </div>

        <div className="score-title-info">
          <div className="status-pill-row">
            <span className={`status-badge badge-${statusColor}`}>
              <StatusIcon size={16} />
              <span>{classification} Livability Rating</span>
            </span>
            <span className="active-profile-tag">Profile: {profileLabel}</span>
          </div>
          
          <h2 className="overall-score-heading">
            Neighborhood Score: {overallScore}/100
          </h2>
          <p className="score-explanation">
            Calculated dynamically based on school accessibility, hospital proximity, local air quality, and future infrastructure potential.
          </p>
        </div>
      </div>

      <div className="score-breakdown-section">
        <h4 className="breakdown-title">Score Weighting Breakdown</h4>
        <div className="breakdown-grid">
          {breakdown.map((item, idx) => (
            <div key={idx} className="breakdown-item">
              <div className="breakdown-header">
                <span className="factor-name">{item.name}</span>
                <span className="factor-val">
                  {item.score}/100 <span className="weight-pct">({item.weightPct}% weight)</span>
                </span>
              </div>
              <div className="progress-track">
                <div
                  className={`progress-fill ${item.score >= 75 ? 'bg-emerald' : item.score >= 55 ? 'bg-amber' : 'bg-rose'}`}
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
