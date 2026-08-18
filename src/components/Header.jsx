import React from 'react';
import { Home, Sparkles, MapPin, ArrowLeft, AlertTriangle } from 'lucide-react';

export default function Header({ currentView, onResetLocation, selectedLocalityName }) {
  return (
    <header className="app-header">
      {/* Mandatory Top Prototype Synthetic Data Disclaimer Banner */}
      <div className="synthetic-disclaimer-bar">
        <AlertTriangle size={15} className="disclaimer-icon" />
        <span>
          <strong>Prototype Synthetic Data — Not for Real Property Decisions:</strong> The neighborhood values shown in this academic prototype are simulated for demonstration. Real deployment would use verified government, municipal, environmental and infrastructure data.
        </span>
      </div>

      <div className="header-container">
        <div className="brand-group" onClick={onResetLocation} style={{ cursor: 'pointer' }}>
          <div className="brand-icon-wrapper">
            <Home className="brand-icon" />
            <Sparkles className="brand-sparkle" />
          </div>
          <div>
            <div className="brand-title-row">
              <h1 className="brand-title">HomeWise AI</h1>
              <span className="prototype-pill">Mumbai MMR Edition</span>
            </div>
            <p className="brand-subtitle">
              AI-powered neighborhood intelligence & location recommendation system for Indian home-buyers
            </p>
          </div>
        </div>

        {currentView === 'detail' && (
          <div className="header-actions">
            <button className="btn-secondary" onClick={onResetLocation}>
              <ArrowLeft size={16} />
              <span>Back to Map & Recommendations</span>
            </button>
            <div className="active-location-pill" title={selectedLocalityName}>
              <MapPin size={14} className="pin-icon" />
              <span className="location-text">
                {selectedLocalityName || "Mumbai Locality"}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
