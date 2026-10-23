import { OverpassResponse, DestinationPointOfInterest } from '../types/api';

// Pool of public Overpass endpoints for automatic fallback
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://turbo.overpass.private.coffee/api/interpreter'
];

export async function fetchPointsOfInterest(
  lat: number,
  lon: number,
  radiusMeters: number = 10000
): Promise<DestinationPointOfInterest[]> {
  const overpassQL = `[out:json][timeout:25];(node["tourism"="attraction"](around:${radiusMeters},${lat},${lon});node["amenity"="restaurant"](around:${radiusMeters},${lat},${lon}););out body 20;`;

  // Try each endpoint sequentially if one returns 502/503/504 or fails
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'JourneysUncharted/1.0 (student-project@university.edu)'
        },
        body: `data=${encodeURIComponent(overpassQL)}`
      });

      if (!response.ok) {
        console.warn(`Overpass instance (${endpoint}) responded with ${response.status}. Trying next fallback...`);
        continue; // Try next URL in loop
      }

      const data: OverpassResponse = await response.json();

      return data.elements
        .filter(el => el.tags?.name || el.tags?.['name:en'])
        .map(el => ({
          id: el.id,
          name: el.tags?.['name:en'] || el.tags?.name || 'Unnamed Place',
          category: el.tags?.tourism === 'attraction' ? 'attraction' : 'restaurant',
          lat: el.lat,
          lon: el.lon
        }));
    } catch (error) {
      console.warn(`Failed to connect to Overpass endpoint (${endpoint}):`, error);
    }
  }

  // Graceful fallback if all public endpoints fail or time out
  console.error('All Overpass API endpoints failed. Returning empty POI list as fallback.');
  return [];
}