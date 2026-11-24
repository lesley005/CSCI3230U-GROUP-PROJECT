import { addCityArticles } from "./cityArticleService.js";

const CITIES_URL =
  "https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/geonames-all-cities-with-a-population-1000/records";

export const CITY_PAGE_SIZE = 24;

export async function fetchCountries(signal) {
  const params = new URLSearchParams({
    // get one row per country for the dropdown
    group_by: "cou_name_en",
    order_by: "cou_name_en asc",
    limit: "500",
  });

  const response = await fetch(`${CITIES_URL}?${params}`, { signal });

  if (!response.ok) {
    throw new Error(`Could not load countries (${response.status})`);
  }

  const { results } = await response.json();
  return results.map((row) => row.cou_name_en).filter(Boolean);
}

// AI-assisted - see AI-USAGE.md #4
async function fetchCityPage({
  search = "",
  country = "all",
  sortOrder = "asc",
  offset = 0,
  signal,
} = {}) {
    const direction = sortOrder === "desc" ? "desc" : "asc";
    const params = new URLSearchParams({
        select: "geoname_id,name,cou_name_en,population,coordinates",
        // break ties by country and id so cities with the same name stay in a consistent order
        order_by: `name ${direction}, cou_name_en ${direction}, geoname_id asc`,
        offset: String(offset),
    });

    const filters = [];
    const query = search.trim();

    if (query) {
    // match the full city or country name regardless of capitalization
    const term = JSON.stringify(query.toLowerCase());
    filters.push(`(lower(name) = ${term} OR lower(cou_name_en) = ${term})`);
    }

    if (country !== "all") {
    filters.push(`cou_name_en = ${JSON.stringify(country)}`);
    }

    if (filters.length) {
    params.set("where", filters.join(" AND "));
    }

    const response = await fetch(`${CITIES_URL}?${params}`, { signal });

    if (!response.ok) {
        throw new Error(`Could not load cities (${response.status})`);
    }

    const { results, total_count } = await response.json();

    let cities = results.map((city) => ({
        id: `geonames-${city.geoname_id}`,
        name: city.name,
        country: city.cou_name_en ?? "",
        coordinates: city.coordinates,
        description: city.cou_name_en ? `A city in ${city.cou_name_en}.` : "",
    }));

    try {
        cities = await addCityArticles(cities, signal);
    } catch {
        signal?.throwIfAborted();
        // Keep the GeoNames results if photos or article facts are unavailable.
    }
    // count every row fetched including cities we skip for missing photos
    const nextOffset = offset + results.length;

    return {
        cities: cities.filter((city) => Boolean(city.image)),
        nextOffset: results.length > 0 && nextOffset < total_count
        ? nextOffset
        : null,
    };
}

// AI-assisted - see AI-USAGE.md #5
export async function fetchCities(options = {}) {
  let offset = options.offset ?? 0;

  while (true) {
    options.signal?.throwIfAborted();

    const page = await fetchCityPage({ ...options, offset });

    if (page.cities.length > 0 || page.nextOffset === null) {
      return page;
    }

    // keep looking if this batch has no cards we can display
    offset = page.nextOffset;
  }
}