import React from "react";

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

const Piano = ({ handleKeyClick, tier1 = [], tier2 = [] }) => {
  const getColor = (note, isBlackKey) => {
    const baseNote = note.replace(/[0-9]/g, "");

    if (tier1.includes(baseNote)) {
      return isBlackKey ? "#1a4731" : "#a7f3d0";
    }
    if (tier2.includes(baseNote)) {
      return isBlackKey ? "#593a0e" : "#fef08a";
    }

    return isBlackKey ? "#111" : "white";
  };
  return (
    <div className="piano-container">
      <div className="piano-keyboard">
        {/* WHITE KEYS */}
        {whiteKeys.map((note) => (
          <button
            key={note}
            className="white-key"
            onClick={() => handleKeyClick(note)}
            style={{
              "--key-tint": getColor(note, false),
            }}
          >
            <span className="key-label">{note}</span>
          </button>
        ))}

        {/* BLACK KEYS */}
        {blackKeys.map((key) => (
          <button
            key={key.name}
            className="black-key"
            onClick={() => handleKeyClick(key.name)}
            style={{
              left: `${key.position * 50 - 15}px`,
              "--key-tint": getColor(key.name, true),
            }}
          >
            <span className="key-label black-label">{key.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Piano;
