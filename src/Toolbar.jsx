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
        flexDirection: "column",
        gap: "15px",
        background: "#f7f9fa",
        padding: "15px",
        borderRadius: "8px",
        border: "1px solid #e2e8f0",
      }}
    >
      {/* Row 1: Status Displays */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "10px",
        }}
      >
        <div
          style={{
            flex: 1,
            background: "white",
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #cbd5e0",
            textAlign: "center",
            fontSize: "13px",
            fontWeight: "bold",
            color: "#4a5568",
          }}
        >
          Chord: <span style={{ color: "#e53e3e" }}>{activeChord}</span>
        </div>
        <div
          style={{
            flex: 1,
            background: "white",
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #cbd5e0",
            textAlign: "center",
            fontSize: "13px",
            fontWeight: "bold",
            color: "#4a5568",
          }}
        >
          Note:{" "}
          <span style={{ color: "#007acc" }}>
            {activeNote === "Rest" ? "Rest" : activeNote || "-"}
          </span>
        </div>
      </div>

      {/* Row 2: Note Durations */}
      <div
        style={{ display: "flex", justifyContent: "space-between", gap: "5px" }}
      >
        {["Quaver", "Crotchet", "Minim"].map((duration) => (
          <button
            className={
              activeDuration === duration
                ? "btn-duration-active"
                : "btn-duration-inactive"
            }
            key={duration}
            onClick={() => setActiveDuration(duration)}
            style={{
              flex: 1,
              padding: "8px 0",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "12px",
            }}
          >
            {duration === "Quaver" && "♪ (1/2)"}
            {duration === "Crotchet" && "♩ (1)"}
            {duration === "Minim" && "𝅗𝅥 (2)"}
          </button>
        ))}
      </div>

      {/* Row 3: Actions */}
      <div
        style={{ display: "flex", justifyContent: "space-between", gap: "5px" }}
      >
        <button
          className="btn-light"
          onClick={handleRest}
          style={{
            flex: 2,
            padding: "8px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "12px",
          }}
        >
          ⏸️ Rest (
          {activeDuration === "Quaver"
            ? "1/2"
            : activeDuration === "Minim"
              ? "2"
              : "1"}
          )
        </button>
        <button
          className="btn-danger"
          onClick={handleUndo}
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "12px",
          }}
        >
          ↩ Undo
        </button>
        <button
          className="btn-neutral"
          onClick={handleReset}
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "12px",
          }}
        >
          🗑️ Reset
        </button>
      </div>
    </div>
  );
}
