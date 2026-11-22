
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "../components/HomePage.jsx";
import DestinationDetailsRoute from "../components/DestinationDetailsRoute.jsx";

createRoot(document.getElementById("home-root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/index.html" element={<HomePage />} />
      <Route
        path="/destinations/:id"
        element={<DestinationDetailsRoute />}
      />
    </Routes>
  </BrowserRouter>
);
