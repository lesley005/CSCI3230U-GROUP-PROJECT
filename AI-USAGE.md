# AI-USAGE.md

Log of AI contributions to submitted code (M3 onward). Format: see `AI-USAGE-template.md`.
Markers in code: `// AI-assisted - see AI-USAGE.md #<n>`.

## Log

### #1 - Saved destinations hook + localStorage
- **Date:** 2026-11-15 · **Member:** Zainab Sohail · **Tool:** Claude (Anthropic)
- **Files:** `src/hooks/useSavedDestinations.js`, `src/utils/savedStorage.js`, `SaveButton.jsx`, `Wishlist.jsx`
- **Prompt:** `okay so what do i do rn for this prt` (follow-up after sharing soome of the M3 requirements and our package.json)
- **Kept/changed:** Kept the generated hook; fixed the file extension, wired SaveButton(built it myself used help but not generated code for button) into DestinationDetails, tested save/refresh/remove in the browser.

### #2 - Tests for saved destinations
- **Date:** 2026-11-22 · **Member:** Zainab Sohail · **Tls testsool:** Claude (Anthropic)
- **Files:** `tests/savedStorage.test.js`, `tests/Wishlist.test.jsx`
- **Prompt:** `Yeah, npm test runs Vitest now, and the config only picks up tests in src/components. You can convert yours after the merge so they all run together` (my teammate's message, pasted in to ask for the test conversion)
- **Kept/changed:** Kept the generated tests; updated vitest.config.js, added the /saved route, confirmed all 22 tests pass.

### #3 - Function to display itinerary event creation on other pages
- **Date:** 2026-11-23 · **Member:** Daniel Allen · **Tool:** Google Hydrogen 4 Thinking (Education Plan)
- **Files:** `src/scripts/itinerary.tsx`
- **Prompt:** `Can you create a function that another page can call that will display an add event form with default values passed to the function?` (followed by the content of `src/scripts/itinerary.tsx`)
- **Kept/changed:** Kept only `show_add_event_form`, removed callback function, replaced `React.FormEvent<HTMLFormElement>` with `React.SubmitEvent<HTMLFormElement>`, added check to prevent duplicate dialogs from appearing

### #4 -  Homepage API integration
- **Date:** 2026-11-24 · **Member:** Rameen Khan · **Tool:** ChatGPT / GPT-5.6 Luna
- **Files:** `src/services/cityCatalogService.js`, `src/services/cityArticleService.js`, `src/components/HomePage.jsx`, `src/components/HomeDestinationCard.jsx`
- **Prompt:** `Help me update the React homepage to load a worldwide list of cities when the search box is empty. Use GeoNames for the city catalog and Wikimedia for photos and Wikipedia summaries so Quick Info shows something about each place beyond its population. Show only cities with photos, keep the source credits, add Load more, and let users search the full catalog before loading more cards. Use the team's `useSavedDestinations` hook so users can save API cities to the Wishlist. I shared my `HomePage.jsx` code, the city-fetching function, and screenshots of the cards with missing photos.`
- **Kept/changed:** Integrated GeoNames for browsing and searching cities and Wikimedia for photos and Quick Info. Added source credits and connected the Home Save buttons to the team's shared Wishlist hook.

### #5 - Homepage bug fixes
- **Date:** 2026-11-24 · **Member:** Rameen Khan · **Tool:** ChatGPT / GPT-5.6 Luna
- **Files:** `src/components/HomePage.jsx`, `src/services/cityCatalogService.js`
- **Prompt:** `Help me debug why clicking Load more leaves the homepage blank or adds no cards. Keep the existing cards visible, append new results below them in the selected sort order, and automatically skip batches that have no usable city photos. Also fix the country dropdown so it lists countries from the catalog, and make clearing the search restore the default city list. I pasted my current `HomePage.jsx` and `cityCatalogService.js` and shared screenshots of the blank page and the country dropdown.`
- **Kept/changed:** Fixed the blank page, kept existing cards visible while loading more, and skipped API batches without usable photos. Also fixed the country dropdown and made clearing the search restore the default city list.

### #6 - Homepage tests
- **Date:** 2026-11-24 · **Member:** Rameen Khan · **Tool:** ChatGPT / GPT-5.6 Luna
- **Files:** `tests/HomePage.test.jsx`
- **Prompt:** `Help me write Vitest tests for my homepage and check whether the initial two tests cover the M3 requirements. Explain when mocked API responses are appropriate, and add coverage for search, country filtering, sorting, Load more, loading and empty states, error recovery, and cancellation when a new search starts. I shared the homepage code earlier and later verified the tests and production build locally.`
- **Kept/changed:** Used mocked catalog responses to test search, country filtering, sorting, Load more, loading and empty states, error recovery, and request cancellation. All five Home tests passed. The full suite reported 30 passed and one itinerary TODO, and the production build succeeded.