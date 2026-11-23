
import type {
  OverpassResponse,
  DestinationPointOfInterest
} from "../types/api";

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://turbo.overpass.private.coffee/api/interpreter"
];

export async function fetchPointsOfInterest(
  lat: number,
  lon: number,
  radiusMeters: number = 10000,
  signal?: AbortSignal
): Promise<DestinationPointOfInterest[]> {
  const overpassQL = `[out:json][timeout:25];(node["tourism"="attraction"](around:${radiusMeters},${lat},${lon});node["amenity"="restaurant"](around:${radiusMeters},${lat},${lon}););out body 20;`;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    signal?.throwIfAborted();

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "JourneysUncharted/1.0 (student-project@university.edu)"
        },
        body: `data=${encodeURIComponent(overpassQL)}`,
        signal
      });

      if (!response.ok) {
        console.warn(`Overpass returned ${response.status}. Trying another endpoint.`);
        continue;
      }

      const data: OverpassResponse = await response.json();

      signal?.throwIfAborted();

      return data.elements
        .filter((place) => place.tags?.name || place.tags?.["name:en"])
        .map((place) => ({
          id: place.id,
          name: place.tags?.["name:en"] || place.tags?.name || "Unnamed Place",
          category: place.tags?.tourism === "attraction" ? "attraction" : "restaurant",
          lat: place.lat,
          lon: place.lon
        }));
    } catch (error) {
      if (signal?.aborted) {
        throw error;
      }

      console.warn(`Overpass endpoint failed (${endpoint}):`, error);
    }
  }

  signal?.throwIfAborted();

  console.error("All Overpass endpoints failed.");
  return [];
}
