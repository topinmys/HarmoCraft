import React, { useState } from "react";
import "./App.css";
import SheetMusic from "./SheetMusic";
import Login from "./Login";
import Workspace from "./Workspace";
import Home from "./Home";
import Profile from "./Profile";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState("home");

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setCurrentView("home");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentView("home");
  };

  // show login page if not authenticated, otherwise show the main app
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      {currentView === "home" && (
        <Home setView={setCurrentView} onLogout={handleLogout} />
      )}
      {currentView === "workspace" && <Workspace setView={setCurrentView} />}
      {currentView === "profile" && <Profile setView={setCurrentView} />}
    </div>
  );
}

export default App;
