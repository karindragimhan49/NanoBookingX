/**
 * TourDetailPage.jsx — Single Tour Package Detail
 * --------------------------------------------------
 * Fetches a single travel package by its :id param.
 * Sections: hero image, key stats, tabbed detail (Overview / Itinerary /
 * Includes), and a sticky booking CTA sidebar.
 */

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, MapPin, Clock, Users, Star, CheckCircle, XCircle,
  Calendar, ChevronDown, ChevronUp, Tag,
} from "lucide-react";
import toast from "react-hot-toast";
import { getTourById } from "../api/tourApi";
import { createBooking } from "../api/bookingApi";
import { useAuth } from "../context/AuthContext";
import { PageSpinner } from "../components/common/LoadingSpinner";

// ---- Difficulty badge styles — keys match backend enum (easy/moderate/challenging) ----
const DIFFICULTY_STYLES = {
  easy:        "bg-emerald-50 text-emerald-700 border-emerald-200",
  moderate:    "bg-amber-50   text-amber-700   border-amber-200",
  challenging: "bg-red-50     text-red-700     border-red-200",
};

/* ──────────────────────────────────────────────────────────────
   ItineraryDay — collapsible itinerary item
   ────────────────────────────────────────────────────────────── */
const ItineraryDay = ({ day }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 text-left transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#1B4F8A] text-sm font-bold flex items-center justify-center flex-shrink-0">
            {day.dayNumber}
          </span>
          <span className="font-medium text-gray-900">{day.title}</span>
        </div>
        {open
          ? <ChevronUp  className="w-4 h-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
          : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
        }
      </button>
      {open && day.description && (
        <div className="px-5 pb-4 bg-gray-50 border-t border-gray-100">
          <p className="text-gray-600 text-sm leading-relaxed pt-3">{day.description}</p>
          {day.accommodation && (
            <p className="text-xs text-gray-400 mt-2">
              Accommodation: {day.accommodation}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────
   BookingPanel — sticky sidebar for booking action
   ────────────────────────────────────────────────────────────── */
const BookingPanel = ({ tour }) => {
  const navigate       = useNavigate();
  const { isAuthenticated } = useAuth();

  const [travellers,   setTravellers]   = useState(1);
  const [startDate,    setStartDate]    = useState("");
  const [isBooking,    setIsBooking]    = useState(false);

  const price       = tour.discountedPrice ?? tour.pricePerPerson;
  const totalPrice  = price * travellers;
  const maxGroup    = tour.maxGroupSize   || 20;
  const available   = !tour.isFullyBooked && tour.isAvailable;

  const handleBook = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: `/tours/${tour._id}` } } });
      return;
    }
    if (!startDate) {
      toast.error("Please select a start date.");
      return;
    }

    setIsBooking(true);
    try {
      // Field names must match the backend's validateCreateBooking rules
      await createBooking({
        travelPackageId:    tour._id,
        travelStartDate:    startDate,
        numberOfTravellers: travellers,
      });
      toast.success("Booking submitted! Check your dashboard for details.");
      navigate("/dashboard");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Booking failed. Please try again."
      );
    } finally {
      setIsBooking(false);
    }
  };

  // Minimum date = tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm sticky top-24">

      {/* Price */}
      <div className="mb-5">
        {tour.discountedPrice && tour.discountedPrice < tour.pricePerPerson && (
          <div className="text-sm text-gray-400 line-through">${tour.pricePerPerson} / person</div>
        )}
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-bold text-gray-900">${price}</span>
          <span className="text-gray-500 text-sm">/ person</span>
        </div>
        {tour.averageRating > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" aria-hidden="true" />
            <span className="text-sm font-medium text-gray-700">{tour.averageRating.toFixed(1)}</span>
            <span className="text-sm text-gray-400">({tour.reviewCount} reviews)</span>
          </div>
        )}
      </div>

      {/* Availability */}
      {!available && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm text-center font-medium">
          This tour is currently unavailable
        </div>
      )}

      {available && (
        <div className="space-y-4 mb-5">

          {/* Start date */}
          <div>
            <label htmlFor="startDate" className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
              Start Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" aria-hidden="true" />
              <input
                id="startDate"
                type="date"
                min={minDate}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1B4F8A]/30 focus:border-[#1B4F8A] transition-colors"
              />
            </div>
          </div>

          {/* Number of travellers */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
              Travellers
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setTravellers((v) => Math.max(1, v - 1))}
                aria-label="Decrease traveller count"
                className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors text-lg font-medium"
              >
                −
              </button>
              <span className="w-8 text-center font-semibold text-gray-900">{travellers}</span>
              <button
                type="button"
                onClick={() => setTravellers((v) => Math.min(maxGroup, v + 1))}
                aria-label="Increase traveller count"
                className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors text-lg font-medium"
              >
                +
              </button>
              <span className="text-xs text-gray-400">max {maxGroup}</span>
            </div>
          </div>
        </div>
      )}

      {/* Total */}
      {available && (
        <div className="flex items-center justify-between py-3 border-t border-b border-gray-100 mb-5 text-sm">
          <span className="text-gray-600">
            ${price} × {travellers} traveller{travellers > 1 ? "s" : ""}
          </span>
          <span className="font-bold text-gray-900 text-base">${totalPrice}</span>
        </div>
      )}

      {/* CTA button */}
      <button
        onClick={handleBook}
        disabled={!available || isBooking}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1B4F8A] hover:bg-[#163F70] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-all duration-200 shadow-sm"
      >
        {isBooking ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
            Booking…
          </>
        ) : !isAuthenticated ? (
          "Sign In to Book"
        ) : available ? (
          "Book Now"
        ) : (
          "Unavailable"
        )}
      </button>

      <p className="text-center text-xs text-gray-400 mt-3">
        Free cancellation up to 48 hours before start
      </p>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   TourDetailPage — Main component
   ══════════════════════════════════════════════════════════════ */
