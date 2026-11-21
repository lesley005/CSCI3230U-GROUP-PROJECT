// This file contains a test of the raw output and an example of how to extract usable data
// I run this file in the terminal using: "npx tsx scripts/test-backend.ts"


//---------------------------------------------------------------------------------------------------

// Test of raw output

// import { getCityDetails } from '../src/services/destinationService';

// async function runTest() {
//   console.log('1. Starting test script...');
  
//   try {
//     console.log('2. Calling getCityDetails("Tokyo")...');
//     const destination = await getCityDetails('Tokyo');
    
//     console.log('3. API Response received:');
//     console.dir(destination, { depth: null });
//   } catch (error) {
//     console.error('Error during API execution:', error);
//   }
// }

// // Ensure errors in top-level execution are caught
// runTest().catch((err) => {
//   console.error('Top-level promise rejected:', err);
// });

//---------------------------------------------------------------------------------------------------

// Example on how to get usable output

// import { getCityDetails } from '../src/services/destinationService';

// async function runExample() {
//   console.log('Fetching destination details for Toronto...');
  
//   try {
//     const destination = await getCityDetails('Toronto');
    
//     if (destination) {
//       console.log(`Country: ${destination.countryName} (${destination.countryCodeIso3})`);
//       console.log(`Safety Score: ${destination.safetyScore} / 10`);
//       console.log(`Advisory Level: ${destination.advisoryLevel}`);

//       // Take only the first 5 POIs
//       const topPois = destination.pointsOfInterest.slice(0, 5);

//       console.log(`\n--- Top 5 Points of Interest (out of ${destination.pointsOfInterest.length}) ---`);
//       if (topPois.length === 0) {
//         console.log('No points of interest found.');
//       } else {
//         topPois.forEach((poi, index) => {
//           console.log(`${index + 1}. ${poi.name} [${poi.category.toUpperCase()}]`);
//           console.log(`   Location: ${poi.lat}, ${poi.lon}`);
//         });
//       }
//     } else {
//       console.log('City not found.');
//     }
//   } catch (error) {
//     console.error('Error during test execution:', error);
//   }
// }

// runExample();

//---------------------------------------------------------------------------------------------------

// Testing localStorage with mock browser

import { getCityDetails } from '../src/services/destinationService';

// 1. Mock browser window.localStorage for Node.js CLI testing
const mockStorage = new Map<string, string>();
(globalThis as any).window = {
  localStorage: {
    getItem: (key: string) => mockStorage.get(key) ?? null,
    setItem: (key: string, value: string) => mockStorage.set(key, value),
    removeItem: (key: string) => mockStorage.delete(key),
  },
};

async function runTests() {
  console.log('--- 1. FIRST CALL (Cache Miss - Hits Live APIs) ---');
  console.time('First Fetch');
  const firstResult = await getCityDetails('New York City');
  console.timeEnd('First Fetch');

  console.log('Safety Score:', firstResult?.safetyScore);
  console.log('Advisory Level:', firstResult?.advisoryLevel);
  console.log('POIs Found:', firstResult?.pointsOfInterest.length);
  console.log('Saved Keys in localStorage:', Array.from(mockStorage.keys()));

  console.log('\n--- 2. SECOND CALL (Cache Hit - Reads from localStorage) ---');
  console.time('Second Fetch');
  const secondResult = await getCityDetails('New York City');
  console.timeEnd('Second Fetch');

  console.log('Cached Safety Score:', secondResult?.safetyScore);
}

runTests(); 