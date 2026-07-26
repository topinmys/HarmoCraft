import React, { useState, useEffect } from "react";
import Piano from "./Piano";
import { noteFrequencies, abcMapper } from "./musicTheory";
import ABCJS from "abcjs";

const noteToMidi = {
  C3: 48,
  "C#3": 49,
  Db3: 49,
  D3: 50,
  "D#3": 51,
  Eb3: 51,
  E3: 52,
  F3: 53,
  "F#3": 54,
  Gb3: 54,
  G3: 55,
  "G#3": 56,
  Ab3: 56,
  A3: 57,
  "A#3": 58,
  Bb3: 58,
  B3: 59,

  C4: 60,
  "C#4": 61,
  Db4: 61,
  D4: 62,
  "D#4": 63,
  Eb4: 63,
  E4: 64,
  F4: 65,
  "F#4": 66,
  Gb4: 66,
  G4: 67,
  "G#4": 68,
  Ab4: 68,
  A4: 69,
  "A#4": 70,
  Bb4: 70,
  B4: 71,

  C5: 72,
  "C#5": 73,
  Db5: 73,
  D5: 74,
  "D#5": 75,
  Eb5: 75,
  E5: 76,
  F5: 77,
  "F#5": 78,
  Gb5: 78,
  G5: 79,
  "G#5": 80,
  Ab5: 80,
  A5: 81,
  "A#5": 82,
  Bb5: 82,
  B5: 83,

  C6: 84,
};

let globalAudioContext = null;

const playSynthNote = async (note) => {
  const midi = noteToMidi[note];
  if (!midi) {
    return;
  }

  if (!globalAudioContext) {
    globalAudioContext = new (
      window.AudioContext || window.webkitAudioContext
    )();
  }

  if (globalAudioContext.state === "suspended") {
    await globalAudioContext.resume();
  }

  ABCJS.synth.playEvent(
    [
      {
        pitch: midi,
        duration: 0.6,
        volume: 80,
        instrument: 0,
      },
    ],
    [],
    globalAudioContext.sampleRate,
  );
};

// standard chromatic scale array
const chromaticScale = [
  "C4",
  "C#4",
  "D4",
  "D#4",
  "E4",
  "F4",
  "F#4",
  "G4",
  "G#4",
  "A4",
  "A#4",
  "B4",
  "C5",
  "C#5",
  "D5",
  "D#5",
  "E5",
  "F5",
  "F#5",
  "G5",
  "G#5",
  "A5",
  "A#5",
  "B5",
  "C6",
];

const intervals = [
  { name: "Minor 2nd", steps: 1, hint: "1 semitone" },
  { name: "Major 2nd", steps: 2, hint: "2 semitones" },
  { name: "Minor 3rd", steps: 3, hint: "3 semitones" },
  { name: "Major 3rd", steps: 4, hint: "4 semitones" },
  { name: "Perfect 4th", steps: 5, hint: "5 semitones" },
  { name: "Tritone", steps: 6, hint: "6 semitones" },
  { name: "Perfect 5th", steps: 7, hint: "7 semitones" },
  { name: "Minor 6th", steps: 8, hint: "8 semitones" },
  { name: "Major 6th", steps: 9, hint: "9 semitones" },
  { name: "Minor 7th", steps: 10, hint: "10 semitones" },
  { name: "Major 7th", steps: 11, hint: "11 semitones" },
  { name: "Octave", steps: 12, hint: "12 semitones" },
];

