import React, { useState } from "react";
import SheetMusic from "./SheetMusic";

// frequency (in hertz)
const noteFrequencies = {
  C3: 130.81,
  "C#3": 138.59,
  D3: 146.83,
  "D#3": 155.56,
  E3: 164.81,
  F3: 174.61,
  "F#3": 185.0,
  G3: 196.0,
  "G#3": 207.65,
  A3: 220.0,
  "A#3": 233.08,
  B3: 246.94,
  C4: 261.63,
  "C#4": 277.18,
  D4: 293.66,
  "D#4": 311.13,
  E4: 329.63,
  F4: 349.23,
  "F#4": 369.99,
  G4: 392.0,
  "G#4": 415.3,
  A4: 440.0,
  "A#4": 466.16,
  B4: 493.88,
  C5: 523.25,
  "C#5": 554.37,
  D5: 587.33,
  "D#5": 622.25,
  E5: 659.25,
  F5: 698.46,
  "F#5": 739.99,
  G5: 783.99,
  "G#5": 830.61,
  A5: 880.0,
  "A#5": 932.33,
  B5: 987.77,
  C6: 1046.5,
};

// abc notation translator
const abcMapper = {
  C3: "C,",
  "C#3": "^C,",
  D3: "D,",
  "D#3": "^D,",
  E3: "E,",
  F3: "F,",
  "F#3": "^F,",
  G3: "G,",
  "G#3": "^G,",
  A3: "A,",
  "A#3": "^A,",
  B3: "B,",
  C4: "C",
  "C#4": "^C",
  D4: "D",
  "D#4": "^D",
  E4: "E",
  F4: "F",
  "F#4": "^F",
  G4: "G",
  "G#4": "^G",
  A4: "A",
  "A#4": "^A",
  B4: "B",
  C5: "c",
  "C#5": "^c",
  D5: "d",
  "D#5": "^d",
  E5: "e",
  F5: "f",
  "F#5": "^f",
  G5: "g",
  "G#5": "^g",
  A5: "a",
  "A#5": "^a",
  B5: "b",
  C6: "c'",
};

// synthesizer
const playSynthNote = (noteName) => {
  const frequency = noteFrequencies[noteName];
  if (!frequency) return;

  // initialize the browser's audio engine
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  // create an oscillator
  const oscillator = audioCtx.createOscillator();
  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);

  // create a gain node (the volume knob)
  const gainNode = audioCtx.createGain();

  // start at full volume, then quickly fade out over 1.5 seconds
  gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.5);

  // connect the wires: Oscillator -> Volume -> Speakers
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  // play the note and stop
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 1.5);
};

export default function Workspace({ setView }) {
  const [activeNote, setActiveNote] = useState("None");
  const [melodyString, setMelodyString] = useState("");

  const whiteKeys = [
    "C3",
    "D3",
    "E3",
    "F3",
    "G3",
    "A3",
    "B3",
    "C4",
    "D4",
    "E4",
    "F4",
    "G4",
    "A4",
    "B4",
    "C5",
    "D5",
    "E5",
    "F5",
    "G5",
    "A5",
    "B5",
    "C6",
  ];

  const blackKeys = [
    // Octave 3
    { name: "C#3", position: 1 },
    { name: "D#3", position: 2 },
    { name: "F#3", position: 4 },
    { name: "G#3", position: 5 },
    { name: "A#3", position: 6 },
    // Octave 4
    { name: "C#4", position: 8 },
    { name: "D#4", position: 9 },
    { name: "F#4", position: 11 },
    { name: "G#4", position: 12 },
    { name: "A#4", position: 13 },
    // Octave 5
    { name: "C#5", position: 15 },
    { name: "D#5", position: 16 },
    { name: "F#5", position: 18 },
    { name: "G#5", position: 19 },
    { name: "A#5", position: 20 },
  ];

  // function to handle key clicks
  const handleKeyClick = (note) => {
    setActiveNote(note);
    playSynthNote(note);
    setMelodyString((prev) => {
      // count how many actual notes we have
      const currentNotes = prev
        .split(" ")
        .filter((n) => n !== "" && n !== "|" && n !== "\n");
      const noteCount = currentNotes.length;

      let newAddition = abcMapper[note] + " ";

      // add a measure bar every 4 notes
      if ((noteCount + 1) % 4 === 0) {
        newAddition += "| ";
      }

      // force a new staff line below every 16 notes
      if ((noteCount + 1) % 16 === 0) {
        newAddition += "\n";
      }

      return prev + newAddition;
    });
  };

  // function to handle undoing the last note
  const handleUndo = () => {
    setMelodyString((prev) => {
      const arr = prev.trim().split(" ");
      if (arr.length === 0 || arr[0] === "") return "";

      // if the last thing we added was a measure bar or new line, delete it first
      if (arr[arr.length - 1] === "|" || arr[arr.length - 1] === "\n") {
        arr.pop();
      }

      // delete the actual note
      arr.pop();
      return arr.length > 0 ? arr.join(" ") + " " : "";
    });
  };

  // function to reset the entire composition
  const handleReset = () => {
    setMelodyString("");
    setActiveNote("None");
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1126px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          marginBottom: "30px",
        }}
      >
        <h1 style={{ margin: 0 }}>🎹 HarmoCraft Workspace</h1>

        <button onClick={() => setView("home")} className="secondary-btn">
          ← Back to Home
        </button>
      </div>
      <div
        className="status-panel"
        style={{ display: "flex", gap: "15px", alignItems: "center" }}
      >
        <h3 style={{ margin: 0, marginRight: "10px" }}>
          Last Note: <span className="note-display">{activeNote}</span>
        </h3>

        <button
          onClick={handleUndo}
          style={{
            padding: "8px 16px",
            background: "#e53e3e",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          ↩ Undo
        </button>

        <button
          onClick={handleReset}
          style={{
            padding: "8px 16px",
            background: "#718096",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          🗑️ Reset
        </button>
      </div>
      <SheetMusic melody={melodyString} />
      <div className="piano-container">
        <div className="piano-keyboard">
          {whiteKeys.map((note) => (
            <button
              key={note}
              className="white-key"
              onClick={() => handleKeyClick(note)}
            >
              <span className="key-label">{note}</span>
            </button>
          ))}

          {blackKeys.map((key) => (
            <button
              key={key.name}
              className="black-key"
              style={{ left: `${key.position * 50 - 15}px` }}
              onClick={() => handleKeyClick(key.name)}
            >
              <span className="key-label black-label">{key.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
