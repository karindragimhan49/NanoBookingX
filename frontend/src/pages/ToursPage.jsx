/**
 * ToursPage.jsx — Tour Package Listings
 * ----------------------------------------
 * Fetches packages from /api/packages, supports URL-based search & category
 * filtering via useSearchParams. Shows skeleton cards while loading.
 *
 * URL params:
 *   ?search=<string>       — text search applied to name / destination
 *   ?category=<string>     — filter by package category
 */

import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search, MapPin, Clock, Star, SlidersHorizontal, X,
} from "lucide-react";
// Use the packagesApi (backend renamed tours → packages)
import { getAllPackages } from "../api/packagesApi";
import { SectionSpinner } from "../components/common/LoadingSpinner";

/* Skeleton card — shown while packages are loading */
const SkeletonCard = () => (
  <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white">
    <div className="h-48 skeleton" />
    <div className="p-5 space-y-3">
      <div className="h-3 w-1/3 skeleton rounded" />
      <div className="h-4 w-3/4 skeleton rounded" />
      <div className="h-3 w-full skeleton rounded" />
      <div className="h-3 w-2/3 skeleton rounded" />
    </div>
  </div>
);

// ---- Category filter options — must match the backend TravelPackage enum ----
const CATEGORIES = [
  { value: "",           label: "All"        },
  { value: "beach",      label: "Beach"      },
  { value: "cultural",   label: "Cultural"   },
  { value: "wildlife",   label: "Wildlife"   },
  { value: "adventure",  label: "Adventure"  },
  { value: "wellness",   label: "Wellness"   },
  { value: "luxury",     label: "Luxury"     },
  { value: "budget",     label: "Budget"     },
  { value: "family",     label: "Family"     },
];

// ---- Difficulty badge colours — keys match the backend enum (easy/moderate/challenging) ----
const DIFFICULTY_STYLES = {
  easy:        "bg-emerald-50 text-emerald-700 border-emerald-200",
  moderate:    "bg-amber-50   text-amber-700   border-amber-200",
  challenging: "bg-red-50     text-red-700     border-red-200",
};

/* ──────────────────────────────────────────────────────────────
   TourCard — single package card in the grid
   ────────────────────────────────────────────────────────────── */
