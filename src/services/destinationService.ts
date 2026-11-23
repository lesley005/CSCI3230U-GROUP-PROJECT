
import { searchCityNominatim } from "./nominatimService";
import { fetchPointsOfInterest } from "./overpassService";
import { fetchCountrySafety } from "./safetyService";
import type { UnifiedDestination } from "../types/api";

export async function getCityDetails(
  cityName: string,
  signal?: AbortSignal
): Promise<UnifiedDestination | null> {
  const places = await searchCityNominatim(cityName, signal);

  if (!places || places.length === 0) {
    return null;
  }

  const topMatch = places[0];
  const lat = parseFloat(topMatch.lat);
  const lon = parseFloat(topMatch.lon);
  const countryName = topMatch.address?.country || "";
  const countryCodeIso2 = topMatch.address?.country_code;

  const [pois, safetyData] = await Promise.all([
    fetchPointsOfInterest(lat, lon, 10000, signal),
    countryName
      ? fetchCountrySafety(countryName, countryCodeIso2, signal)
      : Promise.resolve(null)
  ]);

  signal?.throwIfAborted();

  return {
    id: `${topMatch.osm_type}-${topMatch.osm_id}`,
    cityName: topMatch.address?.city || topMatch.address?.town || cityName,
    countryName: countryName,
    countryCodeIso3: safetyData?.iso3 || "",
    coordinates: { lat, lon },
    population: topMatch.extratags?.population
      ? parseInt(topMatch.extratags.population, 10)
      : undefined,
    wikiUrl: topMatch.extratags?.wikipedia
      ? `https://wikipedia.org/wiki/${topMatch.extratags.wikipedia}`
      : undefined,
    safetyScore: safetyData?.scoreDisplay,
    advisoryLevel: safetyData?.advisories?.ca?.level,
    pointsOfInterest: pois
  };
}
