import Wishlist from "../components/Wishlist.jsx";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "../components/HomePage.jsx";
import DestinationDetailsRoute from "../components/DestinationDetailsRoute.jsx";
import { ItineraryPage } from "./itinerary.js";

createRoot(document.getElementById("home-root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/index.html" element={<HomePage />} />
      <Route
        path="/destinations/:id"
        element={<DestinationDetailsRoute />}
      />
      <Route path="/saved" element={<Wishlist />} />
      <Route path="/itinerary" element={<ItineraryPage />} />
    </Routes>
  </BrowserRouter>
);
