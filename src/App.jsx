import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import LocationSelector from './components/LocationSelector';
import RecommendationDashboard from './components/RecommendationDashboard';
import NeighborhoodDetail from './components/NeighborhoodDetail';
import { MUMBAI_LOCALITIES, DEFAULT_MUMBAI_CENTER } from './data/mumbaiNeighborhoodData';
import { getTopRecommendations } from './services/recommendationService';

export default function App() {
  // Default to Powai locality
  const defaultLocality = MUMBAI_LOCALITIES.find(l => l.name === 'Powai') || MUMBAI_LOCALITIES[0];

  const [selectedLocality, setSelectedLocality] = useState(defaultLocality);
  const [selectedLat, setSelectedLat] = useState(defaultLocality.latitude);
  const [selectedLng, setSelectedLng] = useState(defaultLocality.longitude);

  // Preference Checkboxes state
  const [preferences, setPreferences] = useState({
    schools: true,
    hospitals: true,
    markets: false,
    crimeRisk: true,
    connectivity: true,
    affordablePrice: false,
    airQuality: false,
    floodSafety: false,
    futureInfra: false
  });

  // Target Budget Range (₹ Cr)
  const [budgetMin, setBudgetMin] = useState(1.0);
  const [budgetMax, setBudgetMax] = useState(3.5);

  // Active View: 'selection' | 'recommendations' | 'detail'
  const [currentView, setCurrentView] = useState('selection');

  // Compute Top 5 Recommendations dynamically
  const recommendations = useMemo(() => {
    return getTopRecommendations(preferences, budgetMin, budgetMax);
  }, [preferences, budgetMin, budgetMax]);

  const topRecommendedLocalityIds = useMemo(() => {
    return recommendations.map(r => r.locality.id);
  }, [recommendations]);

  // Preference Toggle Handler
  const handleTogglePreference = (id) => {
    setPreferences(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Select a locality (e.g. from map marker or search)
  const handleSelectLocality = (locality) => {
    setSelectedLocality(locality);
    setSelectedLat(locality.latitude);
    setSelectedLng(locality.longitude);
    setCurrentView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFindBestLocations = () => {
    setCurrentView('recommendations');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetLocation = () => {
    setCurrentView('selection');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-root">
      <Header
        currentView={currentView}
        onResetLocation={handleResetLocation}
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
            onTogglePreference={handleTogglePreference}
            budgetMin={budgetMin}
            budgetMax={budgetMax}
            onChangeBudgetMin={setBudgetMin}
            onChangeBudgetMax={setBudgetMax}
            onFindBestLocations={handleFindBestLocations}
            onSelectLocality={handleSelectLocality}
          />
        )}

        {currentView === 'recommendations' && (
          <RecommendationDashboard
            recommendations={recommendations}
            preferences={preferences}
            budgetMin={budgetMin}
            budgetMax={budgetMax}
            onSelectLocality={handleSelectLocality}
            onBackToSearch={handleResetLocation}
          />
        )}

        {currentView === 'detail' && selectedLocality && (
          <NeighborhoodDetail
            locality={selectedLocality}
            preferences={preferences}
            budgetMin={budgetMin}
            budgetMax={budgetMax}
            onBackToMap={handleResetLocation}
          />
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-container">
          <p>© {new Date().getFullYear()} HomeWise AI — Mumbai Metropolitan Region Edition (Review 2 Academic Prototype)</p>
          <p className="footer-sub">Synthetic demonstration data. Not intended for actual real estate or financial investment decisions.</p>
        </div>
      </footer>
    </div>
  );
}