const TABS = ["Overview", "Itinerary", "Includes"];

const TourDetailPage = () => {
  const { id } = useParams();
  const [tour,      setTour]      = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState("");
  const [activeTab, setActiveTab] = useState("Overview");

  useEffect(() => {
    const fetchTour = async () => {
      setIsLoading(true);
      setError("");
      try {
        const res = await getTourById(id);
        // Backend returns { success, package: travelPackage }
        setTour(res.data?.package ?? null);
      } catch (err) {
        setError(
          err.response?.status === 404
            ? "This tour package could not be found."
            : err.response?.data?.message || "Failed to load tour details."
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchTour();
  }, [id]);

  if (isLoading) return <PageSpinner label="Loading tour details…" />;

  if (error) {
    return (
      <div className="container-custom section-padding text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Link to="/tours" className="text-[#1B4F8A] font-medium hover:underline">
          ← Back to Tours
        </Link>
      </div>
    );
  }

  if (!tour) return null;

  const price       = tour.discountedPrice ?? tour.pricePerPerson;
  const destination = tour.destination
    ? `${tour.destination.city}, ${tour.destination.country}`
    : "Sri Lanka";

  return (
    <div className="min-h-screen bg-white animate-fade-in">

      {/* ── Hero image + breadcrumb ── */}
      <div className="relative h-72 md:h-96 bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] overflow-hidden">
        {tour.coverImage ? (
          <img
            src={tour.coverImage}
            alt={tour.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin className="w-20 h-20 text-[#1B4F8A]/15" aria-hidden="true" />
          </div>
        )}

        {/* Breadcrumb overlay */}
        <div className="absolute top-5 left-0 right-0 container-custom">
          <Link
            to="/tours"
            className="inline-flex items-center gap-1.5 text-sm bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1.5 rounded-lg hover:bg-white transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            All Tours
          </Link>
        </div>
      </div>

      {/* ── Main layout: content + sidebar ── */}
      <div className="container-custom py-8">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* ── Left: detail content ── */}
          <div className="flex-1 min-w-0">

            {/* Title + badges */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2 mb-3">
                {tour.category && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium bg-[#EFF6FF] text-[#1B4F8A] px-2.5 py-1 rounded-full border border-[#1B4F8A]/20 capitalize">
                    <Tag className="w-3 h-3" aria-hidden="true" />
                    {tour.category}
                  </span>
                )}
                {tour.difficulty && (
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${DIFFICULTY_STYLES[tour.difficulty] || DIFFICULTY_STYLES.easy}`}>
                    {tour.difficulty}
                  </span>
                )}
                {tour.isFeatured && (
                  <span className="text-xs font-medium bg-[#1B4F8A] text-white px-2.5 py-1 rounded-full">
                    Featured
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                {tour.name}
              </h1>

              {/* Key stats row */}
              <div className="flex flex-wrap gap-5 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#1B4F8A]" aria-hidden="true" />
                  {destination}
                </div>
                {(tour.durationDays || tour.durationNights) && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#1B4F8A]" aria-hidden="true" />
                    {tour.durationDays || tour.durationNights} days
                    {tour.durationNights ? ` / ${tour.durationNights} nights` : ""}
                  </div>
                )}
                {tour.maxGroupSize && (
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#1B4F8A]" aria-hidden="true" />
                    Max {tour.maxGroupSize} people
                  </div>
                )}
                {tour.averageRating > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" aria-hidden="true" />
                    {tour.averageRating.toFixed(1)} ({tour.reviewCount} reviews)
                  </div>
                )}
              </div>
            </div>

            {/* Tab navigation */}
            <div className="flex border-b border-gray-200 mb-6 gap-1">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                    activeTab === tab
                      ? "border-[#1B4F8A] text-[#1B4F8A]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab: Overview */}
            {activeTab === "Overview" && (
              <div className="prose prose-gray max-w-none">
                {tour.summary && (
                  <p className="text-lg text-gray-600 leading-relaxed mb-4">{tour.summary}</p>
                )}
                {tour.description && (
                  <p className="text-gray-600 leading-relaxed">{tour.description}</p>
                )}
                {tour.activities?.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-3">Activities</h3>
                    <div className="flex flex-wrap gap-2">
                      {tour.activities.map((act) => (
                        <span
                          key={act}
                          className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm capitalize"
                        >
                          {act}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Itinerary */}
            {activeTab === "Itinerary" && (
              <div className="space-y-3">
                {tour.itinerary?.length > 0 ? (
                  tour.itinerary.map((day) => (
                    <ItineraryDay key={day.dayNumber} day={day} />
                  ))
                ) : (
                  <p className="text-gray-500 py-6 text-center">
                    Detailed itinerary coming soon.
                  </p>
                )}
              </div>
            )}

            {/* Tab: Includes */}
            {activeTab === "Includes" && (
              <div className="grid sm:grid-cols-2 gap-8">
                {/* Included */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                    What's Included
                  </h3>
                  {tour.included?.length > 0 ? (
                    <ul className="space-y-2">
                      {tour.included.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-400 text-sm">Details coming soon.</p>
                  )}
                </div>

                {/* Excluded */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-400" aria-hidden="true" />
                    Not Included
                  </h3>
                  {tour.excluded?.length > 0 ? (
                    <ul className="space-y-2">
                      {tour.excluded.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-400 text-sm">Details coming soon.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Booking panel ── */}
          <div className="lg:w-80 xl:w-96 flex-shrink-0">
            <BookingPanel tour={tour} />
          </div>

        </div>
      </div>

    </div>
  );
};

export default TourDetailPage;
