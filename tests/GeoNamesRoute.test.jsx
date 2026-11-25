
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import DestinationDetailsRoute from "../src/components/DestinationDetailsRoute.jsx";
import { getGeoNamesDestination, getGeoNamesPlaces } from "../src/services/geoNamesDetailService.js";

vi.mock("../src/services/geoNamesDetailService.js", () => ({
  getGeoNamesDestination: vi.fn(),
  getGeoNamesPlaces: vi.fn()
}));

vi.mock("../src/services/destinationService.ts", () => ({
  getCityDetails: vi.fn()
}));

function renderDestination(id) {
  return render(
    <MemoryRouter initialEntries={[`/destinations/${id}`]}>
      <Routes>
        <Route
          path="/destinations/:id"
          element={<DestinationDetailsRoute />}
        />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.resetAllMocks();
  getGeoNamesPlaces.mockResolvedValue({
    activities: [],
    restaurants: []
  });
});

afterEach(() => {
  cleanup();
});

describe("GeoNames destination routes", () => {
  it("loads a city using its GeoNames ID", async () => {
    getGeoNamesDestination.mockResolvedValue({
      id: "geonames-2988507",
      name: "Paris",
      country: "France",
      description: "Paris is a city in France.",
      activities: [
        { id: 1, name: "Sample Attraction" }
      ],
      restaurants: []
    });

    getGeoNamesPlaces.mockResolvedValue({
      activities: [
        { id: 1, name: "Sample Attraction" }
      ],
      restaurants: []
    });

    renderDestination("geonames-2988507");

    expect(await screen.findByText("About Paris")).toBeTruthy();
    expect(await screen.findByText("Sample Attraction")).toBeTruthy();

    expect(getGeoNamesDestination).toHaveBeenCalledWith(
      "geonames-2988507",
      expect.any(AbortSignal)
    );
  });

  it("shows Paris before nearby places finish loading", async () => {
    getGeoNamesDestination.mockResolvedValue({
      id: "geonames-2988507",
      name: "Paris",
      country: "France",
      description: "Paris is a city in France.",
      coordinates: { lat: 48.85, lon: 2.35 },
      activities: [],
      restaurants: []
    });

    getGeoNamesPlaces.mockImplementation(
      () => new Promise(() => {})
    );

    renderDestination("geonames-2988507");

    expect(await screen.findByText("About Paris")).toBeTruthy();
    expect(
      screen.getByText("Loading nearby attractions and restaurants...")
    ).toBeTruthy();
  });

  it("shows a 404 when a GeoNames city is not found", async () => {
    getGeoNamesDestination.mockResolvedValue(null);

    renderDestination("geonames-999999999");

    expect(await screen.findByText("Error 404")).toBeTruthy();
  });

  it("cancels the GeoNames request when leaving the page", () => {
    getGeoNamesDestination.mockImplementation(
      () => new Promise(() => {})
    );

    const { unmount } = renderDestination("geonames-2988507");
    const signal = getGeoNamesDestination.mock.calls[0][1];

    expect(signal.aborted).toBe(false);

    unmount();

    expect(signal.aborted).toBe(true);
  });
});
