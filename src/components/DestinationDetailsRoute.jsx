
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { destinations } from "../data/destinations.js";
import { getCityDetails } from "../services/destinationService.ts";
import DestinationDetails from "./DestinationDetails.jsx";

function DestinationDetailsRoute() {
  const { id } = useParams();

  const destination = destinations.find(
    (place) => place.id === id
  );

  const [apiState, setApiState] = useState({
    id: null,
    loading: true,
    data: null,
    error: ""
  });

  useEffect(() => {
    if (!destination) return;

    const controller = new AbortController();

    setApiState({
      id,
      loading: true,
      data: null,
      error: ""
    });

    getCityDetails(destination.name, controller.signal)
      .then((details) => {
        if (controller.signal.aborted) return;

        if (!details) {
          throw new Error("Destination not found");
        }

        const activities = details.pointsOfInterest
          .filter((place) => place.category === "attraction")
          .map((place) => ({
            id: place.id,
            name: place.name
          }));

        const restaurants = details.pointsOfInterest
          .filter((place) => place.category === "restaurant")
          .map((place) => ({
            id: place.id,
            name: place.name,
            cuisine: null,
            rating: null
          }));

        setApiState({
          id,
          loading: false,
          data: {
            ...destination,
            activities,
            restaurants
          },
          error: ""
        });
      })
      .catch(() => {
        if (controller.signal.aborted) return;

        setApiState({
          id,
          loading: false,
          data: null,
          error: "Could not load live destination information."
        });
      });

    return () => {
      controller.abort();
    };
  }, [id, destination]);

  if (!destination) {
    return <DestinationDetails destination={undefined} />;
  }

  if (apiState.id !== id || apiState.loading) {
    return (
      <main className="destination-details">
        <section role="status">
          <p>Loading places in {destination.name}...</p>
        </section>
      </main>
    );
  }

  return (
    <>
      {apiState.error && (
        <div className="destination-details">
          <section role="alert">
            <p>{apiState.error}</p>
            <p>Showing saved information instead.</p>
          </section>
        </div>
      )}

      <DestinationDetails
        destination={apiState.data || destination}
      />
    </>
  );
}

export default DestinationDetailsRoute;
