import { getCityDetails } from '../src/services/destinationService';

async function runTest() {
  console.log('1. Starting test script...');
  
  try {
    console.log('2. Calling getCityDetails("Tokyo")...');
    const destination = await getCityDetails('Tokyo');
    
    console.log('3. API Response received:');
    console.dir(destination, { depth: null });
  } catch (error) {
    console.error('❌ Error during API execution:', error);
  }
}

// Ensure errors in top-level execution are caught
runTest().catch((err) => {
  console.error('❌ Top-level promise rejected:', err);
});