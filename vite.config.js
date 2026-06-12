import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  root: ".",
  build: {
    rollupOptions: {
      input: {
        landing: resolve(__dirname, "frontend/landing.html"),
        workspace: resolve(__dirname, "frontend/index.html"),
        pricing: resolve(__dirname, "frontend/pricing.html"),
        billingSuccess: resolve(__dirname, "frontend/billing-success.html"),
        billingCancel: resolve(__dirname, "frontend/billing-cancel.html"),
        focusRoom: resolve(__dirname, "frontend/focus-room.html")
      }
    }
  },
  server: {
    host: "0.0.0.0",
    port: 5173
  }
});
