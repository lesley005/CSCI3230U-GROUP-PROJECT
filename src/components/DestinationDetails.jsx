
import { useState } from "react";
import ActivityList from "./ActivityList";
import RestaurantList from "./RestaurantList";
import "./DestinationDetails.css";

function DestinationDetails({ destination }) {
  const [showMore, setShowMore] = useState(false);
  if(destination === undefined){
    return (
      <main className="destination-details">
      <section>
        <h1>Error 404</h1>

        <p>Unknown destination</p>
      </section>
    </main>
    );
  }
  return (
    <main className="destination-details">
      <section>
        <h1>About {destination.name}</h1>

        <p>{destination.description}</p>

        {showMore && (
          <p>
            Explore activities, restaurants, and attractions
            in {destination.name}.
          </p>
        )}

        <button onClick={() => setShowMore(prev => !prev)}>
          {showMore ? "Show Less" : "Show More"}
        </button>
      </section>

      <ActivityList activities={destination.activities || []} />

      <RestaurantList restaurants={destination.restaurants || []} />
    </main>
  );
}

export default DestinationDetails;
