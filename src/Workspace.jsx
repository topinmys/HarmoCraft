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

// 16 bars progression logic (64 beats total)
const chordProgressions = {
  "C Major": {
    // a massive pop journey: verse -> pre-chorus -> huge chorus -> resolution
    Pop: [
      "C",
      "G",
      "Am",
      "F",
      "C",
      "G",
      "F",
      "C",
      "Am",
      "F",
      "C",
      "G",
      "Dm",
      "F",
      "G",
      "C",
    ],
    // deep melancholy that shifts around before settling back into the minor key
    Melancholy: [
      "Am",
      "F",
      "C",
      "G",
      "Am",
      "Em",
      "F",
      "G",
      "Am",
      "F",
      "C",
      "G",
      "Dm",
      "Am",
      "Em",
      "Am",
    ],
    // a smooth, wandering R&B progression that ends on a classic turnaround
    "Jazz / R&B": [
      "Dm",
      "G",
      "C",
      "Am",
      "Dm",
      "G",
      "C",
      "Am",
      "F",
      "G",
      "Em",
      "Am",
      "Dm",
      "G",
      "C",
      "C",
    ],
  },
  "G Major": {
    Pop: [
      "G",
      "D",
      "Em",
      "C",
      "G",
      "D",
      "C",
      "G",
      "Em",
      "C",
      "G",
      "D",
      "Am",
      "C",
      "D",
      "G",
    ],
    Melancholy: [
      "Em",
      "C",
      "G",
      "D",
      "Em",
      "Bm",
      "C",
      "D",
      "Em",
      "C",
      "G",
      "D",
      "Am",
      "Em",
      "Bm",
      "Em",
    ],
    "Jazz / R&B": [
      "Am",
      "D",
      "G",
      "Em",
      "Am",
      "D",
      "G",
      "Em",
      "C",
      "D",
      "Bm",
      "Em",
      "Am",
      "D",
      "G",
      "G",
    ],
  },
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
  const [selectedKey, setSelectedKey] = useState("C Major");
  const [selectedStyle, setSelectedStyle] = useState("Pop");
  const [activeDuration, setActiveDuration] = useState("Crotchet");
  const [warningMessage, setWarningMessage] = useState("");

  const currentChords = chordProgressions[selectedKey][selectedStyle];

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
    const translated = abcMapper[note];
    if (!translated) return;

    // do math before updating the sheet music
    const currentBeats = calculateBeats(melodyString);
    const durationValue =
      activeDuration === "Quaver" ? 0.5 : activeDuration === "Minim" ? 2 : 1;

    // overflow guard
    // calculate beats currently inside this specific 4-beat measure
    const currentMeasureBeats = currentBeats % 4;

    // if note overflows the measure, block the click
    if (currentMeasureBeats + durationValue > 4) {
      setWarningMessage(
        `⚠️ Not enough space! A ${activeDuration} (${durationValue} beats) doesn't fit here.`,
      );
      return;
    }

    // block if they exceed the 64 beat song limit
    if (currentBeats + durationValue > 64) {
      setWarningMessage(
        "⚠️ Song is full! (64 beats max). Time to save your masterpiece.",
      );
      return;
    }

    // if valid, clear any previous warning messages, play sound and update state
    setWarningMessage("");
    setActiveNote(note);
    playSynthNote(note);
    setMelodyString((prev) => {
      const prevBeats = calculateBeats(prev);
      const modifier = getDurationModifier();

      // add the duration modifier to the note (e.g. C -> C/2 for quaver)
      let newAddition = translated + modifier;

      // proper music theory beaming: connect quavers in pairs to form 1 beat
      if (activeDuration === "Quaver" && currentBeats % 1 === 0) {
        // first quaver of the beat: no space, so the next note connects
      } else {
        // end of a beat, or its a larger note: add a space to break the beam
        newAddition += " ";
      }

      // barline and measure math
      const totalBeats = currentBeats + durationValue;
      // add a measure bar every 4 beats
      if (totalBeats % 4 === 0) {
        newAddition += "| ";
      }

      // force a new staff line below every 16 beats
      if (totalBeats % 16 === 0) {
        newAddition += "\n";
      }

      return prev + newAddition;
    });
  };

  const handleRest = () => {
    const currentBeats = calculateBeats(melodyString);
    const durationValue =
      activeDuration === "Quaver" ? 0.5 : activeDuration === "Minim" ? 2 : 1;

    // overflow guard for rests
    const currentMeasureBeats = currentBeats % 4;
    if (currentMeasureBeats + durationValue > 4) {
      setWarningMessage(
        `⚠️ Not enough space! A ${activeDuration} rest doesn't fit here.`,
      );
      return;
    }
    if (currentBeats + durationValue > 64) {
      setWarningMessage("⚠️ Song is full! (64 beats max).");
      return;
    }

    setWarningMessage("");
    setActiveNote("Rest");
    setMelodyString((prev) => {
      const prevBeats = calculateBeats(prev);
      const modifier = getDurationModifier();

      let newAddition = "z" + modifier + " "; // rests always get spaces

      const totalBeats = currentBeats + durationValue;
      if (totalBeats % 4 === 0) newAddition += "| ";
      if (totalBeats % 16 === 0) newAddition += "\n";

      return prev + newAddition;
    });
  };

  // function to handle undoing the last note
  const handleUndo = () => {
    setWarningMessage("");
    setMelodyString((prev) => {
      // safely removes the last note or rest, even if it's connected/beamed
      return prev.replace(/[\^_=]?[a-zA-Zz][,'0-9]*(\/[0-9]+)?[\s|\n]*$/, "");
    });
  };

  // function to reset the entire composition
  const handleReset = () => {
    setMelodyString("");
    setActiveNote("None");
  };

  // function to translate our duration into ABC notation
  const getDurationModifier = () => {
    if (activeDuration === "Quaver") return "/2";
    if (activeDuration === "Minim") return "2";
    return "";
  };

  // counts true musical beats instead of just clicks
  const calculateBeats = (abcString) => {
    // Matches all notes/rests including accidentals (^C) and durations (C2, z/2)
    const tokens =
      abcString.match(/[\^_=]?[a-zA-Zz][,'0-9]*(\/[0-9]+)?/g) || [];
    let beats = 0;
    tokens.forEach((token) => {
      if (token.includes("/2")) beats += 0.5;
      else if (token.includes("2")) beats += 2;
      else beats += 1;
    });
    return beats;
  };

  // if string isn't empty, they have started composing
  const hasStartedComposing = melodyString.trim().length > 0;

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
          marginBottom: "15px",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "24px" }}>🎹 HarmoCraft Workspace</h1>

        <button
          style={{ fontSize: "14px", padding: "6px 12px" }}
          onClick={() => setView("home")}
          className="secondary-btn"
        >
          ← Back to Home
        </button>
      </div>
      {/* chord setup control panel */}
      <div className="control-panel">
        <div className="control-group-wrapper">
          {/* key signature dropdown */}
          <div className="control-input-group">
            <label className="control-label">Key Signature</label>
            <select
              value={selectedKey}
              onChange={(e) => setSelectedKey(e.target.value)}
              className="control-select"
              disabled={hasStartedComposing}
            >
              <option value="C Major">C Major (Easy)</option>
              <option value="G Major">G Major (1 Sharp)</option>
            </select>
          </div>

          {/* progression style dropdown */}
          <div className="control-input-group">
            <label className="control-label">
              Progression Style
              {hasStartedComposing && (
                <span
                  style={{
                    color: "#e53e3e",
                    marginLeft: "5px",
                    textTransform: "none",
                    fontSize: "10px",
                  }}
                >
                  (Locked)
                </span>
              )}
            </label>{" "}
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="control-select"
              disabled={hasStartedComposing}
            >
              <option value="Pop">Pop (Upbeat)</option>
              <option value="Melancholy">Melancholy (Sad)</option>
              <option value="Jazz / R&B">Jazz / R&B (Smooth)</option>
            </select>
          </div>
        </div>

        {/* dynamic chord display */}
        <div
          className="chord-display-box"
          style={{ maxWidth: "none", padding: "10px 40px" }}
        >
          <span className="chord-display-label">
            GENERATED CHORDS (64 BEATS)
          </span>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              marginTop: "8px",
            }}
          >
            <span className="chord-display-text">
              {currentChords.slice(0, 8).join(" - ")}
            </span>
            <span className="chord-display-text">
              {currentChords.slice(8, 16).join(" - ")}
            </span>
          </div>
        </div>
      </div>
      <SheetMusic melody={melodyString} selectedKey={selectedKey} />
      {/* --- MASTER COMMAND CENTER --- */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "10px",
          background: "#f7f9fa",
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #e2e8f0",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "6px 12px",
            borderRadius: "6px",
            border: "1px solid #cbd5e0",
            fontWeight: "bold",
            color: "#4a5568",
            minWidth: "80px",
            textAlign: "center",
            fontSize: "14px",
          }}
        >
          Note:{" "}
          <span style={{ color: "#007acc" }}>
            {activeNote === "Rest" ? "Rest" : activeNote || "-"}
          </span>
        </div>

        <div
          style={{
            width: "2px",
            height: "24px",
            background: "#cbd5e0",
            margin: "0 5px",
          }}
        ></div>
        {/* Note Durations */}
        {["Quaver", "Crotchet", "Minim"].map((duration) => (
          <button
            key={duration}
            onClick={() => setActiveDuration(duration)}
            style={{
              padding: "10px 20px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
              border: "none",
              background:
                activeDuration === duration ? "#007acc" : "transparent",
              color: activeDuration === duration ? "white" : "#4a5568",
              transition: "all 0.2s",
            }}
          >
            {duration === "Quaver" && "♪ Quaver (1/2)"}
            {duration === "Crotchet" && "♩ Crotchet (1)"}
            {duration === "Minim" && "𝅗𝅥 Minim (2)"}
          </button>
        ))}

        {/* Clean visual divider */}
        <div
          style={{
            width: "2px",
            height: "30px",
            background: "#cbd5e0",
            margin: "0 10px",
          }}
        ></div>

        {/* The Dynamic Rest Button */}
        <button
          onClick={handleRest}
          style={{
            padding: "10px 20px",
            background: "#edf2f7",
            color: "#4a5568",
            border: "1px solid #cbd5e0",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          ⏸️ Insert Rest (
          {activeDuration === "Quaver"
            ? "1/2"
            : activeDuration === "Minim"
              ? "2"
              : "1"}
          )
        </button>
        {/* Undo and Reset Buttons */}
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
          onClick={() => {
            setMelodyString("");
            setWarningMessage("");
          }}
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
      {/* --- WARNING MESSAGE UI --- */}
      <div
        style={{
          height:
            "24px" /* Fixed height so the keyboard doesn't jump up and down */,
          color: "#e53e3e" /* Bold red color */,
          fontWeight: "bold",
          fontSize: "14px",
          textAlign: "center",
          marginBottom: "10px",
          transition: "opacity 0.2s",
          opacity: warningMessage ? 1 : 0 /* Fades in and out */,
        }}
      >
        {warningMessage}
      </div>
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
