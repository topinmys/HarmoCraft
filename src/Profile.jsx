import React, { useState, useEffect } from "react";
import { supabase } from "./supabase_client";

function Profile({ setView, user, setCurrentProject }) {
  const [songs, setSongs] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);

  useEffect(() => {
    console.log("use effect");
    const fetchData = async () => {
      const { data } = await supabase
        .from("melodies")
        .select("*")
        .eq("user_id", user.id)
        .neq("melody_name", "HarmoCraft Sandbox");

      console.log(data);

      if (data) {
        setSongs(data);
      }
    };

    fetchData();
  }, [refresh]);

  const openDeleteModal = (song) => {
    setSelectedSong(song);
    setShowDeleteModal(true);
  };

  const openRenameModal = (song) => {
    setSelectedSong(song);
    setNewTitle(song.melody_name);
    setShowRenameModal(true);
  };

  // actual db delete function
  const handleDelete = async () => {
    if (!selectedSong) return;

    const { error } = await supabase
      .from("melodies")
      .delete()
      .eq("id", selectedSong.id);

    if (error) {
      console.log(error);
    }

    // close modal and refresh list
    setShowDeleteModal(false);
    setSelectedSong(null);
    setRefresh(!refresh);
  };

  // actual db rename function
  const handleRename = async () => {
    if (!selectedSong || !newTitle.trim()) return;

    const { error } = await supabase
      .from("melodies")
      .update({
        melody_name: newTitle,
      })
      .eq("user_id", user.id)
      .eq("melody_name", selectedSong.melody_name);

    if (error) {
      console.log(error);
    }

    // close modal and refresh list
    setShowRenameModal(false);
    setSelectedSong(null);
    setRefresh(!refresh);
  };

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
      {/* header section */}
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
          onClick={() => {
            setCurrentProject(null);
            setView("home");
          }}
          className="secondary-btn"
          style={{ padding: "8px 16px", fontSize: "14px" }}
        >
          ← Back to Home
        </button>
      </div>

      {/* user stats card */}
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
          <strong>Saved Melodies:</strong> {songs.length}
        </p>
      </div>

      {/* library section */}
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

        {/* css grid for the song cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
            gap: "20px",
          }}
        >
          {songs.map((song) => (
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
              {/* song info */}
              <div>
                <h3
                  style={{
                    margin: "0 0 5px 0",
                    color: "#2d3748",
                    fontSize: "18px",
                  }}
                >
                  {song.melody_name}
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
                  Last saved:{" "}
                  {new Date(song.last_saved).toLocaleDateString("en-CA")}
                </p>
              </div>

              {/* action buttons grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                  marginTop: "auto",
                }}
              >
                <button
                  onClick={() => {
                    setCurrentProject(song);
                    setView("workspace");
                  }}
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
                  onClick={() => openRenameModal(song)}
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
                  onClick={() => handleExport(song)}
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
                  onClick={() => openDeleteModal(song)}
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

      {/* rename modal overlay */}
      {showRenameModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.6)",
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "10px",
              width: "400px",
              textAlign: "center",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            }}
          >
            <h2 style={{ margin: "0 0 15px 0", color: "#2d3748" }}>
              Rename Composition
            </h2>
            <input
              type="text"
              placeholder="Enter new title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "20px",
                borderRadius: "6px",
                border: "1px solid #cbd5e0",
                boxSizing: "border-box",
                fontSize: "16px",
              }}
            />
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                className="btn-neutral"
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
                onClick={() => {
                  setShowRenameModal(false);
                  setSelectedSong(null);
                }}
              >
                Cancel
              </button>
              <button
                className="primary-btn"
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
                onClick={handleRename}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* delete confirmation modal overlay */}
      {showDeleteModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.6)",
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "10px",
              width: "400px",
              textAlign: "center",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            }}
          >
            <h2 style={{ margin: "0 0 15px 0", color: "#e53e3e" }}>
              Delete Composition?
            </h2>
            <p style={{ margin: "0 0 20px 0", color: "#718096" }}>
              Are you sure you want to delete "{selectedSong?.melody_name}"?
              This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                className="btn-neutral"
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedSong(null);
                }}
              >
                Cancel
              </button>
              <button
                className="btn-danger"
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
                onClick={handleDelete}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
