import React from "react";

const WelcomeModal = ({ onClose }) => {
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
          maxWidth: "500px",
          width: "90%",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          textAlign: "center",
        }}
      >
        <h1
          style={{ margin: "0 0 10px 0", color: "#2d3748", fontSize: "28px" }}
        >
          Welcome to HarmoCraft 🎵
        </h1>
        <p
          style={{
            color: "#718096",
            fontSize: "16px",
            marginBottom: "30px",
            lineHeight: "1.5",
          }}
        >
          You don't need to know music theory to write a great song. Just follow
          the guide!
        </p>

        <div style={{ textAlign: "left", marginBottom: "30px" }}>
          <div style={{ marginBottom: "20px" }}>
            <h3
              style={{
                margin: "0 0 5px 0",
                color: "#4a5568",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>🎹</span> 1. Pick a Vibe
            </h3>
            <p
              style={{
                margin: 0,
                color: "#718096",
                fontSize: "14px",
                paddingLeft: "32px",
              }}
            >
              Select a Key Signature and a Style to set the mood of your song.
            </p>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <h3
              style={{
                margin: "0 0 5px 0",
                color: "#4a5568",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>✨</span> 2. Get Inspired
            </h3>
            <p
              style={{
                margin: 0,
                color: "#718096",
                fontSize: "14px",
                paddingLeft: "32px",
              }}
            >
              Stuck? Click <b>Generate Starter Idea</b> to get a catchy rhythm
              on your Scratchpad.
            </p>
          </div>

          <div>
            <h3
              style={{
                margin: "0 0 5px 0",
                color: "#4a5568",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>🟢</span> 3. Follow the Lights
            </h3>
            <p
              style={{
                margin: 0,
                color: "#718096",
                fontSize: "14px",
                paddingLeft: "32px",
              }}
            >
              Look at the Piano! <b>Green keys</b> are always safe.{" "}
              <b>Yellow keys</b> add flavor. Click a key to paint your melody!
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none",
            padding: "12px 30px",
            borderRadius: "8px",
            fontSize: "16px",
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
      </div>
    </div>
  );
};

export default WelcomeModal;
