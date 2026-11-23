import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import Wishlist from "./Wishlist.jsx";
import SaveButton from "./SaveButton.jsx";
import { STORAGE_KEY } from "../utils/savedStorage.js";

const toronto = { id: "toronto", name: "Toronto", country: "Canada", image: "toronto.jpg" };
const banff = { id: "banff", name: "Banff", country: "Canada", image: "banff.jpg" };

function saveInStorage(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}
// AI-assisted - see AI-USAGE.md #2
beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
});

describe("Wishlist", () => {
  it("shows the empty state when nothing is saved", () => {
    render(<Wishlist />);
    expect(screen.getByText(/No saved destinations yet/)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Browse destinations" })).toBeTruthy();
  });

  it("shows a card for each saved destination", () => {
    saveInStorage([toronto, banff]);
    render(<Wishlist />);
    expect(screen.getByText("Toronto, Canada")).toBeTruthy();
    expect(screen.getByText("Banff, Canada")).toBeTruthy();
  });

  it("removes a card and updates localStorage when Remove is clicked", () => {
    saveInStorage([toronto, banff]);
    render(<Wishlist />);

    fireEvent.click(screen.getAllByRole("button", { name: "Remove" })[0]);

    expect(screen.queryByText("Toronto, Canada")).toBeNull();
    expect(screen.getByText("Banff, Canada")).toBeTruthy();
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(stored.map((d) => d.id)).toEqual(["banff"]);
  });
});

describe("SaveButton", () => {
  it("toggles between Save and Saved and stores the destination", () => {
    render(<SaveButton destination={toronto} />);

    fireEvent.click(screen.getByRole("button", { name: "Save Toronto" }));
    expect(screen.getByText("♥ Saved")).toBeTruthy();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))[0].id).toBe("toronto");

    fireEvent.click(screen.getByRole("button", { name: "Remove Toronto from saved" }));
    expect(screen.getByText("♡ Save")).toBeTruthy();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toEqual([]);
  });
});