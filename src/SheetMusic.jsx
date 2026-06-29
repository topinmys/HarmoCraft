import React, { useEffect, useRef } from "react";
import abcjs from "abcjs";

const SheetMusic = ({ melody, selectedKey, chord }) => {
  // create reference to an empty HTML div
  const paperRef = useRef(null);
  const audioContextRef = useRef(null);
  const synthRef = useRef(null);

  // use useEffect so it only draws after the screen loads
  useEffect(() => {
    const init = async () => {
      const abcKey = selectedKey && selectedKey.includes("G Major") ? "G" : "C";
      const melodyBars = melody.split("|");
      const abcMelody = melodyBars
        .map((bar, i) => {
          const c = chord[i];
          return c ? `"${c}" ${bar}` : bar;
        })
        .join(" | ");
      const abcString = `X:1
T:HarmoCraft Sandbox
M:4/4
L:1/4
K:${abcKey}
${abcMelody}`;

      // tell abcjs to draw the string onto our referenced div
      const visualObj = abcjs.renderAbc(paperRef.current, abcString, {
        add_classes: true,
        scale: 0.9,
        foregroundColor: "#2d3748",
        paddingtop: 15,
        paddingbottom: 15,
        staffwidth: 680,
        wrap: {
          minSpacing: 1.5,
          maxSpacing: 2.7,
          preferredMeasuresPerLine: 4,
        },
      });

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      await abcjs.synth.supportsAudio();

      synthRef.current = new abcjs.synth.CreateSynth();

      await synthRef.current.init({
        audioContext: audioContextRef.current,
        visualObj: visualObj[0],
      });

      await synthRef.current.prime();
    }
    init();
  }, [melody, selectedKey]);

  const handlePlayBack = async () => {
    await audioContextRef.current.resume();
    synthRef.current.start();
  };

  return (
    <div
      style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        marginBottom: "40px",
        width: "700px",
        boxSizing: "border-box",
        height: "350px",
        overflowY: "auto",
      }}
    >
      <div ref={paperRef}></div>
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
          onClick={() => handlePlayBack()}
          style={{
            padding: "10px 10px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          }}
        >
          ▶ Play
        </button>
      </div>
    </div>
  );
};

export default SheetMusic;