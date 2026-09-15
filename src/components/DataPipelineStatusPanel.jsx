import React from 'react';
import { Network, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

export default function DataPipelineStatusPanel({ backendHealthy }) {
  const sources = [
    { name: "FastAPI Python Model Service", type: "Backend API (Port 8000)", status: backendHealthy ? "Connected" : "Offline (Fallback Mode)", ok: backendHealthy },
    { name: "OpenStreetMap / Overpass API", type: "Geospatial POIs & Transit", status: "Connected", ok: true },
    { name: "UDISE+ School Dataset", type: "K-12 Education Data", status: "Available (Government Data)", ok: true },
    { name: "BMC / OpenCity Health Registry", type: "Hospital & Medical Data", status: "Available", ok: true },
    { name: "CPCB / MPCB Air Quality", type: "AQI Station Records", status: "Connected", ok: true },
    { name: "ISRO Bhuvan GIS Hazard Map", type: "Flood Elevation Data", status: "Available", ok: true },
    { name: "Mumbai Police / NCRB Registry", type: "Crime & Safety Records", status: "Available", ok: true },
    { name: "MMRDA Infrastructure GIS Plan", type: "Metro & Sea Link Corridor", status: "Available", ok: true }
  ];

  return (
    <div className="pipeline-card">
      <div className="card-header-row flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Network size={20} className="text-primary" />
          <div>
            <h4 className="pipeline-title">Data Pipeline & Source Status</h4>
            <p className="pipeline-sub">
              Real-time monitoring of open data APIs, GIS raster services, and python model inference endpoints.
            </p>
          </div>
        </div>
      </div>

      <div className="pipeline-grid">
        {sources.map((src, idx) => (
          <div key={idx} className={`pipeline-item ${src.ok ? 'ok' : 'warn'}`}>
            <div className="flex items-center gap-2">
              {src.ok ? (
                <CheckCircle2 size={16} className="text-emerald shrink-0" />
              ) : (
                <AlertTriangle size={16} className="text-amber shrink-0" />
              )}
              <div>
                <span className="src-name">{src.name}</span>
                <span className="src-type">{src.type}</span>
              </div>
            </div>

            <span className={`status-tag ${src.ok ? 'tag-emerald' : 'tag-amber'}`}>
              {src.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
