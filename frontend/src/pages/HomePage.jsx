/**
 * HomePage.jsx — GlobeTrek Adventures Landing Page
 * --------------------------------------------------
 * The main marketing page. Features:
 *  - Full-screen hero section with a bold headline and CTA
 *  - Search/filter bar for quick tour discovery
 *  - Feature highlights (Why Choose Us)
 *  - Call-to-action banner
 */

import { Link } from "react-router-dom";
import { ArrowRight, Star, Shield, Clock, Users, MapPin } from "lucide-react";

// ---- Feature data for the "Why GlobeTrek?" section ----
const FEATURES = [
  {
    id: "expert-guides",
    Icon: Users,
    title: "Expert Local Guides",
    description: "Our certified guides bring Sri Lanka's stories to life with insider knowledge and genuine passion.",
  },
  {
    id: "safety-first",
    Icon: Shield,
    title: "Safety First",
    description: "Every tour is fully insured and rigorously safety-checked so you can explore with total confidence.",
  },
  {
    id: "flexible-booking",
    Icon: Clock,
    title: "Flexible Booking",
    description: "Free cancellation up to 48 hours before your tour. Your plans change — we understand.",
  },
  {
    id: "curated-experiences",
    Icon: Star,
    title: "Curated Experiences",
    description: "Handpicked destinations and itineraries designed to deliver authentic, unforgettable memories.",
  },
];

// ---- Popular destination tags ----
const DESTINATIONS = ["Sigiriya", "Kandy", "Ella", "Yala", "Galle", "Mirissa", "Nuwara Eliya", "Negombo"];

const HomePage = () => {
  return (
    <div className="animate-fade-in">

      {/* ============================================================
          HERO SECTION
          ============================================================ */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">

        {/* Background gradient blobs for visual depth */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 -left-40 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        </div>

        <div className="container-custom py-20">
          <div className="max-w-3xl">

            {/* Eyebrow label */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm font-medium mb-6">
              <MapPin className="w-4 h-4" />
              Based in Negombo, Sri Lanka 🇱🇰
            </div>

            {/* Main headline */}
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              <span className="text-white">Discover the</span>{" "}
              <span className="text-gradient">Wonder</span>{" "}
              <span className="text-white">of Sri Lanka</span>
            </h1>

            <p className="text-slate-400 text-lg md:text-xl max-w-xl mb-8 leading-relaxed">
              Handcrafted travel experiences that go beyond sightseeing. Join thousands
              of adventurers who've trusted GlobeTrek to create the journey of a lifetime.
            </p>

            {/* Call-to-action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link
                to="/tours"
                id="hero-explore-tours-btn"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-semibold text-lg transition-all duration-300 shadow-lg shadow-teal-500/25 hover:shadow-teal-400/30 hover:-translate-y-0.5"
              >
                Explore Tours
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/about"
                id="hero-learn-more-btn"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-lg transition-all duration-300 border border-slate-700"
              >
                Learn More
              </Link>
            </div>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-8 text-sm text-slate-400">
              {[
                { value: "500+", label: "Happy Travelers" },
                { value: "45+", label: "Tour Packages" },
                { value: "4.9★", label: "Average Rating" },
                { value: "8+", label: "Years Experience" },
              ].map(({ value, label }) => (
                <div key={label}>
                  <div className="text-2xl font-bold text-white mb-0.5">{value}</div>
                  <div>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          POPULAR DESTINATIONS TAGS
          ============================================================ */}
      <section className="bg-slate-800/50 border-y border-slate-700/50 py-6">
        <div className="container-custom">
          <div className="flex items-center gap-4 overflow-x-auto pb-1 scrollbar-hide">
            <span className="text-slate-400 text-sm font-medium whitespace-nowrap flex-shrink-0">
              Popular:
            </span>
            {DESTINATIONS.map((destination) => (
              <Link
                key={destination}
                to={`/tours?search=${destination}`}
                className="flex-shrink-0 px-4 py-1.5 rounded-full bg-slate-700 hover:bg-teal-500/20 hover:border-teal-500/40 text-slate-300 hover:text-teal-400 text-sm border border-slate-600 transition-all duration-200 whitespace-nowrap"
              >
                {destination}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          WHY CHOOSE GLOBETREK SECTION
          ============================================================ */}
      <section className="section-padding">
        <div className="container-custom">

          {/* Section header */}
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Travel With <span className="text-teal-400">GlobeTrek?</span>
            </h2>
            <p className="text-slate-400 text-lg">
              We're not just a booking platform — we're your adventure partners,
              committed to making every moment extraordinary.
            </p>
          </div>

          {/* Feature cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ id, Icon, title, description }) => (
              <div
                key={id}
                id={`feature-${id}`}
                className="glass-card p-6 hover:border-teal-500/30 transition-all duration-300 group hover:-translate-y-1"
              >
                {/* Icon badge */}
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center mb-4 group-hover:bg-teal-500/20 transition-colors">
                  <Icon className="w-6 h-6 text-teal-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          CALL-TO-ACTION BANNER
          ============================================================ */}
      <section className="section-padding bg-gradient-to-r from-teal-900/40 to-slate-800/40 border-y border-teal-500/10">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready for Your Next Adventure?
          </h2>
          <p className="text-slate-400 text-lg mb-8 max-w-lg mx-auto">
            Browse our curated collection of Sri Lanka tours and book your spot today.
            Limited availability — don't miss out!
          </p>
          <Link
            to="/tours"
            id="cta-browse-tours-btn"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-bold text-lg transition-all duration-300 shadow-xl shadow-teal-500/20 hover:-translate-y-0.5"
          >
            Browse All Tours
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
