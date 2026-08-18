import React from 'react';
import { Layers, Cpu, ArrowRight, ShieldCheck } from 'lucide-react';

export default function RoadmapFooter({ roadmapFactors }) {
  return (
    <div className="roadmap-section">
      <div className="roadmap-header">
        <div className="roadmap-title-row">
          <Layers className="text-primary" size={22} />
          <div>
            <h4 className="roadmap-heading">Future AI & Real-Time API Architecture</h4>
            <p className="roadmap-sub">
              HomeWise AI modular pipeline designed to integrate live municipal feeds and GenAI analysis in future releases.
            </p>
          </div>
        </div>
      </div>

      <div className="roadmap-grid">
        {roadmapFactors.map((factor, idx) => (
          <div key={idx} className="roadmap-chip">
            <div className="chip-left">
              <Cpu size={16} className="chip-icon" />
              <span className="factor-title">{factor.name}</span>
            </div>
            <span className="status-tag">{factor.status}</span>
          </div>
        ))}
      </div>

      <div className="architecture-note-box">
        <ShieldCheck size={18} className="text-emerald" />
        <p>
          <strong>Modular Architecture Ready:</strong> Data layer interfaces (`scoringService` & `mockNeighborhoodData`) are decoupled to support instant drop-in replacement with real REST/GraphQL APIs (Overpass OpenStreetMap, OpenAQ, Open-Meteo, Google Maps API, and OpenAI/Claude LLM endpoints).
        </p>
      </div>
    </div>
  );
}
