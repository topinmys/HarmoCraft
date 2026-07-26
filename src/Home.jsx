import React from "react";

function Home({ setView, onLogout }) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "950px",
        margin: "0 auto",
        padding: "60px 40px",
        boxSizing: "border-box",
        borderRadius: "20px",
      }}
    >
      {/* header section */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "50px",
        }}
      >
        <h1
          style={{ margin: "0 0 10px 0", fontSize: "40px", color: "#2d3748" }}
        >
          Welcome to HarmoCraft
        </h1>
        <p style={{ margin: 0, color: "#718096", fontSize: "18px" }}>
          Your best composition companion.
        </p>
      </div>

      {/* main features grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "30px",
          marginBottom: "50px",
        }}
      >
        {/* workspace card */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "40px 30px",
            textAlign: "center",
            boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-5px)";
            e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.05)";
          }}
        >
          <div style={{ fontSize: "50px", marginBottom: "20px" }}>🎹</div>
          <h2
            style={{ margin: "0 0 10px 0", color: "#2d3748", fontSize: "22px" }}
          >
            Piano Workspace
          </h2>
          <p
            style={{
              margin: "0 0 25px 0",
              color: "#718096",
              fontSize: "15px",
              lineHeight: "1.5",
            }}
          >
            Compose melodies, generate smart harmonizations, and playback your
            creations.
          </p>
          <button
            onClick={() => setView("workspace")}
            className="primary-btn"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              fontSize: "15px",
            }}
          >
            Enter Workspace
          </button>
        </div>

        {/* ear training card */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "40px 30px",
            textAlign: "center",
            boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-5px)";
            e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.05)";
          }}
        >
          <div style={{ fontSize: "50px", marginBottom: "20px" }}>🎧</div>
          <h2
            style={{ margin: "0 0 10px 0", color: "#2d3748", fontSize: "22px" }}
          >
            Ear Training Studio
          </h2>
          <p
            style={{
              margin: "0 0 25px 0",
              color: "#718096",
              fontSize: "15px",
              lineHeight: "1.5",
            }}
          >
            Master relative pitch and test your interval recognition with
            interactive audio puzzles.
          </p>
          <button
            onClick={() => setView("ear-training")}
            className="btn-neutral"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              fontWeight: "bold",
              fontSize: "15px",
              cursor: "pointer",
            }}
          >
            Enter Studio
          </button>
        </div>
      </div>

      {/* secondary actions */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
        }}
      >
        <button
          onClick={() => setView("profile")}
          className="secondary-btn"
          style={{
            padding: "10px 24px",
            borderRadius: "8px",
            fontWeight: "bold",
          }}
        >
          👤 View Profile
        </button>

        <button
          onClick={onLogout}
          className="btn-danger"
          style={{
            padding: "10px 24px",
            borderRadius: "8px",
            fontWeight: "bold",
          }}
        >
          Log Out
        </button>
      </div>
    </div>
  );
}

export default Home;
