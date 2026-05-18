/**
 * vite.config.js — Vite Build Configuration for GlobeTrek Frontend
 * -----------------------------------------------------------------
 * Configures the Vite dev server, plugins, and API proxy.
 *
 * Key configuration:
 *  - React plugin for JSX/Fast Refresh support
 *  - Tailwind CSS v4 via the official @tailwindcss/vite plugin
 *  - API proxy: forwards /api/* requests to the backend (avoids CORS in dev)
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    // Enables React JSX transformation and Fast Refresh (hot reloading)
    react(),

    // Tailwind CSS v4 Vite plugin — handles CSS processing automatically
    tailwindcss(),
  ],

  server: {
    port: 5173, // The port the dev server runs on

    // Proxy API requests to the Express backend during development.
    // Any request starting with /api will be forwarded to localhost:5000.
    // This eliminates the need for absolute API URLs in the frontend code.
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
