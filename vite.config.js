import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

const reactModuleAliases = {
  "react": resolve(__dirname, "node_modules/react"),
  "react-dom": resolve(__dirname, "node_modules/react-dom"),
  "react-dom/client": resolve(__dirname, "node_modules/react-dom/client.js"),
  "react/jsx-runtime": resolve(__dirname, "node_modules/react/jsx-runtime.js"),
  "react/jsx-dev-runtime": resolve(__dirname, "node_modules/react/jsx-dev-runtime.js")
};

export default defineConfig({
  plugins: [react()],
  root: ".",
  resolve: {
    alias: reactModuleAliases,
    dedupe: ["react", "react-dom"]
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-dom/client",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "zustand",
      "zustand/react",
      "zustand/react/shallow",
      "motion/react",
      "howler",
      "lucide-react",
      "gsap",
      "@react-three/fiber",
      "@radix-ui/react-dialog",
      "@radix-ui/react-tabs",
      "@radix-ui/react-slider"
    ]
  },
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
    port: 5175,
    strictPort: true
  },
  preview: {
    host: "0.0.0.0",
    port: 5175,
    strictPort: true
  }
});
