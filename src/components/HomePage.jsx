import { useSavedDestinations } from "../hooks/useSavedDestinations.js";
import { useEffect, useState } from "react";
import { destinations } from "../data/destinations.js";
import { destinations as featuredDestinations } from "../data/destinations.js";
import { fetchCities, fetchCountries } from "../services/cityCatalogService.js";
import HomeDestinationCard from "./HomeDestinationCard.jsx";
import "./HomePage.css";

function HomePage() {
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("all");
  const [sortOrder, setSortOrder] = useState("asc");
  // AI-assisted - see AI-USAGE.md #4
  const {saved, isSaved, toggleSaved } = useSavedDestinations();
  const [expandedIds, setExpandedIds] = useState([]);

  const [destinations, setDestinations] = useState(featuredDestinations);
  const [cityStatus, setCityStatus] = useState("loading");
  // keep the submitted search separate so typing does not fetch cities on every keystroke
  const [request, setRequest] = useState({
    search: "",
    country: "all",
    sortOrder: "asc",
    offset: 0,
  });
  const [nextOffset, setNextOffset] = useState(null);

  // AI-assisted - see AI-USAGE.md #4 and #5
  useEffect(() => {
    const controller = new AbortController();

    async function loadCities() {
      try {
        const page = await fetchCities({
          search: request.search,
          country: request.country,
          offset: request.offset,
          signal: controller.signal,
          sortOrder: request.sortOrder,
        });

        // ignore this response if the user has already started another search
        if (controller.signal.aborted) return;

        setDestinations((current) => {
          	// a new search replaces the cards and load more keeps the cards already on screen
          const combined = request.offset === 0
            ? page.cities
            : [...current, ...page.cities];
          // use the city id to keep duplicate cards out of the results
          return [...new Map(combined.map((city) => [city.id, city])).values()];
        });
        setNextOffset(page.nextOffset);
        setCityStatus("ready");
      } catch (error) {
        if (controller.signal.aborted) return;

        console.error("Could not load destinations:", error);
        setCityStatus("error");
      }
    }

    loadCities();
    // cancel the old request when the search filters or page changes
    return () => controller.abort();
  }, [request]);

  const [countries, setCountries] = useState([]);

  // AI-assisted - see AI-USAGE.md #5
  useEffect(() => {
    const controller = new AbortController();

    fetchCountries(controller.signal)
      .then(setCountries)
      .catch((error) => {
        if (!controller.signal.aborted) console.error(error);
      });

    return () => controller.abort();
  }, []);

  const visibleDestinations = destinations;

  function toggleDetails(id) {
    setExpandedIds((current) =>
      current.includes(id)
        ? current.filter((openId) => openId !== id)
        : [...current, id]
    );
  }

  // start at the first page whenever the search or filters change
  function startCitySearch(query, selectedCountry, direction = sortOrder) {
    setExpandedIds([]);
    setDestinations([]);
    setNextOffset(null);
    setCityStatus("loading");
    setRequest({
      search: query.trim(),
      country: selectedCountry,
      sortOrder: direction,
      offset: 0,
    });
  }

  function handleSortChange(event) {
    const direction = event.target.value;
    setSortOrder(direction);
    startCitySearch(request.search, country, direction);
  }

  function handleSearch(event) {
    event.preventDefault();
    startCitySearch(search, country);
  }

  // AI-assisted - see AI-USAGE.md #5
  function handleSearchChange(event) {
    const value = event.target.value;
    setSearch(value);

    // clearing a submitted search brings back the list for all countries
    if (!value.trim() && request.search) {
      setCountry("all");
      startCitySearch("", "all");
    }
  }

  function handleCountryChange(event) {
    const selectedCountry = event.target.value;
    setCountry(selectedCountry);
    startCitySearch(request.search, selectedCountry);
  }

  function handleLoadMore() {
    if (nextOffset === null || cityStatus === "loading") return;

    setCityStatus("loading");
    // keep the current search and filters when requesting the next page
    setRequest((current) => ({ ...current, offset: nextOffset }));
  }

  return (
    <main className="home-main">
      <section className="home-intro" aria-labelledby="home-title">
        <h1 id="home-title">Find your next destination!</h1>
        <p>
          Explore new places, discover things to do, and start planning your
          next adventure.
        </p>

        <form className="home-search" onSubmit={handleSearch}>
          <div className="home-field">
            <label htmlFor="searchbar">Search destinations</label>
            <input
              id="searchbar"
              type="search"
              placeholder="Enter a city or country"
              value={search}
              onChange={handleSearchChange}
            />
          </div>
          <button className="home-button" type="submit">
            Search
          </button>
        </form>

        <div className="home-filters">
          <div className="home-field">
            <label htmlFor="home-country">Country</label>
            <select
              id="home-country"
              value={country}
              onChange={handleCountryChange}
            >
              <option value="all">All countries</option>
              {countries.map((countryName) => (
                <option key={countryName} value={countryName}>
                  {countryName}
                </option>
              ))}
            </select>
          </div>

          <div className="home-field">
            <label htmlFor="home-sort">Sort destinations</label>
            <select
              id="home-sort"
              value={sortOrder}
              onChange={handleSortChange}
            >
              <option value="asc">Name: A–Z</option>
              <option value="desc">Name: Z–A</option>
            </select>
          </div>
        </div>
      </section>

      <section
        className="home-explore"
        id="home-destinations"
        aria-labelledby="explore-title"
      >
        <h2 id="explore-title">Explore Destinations</h2>

        <p role="status">
          {cityStatus === "loading" &&
            (request.offset === 0 ? "Loading cities…" : "Loading more cities…")}
          {cityStatus === "error" &&
            (request.offset > 0
              ? "Could not load more cities. Try again."
              : "Could not load cities. Try searching again.")}
        </p>

        <p className="home-results-status" aria-live="polite">
          Showing {visibleDestinations.length}{" "}
          {visibleDestinations.length === 1 ? "destination" : "destinations"}
          {saved.length > 0 && ` · ${saved.length} saved`}
        </p>

        {visibleDestinations.length > 0 ? (
          <div className="home-grid">
            {visibleDestinations.map((destination) => (
              <HomeDestinationCard
                key={destination.id}
                destination={destination}
                isSaved={isSaved(destination.id)}
                isExpanded={expandedIds.includes(destination.id)}
                onToggleSaved={() => toggleSaved(destination)}
                onToggleDetails={() => toggleDetails(destination.id)}
              />
            ))}
          </div>
        ) : cityStatus === "ready" ? (
          <p className="home-empty-state" role="status">
            No destinations match those filters. Try another search.
          </p>
        ) : null}

        {request.offset > 0 && (
          <p role="status">
            {cityStatus === "loading" && "Loading more destinations…"}
            {cityStatus === "error" && "Could not load more destinations. Click Load more to retry."}
          </p>
        )}

        {nextOffset !== null && (
          <button
            className="home-button home-load-more"
            type="button"
            onClick={handleLoadMore}
            disabled={cityStatus === "loading"}
          >
            {cityStatus === "loading" ? "Loading…" : "Load more"}
          </button>
        )}
      </section>
    </main>
  );
}

export default HomePage;