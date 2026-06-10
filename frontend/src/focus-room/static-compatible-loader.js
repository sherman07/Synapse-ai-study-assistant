const VITE_PORTS = new Set(["5173", "5174", "5175", "5176", "5177", "5178", "4173"]);

function renderFocusRoomLoadError(error) {
  console.error("Synapse Focus Room failed to load:", error);
  const root = document.getElementById("focusRoomRoot");
  if (!root) return;
  const message = String(error?.message || error || "Unknown error");
  root.innerHTML = [
    '<section class="focus-empty-stage">',
    '<article class="liquid-glass focus-empty-card">',
    "<h1>Synapse Focus Room</h1>",
    "<p>Focus Room could not load. Refresh the page, or start the Vite dev server with npm run dev.</p>",
    `<p>${message.replace(/[<>&]/g, char => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[char]))}</p>`,
    "</article>",
    "</section>"
  ].join("");
}

if (VITE_PORTS.has(window.location.port)) {
  import("./standalone.js?v=focus-room-react-vite-v2").catch(renderFocusRoomLoadError);
} else {
  import(/* @vite-ignore */ "../../assets/focus-room-app/focus-room-static.js?v=focus-room-static-v1")
    .catch(renderFocusRoomLoadError);
}
