import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Home from "./Home";

describe("Home Component", () => {
  it("should render the welcome message", () => {
    // render the component with dummy functions for the props
    render(<Home setView={vi.fn()} onLogout={vi.fn()} />);

    // check if specific text is visible on the screen
    expect(screen.getByText("Welcome to HarmoCraft")).toBeInTheDocument();
    expect(screen.getByText("Piano Workspace")).toBeInTheDocument();
  });

  it('should navigate to the workspace when "Enter Workspace" is clicked', () => {
    //  watch if setView gets called
    const mockSetView = vi.fn();

    render(<Home setView={mockSetView} onLogout={vi.fn()} />);

    // find the button and simulate a user clicking it
    const workspaceBtn = screen.getByText("Enter Workspace");
    fireEvent.click(workspaceBtn);

    expect(mockSetView).toHaveBeenCalledWith("workspace");
  });

  it('should trigger logout when "Log Out" is clicked', () => {
    const mockLogout = vi.fn();
    render(<Home setView={vi.fn()} onLogout={mockLogout} />);

    fireEvent.click(screen.getByText("Log Out"));

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
