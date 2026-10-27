import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        destinations: 'destinations.html',
        itinerary: 'itinerary.html',
        wishlist: 'wishlist.html'
      },
    },
  },
})