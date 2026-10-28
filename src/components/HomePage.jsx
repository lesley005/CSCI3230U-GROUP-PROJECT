import { useMemo, useState } from "react";
import { destinations } from "../data/destinations.js";
import HomeDestinationCard from "./HomeDestinationCard.jsx";
import "./HomePage.css";

function HomePage() {
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("all");
  const [sortOrder, setSortOrder] = useState("asc");
  const [savedIds, setSavedIds] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  const countries = [
    ...new Set(destinations.map((destination) => destination.country)),
  ].sort();

  const visibleDestinations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return destinations
      .filter(
        (destination) =>
          country === "all" || destination.country === country
      )
      .filter((destination) =>
        `${destination.name} ${destination.country} ${destination.description}`
          .toLowerCase()
          .includes(query)
      )
      .sort((first, second) => {
        const comparison = first.name.localeCompare(second.name);
        return sortOrder === "asc" ? comparison : -comparison;
      });
  }, [country, search, sortOrder]);

  function toggleSaved(id) {
    setSavedIds((currentIds) =>
      currentIds.includes(id)
        ? currentIds.filter((savedId) => savedId !== id)
        : [...currentIds, id]
    );
  }

  function toggleDetails(id) {
    setExpandedId((currentId) => (currentId === id ? null : id));
  }

  function handleSearch(event) {
    event.preventDefault();
    document
      .getElementById("home-destinations")
      ?.scrollIntoView({ behavior: "smooth" });
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
              onChange={(event) => setSearch(event.target.value)}
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
              onChange={(event) => setCountry(event.target.value)}
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
              onChange={(event) => setSortOrder(event.target.value)}
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

        <p className="home-results-status" aria-live="polite">
          Showing {visibleDestinations.length}{" "}
          {visibleDestinations.length === 1 ? "destination" : "destinations"}
          {savedIds.length > 0 && ` · ${savedIds.length} saved`}
        </p>

        {visibleDestinations.length > 0 ? (
          <div className="home-grid">
            {visibleDestinations.map((destination) => (
              <HomeDestinationCard
                key={destination.id}
                destination={destination}
                isSaved={savedIds.includes(destination.id)}
                isExpanded={expandedId === destination.id}
                onToggleSaved={() => toggleSaved(destination.id)}
                onToggleDetails={() => toggleDetails(destination.id)}
              />
            ))}
          </div>
        ) : (
          <p className="home-empty-state" role="status">
            No destinations match those filters. Try another search.
          </p>
        )}
      </section>
    </main>
  );
}

export default HomePage;