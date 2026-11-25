
import { fetchPointsOfInterest } from "./overpassService.ts";

const CITIES_URL =
  "https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/geonames-all-cities-with-a-population-1000/records";

// Use these Paris recommendations if Overpass is unavailable.
const PARIS_FALLBACK = {
  activities: [
    { id: "paris-eiffel", name: "Eiffel Tower" },
    { id: "paris-louvre", name: "Louvre Museum" },
    { id: "paris-notre-dame", name: "Notre-Dame Cathedral" }
  ],
  restaurants: [
    {
      id: "paris-le-train-bleu",
      name: "Le Train Bleu",
      cuisine: null,
      rating: null
    },
    {
      id: "paris-bouillon-chartier",
      name: "Bouillon Chartier",
      cuisine: null,
      rating: null
    }
  ]
};

function getFallbackPlaces(id) {
  if (id === "geonames-2988507") {
    return {
      activities: [...PARIS_FALLBACK.activities],
      restaurants: [...PARIS_FALLBACK.restaurants]
    };
  }

  return {
    activities: [],
    restaurants: []
  };
}

export async function getGeoNamesDestination(id, signal) {
  const match = /^geonames-(\d+)$/.exec(id);

  if (!match) return null;

  signal?.throwIfAborted();

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

  const fallback = getFallbackPlaces(id);

  return {
    id,
    name: city.name,
    country: city.cou_name_en || "",
    description: city.cou_name_en
      ? `${city.name} is a city in ${city.cou_name_en}.`
      : `Explore ${city.name}.`,
    coordinates: city.coordinates,
    activities: fallback.activities,
    restaurants: fallback.restaurants
  };
}

export async function getGeoNamesPlaces(city, signal) {
  const lat = city.coordinates?.lat;
  const lon = city.coordinates?.lon;

  const fallback = getFallbackPlaces(city.id);

  if (lat == null || lon == null) {
    return fallback;
  }

  signal?.throwIfAborted();

  const controller = new AbortController();

  const abortRequest = () => controller.abort();

  signal?.addEventListener("abort", abortRequest, {
    once: true
  });

  const timeout = setTimeout(() => {
    controller.abort();
  }, 65000);

  try {
    const places = await fetchPointsOfInterest(
      Number(lat),
      Number(lon),
      2000,
      controller.signal
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

    return {
      activities:
        activities.length > 0
          ? activities
          : fallback.activities,
      restaurants:
        restaurants.length > 0
          ? restaurants
          : fallback.restaurants
    };
  } catch (error) {
    if (signal?.aborted) {
      throw error;
    }

    console.warn(
      "Overpass unavailable. Using fallback places:",
      error
    );

    return fallback;
  } finally {
    clearTimeout(timeout);

    signal?.removeEventListener(
      "abort",
      abortRequest
    );
  }
}
