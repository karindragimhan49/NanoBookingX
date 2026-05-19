/**
 * NotFoundPage.jsx — 404 Page
 * ============================
 * Shown when the user navigates to a route that doesn't exist.
 * White background, clear messaging, and two helpful navigation buttons.
 */

import { Link } from "react-router-dom";
import { Home, Compass, ArrowRight } from "lucide-react";

const NotFoundPage = () => (
  <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center bg-white animate-fade-up">

    {/* Large decorative 404 number */}
    <div className="text-[9rem] font-black text-gray-100 leading-none select-none mb-4">
      404
    </div>

    {/* Compass icon */}
    <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-6">
      <Compass className="w-8 h-8 text-blue-600" strokeWidth={1.5} />
    </div>

    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
      You've Ventured Off the Map
    </h1>

    <p className="text-gray-500 text-base md:text-lg max-w-sm mb-8 leading-relaxed">
      The page you're looking for doesn't exist or may have been moved.
      Let's get you back on track.
    </p>

    {/* Navigation buttons */}
    <div className="flex flex-col sm:flex-row gap-3">
      <Link
        to="/"
        id="not-found-home-btn"
        className="btn btn-primary btn-lg"
      >
        <Home className="w-4 h-4" aria-hidden="true" />
        Back to Home
      </Link>
      <Link
        to="/tours"
        id="not-found-tours-btn"
        className="btn btn-ghost btn-lg"
      >
        Browse Tours
        <ArrowRight className="w-4 h-4" aria-hidden="true" />
      </Link>
    </div>
  </div>
);

export default NotFoundPage;
