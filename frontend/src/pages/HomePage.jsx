/**
 * HomePage.jsx — GlobeTrek Adventures Landing Page
 * ==================================================
 * Full marketing landing page for guest visitors.
 * WHITE / LIGHT theme — crisp, professional, premium.
 *
 * Sections:
 *   1. Hero          — Bold headline, subtext, CTA buttons, key stats
 *   2. Destinations  — Quick-filter pills for popular Sri Lanka locations
 *   3. Why GlobeTrek — 4-column feature card grid
 *   4. CTA Banner    — Full-width call-to-action before the footer
 */

import { Link } from "react-router-dom";
import {
  ArrowRight, Star, Shield, Clock, Users,
  MapPin, CheckCircle, ChevronRight,
} from "lucide-react";

/* ── Feature cards data ──────────────────────────────────────── */
const FEATURES = [
  {
    id: "expert-guides",
    icon: Users,
    color: "blue",
    title: "Expert Local Guides",
    description:
      "Our certified guides bring Sri Lanka's culture, history, and hidden gems to life with insider knowledge.",
  },
  {
    id: "safety-first",
    icon: Shield,
    color: "green",
    title: "Fully Insured & Safe",
    description:
      "Every tour is comprehensively insured and rigorously safety-checked so you can relax and explore.",
  },
  {
    id: "flexible-booking",
    icon: Clock,
    color: "amber",
    title: "Flexible Booking",
    description:
      "Free cancellation up to 48 hours before your tour starts. Your schedule, your adventure.",
  },
  {
    id: "top-rated",
    icon: Star,
    color: "purple",
    title: "Top Rated Experiences",
    description:
      "Consistently rated 4.9 ★ by over 500 travellers — quality and satisfaction are our guarantee.",
  },
];

/* ── Icon colour map for feature cards ───────────────────────── */
const ICON_COLORS = {
  blue:   "bg-blue-50   text-blue-600   border-blue-100",
  green:  "bg-green-50  text-green-600  border-green-100",
  amber:  "bg-amber-50  text-amber-600  border-amber-100",
  purple: "bg-purple-50 text-purple-600 border-purple-100",
};

/* ── Popular destination pills ───────────────────────────────── */
const DESTINATIONS = [
  "Sigiriya", "Kandy", "Ella", "Yala", "Galle",
  "Mirissa", "Nuwara Eliya", "Negombo", "Trincomalee",
];

/* ── Stats strip ─────────────────────────────────────────────── */
const STATS = [
  { value: "500+", label: "Happy Travellers" },
  { value: "45+",  label: "Tour Packages" },
  { value: "4.9★", label: "Average Rating" },
  { value: "8+",   label: "Years of Experience" },
];

/* ════════════════════════════════════════════════════════════════
   HOME PAGE COMPONENT
   ════════════════════════════════════════════════════════════════ */
