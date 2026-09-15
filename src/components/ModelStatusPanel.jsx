import React from 'react';
import { Database, CheckCircle2, AlertCircle, Cpu, FileCode } from 'lucide-react';

export default function ModelStatusPanel({ modelRegistry }) {
  const categories = [
    { key: "school", label: "School Quality Model", defaultAlg: "XGBoostRegressor" },
    { key: "hospital", label: "Hospital Accessibility Model", defaultAlg: "RandomForestRegressor" },
    { key: "market", label: "Market Accessibility Model", defaultAlg: "GradientBoosting" },
    { key: "safety", label: "Crime & Safety Risk Model", defaultAlg: "RandomForestRegressor" },
    { key: "connectivity", label: "City Connectivity Engine", defaultAlg: "GIS Spatial Transit Distance" },
    { key: "air_quality", label: "Air Quality (AQI) Model", defaultAlg: "LSTM Time-Series Predictor" },
    { key: "flood_safety", label: "Monsoon Flood Safety Model", defaultAlg: "Topographic Bhuvan GIS" },
    { key: "property_price", label: "Property Price Valuation", defaultAlg: "70K+ Listing Regression" },
    { key: "water_reliability", label: "Water Supply Reliability", defaultAlg: "Data-Driven Municipal Index" },
    { key: "power_reliability", label: "Power Grid Stability", defaultAlg: "Outage Grid Index" },
    { key: "future_infrastructure", label: "Future Infrastructure Boost", defaultAlg: "MMRDA Corridor Buffer" },
    { key: "overall_livability", label: "Overall Livability Composite", defaultAlg: "MCDM Normalized Weight Aggregation" }
  ];

  return (
    <div className="model-status-card">
      <div className="card-header-bar">
        <div className="flex items-center gap-2">
          <Cpu className="text-primary" size={22} />
          <div>
            <h3 className="card-title-text">12-Factor Machine Learning & GIS Architecture Status</h3>
            <p className="card-sub-text">
              Real-time directory & binary inspection of trained model files in <code>models/</code> and spatial fallbacks.
            </p>
          </div>
        </div>
      </div>

      <div className="models-status-grid">
        {categories.map((cat) => {
          const info = (modelRegistry && modelRegistry[cat.key]) || {};
          const isLoaded = !!info.loaded;
          const fileName = info.file || `models/${cat.key}/model_config.json`;
          const alg = info.algorithm || cat.defaultAlg;
          const source = info.source || "Prototype Spatial Index — Not for Real Property Decisions";

          return (
            <div key={cat.key} className={`model-tile ${isLoaded ? 'loaded' : 'fallback'}`}>
              <div className="tile-top-row">
                <div className="flex items-center gap-1.5">
                  <Database size={16} className={isLoaded ? "text-emerald" : "text-amber"} />
                  <span className="model-name">{cat.label}</span>
                </div>

                <span className={`status-badge-sm ${isLoaded ? 'badge-emerald' : 'badge-amber'}`}>
                  {isLoaded ? 'Loaded (.pkl)' : 'Active (Spatial Index)'}
                </span>
              </div>

              <div className="model-meta-info">
                <div className="meta-line">
                  <Cpu size={13} className="text-muted" />
                  <span>Algorithm: <strong>{alg}</strong></span>
                </div>
                <div className="meta-line">
                  <FileCode size={13} className="text-muted" />
                  <span className="file-path">{fileName}</span>
                </div>
                <div className="source-line">
                  <span className="lbl">Source:</span> <span>{source}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
