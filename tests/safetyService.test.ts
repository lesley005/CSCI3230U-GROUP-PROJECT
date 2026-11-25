import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const MOCK_SAFETY_RESPONSE = {
  countries: [
    {
      name: { en: "Canada" },
      iso3: "CAN",
      scoreDisplay: "4.5"
    },
    {
      name: { en: "Japan" },
      iso3: "JPN",
      scoreDisplay: "4.8"
    }
  ]
};

describe("fetchCountrySafety", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("matches by English country name and caches the map-data response in memory", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => MOCK_SAFETY_RESPONSE
    });
    vi.stubGlobal("fetch", mockFetch);

    const { fetchCountrySafety } = await import("../src/services/safetyService");

    const first = await fetchCountrySafety("  canada ");
    const second = await fetchCountrySafety("Japan");

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(first).toEqual(MOCK_SAFETY_RESPONSE.countries[0]);
    expect(second).toEqual(MOCK_SAFETY_RESPONSE.countries[1]);
  });

  it("matches using ISO2 country code via Intl.DisplayNames", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => MOCK_SAFETY_RESPONSE
    });
    vi.stubGlobal("fetch", mockFetch);

    const { fetchCountrySafety } = await import("../src/services/safetyService");

    const result = await fetchCountrySafety("Nippon", "jp");

    expect(result).toEqual(MOCK_SAFETY_RESPONSE.countries[1]);
  });

  it("matches using ISO3 country code", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => MOCK_SAFETY_RESPONSE
    });
    vi.stubGlobal("fetch", mockFetch);

    const { fetchCountrySafety } = await import("../src/services/safetyService");

    const result = await fetchCountrySafety("CAN");

    expect(result).toEqual(MOCK_SAFETY_RESPONSE.countries[0]);
  });

  it("returns null when country is not found or when fetch fails", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => MOCK_SAFETY_RESPONSE
      });
    vi.stubGlobal("fetch", mockFetch);

    const { fetchCountrySafety } = await import("../src/services/safetyService");
    expect(await fetchCountrySafety("Atlantis")).toBeNull();

    vi.resetModules();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 })
    );
    const { fetchCountrySafety: freshFetch } = await import("../src/services/safetyService");
    expect(await freshFetch("Canada")).toBeNull();
  });

  it("rethrows immediately if AbortSignal is aborted", async () => {
    const controller = new AbortController();
    controller.abort();

    const { fetchCountrySafety } = await import("../src/services/safetyService");

    await expect(
      fetchCountrySafety("Canada", "CA", controller.signal)
    ).rejects.toThrow();
  });
});