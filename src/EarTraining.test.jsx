import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import EarTraining from "./EarTraining";

// mock abcjs
vi.mock("abcjs", () => {
  return {
    default: {
      synth: {
        supportsAudio: vi.fn().mockResolvedValue(true),
        CreateSynth: vi.fn().mockImplementation(() => ({
          init: vi.fn().mockResolvedValue(true),
          prime: vi.fn().mockResolvedValue(true),
        })),
        playEvent: vi.fn(), // We just need it to fail silently!
      },
      renderAbc: vi.fn().mockReturnValue([{}]),
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

describe("EarTraining Component", () => {
  // mock browser
  beforeEach(() => {
    window.AudioContext = MockAudioContext;
    window.webkitAudioContext = MockAudioContext;
  });

  it("should change feedback text when starting a new game", () => {
    render(<EarTraining setView={vi.fn()} />);

    // verify the starting state
    expect(
      screen.getByText("Click 'Play New Interval' to start!"),
    ).toBeInTheDocument();

    // click the play button
    const playBtn = screen.getByText("▶ Play New Interval");
    fireEvent.click(playBtn);

    // starting text should disappear
    expect(
      screen.queryByText("Click 'Play New Interval' to start!"),
    ).not.toBeInTheDocument();

    // be replaced by the dynamic Base Note text
    expect(screen.getByText(/Base note is/)).toBeInTheDocument();
  });
});
