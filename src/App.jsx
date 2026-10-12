import React, { useState, useEffect, useMemo, useRef } from 'react';
import Header from './components/Header';
import LocationSelector from './components/LocationSelector';
import RecommendationDashboard from './components/RecommendationDashboard';
import NeighborhoodDetail from './components/NeighborhoodDetail';
import AnalysisLoadingModal from './components/AnalysisLoadingModal';
import LocalityComparisonMatrix from './components/LocalityComparisonMatrix';
import DetailedReportView from './components/DetailedReportView';
import ModelStatusPanel from './components/ModelStatusPanel';
import AuthModal from './components/AuthModal';
import { MUMBAI_LOCALITIES } from './data/mumbaiNeighborhoodData';
import { getTopRecommendations } from './services/recommendationService';
import { getCurrentUser, signOutUser, onAuthStateChange } from './services/supabaseClient';
import { savePreferences, loadPreferences } from './services/userPreferenceService';

export default function App() {
  // Default to Powai locality
  const defaultLocality = MUMBAI_LOCALITIES.find(l => l.name === 'Powai') || MUMBAI_LOCALITIES[0];

  const [selectedLocality, setSelectedLocality] = useState(defaultLocality);
  const [selectedLat, setSelectedLat] = useState(defaultLocality.latitude);
  const [selectedLng, setSelectedLng] = useState(defaultLocality.longitude);

  // 1 to 10 Slider / Priority Chip Preferences state for 11 factors
  const [preferences, setPreferences] = useState({
    school: false,
    hospital: false,
    market: false,
    safety: false,
    connectivity: false,
    airQuality: false,
    floodSafety: false,
    affordability: false,
    water: false,
    power: false,
    futureInfrastructure: false
  });

  // Target Property Budget Range (₹ Cr)
  const [budgetMin, setBudgetMin] = useState(1.0);
  const [budgetMax, setBudgetMax] = useState(3.5);

  // Authentication State
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [prefSyncStatus, setPrefSyncStatus] = useState('idle');

  // Active View: 'selection' | 'dashboard' | 'detail' | 'comparison' | 'report' | 'model_status'
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

  // Initialize and listen to Supabase Authentication
  useEffect(() => {
    // Check existing session
    getCurrentUser().then(user => {
      setCurrentUser(user);
      if (user) {
        // Load saved preferences for this user
        loadPreferences(user.id).then(saved => {
          if (saved) {
            if (saved.preferences) setPreferences(saved.preferences);
            if (saved.budgetMin !== null && saved.budgetMin !== undefined) setBudgetMin(saved.budgetMin);
            if (saved.budgetMax !== null && saved.budgetMax !== undefined) setBudgetMax(saved.budgetMax);
            setPrefSyncStatus('saved');
          }
        });
      }
    });

    const unsubscribe = onAuthStateChange(user => {
      setCurrentUser(user);
      if (user) {
        loadPreferences(user.id).then(saved => {
          if (saved) {
            if (saved.preferences) setPreferences(saved.preferences);
            if (saved.budgetMin !== null && saved.budgetMin !== undefined) setBudgetMin(saved.budgetMin);
            if (saved.budgetMax !== null && saved.budgetMax !== undefined) setBudgetMax(saved.budgetMax);
            setPrefSyncStatus('saved');
          }
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Save user preferences when preferences, budgetMin, or budgetMax change
  const saveTimeoutRef = useRef(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      setPrefSyncStatus('saving');
      const res = await savePreferences(currentUser?.id, { preferences, budgetMin, budgetMax });
      if (res.success) {
        setPrefSyncStatus('saved');
      } else {
        setPrefSyncStatus('error');
      }
    }, 800);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [preferences, budgetMin, budgetMax, currentUser]);

  // Compute Top 5 Recommendations dynamically based on preferences & budget
  const recommendations = useMemo(() => {
    return getTopRecommendations(preferences, budgetMax, budgetMin);
  }, [preferences, budgetMax, budgetMin]);

  const topRecommendedLocalityIds = useMemo(() => {
    return recommendations.map(r => r.locality.id);
  }, [recommendations]);

  // Toggle feature priority card (selected vs unselected)
  const handleToggleFeature = (id) => {
    setPreferences(prev => {
      const currentVal = prev[id];
      const newVal = currentVal === true || (typeof currentVal === 'number' && currentVal > 5) ? false : true;
      return {
        ...prev,
        [id]: newVal
      };
    });
  };

  // Fine-tune 1-10 Slider Preference Change Handler
  const handleChangePreference = (id, val) => {
    setPreferences(prev => ({
      ...prev,
      [id]: val
    }));
  };

  // Reset to balanced overview
  const handleResetBalanced = () => {
    setPreferences({
      school: false,
      hospital: false,
      market: false,
      safety: false,
      connectivity: false,
      airQuality: false,
      floodSafety: false,
      affordability: false,
      water: false,
      power: false,
      futureInfrastructure: false
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
    setCurrentView('dashboard');
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

  const handleSignOut = async () => {
    await signOutUser();
    setCurrentUser(null);
    setPrefSyncStatus('idle');
  };

  return (
    <div className="app-root">
      <Header
        currentView={currentView}
        onResetLocation={handleResetLocation}
        onOpenModelStatus={handleOpenModelStatus}
        selectedLocalityName={selectedLocality?.name}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
        prefSyncStatus={prefSyncStatus}
      />

      <main className="app-main-content">
        {currentView === 'selection' && (
          <LocationSelector
            selectedLat={selectedLat}
            selectedLng={selectedLng}
            selectedLocality={selectedLocality}
            topRecommendedLocalityIds={topRecommendedLocalityIds}
            preferences={preferences}
            onToggleFeature={handleToggleFeature}
            onChangePreference={handleChangePreference}
            onResetBalanced={handleResetBalanced}
            budgetMin={budgetMin}
            onChangeBudgetMin={setBudgetMin}
            budgetMax={budgetMax}
            onChangeBudgetMax={setBudgetMax}
            onAnalyzeProperty={handleAnalyzeProperty}
            onSelectLocality={handleSelectLocality}
          />
        )}

        {currentView === 'dashboard' && (
          <div className="detail-page-container">
            <RecommendationDashboard
              recommendations={recommendations}
              preferences={preferences}
              budgetMin={budgetMin}
              budgetMax={budgetMax}
              currentUser={currentUser}
              onSelectLocality={(locality) => {
                setSelectedLocality(locality);
                setSelectedLat(locality.latitude);
                setSelectedLng(locality.longitude);
                setCurrentView('detail');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onBackToSearch={handleResetLocation}
            />
          </div>
        )}

        {currentView === 'detail' && selectedLocality && (
          <NeighborhoodDetail
            locality={selectedLocality}
            preferences={preferences}
            budgetMax={budgetMax}
            currentUser={currentUser}
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
            budgetMin={budgetMin}
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

      {/* Supabase Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthModalOpen(false);
        }}
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
