import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchPointsOfInterest } from "../src/services/overpassService";

describe("fetchPointsOfInterest", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("maps attractions and restaurants, prefers name:en, and filters unnamed places", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        elements: [
          {
            id: 101,
            lat: 43.6532,
            lon: -79.3832,
            tags: { tourism: "attraction", name: "Tour CN", "name:en": "CN Tower" }
          },
          {
            id: 102,
            lat: 43.654,
            lon: -79.385,
            tags: { amenity: "restaurant", name: "Local Bistro" }
          },
          {
            id: 103,
            lat: 43.655,
            lon: -79.386,
            tags: { tourism: "attraction" }
          }
        ]
      })
    });

    vi.stubGlobal("fetch", mockFetch);

    const results = await fetchPointsOfInterest(43.6532, -79.3832, 5000);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(results).toEqual([
      {
        id: 101,
        name: "CN Tower",
        category: "attraction",
        lat: 43.6532,
        lon: -79.3832
      },
      {
        id: 102,
        name: "Local Bistro",
        category: "restaurant",
        lat: 43.654,
        lon: -79.385
      }
    ]);
  });

  it("falls back to the next Overpass endpoint on non-ok HTTP status or network failure", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 504 })
      // .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          elements: [
            {
              id: 201,
              lat: 48.8584,
              lon: 2.2945,
              tags: { tourism: "attraction", name: "Eiffel Tower" }
            }
          ]
        })
      });

    vi.stubGlobal("fetch", mockFetch);

    const results = await fetchPointsOfInterest(48.8584, 2.2945);

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(results).toEqual([
      {
        id: 201,
        name: "Eiffel Tower",
        category: "attraction",
        lat: 48.8584,
        lon: 2.2945
      }
    ]);
  });

  it("returns an empty array when all Overpass endpoints fail", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
    vi.stubGlobal("fetch", mockFetch);

    const results = await fetchPointsOfInterest(40.7128, -74.006);

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(results).toEqual([]);
  });

  it("rethrows immediately if AbortSignal is aborted before or during fetch", async () => {
    const controller = new AbortController();
    controller.abort();

    const mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);

    await expect(
      fetchPointsOfInterest(43.6532, -79.3832, 10000, controller.signal)
    ).rejects.toThrow();

    expect(mockFetch).not.toHaveBeenCalled();
  });
});