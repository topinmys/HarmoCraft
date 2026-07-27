import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Toolbar from "./Toolbar";

describe("Toolbar Component", () => {
  it("should correctly display the active chord and active note", () => {
    // pass in fake data to see if it renders
    render(
      <Toolbar
        activeChord="Am"
        activeNote="C4"
        activeDuration="Crotchet"
        setActiveDuration={vi.fn()}
      />,
    );

    expect(screen.getByText("Am")).toBeInTheDocument();
    expect(screen.getByText("C4")).toBeInTheDocument();
  });

  it("should call handleUndo when the Undo button is clicked", () => {
    const mockUndo = vi.fn();

    render(<Toolbar activeDuration="Crotchet" handleUndo={mockUndo} />);

    // find the button by its exact text and click it
    fireEvent.click(screen.getByText("↩ Undo"));

    expect(mockUndo).toHaveBeenCalled();
  });

  it("should update duration when a duration button is clicked", () => {
    const mockSetDuration = vi.fn();

    render(
      <Toolbar activeDuration="Crotchet" setActiveDuration={mockSetDuration} />,
    );

    // click the Minim button
    fireEvent.click(screen.getByText("𝅗𝅥 (2)"));

    // check if it told the parent component to switch to Minim
    expect(mockSetDuration).toHaveBeenCalledWith("Minim");
  });
});
