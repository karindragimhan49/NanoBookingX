/**
 * main.jsx — Application Bootstrap
 * -----------------------------------
 * Entry point for the React application.
 * Renders the root <App /> component into the DOM.
 *
 * React.StrictMode is enabled in development to:
 *  - Detect potential problems in components
 *  - Warn about deprecated lifecycle methods
 *  - Highlight unexpected side effects
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Import the global stylesheet (includes Tailwind CSS + design tokens)
import "./index.css";

import App from "./App.jsx";

// Mount the React app to the #root div in index.html
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
