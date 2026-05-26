import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  root: "apps/web",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "apps/web/src"),
    },
  },
  build: {
    outDir: path.resolve(__dirname, "apps/web/dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, "apps/web/index.html"),
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/.netlify/functions": "http://localhost:8888",
    },
  },
});
