# CSCI 3230U - Group Project

The course's major summative assessment (there is no final exam). In a team of 4–5, you design and build a single-page web application that browses and acts on a collection of items drawn from a web service - and you do it in stages, so the work is spread across the term instead of crammed into the last two weeks.

## The idea

Every group builds an app with the same core capabilities but a unique topic. Think of the recipe browser from the lectures: a searchable, filterable collection of cards, each with a detail page, favourites, and data loaded from an API. Your group picks a different domain - movies, books, board games, houseplants, travel destinations, video games, workouts, cocktails, hiking trails, … - and a matching data source.

- **Unique topics.** No two groups share a domain (claimed first-come, first-served)
- **Shared functionality.** Whatever the topic, the app must meet the minimum baseline below

## The size of it (what "enough work" means)

The recipe demo app is the minimum (per student). A team of *N* delivers roughly *N×* that app's worth of work.

The unit of contribution is a **vertical slice**: one feature built end-to-end through every layer - its UI component(s), its state/hook, its data (an API call or local store), its route if it has one, and its tests + accessibility. A slice is "yours": it should be visible as your commits and PRs in the Git history.

- **Each member owns at least one vertical slice** comparable to a recipe-app feature (e.g. search + results, item detail, favourites, a rating/review form, filter-by-category, a "trending" view).
- The slices sit on top of a shared app shell (routing, layout, the data layer) that the team builds together.

## What you build (baseline - every group)

A React SPA that:

- loads a collection from a web service and renders it as cards/a list, with loading / error / empty states;
- supports search, filter, and sort;
- has a detail view per item (client-side routing + URL params);
- keeps persisted user state (favourites / saved / rated) in a custom hook or Context + `localStorage`;
- includes at least one controlled form (add an item, submit a rating/review, or an advanced search);
- has multiple routes (e.g. list / detail / favourites or about);
- is accessible (WCAG basics - semantic HTML, labels, keyboard, contrast), responsive, and deployed to a public URL (e.g. Netlify);
- has automated tests for some logic and components.

Then your group scales past the baseline with each member's slices.

## Your data source

- **Default: a public API.** Most domains have free ones (TheMealDB, OMDb/TMDB, Google Books, RAWG, BoardGameGeek, Open Trivia, …). Pick one whose data is rich enough for search/detail/filtering, and map its shape to yours at the boundary.
- **Option: bring your own API.** A group may build a small backend (Node/Express or Next.js API routes) and have the frontend consume it - this connects to the week-12 material and is a stretch.

---

## Milestones

Five checkpoints pace the work. Each is **demoable and graded**, so progress can't be deferred - you'll have a *styled prototype* by week 4 and a *working React app* by the week-7 halfway point, leaving the last stretch for the live API and polish rather than the whole build.

> **AI policy (`ai-policy.md`):** M1–M2 are AI-free (AI for learning only - explanations, error messages). AI generation is permitted on M3-M4, documented in `AI-USAGE.md`, free models only. When in doubt, document.

### M0 - Team & Topic

**When:** form your team during Lab 01 - the TAs will guide team creation and help you set up GitHub; you'll be busy with the lab itself, so will be due at the start of your next lab session.
**Follows from:** the Git/GitHub workflow from Lab 01.
- A team of 4–5 with a team name and a one-line role/interest for each member.
- A GitHub repository (team-owned) with a project board (Issues/Projects) created.
- A tentative topic (domain) and a candidate data source (the API you expect to use).

### M1 - Proposal & Static Prototype

**When:** Lab 03
**Follows from:** HTML & CSS (01b, 02b - responsive, a framework if you like), JavaScript (03a/03b).
- A short written proposal: the locked topic; the API you'll consume and a sample of its data shape; 2–3 comparators (existing apps/sites doing something similar, and how yours differs); the scaled feature list (which slice each member owns); and wireframes.
- A static HTML/CSS prototype of the key pages (the list page + a detail page) on sample/hard-coded data - semantic, responsive, and accessible, no framework code yet. (Planning alone is hard to assess; this is the tangible artifact.)
- The project board populated with issues, divided among members.

### M2 - React Foundation

**When:** Lab 06
**Follows from:** npm/Vite (05a), web security (06a), components & the SPA model (06b), state & reactivity (07b).
- The prototype rebuilt as a React app (with Vite): the UI decomposed into components with props, state driving the view, event handling, and list rendering with keys.
- The core experience is interactive on local / mock data (an in-repo JSON file or array - not the live API yet): browse the collection, open an item, toggle a piece of state.
- A live progress demo by the team, and an updated board showing real progress.

### M3 - Baseline Working Project

**When:** Lab 10
**Follows from:** forms (08a), state management / hooks / Context (09a), routing (09b), consuming web services / `fetch` / async (10a), testing (10b), accessibility (11a), performance & deployment (11b).
- The complete app meeting the baseline and each member's vertical slice: now consuming the live web service (with loading/error/cancel handling), search/filter/sort, routed detail views, persisted user state, at least one controlled form, tests, accessible + responsive, and deployed to a public URL.
- A final presentation/demo.
- AI use (if any) documented in `AI-USAGE.md`, per policy.

### M4 - Independent Concept & Short-Form Video

**When:** the exam period
**Follows from:** the entire semester - plus self-directed research.
- Research a concept not taught in the course (a library, a Web API, a framework feature, a technique) - each group's concept is unique. Examples: data-fetching caching (TanStack Query), animation (Framer Motion), charts (Recharts/D3), a map (Leaflet), the Geolocation / Canvas / Web Audio / drag-and-drop APIs, a PWA / offline service worker, internationalization, real-time (WebSockets), or a state library (Zustand).
- Integrate a working example of that concept into your project.
- Produce a short-form video (TikTok / Reel / Short style, ~1–3 min): explain the concept from your independent research, then demo your implementation.

---

## Working as a team (carried from Lab 01)

- Plan with **Issues**; do work on **branches**; merge through reviewed **Pull Requests**; keep `main` protected and green.
- Commits and PRs are how **individual contribution** is judged - each member's vertical slice should be theirs in the history.
- Submit by **pushing**; the graded state of each milestone is what's on `main` at the deadline.

## Policies

- **AI:** see `ai-policy.md` - AI-free through M4's week-7-era work; documented AI allowed afterwards; free models only.
- **Academic integrity:** your own work (and your own team's); cite/attribute external code, assets, and API data per their licenses.

## Grading - 44% of the final grade

| Milestone | Weight |
|---|---|
| M0 - Team & Topic | 2% |
| M1 - Proposal & Static Prototype | 8% |
| M2 - React Foundation | 12% |
| M3 - Final Working Project | 14% |
| M4 - Independent Concept & Video | 8% |
| **Total** | **44%** |
