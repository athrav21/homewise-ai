import React, { useState, useEffect } from 'react';
import { Search, MapPin, Navigation, Sparkles, Loader2, Compass } from 'lucide-react';
import LeafletMap from './LeafletMap';
import PreferenceSelector from './PreferenceSelector';
import { MUMBAI_LOCALITIES, DEFAULT_MUMBAI_CENTER, getArbitraryLocationMetrics } from '../data/mumbaiNeighborhoodData';
import { searchLocations, fetchAddressFromCoords } from '../services/geocodingService';

export default function LocationSelector({
  selectedLat,
  selectedLng,
  selectedAddress,
  selectedLocality,
  topRecommendedLocalityIds,
  preferences,
  onChangePreference,
  onResetBalanced,
  budgetMax,
  onChangeBudgetMax,
  onAnalyzeProperty,
  onSelectLocality,
  onMapLocationChange
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Popular Mumbai Presets
  const popularPresets = MUMBAI_LOCALITIES.filter(loc =>
    ["Powai", "Bandra West", "Thane West", "Worli", "Vashi", "Borivali West"].includes(loc.name)
  );

  // Search input handler (searches local Mumbai 40 localities first, then Nominatim API)
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const queryLower = searchQuery.trim().toLowerCase();

      // 1. Search local 40 Mumbai localities
      const localMatches = MUMBAI_LOCALITIES.filter(loc =>
        loc.name.toLowerCase().includes(queryLower) || loc.city.toLowerCase().includes(queryLower)
      ).map(loc => ({
        isLocal: true,
        locality: loc,
        name: `${loc.name}, ${loc.city}`,
        lat: loc.latitude,
        lng: loc.longitude
      }));

      // 2. Search OpenStreetMap Nominatim for general queries
      const onlineResults = await searchLocations(searchQuery + " Mumbai");
      const onlineMatches = onlineResults.map(item => ({
        isLocal: false,
        name: item.name,
        lat: item.lat,
        lng: item.lng
      }));

      // Combine local matches first
      setSearchResults([...localMatches, ...onlineMatches]);
      setIsSearching(false);
      setShowResults(true);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectResult = (result) => {
    if (result.isLocal && result.locality) {
      onSelectLocality(result.locality);
    } else {
      const customLoc = getArbitraryLocationMetrics(result.lat, result.lng, result.name);
      onSelectLocality(customLoc);
    }
    setSearchQuery('');
    setShowResults(false);
  };

  const handleMapClick = async (clickedLat, clickedLng) => {
    // Check if clicked near an existing Mumbai locality (within 1.5 km)
    const matchedLoc = MUMBAI_LOCALITIES.find(loc => {
      const dLat = Math.abs(loc.latitude - clickedLat);
      const dLng = Math.abs(loc.longitude - clickedLng);
      return dLat < 0.015 && dLng < 0.015;
    });

    if (matchedLoc) {
      onSelectLocality(matchedLoc);
    } else {
      const address = await fetchAddressFromCoords(clickedLat, clickedLng);
      const customLoc = getArbitraryLocationMetrics(clickedLat, clickedLng, address);
      onSelectLocality(customLoc);
    }
  };

  return (
    <div className="location-selection-container">
      {/* Hero Search & Title */}
      <div className="location-hero">
        <div className="hero-content">
          <h2 className="hero-title">Property-Centric Neighborhood Intelligence System</h2>
          <p className="hero-desc">
            Select a property on the map or search an address. HomeWise will evaluate the surrounding neighborhood across 12 dimensions and calculate your personalized HomeWise Match Score.
          </p>
        </div>

        {/* Locality Search Input */}
        <div className="search-bar-wrapper">
          <div className="search-input-group">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              className="search-input"
              placeholder="Search Mumbai locality (e.g. Powai, Bandra, Thane, Worli, Vashi)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowResults(true)}
            />
            {isSearching && <Loader2 className="search-spinner animate-spin" size={18} />}
          </div>

          {/* Search Dropdown */}
          {showResults && searchResults.length > 0 && (
            <ul className="search-dropdown">
              {searchResults.map((item, index) => (
                <li
                  key={index}
                  className="dropdown-item"
                  onClick={() => handleSelectResult(item)}
                >
                  <MapPin size={16} className="dropdown-icon" />
                  <span className="dropdown-text">
                    {item.name} {item.isLocal ? '📍 (Mumbai Dataset)' : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Popular Mumbai Locality Chips */}
        <div className="presets-row">
          <span className="presets-label">Popular MMR Localities:</span>
          <div className="presets-pills">
            {popularPresets.map((loc) => (
              <button
                key={loc.id}
                className={`preset-chip ${selectedLocality?.id === loc.id ? 'active' : ''}`}
                onClick={() => onSelectLocality(loc)}
              >
                <Navigation size={12} />
                <span>{loc.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Preferences Panel + Leaflet Map */}
      <div className="map-section-grid">
        <div className="preferences-column">
          <PreferenceSelector
            preferences={preferences}
            onChangePreference={onChangePreference}
            onResetBalanced={onResetBalanced}
            budgetMax={budgetMax}
            onChangeBudgetMax={onChangeBudgetMax}
            onAnalyzeProperty={onAnalyzeProperty}
          />
        </div>

        <div className="map-column">
          <LeafletMap
            lat={selectedLat}
            lng={selectedLng}
            topRecommendedLocalityIds={topRecommendedLocalityIds}
            onSelectLocality={onSelectLocality}
            onMapPointClick={handleMapClick}
          />
        </div>
      </div>
    </div>
  );
}
