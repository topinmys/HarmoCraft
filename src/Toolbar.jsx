import React from "react";

export default function Toolbar({
  activeChord,
  activeNote,
  activeDuration,
  setActiveDuration,
  handleRest,
  handleUndo,
  handleReset,
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        background: "#f7f9fa",
        padding: "10px",
        borderRadius: "8px",
        border: "1px solid #e2e8f0",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* active chord display */}
      <div
        style={{
          background: "white",
          padding: "6px 12px",
          borderRadius: "6px",
          border: "1px solid #cbd5e0",
          fontWeight: "bold",
          color: "#4a5568",
          textAlign: "center",
          fontSize: "14px",
        }}
      >
        Chord: <span style={{ color: "#e53e3e" }}>{activeChord}</span>
      </div>

      {/* active note display */}
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

      {/* note durations */}
      {["Quaver", "Crotchet", "Minim"].map((duration) => (
        <button
          className="toolbar-btn"
          key={duration}
          onClick={() => setActiveDuration(duration)}
          style={{
            padding: "10px 20px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
            border: "none",
            background: activeDuration === duration ? "#007acc" : "transparent",
            color: activeDuration === duration ? "white" : "#4a5568",
            transition: "all 0.2s",
          }}
        >
          {duration === "Quaver" && "♪ Quaver (1/2)"}
          {duration === "Crotchet" && "♩ Crotchet (1)"}
          {duration === "Minim" && "𝅗𝅥 Minim (2)"}
        </button>
      ))}

      <div
        style={{
          width: "2px",
          height: "30px",
          background: "#cbd5e0",
          margin: "0 10px",
        }}
      ></div>

      {/* insert rest */}
      <button
        className="toolbar-btn"
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

      {/* undo button */}
      <button
        className="toolbar-btn"
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

      {/* reset button */}
      <button
        className="toolbar-btn"
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
  );
}
