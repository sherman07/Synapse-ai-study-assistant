import React from "react";
import { createRoot } from "react-dom/client";
import { LandingPage } from "./LandingPage.jsx";
import "./landing.css";

const root = document.getElementById("landing-root");

if (!root) {
  throw new Error("Synapse landing root was not found.");
}

root.classList.remove("static-landing");
root.removeAttribute("data-static-fallback");

createRoot(root).render(
  <React.StrictMode>
    <LandingPage />
  </React.StrictMode>
);
