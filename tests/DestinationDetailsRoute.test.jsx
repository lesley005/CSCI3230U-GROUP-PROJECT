
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import DestinationDetailsRoute from "../src/components/DestinationDetailsRoute.jsx";
import { getCityDetails } from "../src/services/destinationService.ts";

vi.mock("../services/destinationService.ts", () => ({
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
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe("DestinationDetailsRoute", () => {
  it("shows a loading message while fetching data", () => {
    getCityDetails.mockImplementation(
      () => new Promise(() => {})
    );

    renderDestination("banff");

    expect(
      screen.getByText("Loading places in Banff...")
    ).toBeTruthy();
  });

  it("displays activities and restaurants from the API", async () => {
    getCityDetails.mockResolvedValue({
      pointsOfInterest: [
        {
          id: 1,
          name: "Banff Gondola",
          category: "attraction"
        },
        {
          id: 2,
          name: "Banff Restaurant",
          category: "restaurant"
        }
      ]
    });

    renderDestination("banff");

    expect(
      await screen.findByText("Banff Gondola")
    ).toBeTruthy();

    expect(
      screen.getByText("Banff Restaurant")
    ).toBeTruthy();

    expect(getCityDetails).toHaveBeenCalledWith(
      "Banff",
      expect.any(AbortSignal)
    );
  });

  it("shows an error when the API request fails", async () => {
    getCityDetails.mockRejectedValue(
      new Error("Network error")
    );

    renderDestination("banff");

    expect(
      await screen.findByText(
        "Could not load live destination information."
      )
    ).toBeTruthy();

    expect(
      screen.getByText("Showing saved information instead.")
    ).toBeTruthy();

    expect(screen.getByText("About Banff")).toBeTruthy();
  });

  it("shows a 404 page for an unknown destination", () => {
    renderDestination("unknown");

    expect(screen.getByText("Error 404")).toBeTruthy();
    expect(screen.getByText("Unknown destination")).toBeTruthy();

    expect(getCityDetails).not.toHaveBeenCalled();
  });

  it("cancels the request when leaving the page", () => {
    getCityDetails.mockImplementation(
      () => new Promise(() => {})
    );

    const { unmount } = renderDestination("edmonton");

    const signal = getCityDetails.mock.calls[0][1];

    expect(signal.aborted).toBe(false);

    unmount();

    expect(signal.aborted).toBe(true);
  });
});
