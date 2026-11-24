# AI-USAGE.md

Log of AI contributions to submitted code (M3 onward). Format: see `AI-USAGE-template.md`.
Markers in code: `// AI-assisted - see AI-USAGE.md #<n>`.

## Log

### #1 - Saved destinations hook + localStorage
- **Date:** 2026-11-15 · **Member:** Zainab Sohail · **Tool:** Claude (Anthropic)
- **Files:** `src/hooks/useSavedDestinations.js`, `src/utils/savedStorage.js`.
- **Prompt:** `okay do what do i do rn` (follow-up after sharing some of the M3 requirements and our package.json)
- **Kept/changed:** Kept the generated hook; fixed the file extension, wired SaveButton into DestinationDetails, tested save/refresh/remove in the browser.

### #2 - Tests for saved destinations
- **Date:** 2026-11-22 · **Member:** Zainab Sohail · **Tool:** Claude (Anthropic)
- **Files:** `src/utils/savedStorage.test.js`, `src/components/Wishlist.test.jsx`
- **Prompt:** `Yeah, npm test runs Vitest now, and the config only picks up tests in src/components. You can convert yours after the merge so they all run together` (my teammate's message, pasted in to ask for the test conversion)
- **Kept/changed:** Kept the generated tests; updated vitest.config.js, added the /saved route, confirmed all 22 tests pass.

### #3 - Function to display itinerary event creation on other pages
- **Date:** 2026-11-23 · **Member:** Daniel Allen · **Tool:** Google Hydrogen 4 Thinking (Education Plan)
- **Files:** `src/scripts/itinerary.tsx`
- **Prompt:** `Can you create a function that another page can call that will display an add event form with default values passed to the function?` (followed by the content of `src/scripts/itinerary.tsx`)
- **Kept/changed:** Kept only `show_add_event_form`, removed callback function, replaced `React.FormEvent<HTMLFormElement>` with `React.SubmitEvent<HTMLFormElement>`, added check to prevent duplicate dialogs from appearing