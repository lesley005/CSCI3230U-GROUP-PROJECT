
import type {
  OverpassResponse,
  DestinationPointOfInterest
} from "../types/api";

const OVERPASS_ENDPOINTS = [
  "https://overpass.private.coffee/api/interpreter",
  "https://overpass-api.de/api/interpreter"
];

export async function fetchPointsOfInterest(
  lat: number,
  lon: number,
  radiusMeters: number = 10000,
  signal?: AbortSignal
): Promise<DestinationPointOfInterest[]> {
  const overpassQL =
    `[out:json][timeout:10];` +
    `(node["tourism"="attraction"](around:${radiusMeters},${lat},${lon});` +
    `node["amenity"="restaurant"](around:${radiusMeters},${lat},${lon}););` +
    `out body 20;`;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    signal?.throwIfAborted();

    const controller = new AbortController();

    const cancelRequest = () => controller.abort();

    signal?.addEventListener("abort", cancelRequest, {
      once: true
    });

    const timeout = setTimeout(() => {
      controller.abort();
    }, 6500);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `data=${encodeURIComponent(overpassQL)}`,
        signal: controller.signal
      });

      if (!response.ok) {
        console.warn(
          `Overpass returned ${response.status}. Trying another endpoint.`
        );
        continue;
      }

      const data: OverpassResponse = await response.json();

      signal?.throwIfAborted();

      return data.elements
        .filter(
          (place) =>
            place.tags?.name || place.tags?.["name:en"]
        )
        .map((place) => ({
          id: place.id,
          name:
            place.tags?.["name:en"] ||
            place.tags?.name ||
            "Unnamed Place",
          category:
            place.tags?.tourism === "attraction"
              ? "attraction"
              : "restaurant",
          lat: place.lat,
          lon: place.lon
        }));
    } catch (error) {
      if (signal?.aborted) {
        throw error;
      }

      console.warn(
        `Overpass endpoint failed (${endpoint}):`,
        error
      );
    } finally {
      clearTimeout(timeout);
      signal?.removeEventListener(
        "abort",
        cancelRequest
      );
    }
  }

  signal?.throwIfAborted();

  console.error("All Overpass endpoints failed.");
  return [];
}
