// src/services/nominatimService.ts

import { NominatimPlace } from '../types/api';

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';
const cache = new Map<string, NominatimPlace[]>();

// Must have 'export' right before 'function'
export async function searchCityNominatim(cityName: string): Promise<NominatimPlace[]> {
  const query = cityName.trim().toLowerCase();
  
  if (cache.has(query)) {
    return cache.get(query)!;
  }

  const url = `${NOMINATIM_BASE_URL}?city=${encodeURIComponent(cityName)}&format=jsonv2&addressdetails=1&extratags=1`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'JourneysUncharted/1.0 (student-project@university.edu)',
        'Accept-Language': 'en' // Forces English country and city names
      }
    });

    if (!response.ok) {
      throw new Error(`Nominatim request failed: ${response.statusText}`);
    }

    const data: NominatimPlace[] = await response.json();
    cache.set(query, data);
    return data;
  } catch (error) {
    console.error('Error fetching from Nominatim:', error);
    throw error;
  }
}