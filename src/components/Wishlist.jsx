import DestinationCard from "./DestinationCard";
import { useSavedDestinations } from "../hooks/useSavedDestinations.js";
import "./Wishlist.css";

function Wishlist() {
  // Saved destinations come from localStorage, so they survive refreshes
  const { saved, removeSaved } = useSavedDestinations();

  return (
    <main id="wishlist_body">
      <h1>My Wishlist</h1>

      {saved.length > 0 ? (
        <div className="wishlist">
          {saved.map((d) => (
            <DestinationCard key={d.id} destination={d} onRemove={removeSaved} />
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