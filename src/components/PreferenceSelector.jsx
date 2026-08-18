import React from 'react';
import { PREFERENCE_OPTIONS } from '../services/recommendationService';
import {
  GraduationCap,
  Stethoscope,
  ShoppingBag,
  ShieldCheck,
  Train,
  IndianRupee,
  Wind,
  Umbrella,
  TrendingUp,
  Sparkles,
  Sliders
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
  TrendingUp
};

export default function PreferenceSelector({
  preferences,
  onTogglePreference,
  budgetMin,
  budgetMax,
  onChangeBudgetMin,
  onChangeBudgetMax,
  onFindBestLocations
}) {
  const activeCount = Object.values(preferences).filter(Boolean).length;

  return (
    <div className="preference-panel-card">
      <div className="panel-header">
        <div className="header-title-group">
          <Sliders className="text-primary" size={22} />
          <div>
            <h3 className="panel-title">What matters most to you?</h3>
            <p className="panel-sub">
              Select your priority preferences and budget range to rank all 40 Mumbai Metropolitan localities.
            </p>
          </div>
        </div>

        <div className="active-count-badge">
          {activeCount} {activeCount === 1 ? 'Preference' : 'Preferences'} Selected
        </div>
      </div>

      {/* Preferences Checkboxes Grid */}
      <div className="preferences-checkbox-grid">
        {PREFERENCE_OPTIONS.map((option) => {
          const IconComponent = ICON_MAP[option.icon] || Sparkles;
          const isChecked = !!preferences[option.id];

          return (
            <label
              key={option.id}
              className={`pref-checkbox-chip ${isChecked ? 'active' : ''}`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => onTogglePreference(option.id)}
                className="hidden-checkbox"
              />
              <div className="chip-inner">
                <IconComponent size={18} className="pref-icon" />
                <span className="pref-label">{option.label}</span>
              </div>
            </label>
          );
        })}
      </div>

      {/* Budget Range Selection Row */}
      <div className="budget-range-section">
        <div className="budget-header-row">
          <span className="budget-title">Target Property Budget (in ₹ Crore):</span>
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
              onChange={(e) => onChangeBudgetMax(parseFloat(e.target.value) || 4.0)}
              className="budget-num-input"
            />
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="panel-actions">
        <button className="btn-primary-lg w-full" onClick={onFindBestLocations}>
          <Sparkles size={20} />
          <span>Find Best Locations for You</span>
        </button>
      </div>
    </div>
  );
}
