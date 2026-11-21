import { SafetyMapData, SafetyCountry } from '../types/api';

const SAFETY_DATA_URL = 'https://isitsafetotravel.org/map-data.json';
const SAFETY_STORAGE_KEY = 'ju_safety_map_data';
const SAFETY_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

let cachedSafetyData: SafetyMapData | null = null;

// Native engine utility for converting ISO2 codes ('ca') to English names ('Canada')
const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

function loadSafetyFromStorage(): SafetyMapData | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;

  try {
    const raw = window.localStorage.getItem(SAFETY_STORAGE_KEY);
    if (!raw) return null;

    const parsed: { timestamp: number; data: SafetyMapData } = JSON.parse(raw);
    if (Date.now() - parsed.timestamp > SAFETY_TTL_MS) {
      window.localStorage.removeItem(SAFETY_STORAGE_KEY);
      return null;
    }

    return parsed.data;
  } catch {
    return null;
  }
}

function saveSafetyToStorage(data: SafetyMapData): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    window.localStorage.setItem(
      SAFETY_STORAGE_KEY,
      JSON.stringify({ timestamp: Date.now(), data })
    );
  } catch (err) {
    console.warn('Unable to save safety map data to localStorage:', err);
  }
}

export async function fetchCountrySafety(
  countryName: string,
  countryCodeIso2?: string
): Promise<SafetyCountry | null> {
  try {
    // 1. Check in-memory cache first
    if (!cachedSafetyData) {
      // 2. Check browser localStorage second
      cachedSafetyData = loadSafetyFromStorage();
    }

    // 3. Fetch from live API if neither cache has it
    if (!cachedSafetyData) {
      const response = await fetch(SAFETY_DATA_URL);
      if (!response.ok) throw new Error(`Safety API returned ${response.status}`);
      cachedSafetyData = await response.json();
      if (cachedSafetyData) {
        saveSafetyToStorage(cachedSafetyData);
      }
    }

    const searchKey = countryName.toLowerCase().trim();
    const iso2Key = countryCodeIso2?.toLowerCase().trim();

    // Convert ISO2 ('ca') to standardized English ('Canada')
    let convertedEnglishName = '';
    if (iso2Key) {
      try {
        convertedEnglishName = regionNames.of(iso2Key.toUpperCase())?.toLowerCase() || '';
      } catch {
        // Fall back gracefully if an invalid code is passed
      }
    }

    const country = cachedSafetyData?.countries.find((c) => {
      const countryEn = c.name.en.toLowerCase();

      // 1. Match converted ISO2 English name (e.g., 'ca' -> 'canada' === 'canada')
      if (convertedEnglishName && countryEn === convertedEnglishName) return true;

      // 2. Match raw English name from Nominatim
      if (countryEn === searchKey) return true;

      // 3. Match direct 3-letter ISO code
      if (c.iso3.toLowerCase() === searchKey) return true;

      return false;
    });

    return country || null;
  } catch (error) {
    console.error('Error fetching safety data:', error);
    return null;
  }
}