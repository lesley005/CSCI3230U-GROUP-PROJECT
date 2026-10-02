# Journeys Uncharted - Project Proposal (Milestone 1)

**Team:** Lesley Ozurigbo · Rameen Khan· Daniel Allen · Zainab Sohail· Daniel Bryon

## Contents

1. [Topic](#1-topic)
2. [Data source](#2-data-source)
3. [Comparators](#3-comparators)
4. [Feature plan](#4-feature-plan)
5. [Wireframes](#5-wireframes)
6. [What's next](#6-whats-next)


## 1. Topic

Journeys Uncharted is a travel discovery and planning application for budget-conscious travelers and people exploring unfamiliar destinations. Users will be able to browse cities, search and filter destinations, explore destination details, save favorites, and organize a personal trip itinerary. Our goal is to bring destination research and practical planning into one accessible interface, helping users make informed choices about where to go and what to do. Where supported by our chosen data sources, destination pages will also include cost and safety information.

## 2. Data source

| API | What we get from it | Used on |
|---|---|---|
| **Nominatim** (OpenStreetMap search) - https://nominatim.org/release-docs/latest/api/Search/ | City name, country, coordinates, population, Wikipedia/Wikidata link | Browse cards, Details, Compare |
| **Overpass API** (OpenStreetMap data, via Private.coffee) - https://turbo.overpass.private.coffee/ | Restaurants, businesses, and attractions near a city | Details, Compare |
| **IsItSafeToTravel** - https://isitsafetotravel.org/en/ | Country safety score (1–10), risk categories, government advisory levels | Browse cards, Details, Compare |

### Endpoints

| API | Endpoint | Auth |
|---|---|---|
| Nominatim | `GET https://nominatim.openstreetmap.org/search?city={name}&format=jsonv2&addressdetails=1&extratags=1` | None (max 1 request/sec, results cached) |
| Overpass | `POST https://overpass.private.coffee/api/interpreter` | None |
| IsItSafeToTravel | `GET https://isitsafetotravel.org/map-data.json` | None (CORS enabled, CC BY-NC 4.0) |

### Sample responses (trimmed)

**IsItSafeToTravel**, Portugal entry:

```json
{
  "countries": [
    {
      "iso3": "PRT",
      "name": { "en": "Portugal" },
      "scoreDisplay": 8,
      "pillars": [
        { "name": "conflict", "score": 0.85 },
        { "name": "crime", "score": 0.83 },
        { "name": "health", "score": 0.83 },
        { "name": "governance", "score": 0.77 },
        { "name": "environment", "score": 0.65 }
      ],
      "advisories": { "ca": { "level": 1 } }
    }
  ]
}
```

**Overpass**, Rome Landmark Entry:

```json
{
  "version": 0.6,
  "generator": "Overpass API / Private.coffee",
  "elements": [
    {
      "type": "node",
      "id": 25333157,
      "tags": {
        "name": "Colosseo",
        "name:en": "Colosseum",
        "tourism": "attraction"
      }
    }
  ]
}
```


## 3. Comparators

### TripAdvisor - https://www.tripadvisor.ca/

- Provides information about vacation spots
- Lists popular vacation destinations
- Offers buying tickets and booking hotels through their website
- Lists popular events at a specific destination
- Let's users leave comments and reviews on events and hotels

**How our app differs:** Our app will focus on providing a simpler destination-browsing and trip-planning experience, combining destination details with the core travel information needed to plan a trip.


### Trip Central - https://www.tripcentral.ca/

- Let's users book vacations and compare different flight prices
- Includes flights, cruises, tours, and hotels
- Does not include things to do at a specific location
- Can't leave comments and reviews

**How our app differs:** It will place greater emphasis on exploring individual destinations and viewing detailed information about them before planning travel.

---

## 4. Feature plan

### Baseline features

The finished app will have:

- **Browse destinations:** city cards pulled from the API, with a loading message, a message if something breaks, or a message if nothing is found.
- **Search, filter, sort:** search by city name, filter by country, sort A–Z.
- **Destination page:** Each city has its own page and link.
- **Saved stuff:** Saved cities and trip plans stay after you refresh the page.
- **Trip form:** plan a trip (destination, dates, activities, notes) with checks for missing or wrong info.
- **Four pages:** Browse, Details, Saved, Trip Planner.
- **Works for everyone:** usable with a keyboard, readable colors, labeled inputs, and looks good on phone and desktop.
- **Tested and live:** automated tests for key parts, and the finished site is online.

### Vertical slices - who owns what

| Member | Slice | Includes | Issues |
|---|---|---|---|
| **Lesley Ozurigbo** | Destination Details | Build the routed detail page with available destination information, images, and points of interest. Fetch the selected destination using its URL parameter and handle missing or invalid destinations. Test detail rendering and error states. | Browse Destinations Page |
| **Rameen** | Home Page and Destination Discovery | Build the introductory home/list page, destination cards, search, country filtering, and sorting. Connect results to the data layer and handle loading, error, and empty states. Test search and filtering behaviour. | Build home page |
| **Daniel Allen** | Trip Itinerary Planner | Build a controlled form for creating and editing a trip, including dates, activities, and notes. Validate entries and persist plans locally. Test validation and saving. Also lead shared backend setup. | Search, filter by country, sort A–Z |
| **Zainab** | Saved Destinations | Build save/remove controls and a dedicated favorites page. Manage saved destinations through a custom hook or Context with localStorage, including empty states. Test persistence and removal. | Saved Destinations: save/remove buttons + Saved page |
| **Daniel Bryon** | API Integration & Shared Data Setup | Build the shared API layer/service module to get destination and activity data. Create the base TypeScript interface/data model and manage networking with proper error handling and loading behavior, and provide utility functions/fallback mocks for the team. | Shared data/API setup, API integration service, destination & activity data fetching models |



## 5. Wireframes


<img width="960" height="782" alt="Image of pages wireframe" src="https://github.com/user-attachments/assets/92563edb-8ba3-4457-a29f-c3c6190eea1c" />



## 6. What's next

- Review section for destinations (nice to have)
- Add ratings to sort by
