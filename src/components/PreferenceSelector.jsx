import React, { useState } from 'react';
import { FEATURE_OPTIONS } from '../services/recommendationService';
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
  Check,
  Sliders,
  ChevronDown,
  ChevronUp,
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
  onToggleFeature,
  onChangePreference,
  onResetBalanced,
  budgetMin,
  budgetMax,
  onChangeBudgetMin,
  onChangeBudgetMax,
  onFindBestLocations
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Count active selected features
  const activeCount = Object.keys(preferences).filter(k => preferences[k] === true || (typeof preferences[k] === 'number' && preferences[k] > 5)).length;

  return (
    <div className="preference-panel-card font-sans">
      <div className="panel-header">
        <div className="header-title-group">
          <Sparkles className="text-primary" size={22} />
          <div>
            <h3 className="panel-title">What matters most to you?</h3>
            <p className="panel-sub">
              Click the features below to prioritize your lifestyle preferences. HomeWise will dynamically score and rank all 40 Mumbai Metropolitan localities.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="active-count-badge">
            {activeCount > 0 ? `${activeCount} Selected` : 'Balanced Overview'}
          </span>
          {activeCount > 0 && (
            <button
              className="btn-secondary-sm flex items-center gap-1"
              onClick={onResetBalanced}
              title="Clear all selections"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Clickable Feature Cards Grid */}
      <div className="feature-cards-grid">
        {FEATURE_OPTIONS.map((option) => {
          const IconComponent = ICON_MAP[option.icon] || Sparkles;
          const isSelected = preferences[option.id] === true || (typeof preferences[option.id] === 'number' && preferences[option.id] > 5);

          return (
            <button
              key={option.id}
              type="button"
              className={`feature-card-btn ${isSelected ? 'selected' : ''}`}
              onClick={() => onToggleFeature(option.id)}
            >
              <div className="card-btn-top">
                <div className="flex items-center gap-2">
                  <div className={`icon-wrapper ${isSelected ? 'active-icon' : ''}`}>
                    <IconComponent size={20} />
                  </div>
                  <span className="card-btn-title">{option.label}</span>
                </div>
                {isSelected && (
                  <span className="check-badge">
                    <Check size={14} />
                  </span>
                )}
              </div>
              <span className="card-btn-source">{option.source}</span>
            </button>
          );
        })}
      </div>

      {/* Target Property Budget Section */}
      <div className="budget-range-section">
        <div className="budget-header-row">
          <span className="budget-title">Target Property Budget Range (in ₹ Crore):</span>
          <span className="budget-range-display">
            ₹{budgetMin.toFixed(2)} Cr – ₹{budgetMax.toFixed(2)} Cr
          </span>
        </div>

        <div className="budget-inputs-row">
          <div className="budget-input-box">
            <label className="input-label">Minimum Budget (₹ Cr)</label>
            <input
              type="number"
              step="0.25"
              min="0.5"
              max="10.0"
              value={budgetMin}
              onChange={(e) => onChangeBudgetMin(parseFloat(e.target.value) || 0.5)}
              className="budget-num-input"
            />
          </div>

          <div className="budget-input-box">
            <label className="input-label">Maximum Budget (₹ Cr)</label>
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

      {/* Advanced Preference Sliders Collapsible (Optional) */}
      <div className="advanced-toggle-row mt-2">
        <button
          type="button"
          className="advanced-btn flex items-center gap-1 text-muted text-xs font-semibold"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <Sliders size={14} />
          <span>{showAdvanced ? 'Hide Advanced Weight Controls' : 'Show Advanced Weight Controls (1–10 Sliders)'}</span>
          {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showAdvanced && (
          <div className="advanced-sliders-box mt-3 p-3 bg-slate-50 border rounded-lg">
            <p className="text-xs text-muted mb-2">Fine-tune relative factor weights from 1 (low) to 10 (dominant):</p>
            <div className="preference-sliders-grid">
              {FEATURE_OPTIONS.map((option) => {
                const val = typeof preferences[option.id] === 'number' ? preferences[option.id] : (preferences[option.id] ? 10 : 5);
                return (
                  <div key={option.id} className="slider-box">
                    <div className="slider-header-row">
                      <span className="slider-title">{option.label}</span>
                      <span className="slider-value-pill mid">{val}/10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={val}
                      onChange={(e) => onChangePreference(option.id, parseInt(e.target.value, 10))}
                      className="pref-range-slider"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Primary Action Button */}
      <div className="panel-actions mt-4">
        <button className="btn-primary-lg w-full" onClick={onFindBestLocations}>
          <Sparkles size={20} />
          <span>FIND BEST AREAS & EVALUATE NEIGHBORHOOD</span>
        </button>
      </div>
    </div>
  );
}


