import React, { useEffect, useRef, useState } from "react";
import abcjs, { synth } from "abcjs";
import { chordDictionary } from "./musicTheory";

// helper function to determine how busy a melody bar is
const getMelodyDensity = (barString) => {
  const notes = barString.match(/[a-gA-G]/g);
  const noteCount = notes ? notes.length : 0;

  if (noteCount <= 2) return "Calm";
  if (noteCount <= 4) return "Steady";
  return "Busy";
};

const SheetMusic = ({
  melody,
  selectedKey,
  chord,
  songTitle,
  selectedStyle,
  isHarmonized,
}) => {
  // create reference to an empty html div
  const paperRef = useRef(null);
  const audioContextRef = useRef(null);
  const synthRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const timingCallbacksRef = useRef(null);

  const clearHighlights = () => {
    if (paperRef.current) {
      const highlighted = paperRef.current.querySelectorAll(".abcjs-highlight");
      highlighted.forEach((e) => e.classList.remove("abcjs-highlight"));
    }
  };

  // use useEffect so it only draws after the screen loads
  useEffect(() => {
    let isCancelled = false;

    const init = async () => {
      // stop any existing synth before building a new one to prevent overlaps
      if (synthRef.current) {
        synthRef.current.stop();
        synthRef.current = null;
      }

      if (timingCallbacksRef.current) {
        timingCallbacksRef.current.stop();
        timingCallbacksRef.current = null;
      }

      clearHighlights();
      setIsPlaying(false);

      const abcKey = selectedKey && selectedKey.includes("G Major") ? "G" : "C";

      // clean up the melody and split into array
      const cleanMelody = melody.replace(/\n/g, "").trim();
      let melodyBars = cleanMelody.split("|").map((b) => b.trim());
      if (melodyBars[melodyBars.length - 1] === "") melodyBars.pop();
      const numBars = melodyBars.length;

      let header = `X:1\nT:${songTitle}\nM:4/4\nL:1/4\nK:${abcKey}\nQ:1/4=100\n%%MIDI chordvol 0\n`;
      if (isHarmonized) {
        header += `%%score (V1 V2)\nV:1 clef=treble \nV:2 clef=bass \n`;
      }

      let scoreString = "";

      // process the music in chunks of 4 bars per visual line
      for (let i = 0; i < numBars; i += 4) {
        let topLine = "";
        let bottomLine = "";

        // build 4 bars at a time
        for (let j = 0; j < 4; j++) {
          const barIndex = i + j;
          if (barIndex >= numBars) break;

          const currentChordName = chord[barIndex];
          const currentBarString = melodyBars[barIndex] || "";

          // top line (melody)
          const chordStr =
            currentChordName && currentChordName !== "-"
              ? `"${currentChordName}" `
              : "";
          topLine += `${chordStr}${currentBarString} | `;

          // bottom line (smart bass)
          if (isHarmonized) {
            if (
              !currentChordName ||
              currentChordName === "-" ||
              !currentBarString
            ) {
              bottomLine += "z4 | ";
            } else {
              const notes = chordDictionary[currentChordName] || [
                "C",
                "E",
                "G",
              ];

              // set up natural piano voicings
              const rootDeep = notes[0] + ",,";
              const root = notes[0] + ",";
              const third = notes[1] + ",";
              const fifth = notes[2] + ",";
              const upperChord = `[${third}${fifth}]`;
              const fullChord = `[${rootDeep}${third}${fifth}]`;

              const density = getMelodyDensity(currentBarString);
              const isEvenBar = barIndex % 2 === 0;

              if (selectedStyle === "Pop") {
                if (density === "Calm") {
                  // 8th note rolling arpeggio
                  bottomLine += `${rootDeep}/2${fifth}/2${root}/2${fifth}/2 ${rootDeep}/2${fifth}/2${root}/2${fifth}/2 | `;
                } else if (density === "Steady") {
                  // wider quaver arpeggio reaching to the third
                  bottomLine += `${rootDeep}/2${fifth}/2${root}/2${third}/2 ${root}/2${fifth}/2${rootDeep}/2${fifth}/2 | `;
                } else {
                  // a sustained chord for busy melodies
                  bottomLine += `${fullChord}4 | `;
                }
              } else if (selectedStyle === "Melancholy") {
                if (density === "Calm" || density === "Steady") {
                  // sweeping quaver arpeggios that rise and fall
                  bottomLine += isEvenBar
                    ? `${rootDeep}/2${third}/2${fifth}/2${root}/2 ${fifth}/2${third}/2${rootDeep}/2${fifth}/2 | `
                    : `${rootDeep}/2${fifth}/2${root}/2${fifth}/2 ${rootDeep}/2${third}/2${fifth}/2${root}/2 | `;
                } else {
                  bottomLine += `${fullChord}4 | `;
                }
              } else if (selectedStyle === "Jazz / R&B") {
                if (density === "Busy") {
                  // smooth sustained shell voicing
                  bottomLine += `${fullChord}4 | `;
                } else {
                  // syncopated jazz rhythm
                  bottomLine += isEvenBar
                    ? `${rootDeep}2 z/2 ${upperChord}/2 z | `
                    : `z/2 ${upperChord}/2 z/2 ${upperChord}/2 ${rootDeep}2 | `;
                }
              } else {
                bottomLine += `${fullChord}4 | `;
              }
            }
          }
        }

        // stack the completely synced 4-bar blocks together
        if (!isHarmonized) {
          scoreString += `${topLine}\n`;
        } else {
          // inject the soft dynamic marker on the very first bass line
          const volControl = i === 0 ? "!p! " : "";
          scoreString += `[V:1] ${topLine}\n[V:2] ${volControl}${bottomLine}\n`;
        }
      }

      const abcString = header + scoreString;

      // tell abcjs to draw the string onto our referenced div
      const visualObj = abcjs.renderAbc(paperRef.current, abcString, {
        add_classes: true,
        scale: 0.9,
        responsive: "resize",
        foregroundColor: "#2d3748",
        paddingtop: 15,
        paddingbottom: 15,
        wrap: {
          minSpacing: 1.5,
          maxSpacing: 2.7,
          preferredMeasuresPerLine: 4,
        },
      })[0];

      // ensure doesnt try to play any chord symbols
      const audioAbcString = abcString.replace(/"[^"]*"/g, "");
      const audioObj = abcjs.renderAbc("*", audioAbcString)[0];

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      await abcjs.synth.supportsAudio();
      const synth = new abcjs.synth.CreateSynth();

      try {
        await synth.init({
          audioContext: audioContextRef.current,
          visualObj: audioObj,
          options: {
            chnParams: { 1: { vol: 0.7 } },
            onEnded: () => {
              if (!isCancelled) {
                setIsPlaying(false);
                clearHighlights();
                if (timingCallbacksRef.current) {
                  timingCallbacksRef.current.stop();
                }
              }
            },
          },
        });

        await synth.prime();

        const timingCallbacks = new abcjs.TimingCallbacks(visualObj, {
          eventCallback: (e) => {
            if (!e) {
              return;
            }

            clearHighlights();

            if (e.elements) {
              e.elements.forEach((group) => {
                group.forEach((e) => {
                  if (e) {
                    e.classList.add("abcjs-highlight");
                  }
                });
              });
            }
          },
        });

        if (!isCancelled) {
          synthRef.current = synth;
          timingCallbacksRef.current = timingCallbacks;
        }
      } catch (error) {
        console.error("Audio initialization failed: ", error);
      }
    };

    init();

    // ensure synth stops when the component updates
    return () => {
      isCancelled = true;
      if (synthRef.current) {
        synthRef.current.stop();
      }

      if (timingCallbacksRef.current) {
        timingCallbacksRef.current.stop();
      }

      clearHighlights();
    };
  }, [melody, selectedKey, songTitle, selectedStyle, isHarmonized]);

  const handlePlayBack = async () => {
    // stop the previous track before starting a new one to prevent overlap
    if (!synthRef.current || !audioContextRef.current) {
      return;
    }

    if (isPlaying) {
      synthRef.current.stop();

      if (timingCallbacksRef.current) {
        timingCallbacksRef.current.stop();
      }

      clearHighlights();
      setIsPlaying(false);
      return;
    }

    if (audioContextRef.current.state == "suspended") {
      await audioContextRef.current.resume();
    }

    synthRef.current.start();
    if (timingCallbacksRef.current) {
      timingCallbacksRef.current.start();
    }
    setIsPlaying(true);
  };

  const handleExport = () => {
    window.print();
  };

  return (
    <div
      className="sheet-music-container"
      style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        margin: "0",
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
      }}
    >
      <div ref={paperRef} style={{ width: "100%" }}></div>
      <div
        style={{
          paddingTop: "15px",
          paddingBottom: "10px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <button
          className="toolbar-btn"
          onClick={() => handlePlayBack()}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          }}
        >
          {isPlaying ? "⏸ Stop" : "▶ Play"}
        </button>
        <button
          onClick={() => handleExport()}
          className="toolbar-btn"
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            backgroundColor: "#4a5568",
            color: "#fff",
          }}>
          🖨️ Export Sheet
        </button>
      </div>
    </div>
  );
};

export default SheetMusic;