const TourCard = ({ tour }) => {
  const price        = tour.discountedPrice ?? tour.pricePerPerson;
  const hasDiscount  = tour.discountedPrice && tour.discountedPrice < tour.pricePerPerson;
  const destination  = tour.destination
    ? `${tour.destination.city}, ${tour.destination.country}`
    : "Sri Lanka";

  return (
    <Link
      to={`/tours/${tour.id}`}
      className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-[#1B4F8A]/40 hover:shadow-md transition-all duration-300 flex flex-col"
      aria-label={`View ${tour.name}`}
    >
      {/* Cover image / placeholder */}
      <div className="relative h-48 bg-linear-to-br from-[#EFF6FF] to-[#DBEAFE] overflow-hidden shrink-0">
        {tour.coverImage ? (
          <img
            src={tour.coverImage}
            alt={tour.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin className="w-12 h-12 text-[#1B4F8A]/20" aria-hidden="true" />
          </div>
        )}

        {/* Featured badge */}
        {tour.isFeatured && (
          <span className="absolute top-3 left-3 bg-[#1B4F8A] text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            Featured
          </span>
        )}

        {/* Difficulty badge */}
        {tour.difficulty && (
          <span
            className={`absolute top-3 right-3 text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${
              DIFFICULTY_STYLES[tour.difficulty] || DIFFICULTY_STYLES.easy
            }`}
          >
            {tour.difficulty}
          </span>
        )}
      </div>

      {/* Card body */}
      <div className="p-5 flex flex-col flex-1">

        {/* Destination */}
        <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-2">
          <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{destination}</span>
        </div>

        {/* Name */}
        <h3 className="text-gray-900 font-semibold text-base mb-2 line-clamp-2 group-hover:text-[#1B4F8A] transition-colors">
          {tour.name}
        </h3>

        {/* Summary */}
        {tour.summary && (
          <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4 flex-1">
            {tour.summary}
          </p>
        )}

        {/* Footer: stats + price */}
        <div className="flex items-end justify-between mt-auto pt-3 border-t border-gray-100">

          {/* Duration + rating */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 text-gray-500 text-xs">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{tour.durationDays || tour.durationNights || "?"} days</span>
            </div>
            {tour.averageRating > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" aria-hidden="true" />
                <span className="font-medium text-gray-700">{tour.averageRating.toFixed(1)}</span>
                <span className="text-gray-400">({tour.reviewCount})</span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="text-right">
            {hasDiscount && (
              <div className="text-xs text-gray-400 line-through">
                ${tour.pricePerPerson}
              </div>
            )}
            <div className="text-[#1B4F8A] font-bold text-lg">
              ${price}
            </div>
            <div className="text-gray-400 text-xs">per person</div>
          </div>
        </div>

      </div>
    </Link>
  );
};

/* ──────────────────────────────────────────────────────────────
   EmptyState — shown when no tours match the filter
   ────────────────────────────────────────────────────────────── */
const EmptyState = ({ onReset }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
    <div className="w-16 h-16 rounded-2xl bg-[#EFF6FF] flex items-center justify-center mb-4">
      <Search className="w-8 h-8 text-[#1B4F8A]/40" aria-hidden="true" />
    </div>
    <h3 className="text-gray-900 font-semibold text-lg mb-2">No tours found</h3>
    <p className="text-gray-500 text-sm mb-5 max-w-xs">
      No packages match your current filters. Try a different search or category.
    </p>
    <button
      onClick={onReset}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B4F8A] text-white font-medium text-sm hover:bg-[#163F70] transition-colors"
    >
      <X className="w-4 h-4" aria-hidden="true" />
      Clear Filters
    </button>
  </div>
);

/* ══════════════════════════════════════════════════════════════
   ToursPage — Main component
   ══════════════════════════════════════════════════════════════ */
const ToursPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read active filters from URL
  const urlSearch   = searchParams.get("search")   || "";
  const urlCategory = searchParams.get("category") || "";

  // Local state for the search input (avoid API call on every keystroke)
  const [searchInput, setSearchInput] = useState(urlSearch);

  const [tours,     setTours]     = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState("");
  const [total,     setTotal]     = useState(0);

  // ---- Fetch packages whenever URL params change ----
  const fetchTours = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const params = {};
      if (urlSearch)   params.search     = urlSearch;
      if (urlCategory) params.difficulty = urlCategory; // map category → difficulty filter

      const res = await getAllPackages(params);
      const data = res.data;
      // Backend returns { success, count, packages }
      const list = data?.packages ?? [];
      setTours(Array.isArray(list) ? list : []);
      setTotal(data?.count ?? list.length);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load packages. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [urlSearch, urlCategory]);

  useEffect(() => {
    fetchTours();
  }, [fetchTours]);

  // Update the search input when URL changes (e.g. clicking a destination pill on HomePage)
  useEffect(() => {
    setSearchInput(urlSearch);
  }, [urlSearch]);

  // ---- Filter helpers ----
  const applySearch = () => {
    const params = {};
    if (searchInput.trim()) params.search = searchInput.trim();
    if (urlCategory)        params.category = urlCategory;
    setSearchParams(params);
  };

  const selectCategory = (cat) => {
    const params = {};
    if (urlSearch) params.search = urlSearch;
    if (cat)       params.category = cat;
    setSearchParams(params);
  };

  const resetFilters = () => {
    setSearchInput("");
    setSearchParams({});
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") applySearch();
  };

  const hasActiveFilters = urlSearch || urlCategory;

  return (
    <div className="min-h-screen bg-white animate-fade-in">

      {/* ── Page header ── */}
      <div className="bg-gray-50 border-b border-gray-200 py-10">
        <div className="container-custom">
          <p className="text-xs font-bold text-[#1B4F8A] uppercase tracking-widest mb-2">
            Explore
          </p>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Tour Packages</h1>
          <p className="text-gray-500">
            {isLoading
              ? "Loading packages…"
              : `${total} curated Sri Lanka adventure${total !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      <div className="container-custom py-8">

        {/* ── Search + filter bar ── */}
        <div className="mb-6 space-y-4">

          {/* Search input */}
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search by name or destination…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B4F8A]/30 focus:border-[#1B4F8A] transition-colors"
              />
            </div>
            <button
              onClick={applySearch}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B4F8A] hover:bg-[#163F70] text-white font-medium text-sm transition-colors shadow-sm"
            >
              <Search className="w-4 h-4" aria-hidden="true" />
              Search
            </button>
          </div>

          {/* Category pills */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
              Category:
            </div>
            {CATEGORIES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => selectCategory(value)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                  urlCategory === value
                    ? "bg-[#1B4F8A] border-[#1B4F8A] text-white"
                    : "bg-white border-gray-200 text-gray-600 hover:border-[#1B4F8A] hover:text-[#1B4F8A]"
                }`}
              >
                {label}
              </button>
            ))}

            {/* Clear filter button */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-gray-500 hover:text-red-600 border border-gray-200 hover:border-red-300 transition-all"
                aria-label="Clear all filters"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* ── Error state ── */}
        {error && (
          <div
            role="alert"
            className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between"
          >
            <span>{error}</span>
            <button
              onClick={fetchTours}
              className="ml-4 text-xs font-semibold underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Tour grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

          {isLoading
            ? Array.from({ length: 8 }, (_, i) => <SkeletonCard key={i} />)
            : tours.length === 0
              ? <EmptyState onReset={resetFilters} />
              : tours.map((tour) => <TourCard key={tour.id} tour={tour} />)
          }

        </div>
      </div>

    </div>
  );
};

export default ToursPage;
