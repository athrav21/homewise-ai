import React from 'react';
import { GraduationCap, Stethoscope, Wind, Building2, MapPin, AlertCircle, CheckCircle, Info } from 'lucide-react';

export function SchoolFactorCard({ data }) {
  const { score, count, nearestKm, topSchools } = data;

  return (
    <div className="factor-card">
      <div className="card-top-bar">
        <div className="card-title-group">
          <div className="icon-badge icon-school">
            <GraduationCap size={22} />
          </div>
          <div>
            <h3 className="card-title">School Accessibility</h3>
            <span className="card-subtitle">K-12 Educational Institutions</span>
          </div>
        </div>
        <div className="score-pill">
          <span className="pill-score">{score}</span>
          <span className="pill-denom">/100</span>
        </div>
      </div>

      <div className="metrics-summary-row">
        <div className="stat-box">
          <span className="stat-label">Nearest School</span>
          <span className="stat-value">{nearestKm} km</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Nearby Schools</span>
          <span className="stat-value">{count}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Quality Score</span>
          <span className="stat-value text-emerald">{score}/100</span>
        </div>
      </div>

      <div className="sublist-section">
        <h5 className="sublist-title">Nearby Academic Institutions</h5>
        <ul className="sublist">
          {topSchools.map((school, i) => (
            <li key={i} className="sublist-item">
              <div className="sublist-item-main">
                <span className="item-name">{school.name}</span>
                <span className="item-meta">{school.distance} km away</span>
              </div>
              <span className="rating-tag">★ {school.rating}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function HospitalFactorCard({ data }) {
  const { score, count, nearestKm, topHospitals } = data;

  return (
    <div className="factor-card">
      <div className="card-top-bar">
        <div className="card-title-group">
          <div className="icon-badge icon-hospital">
            <Stethoscope size={22} />
          </div>
          <div>
            <h3 className="card-title">Hospital Accessibility</h3>
            <span className="card-subtitle">Medical & Healthcare Facilities</span>
          </div>
        </div>
        <div className="score-pill">
          <span className="pill-score">{score}</span>
          <span className="pill-denom">/100</span>
        </div>
      </div>

      <div className="metrics-summary-row">
        <div className="stat-box">
          <span className="stat-label">Nearest Hospital</span>
          <span className="stat-value">{nearestKm} km</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Nearby Hospitals</span>
          <span className="stat-value">{count}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Access Score</span>
          <span className="stat-value text-primary">{score}/100</span>
        </div>
      </div>

      <div className="sublist-section">
        <h5 className="sublist-title">Nearby Healthcare Centers</h5>
        <ul className="sublist">
          {topHospitals.map((hospital, i) => (
            <li key={i} className="sublist-item">
              <div className="sublist-item-main">
                <span className="item-name">{hospital.name}</span>
                <span className="item-meta">{hospital.distance} km away</span>
              </div>
              <span className="tag-emergency">24x7 ER</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function AirQualityFactorCard({ data }) {
  const { score, aqi, category, mainPollutant } = data;

  let categoryBadgeClass = "badge-emerald";
  if (category.toLowerCase().includes("moderate")) categoryBadgeClass = "badge-amber";
  if (category.toLowerCase().includes("unhealthy")) categoryBadgeClass = "badge-rose";

  return (
    <div className="factor-card">
      <div className="card-top-bar">
        <div className="card-title-group">
          <div className="icon-badge icon-air">
            <Wind size={22} />
          </div>
          <div>
            <h3 className="card-title">Air Quality Index (AQI)</h3>
            <span className="card-subtitle">Environmental & Respiratory Rating</span>
          </div>
        </div>
        <div className="score-pill">
          <span className="pill-score">{score}</span>
          <span className="pill-denom">/100</span>
        </div>
      </div>

      <div className="prototype-disclaimer-banner">
        <AlertCircle size={15} />
        <span>PROTOTYPE DATA: Mock AQI values used for Review 2 demonstration</span>
      </div>

      <div className="metrics-summary-row">
        <div className="stat-box">
          <span className="stat-label">AQI Value</span>
          <span className="stat-value">{aqi}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Status Category</span>
          <span className={`status-badge-sm ${categoryBadgeClass}`}>{category}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Main Pollutant</span>
          <span className="stat-value">{mainPollutant}</span>
        </div>
      </div>

      <div className="sublist-section">
        <h5 className="sublist-title">Air Quality Assessment</h5>
        <p className="aqi-desc-text">
          {aqi <= 50
            ? "Air quality is considered satisfactory, posing little or no risk to public health."
            : aqi <= 100
            ? "Air quality is acceptable; however, sensitive individuals should monitor outdoor exposure."
            : "Air quality may cause minor discomfort for sensitive respiratory groups."}
        </p>
      </div>
    </div>
  );
}

export function InfrastructureFactorCard({ data }) {
  const { score, transitDistKm, connectivity, upcomingProjects } = data;

  return (
    <div className="factor-card">
      <div className="card-top-bar">
        <div className="card-title-group">
          <div className="icon-badge icon-infra">
            <Building2 size={22} />
          </div>
          <div>
            <h3 className="card-title">Infrastructure Potential</h3>
            <span className="card-subtitle">Transit & Municipal Growth</span>
          </div>
        </div>
        <div className="score-pill">
          <span className="pill-score">{score}</span>
          <span className="pill-denom">/100</span>
        </div>
      </div>

      <div className="metrics-summary-row">
        <div className="stat-box">
          <span className="stat-label">Transit Hub</span>
          <span className="stat-value">{transitDistKm} km</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Broadband</span>
          <span className="stat-value text-sm">{connectivity}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Growth Score</span>
          <span className="stat-value text-indigo">{score}/100</span>
        </div>
      </div>

      <div className="sublist-section">
        <h5 className="sublist-title">Upcoming Municipal Projects</h5>
        <ul className="sublist">
          {upcomingProjects.map((proj, i) => (
            <li key={i} className="sublist-item">
              <span className="item-name flex items-center gap-1">
                <CheckCircle size={14} className="text-emerald" /> {proj}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
