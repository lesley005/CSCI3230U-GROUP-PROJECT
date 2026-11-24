
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { destinations } from "../data/destinations.js";
import { getCityDetails } from "../services/destinationService.ts";
import {
  getGeoNamesDestination,
  getGeoNamesPlaces
} from "../services/geoNamesDetailService.js";
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
    notFound: false,
    placesLoading: false
  });

  useEffect(() => {
    if (!destination && !isGeoNames) return;

    const controller = new AbortController();

    setApiState({
      id,
      loading: true,
      data: null,
      error: "",
      notFound: false,
      placesLoading: false
    });

    async function loadDestination() {
      try {
        if (isGeoNames) {
          const city = await getGeoNamesDestination(
            id,
            controller.signal
          );

          if (controller.signal.aborted) return;

          if (!city) {
            setApiState({
              id,
              loading: false,
              data: null,
              error: "",
              notFound: true,
              placesLoading: false
            });
            return;
          }

          setApiState({
            id,
            loading: false,
            data: city,
            error: "",
            notFound: false,
            placesLoading: true
          });

          try {
            const places = await getGeoNamesPlaces(
              city,
              controller.signal
            );

            if (controller.signal.aborted) return;

            setApiState((current) =>
              current.id === id
                ? {
                    ...current,
                    data: {
                      ...city,
                      ...places
                    },
                    placesLoading: false
                  }
                : current
            );
          } catch (error) {
            if (controller.signal.aborted) return;

            console.warn("Could not load nearby places:", error);

            setApiState((current) =>
              current.id === id
                ? { ...current, placesLoading: false }
                : current
            );
          }

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

        const points = details.pointsOfInterest || [];

        const activities = points
          .filter((place) => place.category === "attraction")
          .map((place) => ({
            id: place.id,
            name: place.name
          }));

        const restaurants = points
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
          notFound: false,
          placesLoading: false
        });
      } catch (error) {
        if (controller.signal.aborted) return;

        setApiState({
          id,
          loading: false,
          data: destination || null,
          error: "Could not load live destination information.",
          notFound: false,
          placesLoading: false
        });
      }
    }

    loadDestination();

    return () => controller.abort();
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

      {apiState.placesLoading && (
        <div className="destination-details" role="status">
          <p>Loading nearby attractions and restaurants...</p>
        </div>
      )}
    </>
  );
}

export default DestinationDetailsRoute;
