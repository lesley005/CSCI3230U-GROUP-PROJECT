
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { destinations } from "../data/destinations.js";
import { getCityDetails } from "../services/destinationService.ts";
import { getGeoNamesDestination } from "../services/geoNamesDetailService.js";
import DestinationDetails from "./DestinationDetails.jsx";

function DestinationDetailsRoute() {
  const { id } = useParams();

  const destination = destinations.find(
    (place) => place.id === id
  );

  const isGeoNames = /^geonames-\d+$/.test(id || "");

  const [apiState, setApiState] = useState({
    id: null,
    loading: true,
    data: null,
    error: "",
    notFound: false
  });

  useEffect(() => {
    if (!destination && !isGeoNames) return;

    const controller = new AbortController();

    setApiState({
      id,
      loading: true,
      data: null,
      error: "",
      notFound: false
    });

    async function loadDestination() {
      try {
        if (isGeoNames) {
          const city = await getGeoNamesDestination(
            id,
            controller.signal
          );

          if (controller.signal.aborted) return;

          setApiState({
            id,
            loading: false,
            data: city,
            error: "",
            notFound: !city
          });

          return;
        }

        const details = await getCityDetails(
          destination.name,
          controller.signal
        );

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
          error: "",
          notFound: false
        });
      } catch (error) {
        if (controller.signal.aborted) return;

        setApiState({
          id,
          loading: false,
          data: destination || null,
          error: "Could not load live destination information.",
          notFound: false
        });
      }
    }

    loadDestination();

    return () => {
      controller.abort();
    };
  }, [id, destination, isGeoNames]);

  if (!destination && !isGeoNames) {
    return <DestinationDetails destination={undefined} />;
  }

  if (apiState.id !== id || apiState.loading) {
    return (
      <main className="destination-details">
        <section role="status">
          <p>
            Loading places in {destination?.name || "your destination"}...
          </p>
        </section>
      </main>
    );
  }

  if (apiState.notFound) {
    return <DestinationDetails destination={undefined} />;
  }

  if (apiState.error && !apiState.data) {
    return (
      <main className="destination-details">
        <section role="alert">
          <h1>Could not load destination</h1>
          <p>{apiState.error}</p>
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
