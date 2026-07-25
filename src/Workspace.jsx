import React, { useState, useEffect, useRef } from "react";
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
import { supabase } from "./supabase_client";
import ABCJS from "abcjs";
import { renderAbc } from "abcjs";

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

export default function Workspace({ setView, user, setCurrentProject, currentProject }) {
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
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [songTitle, setSongTitle] = useState("HarmoCraft Sandbox");
  const [refresh, setRefresh] = useState(false);

  //fetch data from last time
  useEffect(() => {
    console.log("use effect");
    console.log(currentProject);

    if (currentProject) {
      console.log("used info");
      console.log(currentProject);
      setMelodyString(currentProject.melody);
      setSelectedKey(currentProject.key_signature);
      setSelectedStyle(currentProject.progression_style);
      setSongTitle(currentProject.melody_name);
      return;
    }

    const fetchUnsaved = async () => {
      const { data, error } = await supabase
        .from("melodies")
        .select("*")
        .eq("user_id", user.id)
        .eq("melody_name", songTitle)
        .maybeSingle();

      if (data) {
        console.log("fetched");
        setMelodyString(data.melody);
        setSelectedKey(data.key_signature);
        setSelectedStyle(data.progression_style);
      } else {
        console.log("created")
        const { data, error } = await supabase
          .from("melodies")
          .insert([
            {
              user_id: user.id,
              melody: "",
              melody_name: songTitle,
              key_signature: selectedKey,
              progression_style: selectedStyle,
            },
          ])
          .select()
          .single();
        setMelodyString(data.melody);
      }
    };

    fetchUnsaved();
  }, [refresh]);

  //autosave after 1 sec
  useEffect(() => {
    const time = setTimeout(async () => {
      const { error } = await supabase
        .from("melodies")
        .update({
          melody: melodyString,
          key_signature: selectedKey,
          progression_style: selectedStyle,
          last_saved: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("melody_name", songTitle);

      if (error) {
        console.log(error);
      }
    }, 1000);

    return () => clearTimeout(time);
  }, [melodyString, selectedKey, selectedStyle, refresh]);

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

  // grab only the part of the string before the first asterisk
  const paintedString = melodyString.includes("*")
    ? melodyString.split("*")[0]
    : melodyString;

  // calculate beats and chords using only the painted part
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

  const handleSaveAs = async () => {
    if (!songTitle.trim()) {
      setWarningMessage("⚠️ Please enter a title for your song!");
      return;
    }

    // HERE!!!! add supabase INSERT logic here using songTitle and melodyString
    console.log(`Handing off to database: ${songTitle}`);
    const { data, error } = await supabase
      .from("melodies")
      .update({
        melody_name: songTitle,
        last_saved: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .eq("melody_name", "HarmoCraft Sandbox")
      .select()
      .single();

    if (error) {
      console.log(error);
    }

    setCurrentProject(data);
    setRefresh(!refresh);
    console.log("this is current project");
    console.log(currentProject);
    console.log("this is data");
    console.log(data);

    // close modal and reset after save as
    setShowSaveModal(false);
    setWarningMessage("");
    setCoachTip(`🎉 Successfully saved "${songTitle}" to your Library!`);
  };

  return (
    <div
      style={{
        width: "100%",
        height: "calc(100vh - 80px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          marginBottom: "5px",
          minWidth: "1050px",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "24px" }}>🎹 HarmoCraft Workspace</h1>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            style={{
              fontSize: "14px",
              padding: "6px 12px",
              borderRadius: "6px",
              cursor: "pointer",
            }}
            onClick={() => setShowSaveModal(true)}
            className="primary-btn"
          >
            💾 Save As...
          </button>
          <button
            style={{ fontSize: "14px", padding: "6px 12px" }}
            onClick={() => {
              setCurrentProject(null);
              setView("home");
            }}
            className="secondary-btn"
          >
            ← Back to Home
          </button>
        </div>
      </div>

      {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}

      {/* Save As Modal*/}
      {showSaveModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.6)",
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "10px",
              width: "400px",
              textAlign: "center",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            }}
          >
            <h2 style={{ margin: "0 0 15px 0", color: "#2d3748" }}>
              Save Masterpiece
            </h2>
            <p
              style={{
                margin: "0 0 15px 0",
                color: "#718096",
                fontSize: "14px",
              }}
            >
              Give your composition a name before saving it to your library.
            </p>

            <input
              type="text"
              placeholder="e.g., Midnight Jazz Intro..."
              value={songTitle}
              onChange={(e) => setSongTitle(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "20px",
                borderRadius: "6px",
                border: "1px solid #cbd5e0",
                boxSizing: "border-box",
                fontSize: "16px",
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "10px",
              }}
            >
              <button
                className="btn-neutral"
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
                onClick={() => setShowSaveModal(false)}
              >
                Cancel
              </button>
              <button
                className="primary-btn"
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
                onClick={handleSaveAs}
              >
                Save to Library
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Alerts */}
      <div
        style={{
          minHeight: "40px",
          width: "100%",
          minWidth: "1050px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
          marginBottom: "5px",
        }}
      >
        {warningMessage && (
          <div
            style={{ color: "#e53e3e", fontWeight: "bold", fontSize: "14px" }}
          >
            {warningMessage}
          </div>
        )}
        {coachTip && (
          <div
            style={{
              display: "inline-block",
              background: "#ebf8ff",
              borderLeft: "4px solid #3182ce",
              padding: "6px 16px",
              color: "#2b6cb0",
              fontWeight: "600",
              borderRadius: "0 6px 6px 0",
              opacity: isTipVisible ? 1 : 0,
              transition: "opacity 0.5s ease-in-out",
            }}
          >
            {coachTip}
          </div>
        )}
      </div>

      {/* 3-COLUMN LAYOUT */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          minWidth: "1050px",
          height: "100%",
          gap: "45px",
          overflow: "hidden",
        }}
      >
        {/* LEFT COLUMN */}
        <div
          style={{
            flex: "0 0 250px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <div
            className="control-panel"
            style={{
              width: "100%",
              flexDirection: "column",
              maxWidth: "none",
              boxSizing: "border-box",
            }}
          >
            <div
              className="control-group-wrapper"
              style={{ flexDirection: "column", width: "100%" }}
            >
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
              <div className="control-input-group">
                <label className="control-label">
                  Progression Style{" "}
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
                </label>
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
            <div
              className="chord-display-box"
              style={{
                width: "100%",
                padding: "10px",
                boxSizing: "border-box",
              }}
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
        </div>

        {/* CENTER COLUMN (MAIN SANDBOX) */}
        <div
          style={{
            flex: "1",
            minWidth: "0",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            position: "relative",
            zIndex: 50,
          }}
        >
          <div
            style={{
              height: "calc(100% - 225px)",
              minHeight: "0",
              display: "flex",
              width: "100%",
              paddingBottom: "10px",
              marginBottom: "15px",
              boxSizing: "border-box",
            }}
          >
            <SheetMusic
              chord={activeProgression}
              melody={displayString}
              selectedKey={selectedKey}
              songTitle={songTitle}
            />
          </div>

          <div
            style={{
              height: "225px",
              flexShrink: 0,
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-end",
            }}
          >
            <div
              style={{
                transform: "scale(0.78)",
                transformOrigin: "bottom center",
              }}
            >
              <Piano
                handleKeyClick={handleKeyClick}
                tier1={tier1}
                tier2={tier2}
              />
            </div>
          </div>
        </div>
        {/* RIGHT COLUMN */}
        <div
          style={{
            flex: "0 0 300px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            overflowY: "auto",
            overflowX: "hidden",
            position: "relative",
            zIndex: 1,
          }}
        >
          <button
            className="btn-generate"
            onClick={generateStarterIdea}
            style={{
              padding: "12px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              width: "100%",
            }}
          >
            ✨ Generate Starter Idea
          </button>

          <Toolbar
            activeChord={activeChord}
            activeNote={activeNote}
            activeDuration={activeDuration}
            setActiveDuration={setActiveDuration}
            handleRest={handleRest}
            handleUndo={handleUndo}
            handleReset={handleReset}
          />

          <Scratchpad
            scratchpadString={scratchpadString}
            acceptIdea={acceptIdea}
            rejectIdea={rejectIdea}
          />
        </div>
      </div>
    </div>
  );
}
