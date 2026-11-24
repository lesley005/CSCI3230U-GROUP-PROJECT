import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, expect, test, vi } from "vitest";
import HomePage from "../src/components/HomePage.jsx";
import { fetchCities, fetchCountries } from "../src/services/cityCatalogService.js";

// use predictable catalog responses so the tests can run without the live api
vi.mock("../src/services/cityCatalogService.js", () => ({
  fetchCities: vi.fn(),
  fetchCountries: vi.fn(),
}));

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.resetAllMocks();
});

const paris = { id: "geonames-2988507", name: "Paris", country: "France" };
const rouen = { id: "geonames-2982652", name: "Rouen", country: "France" };

// AI-assisted - see AI-USAGE.md #6
test("sends the selected country, sort order, and search to the catalog", async () => {
  fetchCountries.mockResolvedValue(["France"]);
  fetchCities.mockResolvedValue({ cities: [paris], nextOffset: null });

  render(<MemoryRouter><HomePage /></MemoryRouter>);

  await screen.findByRole("option", { name: "France" });

  fireEvent.change(screen.getByLabelText("Country"), {
    target: { value: "France" },
  });
  fireEvent.change(screen.getByLabelText("Sort destinations"), {
    target: { value: "desc" },
  });
  fireEvent.change(screen.getByRole("searchbox"), {
    target: { value: "Paris" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Search" }));

  await waitFor(() => {
    expect(fetchCities).toHaveBeenLastCalledWith(
      expect.objectContaining({
        search: "Paris",
        country: "France",
        sortOrder: "desc",
        offset: 0,
      })
    );
  });
});

test("Load more appends the next page and keeps the existing cards", async () => {
  fetchCountries.mockResolvedValue(["France"]);
  fetchCities.mockImplementation(async ({ offset }) =>
    offset === 0
      ? { cities: [paris], nextOffset: 24 }
      : { cities: [rouen], nextOffset: null }
  );

  render(<MemoryRouter><HomePage /></MemoryRouter>);

  fireEvent.click(await screen.findByRole("button", { name: "Load more" }));
  await screen.findByRole("heading", { name: "Rouen, France" });

  expect(fetchCities).toHaveBeenLastCalledWith(
    expect.objectContaining({ offset: 24 })
  );
  
  expect(
    screen.getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent)
  ).toEqual(["Paris, France", "Rouen, France"]);
});

test("shows loading and then an empty state when no cities match", async () => {
  fetchCountries.mockResolvedValue([]);

  // hold the response open long enough to check the loading message
  let finishRequest;
  fetchCities.mockReturnValue(
    new Promise((resolve) => {
      finishRequest = resolve;
    })
  );

  render(<MemoryRouter><HomePage /></MemoryRouter>);

  expect(screen.getByText("Loading cities…")).toBeTruthy();

  finishRequest({ cities: [], nextOffset: null });

  expect(
    await screen.findByText(/No destinations/i)
  ).toBeTruthy();
});

test("shows an error and lets the user search again", async () => {
  fetchCountries.mockResolvedValue(["France"]);
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

  try {
    fetchCities
      .mockRejectedValueOnce(new Error("503 Service Unavailable"))
      .mockResolvedValueOnce({ cities: [paris], nextOffset: null });

    render(<MemoryRouter><HomePage /></MemoryRouter>);

    expect(await screen.findByText(/Could not load cities/i)).toBeTruthy();

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "Paris" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));

    expect(await screen.findByRole("heading", { name: "Paris, France" })).toBeTruthy();
  } finally {
    consoleError.mockRestore();
  }
});

test("aborts the previous city request when a new search starts", async () => {
  fetchCountries.mockResolvedValue(["France"]);
  fetchCities
    .mockReturnValueOnce(new Promise(() => {}))
    .mockResolvedValueOnce({ cities: [paris], nextOffset: null });

  render(<MemoryRouter><HomePage /></MemoryRouter>);

  await waitFor(() => expect(fetchCities).toHaveBeenCalledTimes(1));
  // keep the first request signal so we can check that the next search cancels it
  const initialSignal = fetchCities.mock.calls[0][0].signal;

  fireEvent.change(screen.getByRole("searchbox"), {
    target: { value: "Paris" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Search" }));

  expect(await screen.findByRole("heading", { name: "Paris, France" })).toBeTruthy();
  expect(initialSignal.aborted).toBe(true);
});