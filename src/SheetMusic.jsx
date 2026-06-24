import React, { useEffect, useRef } from "react";
import abcjs from "abcjs";

const SheetMusic = ({ melody, selectedKey }) => {
  // create reference to an empty HTML div
  const paperRef = useRef(null);

  // use useEffect so it only draws after the screen loads
  useEffect(() => {
    const abcKey = selectedKey && selectedKey.includes("G Major") ? "G" : "C";
    const abcString = `X:1
T:HarmoCraft Sandbox
M:4/4
L:1/4
K:${abcKey}
${melody}`;

    // tell abcjs to draw the string onto our referenced div
    abcjs.renderAbc(paperRef.current, abcString, {
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
  }, [melody, selectedKey]);

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
    </div>
  );
};

export default SheetMusic;
