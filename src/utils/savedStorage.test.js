// AI-assisted - see AI-USAGE.md #2
import { describe, it, expect } from "vitest";
import {
  STORAGE_KEY,
  loadSaved,
  writeSaved,
  isInList,
  toggleInList,
  removeFromList,
  toSnapshot,
} from "./savedStorage.js";

// A fake localStorage so these tests don't depend on the browser's real one
function fakeStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => { data[key] = String(value); },
  };
}

const toronto = {
  id: "toronto",
  name: "Toronto",
  country: "Canada",
  image: "toronto.jpg",
  description: "not needed in the wishlist",
};
const banff = { id: "banff", name: "Banff", country: "Canada", image: "banff.jpg" };

describe("savedStorage", () => {
  it("returns [] when nothing is saved", () => {
    expect(loadSaved(fakeStorage())).toEqual([]);
  });

  it("returns [] when the stored data is broken", () => {
    expect(loadSaved(fakeStorage({ [STORAGE_KEY]: "not json{" }))).toEqual([]);
    expect(loadSaved(fakeStorage({ [STORAGE_KEY]: '{"a":1}' }))).toEqual([]);
  });

  it("gives back the same list after writing it (persistence)", () => {
    const storage = fakeStorage();
    const list = [toSnapshot(toronto)];
    writeSaved(list, storage);
    expect(loadSaved(storage)).toEqual(list);
  });

  it("toggle saves a destination that isn't saved", () => {
    const result = toggleInList([], toronto);
    expect(result).toHaveLength(1);
    expect(isInList(result, "toronto")).toBe(true);
  });

  it("toggle unsaves a destination that is already saved", () => {
    expect(toggleInList(toggleInList([], toronto), toronto)).toEqual([]);
  });

  it("toggle does not change the original array", () => {
    const original = [];
    toggleInList(original, toronto);
    expect(original).toEqual([]);
  });

  it("snapshot keeps only the fields the wishlist needs", () => {
    const snap = toSnapshot(toronto);
    expect(snap.name).toBe("Toronto");
    expect(snap).not.toHaveProperty("description");
  });

  it("remove deletes only the matching id", () => {
    const list = [toSnapshot(toronto), toSnapshot(banff)];
    expect(removeFromList(list, "toronto").map((d) => d.id)).toEqual(["banff"]);
  });
});
