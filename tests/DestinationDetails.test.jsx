
import { afterEach, describe, expect, it } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import DestinationDetails from "../src/components/DestinationDetails.jsx";

afterEach(() => {
  cleanup();
});

const testDestination = {
  id: "banff",
  name: "Banff",
  description: "Banff is a mountain town in Alberta.",
  activities: [
    { id: "gondola", name: "Banff Gondola" }
  ],
  restaurants: [
    {
      id: "restaurant-1",
      name: "Sample Restaurant",
      cuisine: null,
      rating: null
    }
  ]
};

describe("DestinationDetails", () => {
  it("shows the destination name and description", () => {
    render(<DestinationDetails destination={testDestination} />);

    expect(screen.getByText("About Banff")).toBeTruthy();
    expect(
      screen.getByText("Banff is a mountain town in Alberta.")
    ).toBeTruthy();
  });

  it("shows activities and restaurants", () => {
    render(<DestinationDetails destination={testDestination} />);

    expect(screen.getByText("Banff Gondola")).toBeTruthy();
    expect(screen.getByText("Sample Restaurant")).toBeTruthy();
  });

  it("shows more information when clicked", () => {
    render(<DestinationDetails destination={testDestination} />);

    const button = screen.getByRole("button", { name: "Show More" });

    fireEvent.click(button);

    expect(
      screen.getByRole("button", { name: "Show Less" })
    ).toBeTruthy();
  });

  it("shows an error for an unknown destination", () => {
    render(<DestinationDetails destination={undefined} />);

    expect(screen.getByText("Error 404")).toBeTruthy();
    expect(screen.getByText("Unknown destination")).toBeTruthy();
  });

  it("handles empty activities and restaurants", () => {
    const emptyDestination = {
      ...testDestination,
      activities: [],
      restaurants: []
    };

    render(<DestinationDetails destination={emptyDestination} />);

    expect(
      screen.getByText("No activities available yet.")
    ).toBeTruthy();

    expect(
      screen.getByText("No restaurants available yet.")
    ).toBeTruthy();
  });
});
