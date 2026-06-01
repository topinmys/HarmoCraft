import React from "react";

function Profile({ setView, user }) {
  return (
    <div
      style={{
        textAlign: "center",
        width: "100%",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      <h1>User Profile</h1>

      <div
        style={{
          padding: "20px",
          border: "1px solid #ccc",
          borderRadius: "8px",
          marginTop: "20px",
        }}
      >
        <p>
          <strong>Email:</strong> {user?.email}
        </p>
        <p>
          <strong>Saved Melodies:</strong> 0
        </p>
      </div>

      <button
        onClick={() => setView("home")}
        className="secondary-btn"
        style={{ marginTop: "30px" }}
      >
        ← Back to Home
      </button>
    </div>
  );
}

export default Profile;
