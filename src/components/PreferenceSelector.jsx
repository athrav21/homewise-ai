import React from 'react';
import { PREFERENCE_SLIDERS } from '../services/recommendationService';
import {
  GraduationCap,
  Stethoscope,
  ShoppingBag,
  ShieldCheck,
  Train,
  IndianRupee,
  Wind,
  Umbrella,
  Construction,
  Droplets,
  Zap,
  Sparkles,
  Sliders,
  RotateCcw
} from 'lucide-react';

const ICON_MAP = {
  GraduationCap,
  Stethoscope,
  ShoppingBag,
  ShieldCheck,
  Train,
  IndianRupee,
  Wind,
  Umbrella,
  Construction,
  Droplets,
  Zap
};

export default function PreferenceSelector({
  preferences,
  onChangePreference,
  onResetBalanced,
  budgetMax,
  onChangeBudgetMax,
  onAnalyzeProperty
}) {
  return (
    <div className="preference-panel-card">
      <div className="panel-header">
        <div className="header-title-group">
          <Sliders className="text-primary" size={22} />
          <div>
            <h3 className="panel-title">Set Your Factor Priorities (1 to 10 Scale)</h3>
            <p className="panel-sub">
              Drag the sliders to prioritize what matters most to you. HomeWise will dynamically re-weight all 12 neighborhood factors.
            </p>
          </div>
        </div>

        <button
          className="btn-secondary-sm flex items-center gap-1"
          onClick={onResetBalanced}
          title="Set all sliders to equal 5/10 importance"
        >
          <RotateCcw size={14} />
          <span>Balanced (5/10)</span>
        </button>
      </div>

      {/* 1 to 10 Sliders Grid */}
      <div className="preference-sliders-grid">
        {PREFERENCE_SLIDERS.map((option) => {
          const IconComponent = ICON_MAP[option.icon] || Sparkles;
          const currentValue = preferences[option.id] !== undefined ? preferences[option.id] : 5;

          return (
            <div key={option.id} className="slider-box">
              <div className="slider-header-row">
                <div className="flex items-center gap-2">
                  <IconComponent size={18} className="slider-icon text-primary" />
                  <span className="slider-title">{option.label}</span>
                </div>
                <span className={`slider-value-pill ${currentValue >= 8 ? 'high' : currentValue >= 5 ? 'mid' : 'low'}`}>
                  {currentValue}/10
                </span>
              </div>

              <div className="slider-control-row">
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={currentValue}
                  onChange={(e) => onChangePreference(option.id, parseInt(e.target.value, 10))}
                  className="pref-range-slider"
                />
              </div>
              <span className="slider-source-tag">{option.source}</span>
            </div>
          );
        })}
      </div>

      {/* Budget Ceiling Input Row */}
      <div className="budget-range-section">
        <div className="budget-header-row">
          <span className="budget-title">Maximum Target Property Budget Ceiling:</span>
          <span className="budget-range-display">
            Up to ₹{budgetMax.toFixed(2)} Cr
          </span>
        </div>

        <div className="budget-inputs-row">
          <div className="budget-input-box w-full">
            <label className="input-label">Maximum Budget (₹ Crore)</label>
            <input
              type="number"
              step="0.25"
              min="0.5"
              max="15.0"
              value={budgetMax}
              onChange={(e) => onChangeBudgetMax(parseFloat(e.target.value) || 3.5)}
              className="budget-num-input"
            />
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="panel-actions">
        <button className="btn-primary-lg w-full" onClick={onAnalyzeProperty}>
          <Sparkles size={20} />
          <span>Analyze Property & Evaluate Neighborhood</span>
        </button>
      </div>
    </div>
  );
}

