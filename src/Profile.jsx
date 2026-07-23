import React from "react";

function Profile({ setView, user }) {
  // MOCK DATA!!!!
  const mockSongs = [
    {
      id: 1,
      title: "Midnight Jazz",
      key_signature: "C Major",
      progression_style: "Jazz / R&B",
      date: "July 23, 2026",
    },
    {
      id: 2,
      title: "Pop Anthem Draft",
      key_signature: "G Major",
      progression_style: "Pop",
      date: "July 22, 2026",
    },
    {
      id: 3,
      title: "Sad Piano Intro",
      key_signature: "C Major",
      progression_style: "Melancholy",
      date: "July 21, 2026",
    },
  ];

  return (
    <div
      style={{
        textAlign: "center",
        width: "100%",
        maxWidth: "900px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
      {/* Header section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1 style={{ margin: 0, color: "#2d3748" }}>User Profile</h1>
        <button
          onClick={() => setView("home")}
          className="secondary-btn"
          style={{ padding: "8px 16px", fontSize: "14px" }}
        >
          ← Back to Home
        </button>
      </div>

      {/* User Stats Card */}
      <div
        style={{
          padding: "20px",
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          marginBottom: "40px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        }}
      >
        <p style={{ margin: "5px 0", color: "#4a5568", fontSize: "16px" }}>
          <strong>Email:</strong> {user?.email || "Guest"}
        </p>
        <p style={{ margin: "5px 0", color: "#4a5568", fontSize: "16px" }}>
          <strong>Saved Melodies:</strong> {mockSongs.length}
        </p>
      </div>

      {/* Library Section */}
      <div style={{ textAlign: "left" }}>
        <h2
          style={{
            color: "#2d3748",
            borderBottom: "2px solid #e2e8f0",
            paddingBottom: "10px",
            marginBottom: "20px",
          }}
        >
          My Compositions
        </h2>

        {/* CSS Grid for the song cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
            gap: "20px",
          }}
        >
          {mockSongs.map((song) => (
            <div
              key={song.id}
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "15px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
              }}
            >
              {/* Song Info */}
              <div>
                <h3
                  style={{
                    margin: "0 0 5px 0",
                    color: "#2d3748",
                    fontSize: "18px",
                  }}
                >
                  {song.title}
                </h3>
                <p
                  style={{
                    margin: "0",
                    fontSize: "13px",
                    color: "#718096",
                    fontWeight: "600",
                  }}
                >
                  Key: {song.key_signature} | Style: {song.progression_style}
                </p>
                <p
                  style={{
                    margin: "5px 0 0 0",
                    fontSize: "12px",
                    color: "#a0aec0",
                  }}
                >
                  Last saved: {song.date}
                </p>
              </div>

              {/* Action Buttons Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                  marginTop: "auto",
                }}
              >
                <button
                  className="primary-btn"
                  style={{
                    padding: "8px",
                    fontSize: "13px",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Open
                </button>
                <button
                  className="btn-light"
                  style={{
                    padding: "8px",
                    fontSize: "13px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Rename
                </button>
                <button
                  className="btn-neutral"
                  style={{
                    padding: "8px",
                    fontSize: "13px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Export
                </button>
                <button
                  className="btn-danger"
                  style={{
                    padding: "8px",
                    fontSize: "13px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Profile;
