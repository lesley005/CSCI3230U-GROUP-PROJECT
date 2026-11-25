import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const MOCK_NOMINATIM_PLACES = [
  {
    place_id: 999,
    display_name: "Toronto, Ontario, Canada",
    lat: "43.6534817",
    lon: "-79.3839347"
  }
];

describe("searchCityNominatim", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches matching places and caches results case-insensitively in the Map", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => MOCK_NOMINATIM_PLACES
    });
    vi.stubGlobal("fetch", mockFetch);

    const { searchCityNominatim } = await import("../src/services/nominatimService");

    const first = await searchCityNominatim("  Toronto ");
    const second = await searchCityNominatim("toronto");

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0][0]).toContain("city=%20%20Toronto%20");
    expect(first).toEqual(MOCK_NOMINATIM_PLACES);
    expect(second).toEqual(MOCK_NOMINATIM_PLACES);
  });

  it("throws an error when Nominatim responds with a non-ok status", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      statusText: "Too Many Requests"
    });
    vi.stubGlobal("fetch", mockFetch);

    const { searchCityNominatim } = await import("../src/services/nominatimService");

    await expect(searchCityNominatim("Paris")).rejects.toThrow(
      "Nominatim request failed: Too Many Requests"
    );
  });

  it("throws immediately if AbortSignal is already aborted", async () => {
    const controller = new AbortController();
    controller.abort();

    const mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);

    const { searchCityNominatim } = await import("../src/services/nominatimService");

    await expect(
      searchCityNominatim("Toronto", controller.signal)
    ).rejects.toThrow();

    expect(mockFetch).not.toHaveBeenCalled();
  });
});