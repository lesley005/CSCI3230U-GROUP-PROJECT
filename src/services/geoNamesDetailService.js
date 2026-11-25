import { fetchPointsOfInterest } from "./overpassService.ts";

const CITIES_URL =
  "https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/geonames-all-cities-with-a-population-1000/records";

const GEO_CACHE_PREFIX = "ju_geo_";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function getCachedGeoDestination(id) {
  if (typeof window === "undefined" || !window.localStorage) return null;

  try {
    const raw = window.localStorage.getItem(`${GEO_CACHE_PREFIX}${id}`);
    if (!raw) return null;

    const entry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      window.localStorage.removeItem(`${GEO_CACHE_PREFIX}${id}`);
      return null;
    }

    return entry.data;
  } catch {
    return null;
  }
}

function setCachedGeoDestination(id, data) {
  if (typeof window === "undefined" || !window.localStorage) return;

  try {
    window.localStorage.setItem(
      `${GEO_CACHE_PREFIX}${id}`,
      JSON.stringify({ timestamp: Date.now(), data })
    );
  } catch {
    // Ignore storage quota errors
  }
}

export async function getGeoNamesDestination(id, signal) {
  const match = /^geonames-(\d+)$/.exec(id);

  if (!match) return null;

  signal?.throwIfAborted();

  const cached = getCachedGeoDestination(id);
  if (cached) return cached;

  const params = new URLSearchParams({
    select: "geoname_id,name,cou_name_en,coordinates",
    where: `geoname_id = ${match[1]}`,
    limit: "1"
  });

  const response = await fetch(`${CITIES_URL}?${params}`, {
    signal
  });

  if (!response.ok) {
    throw new Error(`Could not load city (${response.status})`);
  }

  const data = await response.json();
  signal?.throwIfAborted();

  const city = data.results?.find(
    (place) => String(place.geoname_id) === match[1]
  );

  if (!city) return null;

  const lat = city.coordinates?.lat;
  const lon = city.coordinates?.lon;

  if (lat == null || lon == null) {
    throw new Error("City coordinates are missing");
  }

  const places = await fetchPointsOfInterest(
    Number(lat),
    Number(lon),
    10000,
    signal
  );

  signal?.throwIfAborted();

  const activities = places
    .filter((place) => place.category === "attraction")
    .map((place) => ({
      id: place.id,
      name: place.name
    }));

  const restaurants = places
    .filter((place) => place.category === "restaurant")
    .map((place) => ({
      id: place.id,
      name: place.name,
      cuisine: null,
      rating: null
    }));

  const result = {
    id,
    name: city.name,
    country: city.cou_name_en || "",
    description: city.cou_name_en
      ? `${city.name} is a city in ${city.cou_name_en}.`
      : `Explore ${city.name}.`,
    activities,
    restaurants
  };

  setCachedGeoDestination(id, result);
  return result;
}