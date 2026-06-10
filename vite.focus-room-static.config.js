import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  define: {
    "process.env.NODE_ENV": JSON.stringify("production")
  },
  plugins: [react()],
  root: ".",
  build: {
    copyPublicDir: false,
    emptyOutDir: true,
    outDir: "frontend/assets/focus-room-app",
    sourcemap: false,
    lib: {
      entry: resolve(__dirname, "frontend/src/focus-room/standalone.js"),
      formats: ["es"],
      fileName: () => "focus-room-static.js"
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true
      }
    }
  }
});
