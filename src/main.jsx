import React from "react";
import ReactDOM from "react-dom/client";
import { Preferences } from "@capacitor/preferences";
import StudyPlanner from "./StudyPlanner.jsx";
import "./index.css";

/* Register Preferences on the global bridge so StudyPlanner can find it at
   runtime. Keeping it out of StudyPlanner.jsx means the exact same file runs
   both here and in a Claude artifact, with no porting step. */
if (typeof window !== "undefined") {
  window.Capacitor = window.Capacitor || {};
  window.Capacitor.Plugins = window.Capacitor.Plugins || {};
  window.Capacitor.Plugins.Preferences = Preferences;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <StudyPlanner />
  </React.StrictMode>
);
