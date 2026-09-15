import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import LocationSelector from './components/LocationSelector';
import RecommendationDashboard from './components/RecommendationDashboard';
import NeighborhoodDetail from './components/NeighborhoodDetail';
import AnalysisLoadingModal from './components/AnalysisLoadingModal';
import LocalityComparisonMatrix from './components/LocalityComparisonMatrix';
import DetailedReportView from './components/DetailedReportView';
import ModelStatusPanel from './components/ModelStatusPanel';
import { MUMBAI_LOCALITIES } from './data/mumbaiNeighborhoodData';
import { getTopRecommendations } from './services/recommendationService';

export default function App() {
  // Default to Powai locality
  const defaultLocality = MUMBAI_LOCALITIES.find(l => l.name === 'Powai') || MUMBAI_LOCALITIES[0];

  const [selectedLocality, setSelectedLocality] = useState(defaultLocality);
  const [selectedLat, setSelectedLat] = useState(defaultLocality.latitude);
  const [selectedLng, setSelectedLng] = useState(defaultLocality.longitude);

  // 1 to 10 Slider Preferences state for 11 factors
  const [preferences, setPreferences] = useState({
    school: 5,
    hospital: 5,
    market: 5,
    safety: 5,
    connectivity: 5,
    airQuality: 5,
    floodSafety: 5,
    affordability: 5,
    water: 5,
    power: 5,
    futureInfrastructure: 5
  });

  // Maximum Target Property Budget Ceiling (₹ Cr)
  const [budgetMax, setBudgetMax] = useState(3.5);

  // Active View: 'selection' | 'analyzing' | 'detail' | 'comparison' | 'report' | 'model_status'
  const [currentView, setCurrentView] = useState('selection');
  const [isAnalyzingModalOpen, setIsAnalyzingModalOpen] = useState(false);

  // Comparison matrix list (up to 3 localities)
  const [comparisonList, setComparisonList] = useState([]);
  const [reportLocality, setReportLocality] = useState(null);

  // Backend Health & Model Status state
  const [backendHealthy, setBackendHealthy] = useState(false);
  const [modelRegistry, setModelRegistry] = useState(null);

  // Check Python backend health and model status on mount
  useEffect(() => {
    async function checkBackend() {
      try {
        const healthRes = await fetch('http://localhost:8000/api/health');
        if (healthRes.ok) {
          setBackendHealthy(true);
          const statusRes = await fetch('http://localhost:8000/api/model-status');
          if (statusRes.ok) {
            const data = await statusRes.json();
            setModelRegistry(data.models);
          }
        }
      } catch (e) {
        console.log("FastAPI backend not running on port 8000. Running in client-side prototype fallback mode.");
        setBackendHealthy(false);
      }
    }
    checkBackend();
  }, []);

  // Compute Top 5 Recommendations dynamically based on 1-10 preferences & budget
  const recommendations = useMemo(() => {
    return getTopRecommendations(preferences, budgetMax);
  }, [preferences, budgetMax]);

  const topRecommendedLocalityIds = useMemo(() => {
    return recommendations.map(r => r.locality.id);
  }, [recommendations]);

  // 1-10 Preference Change Handler
  const handleChangePreference = (id, val) => {
    setPreferences(prev => ({
      ...prev,
      [id]: val
    }));
  };

  // Reset to equal 5/10 balanced preferences
  const handleResetBalanced = () => {
    setPreferences({
      school: 5,
      hospital: 5,
      market: 5,
      safety: 5,
      connectivity: 5,
      airQuality: 5,
      floodSafety: 5,
      affordability: 5,
      water: 5,
      power: 5,
      futureInfrastructure: 5
    });
  };

  // Select a locality (from map marker, search, or recommendation cards)
  const handleSelectLocality = (locality) => {
    setSelectedLocality(locality);
    setSelectedLat(locality.latitude);
    setSelectedLng(locality.longitude);
  };

  // Trigger analysis sequence modal
  const handleAnalyzeProperty = () => {
    setIsAnalyzingModalOpen(true);
  };

  // When loading sequence completes
  const handleAnalysisComplete = () => {
    setIsAnalyzingModalOpen(false);
    setCurrentView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetLocation = () => {
    setCurrentView('selection');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenModelStatus = () => {
    setCurrentView('model_status');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToComparison = (locality) => {
    setComparisonList(prev => {
      if (prev.some(l => l.id === locality.id)) return prev;
      if (prev.length >= 3) return [...prev.slice(1), locality];
      return [...prev, locality];
    });
    setCurrentView('comparison');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRemoveFromComparison = (id) => {
    setComparisonList(prev => prev.filter(l => l.id !== id));
  };

  const handleClearComparison = () => {
    setComparisonList([]);
  };

  const handleOpenReport = (locality) => {
    setReportLocality(locality || selectedLocality);
    setCurrentView('report');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-root">
      <Header
        currentView={currentView}
        onResetLocation={handleResetLocation}
        onOpenModelStatus={handleOpenModelStatus}
        selectedLocalityName={selectedLocality?.name}
      />

      <main className="app-main-content">
        {currentView === 'selection' && (
          <LocationSelector
            selectedLat={selectedLat}
            selectedLng={selectedLng}
            selectedLocality={selectedLocality}
            topRecommendedLocalityIds={topRecommendedLocalityIds}
            preferences={preferences}
            onChangePreference={handleChangePreference}
            onResetBalanced={handleResetBalanced}
            budgetMax={budgetMax}
            onChangeBudgetMax={setBudgetMax}
            onAnalyzeProperty={handleAnalyzeProperty}
            onSelectLocality={handleSelectLocality}
          />
        )}

        {currentView === 'detail' && selectedLocality && (
          <NeighborhoodDetail
            locality={selectedLocality}
            preferences={preferences}
            budgetMax={budgetMax}
            backendHealthy={backendHealthy}
            onBackToMap={handleResetLocation}
            onChangePreference={handleChangePreference}
            onAddToComparison={handleAddToComparison}
            onOpenReport={handleOpenReport}
          />
        )}

        {currentView === 'comparison' && (
          <div className="detail-page-container">
            <LocalityComparisonMatrix
              localities={comparisonList.length > 0 ? comparisonList : [selectedLocality]}
              preferences={preferences}
              budgetMax={budgetMax}
              onRemoveLocality={handleRemoveFromComparison}
              onClearComparison={handleClearComparison}
            />
          </div>
        )}

        {currentView === 'report' && reportLocality && (
          <DetailedReportView
            locality={reportLocality}
            preferences={preferences}
            budgetMax={budgetMax}
            onBackToResults={() => setCurrentView('detail')}
          />
        )}

        {currentView === 'model_status' && (
          <div className="detail-page-container">
            <ModelStatusPanel modelRegistry={modelRegistry} />
          </div>
        )}
      </main>

      {/* Step-by-Step Loading Modal */}
      <AnalysisLoadingModal
        isOpen={isAnalyzingModalOpen}
        localityName={selectedLocality?.name}
        onComplete={handleAnalysisComplete}
      />

      <footer className="app-footer">
        <div className="footer-container">
          <p>© {new Date().getFullYear()} HomeWise AI — 12-Factor Neighborhood Intelligence Architecture</p>
          <p className="footer-sub">Prototype Synthetic Data — Not for Real Property Decisions. Evaluated across government, environmental, geospatial and infrastructure data sources.</p>
        </div>
      </footer>
    </div>
  );
}

