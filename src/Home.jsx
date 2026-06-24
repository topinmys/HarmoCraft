import React from "react";

function Home({ setView, onLogout }) {
  return (
    <div
      style={{
        textAlign: "center",
        width: "100%",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <h1 style={{ margin: 0 }}>Welcome to HarmoCraft</h1>
        <p style={{ margin: 0, color: "#555" }}>
          Your best composition companion.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          marginTop: "40px",
        }}
      >
        {/* buttons trigger to change the page*/}
        <button onClick={() => setView("workspace")} className="primary-btn">
          🎹 Enter Piano Workspace
        </button>

        <button onClick={() => setView("profile")} className="secondary-btn">
          👤 View Profile
        </button>

        <button
          onClick={onLogout}
          className="secondary-btn"
          style={{ borderColor: "red", color: "red" }}
        >
          Log Out
        </button>
      </div>
    </div>
  );
}

export default Home;
