import React from 'react';
import { Sliders, Sparkles, TrendingUp, RefreshCw } from 'lucide-react';
import { PREFERENCE_SLIDERS } from '../services/recommendationService';

export default function WhatIfAnalysisTool({
  locality,
  preferences,
  onChangePreference,
  onRecalculate
}) {
  return (
    <div className="what-if-card">
      <div className="card-header-row">
        <div className="flex items-center gap-2">
          <Sliders size={20} className="text-primary" />
          <div>
            <h4 className="what-if-title">What If Your Priorities Change?</h4>
            <p className="what-if-sub">
              Adjust your preference sliders in real time to observe how your HomeWise Match Score and locality rankings recalculate.
            </p>
          </div>
        </div>
      </div>

      <div className="what-if-sliders-flex">
        {PREFERENCE_SLIDERS.map((option) => {
          const val = preferences[option.id] !== undefined ? preferences[option.id] : 5;

          return (
            <div key={option.id} className="what-if-chip font-sans">
              <span className="lbl">{option.label}</span>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={val}
                onChange={(e) => {
                  onChangePreference(option.id, parseInt(e.target.value, 10));
                  onRecalculate();
                }}
                className="mini-range-slider"
              />
              <span className="val-badge">{val}/10</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
