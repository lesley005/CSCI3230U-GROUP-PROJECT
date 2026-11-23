// AI-assisted (Claude) - see AI-USAGE.md
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  STORAGE_KEY,
  loadSaved,
  writeSaved,
  isInList,
  toggleInList,
  removeFromList,
  toSnapshot,
} from "../src/utils/savedStorage.js";

// A fake localStorage so tests run in Node without a browser
function fakeStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => { data[key] = String(value); },
    data,
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

test("loadSaved returns [] when nothing is saved", () => {
  assert.deepEqual(loadSaved(fakeStorage()), []);
});

test("loadSaved returns [] when the stored data is broken", () => {
  assert.deepEqual(loadSaved(fakeStorage({ [STORAGE_KEY]: "not json{" })), []);
  assert.deepEqual(loadSaved(fakeStorage({ [STORAGE_KEY]: '{"a":1}' })), []);
});

test("writeSaved then loadSaved gives back the same list (persistence)", () => {
  const storage = fakeStorage();
  const list = [toSnapshot(toronto)];
  writeSaved(list, storage);
  assert.deepEqual(loadSaved(storage), list);
});

test("toggleInList saves a destination that isn't saved", () => {
  const result = toggleInList([], toronto);
  assert.equal(result.length, 1);
  assert.ok(isInList(result, "toronto"));
});

test("toggleInList unsaves a destination that is already saved", () => {
  const once = toggleInList([], toronto);
  const twice = toggleInList(once, toronto);
  assert.deepEqual(twice, []);
});

test("toggleInList does not change the original array", () => {
  const original = [];
  toggleInList(original, toronto);
  assert.deepEqual(original, []);
});

test("toSnapshot keeps only the fields the wishlist needs", () => {
  const snap = toSnapshot(toronto);
  assert.equal(snap.name, "Toronto");
  assert.equal("description" in snap, false);
});

test("removeFromList removes only the matching id", () => {
  const list = [toSnapshot(toronto), toSnapshot(banff)];
  const result = removeFromList(list, "toronto");
  assert.deepEqual(result.map((d) => d.id), ["banff"]);
});