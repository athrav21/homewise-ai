import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MUMBAI_LOCALITIES, DEFAULT_MUMBAI_CENTER } from '../data/mumbaiNeighborhoodData';

// Custom Pin Marker Icons
const defaultLocalityIcon = L.divIcon({
  className: 'custom-locality-marker',
  html: `
    <div className="locality-marker-pin">
      <div className="pin-dot"></div>
    </div>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 11]
});

const topRecommendationIcon = L.divIcon({
  className: 'custom-recommended-marker',
  html: `
    <div className="recommended-marker-pin">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#059669" width="32" height="32" stroke="#ffffff" stroke-width="2">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    </div>
  `,
  iconSize: [32, 42],
  iconAnchor: [16, 40]
});

const selectedPointIcon = L.divIcon({
  className: 'custom-selected-marker',
  html: `
    <div className="selected-marker-pin">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0284c7" width="36" height="36" stroke="#ffffff" stroke-width="2">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    </div>
  `,
  iconSize: [36, 46],
  iconAnchor: [18, 42]
});

export default function LeafletMap({
  lat = DEFAULT_MUMBAI_CENTER.lat,
  lng = DEFAULT_MUMBAI_CENTER.lng,
  topRecommendedLocalityIds = [],
  onSelectLocality,
  onMapPointClick
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const localityMarkersRef = useRef({});
  const activePinMarkerRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: DEFAULT_MUMBAI_CENTER.zoom,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      // Render 40 Mumbai Locality Markers
      MUMBAI_LOCALITIES.forEach((loc) => {
        const isTop = topRecommendedLocalityIds.includes(loc.id);
        const icon = isTop ? topRecommendationIcon : defaultLocalityIcon;

        const marker = L.marker([loc.latitude, loc.longitude], { icon }).addTo(map);

        // Build rich HTML popup for marker
        const popupContent = document.createElement('div');
        popupContent.className = 'locality-popup-card';
        popupContent.innerHTML = `
          <div style="font-family: inherit; width: 220px; padding: 4px;">
            <div style="font-weight: 700; font-size: 1.05rem; margin-bottom: 2px; color: #0f172a;">${loc.name}</div>
            <div style="font-size: 0.82rem; color: #059669; font-weight: 700; margin-bottom: 6px;">Avg Price: ₹${loc.averagePriceCr} Cr</div>
            <div style="font-size: 0.78rem; display: grid; grid-template-columns: 1fr 1fr; gap: 4px; background: #f8fafc; padding: 6px; border-radius: 6px; margin-bottom: 8px;">
              <div>Schools: <b>${loc.schoolScore}/100</b></div>
              <div>Hospitals: <b>${loc.hospitalScore}/100</b></div>
              <div>Markets: <b>${loc.marketScore}/100</b></div>
              <div>Transit: <b>${loc.connectivityScore}/100</b></div>
              <div>Safety: <b>${loc.crimeRiskScore}/100</b></div>
              <div>Air Quality: <b>${loc.airQualityScore}/100</b></div>
            </div>
            <button id="btn-popup-${loc.id}" style="width: 100%; background: #0284c7; color: white; border: none; padding: 6px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.82rem;">
              View Full Details →
            </button>
          </div>
        `;

        marker.bindPopup(popupContent);

        marker.on('popupopen', () => {
          const btn = document.getElementById(`btn-popup-${loc.id}`);
          if (btn) {
            btn.onclick = () => {
              onSelectLocality(loc);
            };
          }
        });

        localityMarkersRef.current[loc.id] = marker;
      });

      // Handle map arbitrary click
      map.on('click', (e) => {
        const clickedLat = e.latlng.lat;
        const clickedLng = e.latlng.lng;
        if (onMapPointClick) {
          onMapPointClick(clickedLat, clickedLng);
        }
      });

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map center and markers when recommendations or selected location change
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo([lat, lng]);

      // Update marker icons based on top recommendations
      MUMBAI_LOCALITIES.forEach((loc) => {
        const marker = localityMarkersRef.current[loc.id];
        if (marker) {
          const isTop = topRecommendedLocalityIds.includes(loc.id);
          marker.setIcon(isTop ? topRecommendationIcon : defaultLocalityIcon);
        }
      });
    }
  }, [lat, lng, topRecommendedLocalityIds]);

  return (
    <div className="map-wrapper">
      <div ref={mapContainerRef} className="leaflet-map-element" />
      <div className="map-overlay-hint">
        🗺️ Showing 40 Mumbai Metropolitan Localities. Click any marker to view metrics & recommendation match.
      </div>
    </div>
  );
}
