
import type { SafetyMapData, SafetyCountry } from "../types/api";

const SAFETY_DATA_URL = "https://isitsafetotravel.org/map-data.json";
let cachedSafetyData: SafetyMapData | null = null;

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

export async function fetchCountrySafety(
  countryName: string,
  countryCodeIso2?: string,
  signal?: AbortSignal
): Promise<SafetyCountry | null> {
  signal?.throwIfAborted();

  try {
    if (!cachedSafetyData) {
      const response = await fetch(SAFETY_DATA_URL, { signal });

      if (!response.ok) {
        throw new Error(`Safety API returned ${response.status}`);
      }

      const data: SafetyMapData = await response.json();

      signal?.throwIfAborted();
      cachedSafetyData = data;
    }

    const searchKey = countryName.toLowerCase().trim();
    const iso2Key = countryCodeIso2?.toLowerCase().trim();

    let convertedEnglishName = "";

    if (iso2Key) {
      try {
        convertedEnglishName =
          regionNames.of(iso2Key.toUpperCase())?.toLowerCase() || "";
      } catch {
        convertedEnglishName = "";
      }
    }

    const country = cachedSafetyData?.countries.find((item) => {
      const countryEn = item.name.en.toLowerCase();

      if (convertedEnglishName && countryEn === convertedEnglishName) {
        return true;
      }

      if (countryEn === searchKey) {
        return true;
      }

      if (item.iso3.toLowerCase() === searchKey) {
        return true;
      }

      return false;
    });

    return country || null;
  } catch (error) {
    if (signal?.aborted) {
      throw error;
    }

    console.error("Error fetching safety data:", error);
    return null;
  }
}
