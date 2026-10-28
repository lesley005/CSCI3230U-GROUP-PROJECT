import { useState } from "react";
import DestinationCard from "./DestinationCard";
import { destinations } from "../data/destinations.js";
import "./Wishlist.css";

// Mock data for M2: start with these saved. (Later: custom hook + localStorage.)
const INITIAL_SAVED_IDS = ["toronto", "quebec-city", "edmonton", "banff"];

function Wishlist() {
  const [savedIds, setSavedIds] = useState(INITIAL_SAVED_IDS);

  function handleRemove(id) {
    setSavedIds((prev) => prev.filter((savedId) => savedId !== id));
  }

  // Ids with no matching destination are skipped instead of crashing
  const savedDestinations = destinations.filter((d) => savedIds.includes(d.id));

  return (
    <main id="wishlist_body">
      <h1>My Wishlist</h1>

      {savedDestinations.length > 0 ? (
        <div className="wishlist">
          {savedDestinations.map((d) => (
            <DestinationCard key={d.id} destination={d} onRemove={handleRemove} />
          ))}
        </div>
      ) : (
        <p className="wishlist-empty">
          No saved destinations yet.{" "}
          <a href="/destinations.html">Browse destinations</a>
        </p>
      )}
    </main>
  );
}

export default Wishlist;