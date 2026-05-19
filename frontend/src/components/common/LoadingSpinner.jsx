/**
 * LoadingSpinner.jsx — Reusable Loading Indicator Components
 * ============================================================
 * Provides four exported spinner variants for different use cases:
 *
 *  1. <Spinner />      — A standalone animated ring. Use inside any element.
 *  2. <PageSpinner />  — Full-viewport overlay with a label. Used during
 *                         page transitions and auth restoration checks.
 *  3. <SectionSpinner />— Centers a spinner inside its parent container.
 *                         Used when loading data for a card or section.
 *  4. <ButtonSpinner /> — Tiny inline spinner for inside loading buttons.
 *
 * All spinners use the brand blue colour and respect the user's
 * `prefers-reduced-motion` setting via the CSS animation.
 */

/* ── Design note ──────────────────────────────────────────────
   The ring is built with a single div that has:
     - a full circular border (border-4 rounded-full)
     - one transparent border segment that creates the "gap"
     - a CSS animation that rotates the ring
   This avoids SVG complexity while remaining perfectly smooth.
   ──────────────────────────────────────────────────────────── */

/* ─────────────────────────────────────────────────────────────
   SPINNER — Base spinning ring
   Props:
     size    ("sm" | "md" | "lg" | "xl") — Controls ring diameter
     color   ("blue" | "white" | "gray") — Ring colour
   ───────────────────────────────────────────────────────────── */
export const Spinner = ({ size = "md", color = "blue", className = "" }) => {

  /* Map size names to Tailwind width/height and border-width classes */
  const sizeMap = {
    xs: "w-4  h-4  border-2",
    sm: "w-5  h-5  border-2",
    md: "w-8  h-8  border-[3px]",
    lg: "w-11 h-11 border-4",
    xl: "w-14 h-14 border-4",
  };

  /* Map colour names to border colour classes */
  const colorMap = {
    blue:  "border-blue-600  border-t-transparent",
    white: "border-white     border-t-transparent",
    gray:  "border-gray-300  border-t-transparent",
  };

  return (
    <div
      role="status"
      aria-label="Loading"
      className={`
        ${sizeMap[size] ?? sizeMap.md}
        ${colorMap[color] ?? colorMap.blue}
        rounded-full
        animate-spin
        ${className}
      `}
      style={{ animationDuration: "0.75s" }}
    />
  );
};

/* ─────────────────────────────────────────────────────────────
   PAGE SPINNER — Full-viewport loading overlay
   Shown during page lazy-load and auth session restoration.
   Props:
     label ("string") — Optional text shown below the spinner
   ───────────────────────────────────────────────────────────── */
export const PageSpinner = ({ label = "Loading…" }) => (
  /* White overlay that covers the full viewport */
  <div
    role="status"
    aria-live="polite"
    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white gap-4"
  >
    {/* Brand logo mark — gives context while waiting */}
    <div className="flex items-center gap-2 mb-2">
      {/* Simple blue globe placeholder */}
      <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"
          className="w-5 h-5" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 010 18M12 3a15 15 0 000 18" />
        </svg>
      </div>
      <span className="font-semibold text-gray-800 text-lg tracking-tight">
        GlobeTrek
      </span>
    </div>

    {/* Spinner ring */}
    <Spinner size="lg" color="blue" />

    {/* Label */}
    {label && (
      <p className="text-sm font-medium text-gray-500 mt-1">{label}</p>
    )}
  </div>
);

/* ─────────────────────────────────────────────────────────────
   SECTION SPINNER — Centred spinner inside a container
   Used when fetching data for a card, table, or section.
   Props:
     label   — Optional message (default: "Loading…")
     minHeight — Minimum container height in pixels (default: 200)
   ───────────────────────────────────────────────────────────── */
export const SectionSpinner = ({ label = "Loading…", minHeight = 200 }) => (
  <div
    role="status"
    aria-live="polite"
    className="w-full flex flex-col items-center justify-center gap-3"
    style={{ minHeight }}
  >
    <Spinner size="lg" color="blue" />
    {label && (
      <p className="text-sm text-gray-500 font-medium">{label}</p>
    )}
  </div>
);

/* ─────────────────────────────────────────────────────────────
   BUTTON SPINNER — Tiny inline spinner for loading buttons.
   Usage:  <button disabled={loading}>
             {loading ? <><ButtonSpinner /> Saving…</> : "Save"}
           </button>
   ───────────────────────────────────────────────────────────── */
export const ButtonSpinner = ({ color = "white" }) => (
  <Spinner size="xs" color={color} className="inline-block" />
);
