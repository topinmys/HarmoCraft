import React, { useState } from "react";

const WelcomeModal = ({ onClose }) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // save the preference to local storage if checked
  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem("hideHarmoCraftWelcome", "true");
    }
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(17, 24, 39, 0.7)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "16px",
          maxWidth: "800px",
          width: "90%",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          textAlign: "center",
        }}
      >
        <h1
          style={{ margin: "0 0 10px 0", color: "#2d3748", fontSize: "32px" }}
        >
          Welcome to HarmoCraft 🎵
        </h1>
        <p
          style={{
            color: "#718096",
            fontSize: "18px",
            marginBottom: "35px",
            lineHeight: "1.5",
          }}
        >
          You don't need to know music theory to write a great song. Just follow
          the guide!
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "25px",
            textAlign: "left",
            marginBottom: "35px",
          }}
        >
          <div>
            <h3
              style={{
                margin: "0 0 8px 0",
                color: "#4a5568",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "18px",
              }}
            >
              <span>🎹</span> 1. Pick a Vibe & Paint
            </h3>
            <p
              style={{
                margin: 0,
                color: "#718096",
                fontSize: "15px",
                paddingLeft: "32px",
                lineHeight: "1.4",
              }}
            >
              Select a Key and Style. Look at the Piano: <b>Green keys</b> are
              safe, <b>Yellow keys</b> add flavor. Click to paint your melody!
            </p>
          </div>

          <div>
            <h3
              style={{
                margin: "0 0 8px 0",
                color: "#4a5568",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "18px",
              }}
            >
              <span>🎶</span> 2. Auto-Harmonize
            </h3>
            <p
              style={{
                margin: 0,
                color: "#718096",
                fontSize: "15px",
                paddingLeft: "32px",
                lineHeight: "1.4",
              }}
            >
              Click <b>Auto-Harmonize</b> on the right panel to automatically
              build smart, stylistic chords beneath your melody.
            </p>
          </div>

          <div>
            <h3
              style={{
                margin: "0 0 8px 0",
                color: "#4a5568",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "18px",
              }}
            >
              <span>▶️</span> 3. Listen to your track
            </h3>
            <p
              style={{
                margin: 0,
                color: "#718096",
                fontSize: "15px",
                paddingLeft: "32px",
                lineHeight: "1.4",
              }}
            >
              Use the <b>Play button</b> on the sheet music to listen to your
              composition in real-time.
            </p>
          </div>

          <div>
            <h3
              style={{
                margin: "0 0 8px 0",
                color: "#4a5568",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "18px",
              }}
            >
              <span>💾</span> 4. Save Your Masterpiece
            </h3>
            <p
              style={{
                margin: 0,
                color: "#718096",
                fontSize: "15px",
                paddingLeft: "32px",
                lineHeight: "1.4",
              }}
            >
              Click <b>Save As...</b> at the top right to name your project and
              store it permanently in your Library.
            </p>
          </div>
        </div>

        <button
          onClick={handleClose}
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none",
            padding: "14px 30px",
            borderRadius: "8px",
            fontSize: "18px",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            width: "100%",
            transition: "transform 0.1s ease",
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          Let's Compose! 🚀
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            marginTop: "20px",
          }}
        >
          <input
            type="checkbox"
            id="dontShow"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            style={{ cursor: "pointer", width: "16px", height: "16px" }}
          />
          <label
            htmlFor="dontShow"
            style={{ color: "#718096", fontSize: "15px", cursor: "pointer" }}
          >
            Do not show this again
          </label>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
