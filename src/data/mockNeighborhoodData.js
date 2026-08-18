/**
 * Mock Neighborhood Data Service for HomeWise AI Prototype.
 * Provides preset locations and a deterministic mock generator
 * for any (lat, lng) coordinate on Earth.
 */

// Popular Preset Locations for Quick Demonstration
export const PRESET_LOCATIONS = [
  {
    name: "Austin Tech District, TX",
    address: "Downtown Austin, TX 78701, USA",
    lat: 30.2672,
    lng: -97.7431,
  },
  {
    name: "Silicon Valley Central, CA",
    address: "Palo Alto, CA 94301, USA",
    lat: 37.4419,
    lng: -122.1430,
  },
  {
    name: "Manhattan Upper East Side, NY",
    address: "Upper East Side, New York, NY 10021, USA",
    lat: 40.7736,
    lng: -73.9566,
  },
  {
    name: "Bengaluru Indiranagar, India",
    address: "Indiranagar 100ft Road, Bengaluru, Karnataka 560038, India",
    lat: 12.9784,
    lng: 77.6408,
  },
  {
    name: "London Kensington, UK",
    address: "Kensington High Street, London W8 6ED, UK",
    lat: 51.5014,
    lng: -0.1919,
  }
];

/**
 * Hash function to get a deterministic seed from lat/lng
 */
function hashCoords(lat, lng) {
  const str = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Generate realistic, location-specific factor metrics deterministically.
 */
export function getNeighborhoodMetrics(lat, lng, locationName = "") {
  const hash = hashCoords(lat, lng);
  
  // School Accessibility Metrics
  const schoolCount = 3 + (hash % 8); // 3 to 10
  const nearestSchoolDist = Number((0.4 + ((hash % 19) / 10)).toFixed(1)); // 0.4km - 2.2km
  const schoolScore = Math.min(98, Math.max(62, 70 + ((hash % 29) - 5))); // 65 - 98

  const schoolNamesList = [
    "Lincoln Magnet High School",
    "St. Mary's International Academy",
    "Oakridge Primary & Elementary",
    "Riverdale STEM Charter",
    "Cambridge Preparatory School",
    "Greenwood Community College"
  ];
  const topSchools = schoolNamesList
    .slice(0, Math.min(3, schoolCount))
    .map((name, i) => ({
      name,
      distance: Number((nearestSchoolDist + i * 0.5).toFixed(1)),
      rating: Number((4.0 + (hash + i) % 10 / 10).toFixed(1))
    }));

  // Hospital Accessibility Metrics
  const hospitalCount = 2 + ((hash + 3) % 6); // 2 to 7
  const nearestHospitalDist = Number((0.6 + (((hash + 5) % 25) / 10)).toFixed(1)); // 0.6km - 3.0km
  const hospitalScore = Math.min(96, Math.max(58, 68 + (((hash + 7) % 31) - 4))); // 64 - 95

  const hospitalNamesList = [
    "St. Jude Memorial Health Center",
    "City General Emergency & Trauma",
    "Mercy Medical Specialty Hospital",
    "Apex Children's Healthcare",
    "University Medical Research Center"
  ];
  const topHospitals = hospitalNamesList
    .slice(0, Math.min(2, hospitalCount))
    .map((name, i) => ({
      name,
      distance: Number((nearestHospitalDist + i * 0.8).toFixed(1)),
      emergency24x7: i === 0 ? "Yes" : "Yes"
    }));

  // Air Quality Metrics (Clearly Prototype Data)
  const aqiValue = 35 + ((hash + 11) % 75); // AQI 35 to 110
  let aqiCategory = "Good";
  let airQualityScore = 90;

  if (aqiValue <= 50) {
    aqiCategory = "Good";
    airQualityScore = Math.min(100, 100 - (aqiValue / 2));
  } else if (aqiValue <= 100) {
    aqiCategory = "Moderate";
    airQualityScore = Math.max(60, 90 - (aqiValue - 50) * 0.6);
  } else {
    aqiCategory = "Unhealthy for Sensitive Groups";
    airQualityScore = Math.max(40, 60 - (aqiValue - 100) * 0.5);
  }
  airQualityScore = Math.round(airQualityScore);

  // Infrastructure & Future Potential Metrics
  const infraScore = Math.min(95, Math.max(55, 65 + ((hash + 17) % 33)));
  const transitDist = Number((0.3 + ((hash % 12) / 10)).toFixed(1));
  const fiberCoverage = (hash % 2 === 0) ? "Gigabit Fiber Ready" : "High-Speed Broadband Available";
  
  const possibleProjects = [
    "Upcoming Metro Extension (1.2 km away)",
    "New Smart City Green Park (Planned 2027)",
    "Underground Electrical Cable Upgrade",
    "Road Widening & Dedicated Bike Lanes",
    "Commercial Innovation Hub Development"
  ];
  const activeProjects = [
    possibleProjects[hash % possibleProjects.length],
    possibleProjects[(hash + 2) % possibleProjects.length]
  ];

  return {
    lat: Number(lat.toFixed(4)),
    lng: Number(lng.toFixed(4)),
    locationName: locationName || `Location (${lat.toFixed(3)}, ${lng.toFixed(3)})`,
    
    schools: {
      score: schoolScore,
      count: schoolCount,
      nearestKm: nearestSchoolDist,
      topSchools
    },

    hospitals: {
      score: hospitalScore,
      count: hospitalCount,
      nearestKm: nearestHospitalDist,
      topHospitals
    },

    airQuality: {
      score: airQualityScore,
      aqi: aqiValue,
      category: aqiCategory,
      mainPollutant: (hash % 3 === 0) ? "PM2.5" : (hash % 3 === 1) ? "NO2" : "PM10",
      isPrototypeData: true // Mandatory indicator
    },

    infrastructure: {
      score: infraScore,
      transitDistKm: transitDist,
      connectivity: fiberCoverage,
      upcomingProjects: activeProjects
    },

    futureRoadmapFactors: [
      { name: "Live Traffic & Commute Times", status: "Roadmap V2" },
      { name: "Flood Risk & Topography Analysis", status: "Roadmap V2" },
      { name: "Noise & Industrial Pollution", status: "Roadmap V2" },
      { name: "Water Availability & Ground Water Index", status: "Roadmap V3" },
      { name: "Power Outage Frequency Logs", status: "Roadmap V3" },
      { name: "GenAI Real-time Municipal Planning Docs Reader", status: "Roadmap V3" }
    ]
  };
}
