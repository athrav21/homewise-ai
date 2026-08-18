/**
 * Geocoding Service utilizing OpenStreetMap Nominatim API
 * with error handling and fallback strings.
 */

// Reverse Geocoding: Lat/Lng -> Address Name
export async function fetchAddressFromCoords(lat, lng) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'en',
        'User-Agent': 'HomeWiseAI-Prototype/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Reverse geocoding HTTP error: ${response.status}`);
    }

    const data = await response.json();
    if (data && data.display_name) {
      return data.display_name;
    }
    return `Selected Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  } catch (error) {
    console.warn("Nominatim reverse geocode lookup error (using fallback):", error);
    return `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  }
}

// Forward Geocoding: Search query -> Suggestions List [{ name, lat, lng }]
export async function searchLocations(query) {
  if (!query || query.trim().length < 2) return [];

  try {
    const encoded = encodeURIComponent(query.trim());
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encoded}&limit=5`;
    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'en',
        'User-Agent': 'HomeWiseAI-Prototype/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Search HTTP error: ${response.status}`);
    }

    const data = await response.json();
    return data.map((item) => ({
      name: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    }));
  } catch (error) {
    console.warn("Nominatim forward geocode search error:", error);
    return [];
  }
}
