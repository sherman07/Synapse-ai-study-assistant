import React from "react";
import { createRoot } from "react-dom/client";
import { LandingPage } from "./LandingPage.jsx";
import "./landing.css";

const root = document.getElementById("landing-root");

if (!root) {
  throw new Error("Synapse landing root was not found.");
}

createRoot(root).render(
  <React.StrictMode>
    <LandingPage />
  </React.StrictMode>
);
