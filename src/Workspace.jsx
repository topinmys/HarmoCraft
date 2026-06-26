import React, { useState, useEffect } from "react";
import SheetMusic from "./SheetMusic";
import {
  noteFrequencies,
  abcMapper,
  chordProgressions,
  chordDictionary,
  keySignatures,
  motifLibrary,
} from "./musicTheory";
import Piano from "./Piano";
import Scratchpad from "./Scratchpad";
import WelcomeModal from "./WelcomeModal";
import Toolbar from "./Toolbar";

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
  const [scratchpadString, setScratchpadString] = useState("");
  const [coachTip, setCoachTip] = useState("");
  const [history, setHistory] = useState([]);
  const [isTipVisible, setIsTipVisible] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  // toast notification fader logic
  useEffect(() => {
    if (coachTip) {
      setIsTipVisible(true);

      const fadeTimer = setTimeout(() => {
        setIsTipVisible(false);
      }, 5000);

      const clearTimer = setTimeout(() => {
        setCoachTip("");
      }, 5500);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(clearTimer);
      };
    }
  }, [coachTip]);

  const currentChords = chordProgressions[selectedKey][selectedStyle];

  // function to handle key clicks
  const handleKeyClick = (note) => {
    const translated = abcMapper[note];
    if (!translated) return;

    // placeholder logic: if the melody string contains an asterisk, replace it with the clicked note
    if (melodyString.includes("*")) {
      setHistory((prev) => [...prev, melodyString]);
      setMelodyString((prev) => prev.replace("*", translated));

      setTimeout(() => {
        setActiveNote(note);
        playSynthNote(note);
      }, 0);

      return;
    }
    setHistory((prev) => [...prev, melodyString]);

    // do math before updating the sheet music
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
    if (melodyString.includes("*")) {
      setHistory((prev) => [...prev, melodyString]);

      setMelodyString((prev) => prev.replace("*", "z"));
      return; // STOP HERE!
    }

    setHistory((prev) => [...prev, melodyString]);
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

      let newAddition = "z" + modifier + " ";

      const totalBeats = currentBeats + durationValue;
      if (totalBeats % 4 === 0) newAddition += "| ";
      if (totalBeats % 16 === 0) newAddition += "\n";

      return prev + newAddition;
    });
  };

  // steps back one move in time
  const handleUndo = () => {
    setWarningMessage("");
    // if history is empty, do nothing
    if (history.length === 0) return;

    // grab the previous snapshot
    const previousState = history[history.length - 1];

    // restore the screen to that snapshot
    setMelodyString(previousState);

    // remove that snapshot from the history stack
    setHistory((prev) => prev.slice(0, -1));
  };

  // function to reset the entire composition
  const handleReset = () => {
    setMelodyString("");
    setActiveNote("None");
    setWarningMessage("");
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

  // get current active chord
  const getActiveChord = (currentBeats, progressionArray) => {
    const currentMeasureIndex = Math.floor(currentBeats / 4);

    if (currentMeasureIndex >= progressionArray.length) {
      return null;
    }

    return progressionArray[currentMeasureIndex];
  };

  // suggestion engine
  const getNoteSuggestions = (chord, keyName) => {
    // if the song is over or there is no active chord, return empty arrays
    if (!chord || chord === "-") return { tier1: [], tier2: [] };

    // tier 1: gold notes (chord tones)
    const tier1 = chordDictionary[chord] || [];

    // tier 2: silver notes (passing scale tones)
    // take full scale and filter out  tier 1 notes so they don't overlap
    const currentScale = keySignatures[keyName] || [];
    const tier2 = currentScale.filter((note) => !tier1.includes(note));

    return { tier1, tier2 };
  };

  // swap all asterisks to 'C' just for the visual sheet music and math
  const displayString = melodyString.replace(/\*/g, "C");

  // 2. THE FIX: Grab only the part of the string BEFORE the first asterisk
  const paintedString = melodyString.includes("*")
    ? melodyString.split("*")[0]
    : melodyString;

  // 3. Calculate beats and chords using ONLY the painted part!
  const currentBeats = calculateBeats(paintedString);
  const activeProgression =
    chordProgressions[selectedKey]?.[selectedStyle] || [];
  const activeChord = getActiveChord(currentBeats, activeProgression) || "-";
  const { tier1, tier2 } = getNoteSuggestions(activeChord, selectedKey);

  // builds a random aaba phrase based on the style
  const generateStarterIdea = () => {
    const currentStyle = selectedStyle || "Pop";
    const styleMotifs = motifLibrary[currentStyle];

    const motifA = styleMotifs[Math.floor(Math.random() * styleMotifs.length)];
    let motifB = styleMotifs[Math.floor(Math.random() * styleMotifs.length)];
    while (motifB.name === motifA.name) {
      motifB = styleMotifs[Math.floor(Math.random() * styleMotifs.length)];
    }

    const starterPhrase =
      motifA.rhythm + motifA.rhythm + motifB.rhythm + motifA.ending;
    setScratchpadString(starterPhrase);
    setCoachTip(
      `💡 Here's a ${currentStyle} idea for you, built on the '${motifA.name}' pattern.`,
    );
  };
  // dumps the scratchpad idea into the main canvas
  const acceptIdea = () => {
    const currentString = melodyString.replace(/\*/g, "C");
    const currentTotalBeats = calculateBeats(currentString);

    if (currentTotalBeats % 4 !== 0) {
      setWarningMessage(
        "⚠️ Finish your current measure first! Ideas must be dropped at the start of a fresh bar.",
      );
      return;
    }

    if (currentTotalBeats + 16 > 64) {
      setWarningMessage(
        "⚠️ Song is too full! You don't have 16 beats of space left.",
      );
      return;
    }

    setWarningMessage("");
    setHistory((prev) => [...prev, melodyString]);
    setMelodyString((prev) => prev + scratchpadString);
    setScratchpadString("");
    setCoachTip(
      `💡 Awesome! Now click any piano key to "paint" the placeholders left-to-right!`,
    );
  };

  const rejectIdea = () => {
    setScratchpadString("");
    setCoachTip("");
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
          marginBottom: "15px",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "24px" }}>🎹 HarmoCraft Workspace</h1>

        <button
          className="toolbar-btn"
          style={{ fontSize: "14px", padding: "6px 12px" }}
          onClick={() => setView("home")}
          className="secondary-btn"
        >
          ← Back to Home
        </button>
      </div>
      {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}
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
      <div
        style={{
          paddingTop: "5px",
          paddingBottom: "10px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <button
          className="toolbar-btn"
          onClick={generateStarterIdea}
          style={{
            padding: "10px 10px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          }}
        >
          ✨ Generate Starter Idea
        </button>
      </div>

      {coachTip && (
        <div
          style={{
            background: "#ebf8ff",
            borderLeft: "4px solid #3182ce",
            padding: "12px 16px",
            marginBottom: "15px",
            color: "#2b6cb0",
            fontWeight: "600",
            borderRadius: "0 6px 6px 0",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            opacity: isTipVisible ? 1 : 0,
            transition: "opacity 0.5s ease-in-out",
            pointerEvents: isTipVisible ? "auto" : "none",
          }}
        >
          {coachTip}
        </div>
      )}

      <Scratchpad
        scratchpadString={scratchpadString}
        acceptIdea={acceptIdea}
        rejectIdea={rejectIdea}
      />
      {/* sheet music */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "20px",
          marginBottom: "20px",
        }}
      >
        <SheetMusic melody={displayString} selectedKey={selectedKey} />
        <Toolbar
          activeChord={activeChord}
          activeNote={activeNote}
          activeDuration={activeDuration}
          setActiveDuration={setActiveDuration}
          handleRest={handleRest}
          handleUndo={handleUndo}
          handleReset={handleReset}
        />
      </div>
      {/* warning message */}
      <div
        style={{
          height: "24px",
          color: "#e53e3e",
          fontWeight: "bold",
          fontSize: "14px",
          textAlign: "center",
          marginBottom: "10px",
          transition: "opacity 0.2s",
          opacity: warningMessage ? 1 : 0,
        }}
      >
        {warningMessage}
      </div>
      <Piano handleKeyClick={handleKeyClick} tier1={tier1} tier2={tier2} />
    </div>
  );
}