const HomePage = () => (
  <div className="animate-fade-up">

    {/* ══════════════════════════════════════════════════════
        SECTION 1 — HERO
        White background, deep blue typography, two CTA buttons.
        ══════════════════════════════════════════════════════ */}
    <section className="relative bg-white overflow-hidden">

      {/* Subtle blue gradient orb in the top-right corner */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-blue-50 opacity-60 blur-3xl"
      />

      <div className="container-custom pt-20 pb-24 relative">
        <div className="max-w-3xl">

          {/* Eyebrow label */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full
            bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold
            tracking-wide mb-6">
            <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
            Based in Negombo, Sri Lanka 🇱🇰
          </div>

          {/* Main headline */}
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold
            text-gray-900 leading-[1.1] tracking-tight mb-6">
            Discover the{" "}
            <span className="text-gradient-blue">Wonder</span>{" "}
            of Sri Lanka
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mb-8 leading-relaxed">
            Handcrafted travel experiences that go beyond sightseeing.
            Join thousands of adventurers who've trusted GlobeTrek to deliver the
            journey of a lifetime.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-12">
            <Link
              to="/tours"
              id="hero-explore-btn"
              className="btn btn-primary btn-lg group"
            >
              Explore All Tours
              <ArrowRight
                className="w-5 h-5 group-hover:translate-x-0.5 transition-transform"
                aria-hidden="true"
              />
            </Link>
            <Link
              to="/about"
              id="hero-about-btn"
              className="btn btn-ghost btn-lg"
            >
              About GlobeTrek
            </Link>
          </div>

          {/* Trust checkmarks */}
          <div className="flex flex-wrap gap-5 mb-12">
            {[
              "Free cancellation up to 48 hrs",
              "Fully licensed & insured",
              "Expert English-speaking guides",
            ].map((point) => (
              <div key={point} className="flex items-center gap-2 text-sm text-gray-500">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" aria-hidden="true" />
                {point}
              </div>
            ))}
          </div>

          {/* Stats strip */}
          <div className="flex flex-wrap gap-8">
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <p className="text-2xl font-bold text-gray-900 leading-none">
                  {value}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* ══════════════════════════════════════════════════════
        SECTION 2 — POPULAR DESTINATIONS (pill filter bar)
        ══════════════════════════════════════════════════════ */}
    <section className="bg-gray-50 border-y border-gray-200 py-5">
      <div className="container-custom">
        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {/* Label */}
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex-shrink-0">
            Popular:
          </span>
          {/* Destination pills */}
          {DESTINATIONS.map((dest) => (
            <Link
              key={dest}
              to={`/tours?search=${encodeURIComponent(dest)}`}
              className="
                flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium
                bg-white border border-gray-200 text-gray-600
                hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50
                transition-all duration-150 whitespace-nowrap
              "
            >
              {dest}
            </Link>
          ))}
        </div>
      </div>
    </section>

    {/* ══════════════════════════════════════════════════════
        SECTION 3 — WHY GLOBETREK (feature cards)
        ══════════════════════════════════════════════════════ */}
    <section className="section-padding bg-white">
      <div className="container-custom">

        {/* Section header */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">
            Why Choose Us
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Travel Made Simple,{" "}
            <span className="text-gradient-blue">Memorable & Safe</span>
          </h2>
          <p className="text-gray-500 text-lg leading-relaxed">
            We're not just a booking platform — we're your dedicated adventure partners,
            committed to exceeding your expectations at every step.
          </p>
        </div>

        {/* 4-column card grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map(({ id, icon: Icon, color, title, description }) => (
            <article
              key={id}
              id={`feature-card-${id}`}
              className="card card-hover p-6"
            >
              {/* Icon badge */}
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center
                border mb-4 ${ICON_COLORS[color]}
              `}>
                <Icon className="w-6 h-6" strokeWidth={1.75} aria-hidden="true" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>

    {/* ══════════════════════════════════════════════════════
        SECTION 4 — FULL-WIDTH CTA BANNER
        ══════════════════════════════════════════════════════ */}
    <section className="bg-blue-600 py-16">
      <div className="container-custom text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-200 mb-3">
          Limited Availability
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
          Ready for Your Next Adventure?
        </h2>
        <p className="text-blue-200 text-lg mb-8 max-w-md mx-auto leading-relaxed">
          Browse 45+ curated Sri Lanka tours and lock in your dates today
          before they fill up.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/tours"
            id="cta-browse-tours-btn"
            className="
              inline-flex items-center justify-center gap-2
              px-8 py-3.5 rounded-xl bg-white text-blue-700
              text-sm font-bold shadow-lg
              hover:bg-blue-50 transition-colors duration-200
            "
          >
            Browse All Tours
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </Link>
          <Link
            to="/contact"
            id="cta-contact-btn"
            className="
              inline-flex items-center justify-center gap-2
              px-8 py-3.5 rounded-xl border border-blue-400 text-white
              text-sm font-semibold
              hover:bg-blue-700 transition-colors duration-200
            "
          >
            Talk to Our Team
          </Link>
        </div>
      </div>
    </section>

  </div>
);

export default HomePage;