export default function EarTraining({ setView }) {
  const [baseNote, setBaseNote] = useState("");
  const [targetNote, setTargetNote] = useState("");
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState(
    "Click 'Play New Interval' to start!",
  );
  const [isPlaying, setIsPlaying] = useState(false);

  // NEW: Preload the piano soundfont when the studio opens
  useEffect(() => {
    const initAudio = async () => {
      try {
        if (!globalAudioContext) {
          globalAudioContext = new (
            window.AudioContext || window.webkitAudioContext
          )();
        }
        await ABCJS.synth.supportsAudio();
        const synth = new ABCJS.synth.CreateSynth();

        // Create a tiny dummy sheet music object just to force the piano to load
        const dummyVisual = ABCJS.renderAbc("*", "X:1\nK:C\nC")[0];
        await synth.init({
          audioContext: globalAudioContext,
          visualObj: dummyVisual,
        });

        // Prime the audio engine so it's ready for instant playback
        await synth.prime();
      } catch (error) {
        console.error("Failed to preload piano:", error);
      }
    };
    initAudio();
  }, []);

  // function for the cheat sheet buttons
  const playReference = (steps) => {
    if (isPlaying) return;
    setIsPlaying(true);

    const anchorIndex = chromaticScale.indexOf("C4");
    const target = chromaticScale[anchorIndex + steps];

    playSynthNote("C4");

    setTimeout(() => {
      playSynthNote(target);
      setIsPlaying(false);
    }, 600);
  };

  // generates a brand new random puzzle
  const generateNewPuzzle = () => {
    if (isPlaying) return;

    // pick a random base note from the lower half of the scale
    const randomBaseIndex = Math.floor(Math.random() * 12);
    // pick a random interval jump (1 to 12 steps)
    const randomInterval = Math.floor(Math.random() * 12) + 1;

    const newBase = chromaticScale[randomBaseIndex];
    const newTarget = chromaticScale[randomBaseIndex + randomInterval];

    setBaseNote(newBase);
    setTargetNote(newTarget);

    setFeedback(`Base note is ${newBase}. Find the second note!`);

    playPuzzle(newBase, newTarget);
  };

  // plays the actual puzzle audio
  const playPuzzle = (base, target) => {
    setIsPlaying(true);
    playSynthNote(base);

    setTimeout(() => {
      playSynthNote(target);
      setIsPlaying(false);
    }, 600);
  };

  // replays the current puzzle if they need to hear it again
  const handleReplay = () => {
    if (!baseNote || isPlaying) return;
    playPuzzle(baseNote, targetNote);
  };

  // evaluates the user's piano click
  const handleKeyClick = (note) => {
    // block clicks if the sound is currently playing or game hasn't started
    if (isPlaying || !targetNote) return;

    playSynthNote(note);

    if (note === targetNote) {
      // calculate the interval name based on the step distance
      const distance =
        chromaticScale.indexOf(targetNote) - chromaticScale.indexOf(baseNote);
      const intervalData = intervals.find((i) => i.steps === distance);
      const intervalName = intervalData ? intervalData.name : "Interval";

      // display the success message with the interval reveal
      setFeedback(`🎉 Correct! It was a ${intervalName}. Next in 1s...`);
      setStreak((prev) => prev + 1);

      // auto-start next puzzle after a short delay
      setTimeout(() => {
        generateNewPuzzle();
      }, 1200);
    } else {
      setFeedback(`❌ Oops, that was ${note}. Try again!`);
      setStreak(0);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        boxSizing: "border-box",
        padding: "10px 40px",
        overflowX: "hidden",
      }}
    >
      <div style={{ width: "100%", maxWidth: "1400px", margin: "0 auto" }}>
        {/* header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "15px",
          }}
        >
          <h1 style={{ margin: 0, color: "#2d3748", fontSize: "24px" }}>
            🎧 Ear Training Studio
          </h1>
          <button
            onClick={() => setView("home")}
            className="secondary-btn"
            style={{
              padding: "6px 14px",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            ← Back to Home
          </button>
        </div>

        <div
          style={{
            display: "flex",
            gap: "30px",
            justifyContent: "space-between",
            alignItems: "flex-start",
            width: "100%",
          }}
        >
          {/* left column: audible cheat sheet */}
          <div
            style={{
              flex: "0 0 280px",
              background: "#f7fafc",
              padding: "15px",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              boxSizing: "border-box",
            }}
          >
            <h2
              style={{
                fontSize: "16px",
                marginTop: 0,
                color: "#2d3748",
                borderBottom: "2px solid #cbd5e0",
                paddingBottom: "8px",
              }}
            >
              Interval Reference
            </h2>
            <p
              style={{
                fontSize: "12px",
                color: "#718096",
                marginBottom: "12px",
                marginTop: "8px",
              }}
            >
              Click to hear the interval base distance.
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                maxHeight: "450px",
                overflowY: "auto",
                paddingRight: "5px",
              }}
            >
              {intervals.map((interval) => (
                <button
                  key={interval.name}
                  onClick={() => playReference(interval.steps)}
                  disabled={isPlaying}
                  style={{
                    padding: "8px 10px",
                    textAlign: "left",
                    background: "#fff",
                    border: "1px solid #cbd5e0",
                    borderRadius: "6px",
                    cursor: isPlaying ? "not-allowed" : "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    transition: "all 0.2s",
                  }}
                >
                  <span
                    style={{
                      fontWeight: "bold",
                      color: "#4a5568",
                      fontSize: "12px",
                    }}
                  >
                    {interval.name}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#a0aec0",
                      textAlign: "right",
                    }}
                  >
                    {interval.hint}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* right column: the game */}
          <div
            style={{
              flex: "1",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              minWidth: 0,
            }}
          >
            {/* scoreboard & controls */}
            <div
              style={{
                width: "100%",
                background: "#fff",
                padding: "15px",
                borderRadius: "10px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                marginBottom: "20px",
                textAlign: "center",
                boxSizing: "border-box",
              }}
            >
              <h2
                style={{
                  fontSize: "20px",
                  margin: "0 0 5px 0",
                  color: "#2b6cb0",
                }}
              >
                Current Streak: 🔥 {streak}
              </h2>
              <p
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: feedback.includes("❌") ? "#e53e3e" : "#48bb78",
                  minHeight: "24px",
                  margin: "5px 0",
                }}
              >
                {feedback}
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "15px",
                  marginTop: "10px",
                }}
              >
                <button
                  onClick={generateNewPuzzle}
                  disabled={isPlaying}
                  className="primary-btn"
                  style={{
                    padding: "10px 20px",
                    fontSize: "14px",
                    borderRadius: "8px",
                    cursor: isPlaying ? "not-allowed" : "pointer",
                    fontWeight: "bold",
                  }}
                >
                  ▶ Play New Interval
                </button>

                <button
                  onClick={handleReplay}
                  disabled={!baseNote || isPlaying}
                  className="btn-neutral"
                  style={{
                    padding: "10px 20px",
                    fontSize: "14px",
                    borderRadius: "8px",
                    cursor: !baseNote || isPlaying ? "not-allowed" : "pointer",
                    fontWeight: "bold",
                  }}
                >
                  🔄 Replay Sound
                </button>
              </div>
            </div>

            {/* piano component*/}
            <div
              style={{
                width: "100%",
                overflow: "hidden",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  transform: "scale(0.75)",
                  transformOrigin: "top center",
                  whiteSpace: "nowrap",
                }}
              >
                <Piano handleKeyClick={handleKeyClick} activeNote={baseNote} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
