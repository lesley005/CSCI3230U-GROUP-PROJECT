
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        destinations: "destinations.html",
        itinerary: "itinerary.html",
        wishlist: "wishlist.html",
        toronto: "destinations/toronto_ontario.html"
      }
    }
  }
});
