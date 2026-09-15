import React from 'react';
import { Layers, X, IndianRupee, Sparkles } from 'lucide-react';
import { calculateLocalityMatch } from '../services/recommendationService';

export default function LocalityComparisonMatrix({
  localities,
  preferences,
  budgetMax,
  onRemoveLocality,
  onClearComparison
}) {
  if (!localities || localities.length === 0) return null;

  const rows = [
    { label: "HomeWise Match Score", key: "matchScore", isMatch: true },
    { label: "Average Property Price (₹ Cr)", key: "averagePriceCr", isPrice: true },
    { label: "1. School Quality", key: "schoolScore" },
    { label: "2. Hospital Access", key: "hospitalScore" },
    { label: "3. Market Access", key: "marketScore" },
    { label: "4. Safety & Low Crime", key: "safetyScore", fallbackKey: "crimeRiskScore" },
    { label: "5. City Transit Access", key: "connectivityScore" },
    { label: "6. Clean Air Quality", key: "airQualityScore" },
    { label: "7. Monsoon Flood Safety", key: "floodSafetyScore" },
    { label: "8. Water Reliability", key: "waterScore" },
    { label: "9. Power Grid Stability", key: "powerScore" },
    { label: "10. Future Infrastructure", key: "futureInfrastructureScore", fallbackKey: "futureDevelopmentScore" },
    { label: "11. Overall Livability Score", key: "livabilityScore" }
  ];

  const calculatedLocalities = localities.map((loc) => {
    const res = calculateLocalityMatch(loc, preferences, budgetMax);
    return res;
  });

  return (
    <div className="comparison-card">
      <div className="card-header-bar flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers size={22} className="text-primary" />
          <div>
            <h3 className="card-title-text">Locality Comparison Matrix ({localities.length}/3 Selected)</h3>
            <p className="card-sub-text">
              Side-by-side evaluation of selected MMR localities calculated against your current 1–10 preference sliders.
            </p>
          </div>
        </div>

        <button className="btn-secondary-sm" onClick={onClearComparison}>
          Clear Matrix
        </button>
      </div>

      <div className="table-responsive">
        <table className="comparison-table">
          <thead>
            <tr>
              <th className="feature-col">Factor / Metric</th>
              {calculatedLocalities.map((item) => (
                <th key={item.locality.id} className="locality-col">
                  <div className="locality-col-header">
                    <span className="loc-name">{item.locality.name}</span>
                    <span className="loc-city">{item.locality.city}</span>
                    <button
                      className="btn-remove-loc"
                      onClick={() => onRemoveLocality(item.locality.id)}
                      title="Remove from comparison"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} className={row.isMatch ? "highlight-match-row" : ""}>
                <td className="row-label">{row.label}</td>
                {calculatedLocalities.map((item) => {
                  let val = item.locality[row.key];
                  if (val === undefined && row.fallbackKey) {
                    val = item.locality[row.fallbackKey];
                  }

                  if (row.isMatch) {
                    return (
                      <td key={item.locality.id} className="match-cell">
                        <span className="match-num">{item.matchScore}</span>
                        <span className="match-denom">/100</span>
                      </td>
                    );
                  }

                  if (row.isPrice) {
                    return (
                      <td key={item.locality.id} className="price-cell">
                        ₹{item.locality.averagePriceCr} Cr
                      </td>
                    );
                  }

                  return (
                    <td key={item.locality.id} className="score-cell">
                      <span className={`score-badge ${val >= 88 ? 'high' : val >= 75 ? 'mid' : 'low'}`}>
                        {val || 80}/100
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
