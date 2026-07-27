import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "./Login";
import { supabase } from "./supabase_client";

// mock supabase
vi.mock("./supabase_client", () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
    },
  },
}));

describe("Login Component", () => {
  it("should display an error message if Supabase login fails", async () => {
    // return an error when called
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: null,
      error: { message: "Invalid login credentials" },
    });

    render(<Login onLoginSuccess={vi.fn()} />);

    // type into the inputs and click submit
    fireEvent.change(screen.getByPlaceholderText("you@u.nus.edu"), {
      target: { value: "test@nus.edu" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "wrongpassword" },
    });

    // use getByRole to target the specific submit button
    fireEvent.click(screen.getByRole("button", { name: "Log In" }));

    await waitFor(() => {
      expect(screen.getByText("Invalid login credentials")).toBeInTheDocument();
    });
  });
});
