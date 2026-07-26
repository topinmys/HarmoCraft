import { describe, it, expect } from "vitest";
import {
  getNoteSuggestions,
  calculateBeats,
  getActiveChord,
} from "./musicTheory";

describe("musicTheory.js functions", () => {
  it("getNoteSuggestions should return correct tier1 and tier2 arrays for C Major", () => {
    const activeChord = "C";
    const keySignature = "C Major";

    const result = getNoteSuggestions(activeChord, keySignature);

    expect(result.tier1).toEqual(["C", "E", "G"]);
    expect(result.tier2).toEqual(["D", "F", "A", "B"]);
  });

  it("getNoteSuggestions should return empty arrays if no chord is active", () => {
    const result = getNoteSuggestions("-", "C Major");

    expect(result.tier1).toEqual([]);
    expect(result.tier2).toEqual([]);
  });
});

describe("calculateBeats function", () => {
  it("should correctly count standard quarter notes (1 beat each)", () => {
    expect(calculateBeats("C D E F")).toBe(4);
  });

  it("should correctly count eighth notes and half notes combined", () => {
    // Two eighth notes (0.5 + 0.5) and one half note (2) = 3 beats
    expect(calculateBeats("C/2 D/2 E2")).toBe(3);
  });

  it("should handle rests correctly", () => {
    // Quarter rest (1) + eighth rest (0.5) + half rest (2) = 3.5 beats
    expect(calculateBeats("z z/2 z2")).toBe(3.5);
  });

  it("should return 0 for an empty string", () => {
    expect(calculateBeats("")).toBe(0);
  });
});

describe("getActiveChord function", () => {
  const sampleProgression = ["C", "Am", "F", "G"];

  it("should return the first chord for beats 0 through 3.5", () => {
    expect(getActiveChord(0, sampleProgression)).toBe("C");
    expect(getActiveChord(3.5, sampleProgression)).toBe("C");
  });

  it("should transition to the second chord exactly on beat 4", () => {
    expect(getActiveChord(4, sampleProgression)).toBe("Am");
    expect(getActiveChord(7, sampleProgression)).toBe("Am");
  });

  it("should return null if the beats exceed the length of the progression", () => {
    // 4 chords * 4 beats each = 16 beats total. Beat 16 should be out of bounds.
    expect(getActiveChord(16, sampleProgression)).toBeNull();
  });
});
