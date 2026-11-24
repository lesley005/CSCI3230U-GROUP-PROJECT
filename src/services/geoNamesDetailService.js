
import { fetchPointsOfInterest } from "./overpassService.ts";

const CITIES_URL =
  "https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/geonames-all-cities-with-a-population-1000/records";

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

  return {
    id,
    name: city.name,
    country: city.cou_name_en || "",
    description: city.cou_name_en
      ? `${city.name} is a city in ${city.cou_name_en}.`
      : `Explore ${city.name}.`,
    activities,
    restaurants
  };
}
