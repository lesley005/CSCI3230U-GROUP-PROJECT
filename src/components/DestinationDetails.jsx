
import { useState } from "react";
import ActivityList from "./ActivityList";
import RestaurantList from "./RestaurantList";
import "./DestinationDetails.css";
import SaveButton from "./SaveButton";

// This is my main react component for the Destination Details page.
// I use props so it can display information about different cities.
function DestinationDetails({ destination }) {

  // I used useState to control the Show More button.
  // It starts as false because I want the extra information hidden.
  const [showMore, setShowMore] = useState(false);

  // This check was added during our team review.
  // If the destination is missing, it shows an error instead
  // of trying to display information that does not exist.
  if (destination === undefined) {
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

        {/* I use destination.name so the heading
            changes depending on the selected city. */}
        <h1>About {destination.name}</h1>
        <SaveButton destination={destination} />

        {/* The description comes from the destinations data file. */}
        <p>{destination.description}</p>

        {/* This paragraph only appears when showMore is true. */}
        {showMore && (
          <p>
            Explore activities, restaurants, and attractions
            in {destination.name}.
          </p>
        )}

        {/* onClick runs when the button is clicked.
            setShowMore changes the state to its opposite value.
            React updates the page without needing a refresh. */}
        <button onClick={() => setShowMore(prev => !prev)}>

          {/* The button text changes based on the state. */}
          {showMore ? "Show Less" : "Show More"}
        </button>
      </section>

      {/* I pass the activities into my ActivityList component.
          The empty array prevents problems if activities are missing. */}
      <ActivityList activities={destination.activities || []} />

      {/* I pass the restaurant data into RestaurantList
          so it can display the restaurants in a table. */}
      <RestaurantList restaurants={destination.restaurants || []} />

    </main>
  );
}

// This allows other files to import and use this component.
export default DestinationDetails;
