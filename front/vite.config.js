import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from '@tailwindcss/vite'

// Vite + Tailwind v4 + React

export default defineConfig({
  plugins: [react(), tailwind()],
  server: {port: 5173, strictPort: true
    // proxy: {
    //   "/api": {
    //     target: "http://localhost:5000",
    //     changeOrigin: true,
    //   },
    // },
  },
});