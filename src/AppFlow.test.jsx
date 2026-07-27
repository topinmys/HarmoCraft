import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Home from "./Home";
import Login from "./Login";
import Workspace from "./Workspace";
import { supabase } from "./supabase_client";

// mock supabase
vi.mock("./supabase_client", () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 1,
              melody: "",
              melody_name: "HarmoCraft Sandbox",
              key_signature: "C Major",
              progression_style: "Pop",
            },
            error: null,
          }),
        }),
      }),
    }),
  },
}));

// mock abcjs
vi.mock("abcjs", () => {
  class MockSynth {
    init = vi.fn().mockResolvedValue(true);
    prime = vi.fn().mockResolvedValue(true);
    stop = vi.fn();
    start = vi.fn();
  }

  return {
    default: {
      renderAbc: vi.fn().mockReturnValue([{}]),
      synth: {
        supportsAudio: vi.fn().mockResolvedValue(true),
        CreateSynth: MockSynth,
        playEvent: vi.fn(),
      },
      TimingCallbacks: vi.fn().mockImplementation(() => ({
        start: vi.fn(),
        stop: vi.fn(),
      })),
    },
  };
});

class MockAudioContext {
  constructor() {
    this.state = "running";
    this.sampleRate = 44100;
    this.resume = vi.fn().mockResolvedValue(true);
  }
}

describe("HarmoCraft Extended Test Suite", () => {
  // automatically apply the mock AudioContext before every test runs
  beforeEach(() => {
    window.AudioContext = MockAudioContext;
    window.webkitAudioContext = MockAudioContext;
  });

  describe("Home.jsx (Extra Coverage)", () => {
    it("should navigate to profile view when profile button is clicked", () => {
      const mockSetView = vi.fn();
      render(<Home setView={mockSetView} onLogout={vi.fn()} />);

      fireEvent.click(screen.getByText("👤 View Profile"));
      expect(mockSetView).toHaveBeenCalledWith("profile");
    });

    it("should navigate to ear training studio when studio button is clicked", () => {
      const mockSetView = vi.fn();
      render(<Home setView={mockSetView} onLogout={vi.fn()} />);

      fireEvent.click(screen.getByText("Enter Studio"));
      expect(mockSetView).toHaveBeenCalledWith("ear-training");
    });
  });

  describe("Login.jsx (Successful Login & Sign Up Toggle)", () => {
    it("should successfully log in and call onLoginSuccess", async () => {
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: "123" } },
        error: null,
      });

      const mockSuccess = vi.fn();
      render(<Login onLoginSuccess={mockSuccess} />);

      fireEvent.change(screen.getByPlaceholderText("you@u.nus.edu"), {
        target: { value: "user@nus.edu" },
      });
      fireEvent.change(screen.getByPlaceholderText("••••••••"), {
        target: { value: "correctpassword" },
      });

      fireEvent.click(screen.getByRole("button", { name: "Log In" }));

      await waitFor(() => {
        expect(mockSuccess).toHaveBeenCalled();
      });
    });

    it("should toggle to sign-up mode when create account is clicked", () => {
      render(<Login onLoginSuccess={vi.fn()} />);

      fireEvent.click(screen.getByText("Create New Account"));

      expect(screen.getByText("Confirm Password")).toBeInTheDocument();
    });
  });

  describe("Workspace.jsx (Core Component Test)", () => {
    it("should render the workspace title and chord progression box", async () => {
      const mockUser = { id: "123", email: "test@nus.edu" };

      render(
        <Workspace
          setView={vi.fn()}
          user={mockUser}
          setCurrentProject={vi.fn()}
          currentProject={null}
        />,
      );

      expect(screen.getByText("🎹 HarmoCraft Workspace")).toBeInTheDocument();
      expect(
        screen.getByText("GENERATED CHORDS (64 BEATS)"),
      ).toBeInTheDocument();
    });
  });
});
