
import { createRoot } from "react-dom/client";
import DestinationDetails from "../components/DestinationDetails";
import { destinations } from "../data/destinations.js";

const toronto = destinations.find(
  (destination) => destination.id === "toronto"
);

createRoot(document.getElementById("destination-root")).render(
  <DestinationDetails destination={toronto} />
);
