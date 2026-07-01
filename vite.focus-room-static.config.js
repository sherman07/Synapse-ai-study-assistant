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
  define: {
    "process.env.NODE_ENV": JSON.stringify("production")
  },
  plugins: [react()],
  root: ".",
  resolve: {
    alias: reactModuleAliases,
    dedupe: ["react", "react-dom"]
  },
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
