import React, { useState, useEffect } from "react";
import "./App.css";
import SheetMusic from "./SheetMusic";
import Login from "./Login";
import Workspace from "./Workspace";
import Home from "./Home";
import Profile from "./Profile";
import { supabase } from "./supabase_client";

function App() {
  //const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState("home");

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // console.log("Initial session:", session);

      setSession(session);
      setLoading(false);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // console.log("Auth changed:", session);

      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLoginSuccess = () => {
    //setIsAuthenticated(true);
    setCurrentView("home");
  };

  const handleLogout = async () => {
    //setIsAuthenticated(false);
    await supabase.auth.signOut();
    setCurrentView("home");
  };

  // //show login page if not authenticated, otherwise show the main app
  // if (!isAuthenticated) {
  //   return <Login onLoginSuccess={handleLoginSuccess} />;
  // }

  if (!session) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      {currentView === "home" && (
        <Home setView={setCurrentView} onLogout={handleLogout} />
      )}
      {currentView === "workspace" && <Workspace setView={setCurrentView} user={session?.user} />}
      {currentView === "profile" && (
        <Profile setView={setCurrentView} user={session?.user} />
      )}
    </div>
  );
}

export default App;
