// --- Nominatim API Types ---
export interface NominatimPlace {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    country?: string;
    country_code?: string;
    [key: string]: string | undefined;
  };
  extratags?: {
    population?: string;
    wikipedia?: string;
    wikidata?: string;
    [key: string]: string | undefined;
  };
}

// --- Overpass API Types ---
export interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  tags?: {
    name?: string;
    'name:en'?: string;
    tourism?: string;
    amenity?: string;
    description?: string;
    website?: string;
    [key: string]: string | undefined;
  };
}

export interface OverpassResponse {
  version: number;
  generator: string;
  elements: OverpassElement[];
}

// --- IsItSafeToTravel Types ---
export interface SafetyPillar {
  name: 'conflict' | 'crime' | 'health' | 'governance' | 'environment';
  score: number;
}

export interface SafetyCountry {
  iso3: string;
  name: { en: string };
  scoreDisplay: number;
  pillars: SafetyPillar[];
  advisories?: {
    ca?: { level: number };
    [key: string]: { level: number } | undefined;
  };
}

export interface SafetyMapData {
  countries: SafetyCountry[];
}

// --- Unified App Destination Model ---
export interface DestinationPointOfInterest {
  id: number;
  name: string;
  category: 'attraction' | 'restaurant' | 'amenity';
  lat?: number;
  lon?: number;
}

export interface UnifiedDestination {
  id: string; // e.g., "PRT-Rome"
  cityName: string;
  countryName: string;
  countryCodeIso3: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  population?: number;
  wikiUrl?: string;
  safetyScore?: number;
  advisoryLevel?: number;
  pointsOfInterest: DestinationPointOfInterest[];
}