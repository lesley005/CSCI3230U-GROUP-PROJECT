// AI-assisted - see AI-USAGE.md #1
// Plain functions for reading/writing saved destinations in localStorage.
// Kept separate from React so they can be tested with `npm test` (node --test).

export const STORAGE_KEY = "savedDestinations";

// Only keeping the fields the wishlist needs, so API destinations work too
export function toSnapshot(destination) {
  const snapshot = {};
  for (const key of ["id", "name", "country", "image", "imageCredit", "page"]) {
    if (destination[key] !== undefined) snapshot[key] = destination[key];
  }
  return snapshot;
}

// Read the saved list. Returns [] if nothing is saved or the data is broken.
export function loadSaved(storage = globalThis.localStorage) {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeSaved(list, storage = globalThis.localStorage) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Storage full or blocked (e.g. private mode): the app still works, just won't persist
  }
}

export function isInList(list, id) {
  return list.some((item) => item.id === id);
}

// Save if not saved, unsave if already saved. Returns a NEW array.
export function toggleInList(list, destination) {
  return isInList(list, destination.id)
    ? removeFromList(list, destination.id)
    : [...list, toSnapshot(destination)];
}

export function removeFromList(list, id) {
  return list.filter((item) => item.id !== id);
}