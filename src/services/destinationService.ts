import { searchCityNominatim } from './nominatimService';
import { fetchPointsOfInterest } from './overpassService';
import { fetchCountrySafety } from './safetyService';
import { UnifiedDestination } from '../types/api';

const DEST_CACHE_PREFIX = 'ju_dest_';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CachedDestination {
  timestamp: number;
  data: UnifiedDestination;
}

function getCachedDestination(cityKey: string): UnifiedDestination | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;

  try {
    const raw = window.localStorage.getItem(`${DEST_CACHE_PREFIX}${cityKey}`);
    if (!raw) return null;

    const entry: CachedDestination = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      window.localStorage.removeItem(`${DEST_CACHE_PREFIX}${cityKey}`);
      return null;
    }

    return entry.data;
  } catch {
    return null;
  }
}

function setCachedDestination(cityKey: string, data: UnifiedDestination): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    const entry: CachedDestination = {
      timestamp: Date.now(),
      data
    };
    window.localStorage.setItem(`${DEST_CACHE_PREFIX}${cityKey}`, JSON.stringify(entry));
  } catch (err) {
    console.warn('Unable to save destination to localStorage:', err);
  }
}

export async function getCityDetails(cityName: string): Promise<UnifiedDestination | null> {
  const normalizedKey = cityName.trim().toLowerCase();

  // 1. Return immediately if cached in browser localStorage
  const cached = getCachedDestination(normalizedKey);
  if (cached) {
    return cached;
  }

  // 2. Fetch geocoding metadata
  const places = await searchCityNominatim(cityName);
  if (!places || places.length === 0) return null;

  const topMatch = places[0];
  const lat = parseFloat(topMatch.lat);
  const lon = parseFloat(topMatch.lon);
  const countryName = topMatch.address?.country || '';
  const countryCodeIso2 = topMatch.address?.country_code;

  // 3. Fetch POIs and Safety Data concurrently (exact original parameter order)
  const [pois, safetyData] = await Promise.all([
    fetchPointsOfInterest(lat, lon),
    countryName ? fetchCountrySafety(countryName, countryCodeIso2) : Promise.resolve(null)
  ]);

  // 4. Construct normalized UnifiedDestination object
  const destination: UnifiedDestination = {
    id: `${topMatch.osm_type}-${topMatch.osm_id}`,
    cityName: topMatch.address?.city || topMatch.address?.town || cityName,
    countryName: countryName,
    countryCodeIso3: safetyData?.iso3 || '',
    coordinates: { lat, lon },
    population: topMatch.extratags?.population ? parseInt(topMatch.extratags.population, 10) : undefined,
    wikiUrl: topMatch.extratags?.wikipedia
      ? `https://wikipedia.org/wiki/${topMatch.extratags.wikipedia}`
      : undefined,
    safetyScore: safetyData?.scoreDisplay,
    advisoryLevel: safetyData?.advisories?.ca?.level,
    pointsOfInterest: pois
  };

  // 5. Persist in localStorage for future sessions
  setCachedDestination(normalizedKey, destination);

  return destination;
}