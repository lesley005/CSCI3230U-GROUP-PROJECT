import { SafetyMapData, SafetyCountry } from '../types/api';

const SAFETY_DATA_URL = 'https://isitsafetotravel.org/map-data.json';
let cachedSafetyData: SafetyMapData | null = null;

// Native engine utility for converting ISO2 codes ('ca') to English names ('Canada')
const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

export async function fetchCountrySafety(
  countryName: string,
  countryCodeIso2?: string
): Promise<SafetyCountry | null> {
  try {
    if (!cachedSafetyData) {
      const response = await fetch(SAFETY_DATA_URL);
      if (!response.ok) throw new Error(`Safety API returned ${response.status}`);
      cachedSafetyData = await response.json();
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