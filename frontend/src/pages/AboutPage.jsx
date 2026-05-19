/**
 * AboutPage.jsx — About GlobeTrek Adventures
 * ---------------------------------------------
 * Light theme placeholder. Full about page coming in the next phase.
 */

import { Globe } from "lucide-react";

const AboutPage = () => (
  <div className="min-h-[80vh] bg-white animate-fade-in">

    {/* Page header */}
    <div className="bg-gray-50 border-b border-gray-200 py-12">
      <div className="container-custom">
        <p className="text-xs font-bold text-[#1B4F8A] uppercase tracking-widest mb-2">
          Our Story
        </p>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          About GlobeTrek Adventures
        </h1>
        <p className="text-gray-500 text-lg max-w-xl">
          Sri Lanka's premier travel partner, based in Negombo, dedicated to crafting
          unforgettable adventures.
        </p>
      </div>
    </div>

    {/* Placeholder content */}
    <div className="container-custom section-padding text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#EFF6FF] flex items-center justify-center mx-auto mb-5">
        <Globe className="w-8 h-8 text-[#1B4F8A]" aria-hidden="true" />
      </div>
      <p className="text-gray-500 max-w-md mx-auto">
        Our full story, team, and values page is coming in the next phase.
      </p>
    </div>

  </div>
);

export default AboutPage;
