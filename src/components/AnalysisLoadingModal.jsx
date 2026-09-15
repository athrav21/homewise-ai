import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, Sparkles, Building2 } from 'lucide-react';

const ANALYSIS_STEPS = [
  "Location & Geographic Coordinates Identified",
  "School Infrastructure & UDISE+ Data Analyzed",
  "Hospital Density & Emergency Access Evaluated",
  "Overpass API Commercial POIs & Markets Mapped",
  "Mumbai Police & Crime Statistics Evaluated",
  "Suburban Transit & Highway Connectivity Calculated",
  "CPCB Air Quality Index Records Retrieved",
  "ISRO Bhuvan Monsoon Flood Hazard Mapped",
  "Property Price Valuation & Budget Fit Evaluated",
  "BMC Municipal Water Connection Hours Assessed",
  "MSEDCL Power Grid Stability Evaluated",
  "MMRDA Future Infrastructure Corridor Proximity Mapped",
  "Generating Personalized HomeWise Match Score..."
];

export default function AnalysisLoadingModal({ isOpen, localityName, onComplete }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < ANALYSIS_STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 400);
          return prev;
        }
      });
    }, 180);

    return () => clearInterval(interval);
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="analysis-loading-card">
        <div className="loading-header">
          <div className="loading-spinner-wrapper">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
          <div>
            <h3 className="loading-title">Analyzing Property Location</h3>
            <p className="loading-sub">
              Evaluating 12 neighborhood dimensions for <strong>{localityName || "Selected Property"}</strong>
            </p>
          </div>
        </div>

        <div className="steps-progress-list">
          {ANALYSIS_STEPS.map((step, idx) => {
            const isDone = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div
                key={idx}
                className={`step-item ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}
              >
                {isDone ? (
                  <CheckCircle2 size={16} className="text-emerald shrink-0" />
                ) : isCurrent ? (
                  <Loader2 size={16} className="animate-spin text-primary shrink-0" />
                ) : (
                  <div className="step-circle-pending shrink-0" />
                )}
                <span className="step-text">{step}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
