import React from 'react';
import { BUYER_PROFILES } from '../services/scoringService';
import { Users, Briefcase, HeartPulse, TrendingUp, Scale, Check } from 'lucide-react';

const ICON_MAP = {
  Users,
  Briefcase,
  HeartPulse,
  TrendingUp,
  Scale
};

export default function BuyerProfileSelector({ selectedProfileKey, onSelectProfile }) {
  return (
    <div className="buyer-profile-card">
      <div className="profile-header">
        <div>
          <h3 className="profile-title">What matters most to you?</h3>
          <p className="profile-subtitle">
            Select your buyer profile to dynamically re-weight neighborhood scores to match your lifestyle goals.
          </p>
        </div>
      </div>

      <div className="profile-grid">
        {Object.values(BUYER_PROFILES).map((profile) => {
          const IconComponent = ICON_MAP[profile.icon] || Scale;
          const isSelected = selectedProfileKey === profile.key;

          return (
            <div
              key={profile.key}
              className={`profile-chip ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectProfile(profile.key)}
            >
              <div className="chip-content">
                <div className="chip-icon-box">
                  <IconComponent size={20} />
                </div>
                <div className="chip-text">
                  <div className="chip-label-row">
                    <span className="chip-label">{profile.label}</span>
                    {isSelected && <Check size={14} className="check-mark" />}
                  </div>
                  <p className="chip-desc">{profile.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
