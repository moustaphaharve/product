import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    // Listen on all interfaces so http://127.0.0.1:5173/ works as well as localhost
    host: true,
    open: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        // Split the heaviest vendor groups into their own chunks so the
        // initial shell stays small. Anything not explicitly grouped lands
        // in the default "index" chunk (no circular refs).
        manualChunks: {
          three: [
            "three",
            "@react-three/fiber",
            "@react-three/drei",
            "@react-three/postprocessing",
            "postprocessing",
          ],
          clerk: ["@clerk/clerk-react"],
          framer: ["framer-motion"],
        },
      },
    },
  },
});
