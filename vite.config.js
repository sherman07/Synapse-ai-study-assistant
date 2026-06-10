import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  root: ".",
  build: {
    rollupOptions: {
      input: {
        workspace: resolve(__dirname, "frontend/index.html"),
        focusRoom: resolve(__dirname, "frontend/focus-room.html")
      }
    }
  },
  server: {
    host: "0.0.0.0",
    port: 5173
  }
});
