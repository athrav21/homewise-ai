import React from 'react';
import { Home, Sparkles, MapPin, ArrowLeft, AlertTriangle, Cpu, Layers } from 'lucide-react';

export default function Header({
  currentView,
  onResetLocation,
  onOpenModelStatus,
  selectedLocalityName
}) {
  return (
    <header className="app-header">
      {/* Mandatory Top Prototype Synthetic Data Disclaimer Banner */}
      <div className="synthetic-disclaimer-bar">
        <AlertTriangle size={15} className="disclaimer-icon shrink-0" />
        <span>
          <strong>Prototype Synthetic Data — Not for Real Property Decisions:</strong> Factor scores and indicators are generated using 12-factor architecture for academic demonstration. Connected python backend loads trained ML models with transparent GIS fallbacks.
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
              <span className="prototype-pill">12-Factor Architecture</span>
            </div>
            <p className="brand-subtitle">
              Don't just evaluate the house. Evaluate the neighborhood.
            </p>
          </div>
        </div>

        <div className="header-actions">
          <button
            className={`nav-link-btn ${currentView === 'selection' ? 'active' : ''}`}
            onClick={onResetLocation}
          >
            <MapPin size={16} />
            <span>Explore Map</span>
          </button>

          <button
            className={`nav-link-btn ${currentView === 'model_status' ? 'active' : ''}`}
            onClick={onOpenModelStatus}
          >
            <Cpu size={16} />
            <span>Model Status</span>
          </button>

          {selectedLocalityName && (
            <div className="active-location-pill" title={selectedLocalityName}>
              <MapPin size={14} className="pin-icon" />
              <span className="location-text">
                {selectedLocalityName}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

