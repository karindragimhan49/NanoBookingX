/**
 * NotFoundPage.jsx — 404 Page
 * ----------------------------
 * Displayed when the user navigates to a route that doesn't exist.
 * Provides a friendly message and navigation back to the home page.
 */

import { Link } from "react-router-dom";
import { Home, Compass } from "lucide-react";

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 animate-fade-in">
      {/* Large 404 display */}
      <div className="text-9xl font-black text-teal-500/20 leading-none select-none mb-2">
        404
      </div>

      <Compass className="w-16 h-16 text-teal-400 mb-6 animate-spin" style={{ animationDuration: "8s" }} />

      <h1 className="text-3xl font-bold text-white mb-3">You've Ventured Off the Map</h1>
      <p className="text-slate-400 text-lg max-w-md mb-8">
        The page you're looking for doesn't exist. Perhaps the adventure lies elsewhere?
      </p>

      {/* Navigation buttons */}
      <div className="flex gap-4">
        <Link
          to="/"
          id="not-found-home-btn"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-semibold transition-all duration-200"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
        <Link
          to="/tours"
          id="not-found-tours-btn"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-all duration-200 border border-slate-700"
        >
          Browse Tours
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
