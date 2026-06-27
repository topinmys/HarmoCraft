import React, { useEffect } from "react";
import abcjs from "abcjs";

const Scratchpad = ({ scratchpadString, acceptIdea, rejectIdea }) => {
  useEffect(() => {
    if (scratchpadString) {
      const scratchpadDisplay = scratchpadString.replace(/\*/g, "C");
      const abcString = `X:1\nM:4/4\nL:1/4\nK:C\n${scratchpadDisplay}`;
      abcjs.renderAbc("scratchpad-paper", abcString, {
        responsive: "resize",
        scale: 0.8,
      });
    }
  }, [scratchpadString]);

  if (!scratchpadString) return null;

  return (
    <div
      style={{
        background: "#f7fafc",
        border: "2px dashed #cbd5e0",
        borderRadius: "10px",
        padding: "20px",
        marginBottom: "20px",
        position: "relative",
        width: "100%",
        maxWidth: "700px",
        margin: "0 auto",
      }}
    >
      <h3 style={{ marginTop: 0, color: "#4a5568", fontSize: "16px" }}>
        ✨ Inspiration Board
      </h3>

      {/* The canvas for the scratchpad sheet music */}
      <div id="scratchpad-paper"></div>

      {/* Accept / Reject Buttons */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          justifyContent: "flex-end",
          marginTop: "10px",
        }}
      >
        <button
          onClick={rejectIdea}
          style={{
            background: "white",
            color: "#e53e3e",
            border: "1px solid #e53e3e",
            padding: "6px 12px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Discard
        </button>
        <button
          onClick={acceptIdea}
          style={{
            background: "#48bb78",
            color: "white",
            border: "none",
            padding: "6px 12px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Accept & Insert
        </button>
      </div>
    </div>
  );
};

export default Scratchpad;
