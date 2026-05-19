/**
 * DashboardPage.jsx — User & Admin Dashboard
 * ---------------------------------------------
 * Tabbed dashboard used for both /dashboard (customer) and /admin (admin/staff).
 *
 * Customer tabs  : My Bookings · Profile · Change Password
 * Staff/Admin tabs: All Bookings · Profile · Change Password
 *
 * Key fixes applied here:
 *  - booking.travelStartDate (flat model field, not dates.startDate)
 *  - res.data.bookings (top-level response key, not res.data.data.bookings)
 *  - refreshUser() called after profile save so the navbar name updates instantly
 */

import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays, User, Settings, LogOut, MapPin, Clock,
  CheckCircle, XCircle, AlertCircle, Loader2, ExternalLink,
  ChevronRight, ShieldCheck, Lock,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { getMyBookings, getAllBookings, cancelBooking } from "../api/bookingApi";
import { updateMyProfile, changePassword } from "../api/authApi";

/* ──────────────────────────────────────────────────────────────
   Status badge styles — values match the Booking model enum
   ────────────────────────────────────────────────────────────── */
const STATUS_STYLES = {
  pending:   "bg-amber-50   text-amber-700  border-amber-200",
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50     text-red-700    border-red-200",
  completed: "bg-blue-50    text-blue-700   border-blue-200",
};

const STATUS_ICONS = {
  pending:   <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />,
  confirmed: <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />,
  cancelled: <XCircle     className="w-3.5 h-3.5" aria-hidden="true" />,
  completed: <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />,
};

const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${STATUS_STYLES[status] || STATUS_STYLES.pending}`}>
    {STATUS_ICONS[status]}
    {status}
  </span>
);

/* Role pill colours */
const ROLE_PILL_STYLES = {
  customer: "bg-blue-50   text-blue-700  border-blue-200",
  staff:    "bg-amber-50  text-amber-700 border-amber-200",
  admin:    "bg-violet-50 text-violet-700 border-violet-200",
};

/* ──────────────────────────────────────────────────────────────
   BookingCard — single booking row in the list
   ────────────────────────────────────────────────────────────── */
const BookingCard = ({ booking, onCancel, canCancel }) => {
  const pkg       = booking.travelPackage;
  const pkgName   = pkg?.name || "Deleted Package";
  const destination = pkg?.destination
    ? `${pkg.destination.city}, ${pkg.destination.country}`
    : "Sri Lanka";

  // The model stores travel dates as flat fields: travelStartDate, travelEndDate
  const startDate = booking.travelStartDate
    ? new Date(booking.travelStartDate).toLocaleDateString("en-GB", {
        day: "numeric", month: "short", year: "numeric",
      })
    : "—";

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-[#1B4F8A]/30 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-4">

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-semibold text-gray-900 text-sm truncate">{pkgName}</h3>
            <StatusBadge status={booking.status} />
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-2">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" aria-hidden="true" />
              {destination}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" aria-hidden="true" />
              {startDate}
            </span>
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" aria-hidden="true" />
              {booking.numberOfTravellers} traveller{booking.numberOfTravellers > 1 ? "s" : ""}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>
              Ref:{" "}
              <span className="font-mono font-medium text-gray-600">
                {booking.bookingReference || booking._id}
              </span>
            </span>
            <span className="font-semibold text-gray-700">${booking.totalPrice}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {pkg?._id && (
            <Link
              to={`/tours/${pkg._id}`}
              className="inline-flex items-center gap-1 text-xs text-[#1B4F8A] hover:underline font-medium"
            >
              View Tour
              <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </Link>
          )}
          {canCancel && booking.status === "pending" && (
            <button
              onClick={() => onCancel(booking._id)}
              className="text-xs text-red-500 hover:text-red-700 hover:underline font-medium transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────
   BookingsTab — list of bookings
   ────────────────────────────────────────────────────────────── */
const BookingsTab = ({ role }) => {
  const [bookings,  setBookings]  = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState("");

  const isStaff = role === "staff" || role === "admin";

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = isStaff ? await getAllBookings() : await getMyBookings();
      // Both endpoints return { success, ..., bookings: [...] } at top level
      const list = res.data?.bookings ?? [];
      setBookings(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load bookings.");
    } finally {
      setIsLoading(false);
    }
  }, [isStaff]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await cancelBooking(bookingId, "Cancelled by customer.");
      toast.success("Booking cancelled successfully.");
      fetchBookings(); // Refresh the list after cancellation
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not cancel booking.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
        <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
        <span>Loading bookings…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
        {error}
        <button onClick={fetchBookings} className="ml-3 font-semibold underline hover:no-underline text-xs">
          Retry
        </button>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] flex items-center justify-center mx-auto mb-4">
          <CalendarDays className="w-7 h-7 text-[#1B4F8A]" aria-hidden="true" />
        </div>
        <h3 className="font-semibold text-gray-900 mb-2">No bookings yet</h3>
        <p className="text-gray-500 text-sm mb-5">
          {isStaff ? "No bookings have been made yet." : "You haven't booked any tours yet."}
        </p>
        {!isStaff && (
          <Link
            to="/tours"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B4F8A] text-white font-medium text-sm hover:bg-[#163F70] transition-colors"
          >
            Explore Tours
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        {bookings.length} booking{bookings.length !== 1 ? "s" : ""}
      </p>
      {bookings.map((b) => (
        <BookingCard
          key={b._id}
          booking={b}
          onCancel={handleCancel}
          canCancel={!isStaff}
        />
      ))}
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────
   ProfileTab — view & edit profile; calls refreshUser() on save
   so the navbar name updates immediately without a page reload.
   ────────────────────────────────────────────────────────────── */
const ProfileTab = ({ currentUser, onProfileSaved }) => {
  const [form, setForm] = useState({
    fullName:    currentUser?.fullName    || "",
    phoneNumber: currentUser?.phoneNumber || "",
    country:     currentUser?.country     || "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim()) {
      toast.error("Full name cannot be empty.");
      return;
    }
    setIsSaving(true);
    try {
      await updateMyProfile({
        fullName:    form.fullName.trim(),
        phoneNumber: form.phoneNumber.trim() || undefined,
        country:     form.country.trim()     || undefined,
      });
      // Sync AuthContext so the navbar name reflects the change instantly
      await onProfileSaved();
      toast.success("Profile updated successfully.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B4F8A]/30 focus:border-[#1B4F8A] transition-colors";

  return (
    <div className="max-w-lg space-y-8">

      {/* Read-only identity card */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-[#1B4F8A] flex items-center justify-center text-white text-xl font-bold flex-shrink-0 select-none">
          {currentUser?.fullName?.charAt(0)?.toUpperCase() || "?"}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{currentUser?.fullName}</p>
          <p className="text-sm text-gray-500">{currentUser?.email}</p>
          <span
            className={`inline-flex items-center gap-1 mt-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full border capitalize ${ROLE_PILL_STYLES[currentUser?.role] || ROLE_PILL_STYLES.customer}`}
          >
            {currentUser?.role === "admin" && (
              <ShieldCheck className="w-3 h-3" aria-hidden="true" />
            )}
            {currentUser?.role}
          </span>
        </div>
      </div>

      {/* Editable fields */}
      <form onSubmit={handleSave} className="space-y-4">
        <h3 className="font-semibold text-gray-900">Edit Profile</h3>

        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1.5">
            Full name <span className="text-red-500">*</span>
          </label>
          <input id="fullName" name="fullName" type="text" value={form.fullName}
            onChange={handleChange} className={inputClass} />
        </div>

        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1.5">
            Phone number
          </label>
          <input id="phoneNumber" name="phoneNumber" type="tel" value={form.phoneNumber}
            onChange={handleChange} placeholder="+94 77 123 4567" className={inputClass} />
        </div>

        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1.5">
            Country
          </label>
          <input id="country" name="country" type="text" value={form.country}
            onChange={handleChange} placeholder="e.g. Australia" className={inputClass} />
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1B4F8A] hover:bg-[#163F70] disabled:opacity-60 text-white font-medium text-sm transition-colors"
        >
          {isSaving ? (
            <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />Saving…</>
          ) : (
            <><Settings className="w-4 h-4" aria-hidden="true" />Save Changes</>
          )}
        </button>
      </form>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────
   ChangePasswordTab — verify current password, set new one.
   Password requirements match the backend validateChangePassword rules:
   min 8 chars, at least one uppercase letter, at least one digit.
   ────────────────────────────────────────────────────────────── */
const ChangePasswordTab = () => {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword:     "",
    confirmPassword: "",
  });
  const [errors,    setErrors]    = useState({});
  const [isSaving,  setIsSaving]  = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Validate to match backend rules exactly (validateChangePassword)
  const validate = () => {
    const errs = {};
    if (!form.currentPassword) errs.currentPassword = "Current password is required.";
    if (!form.newPassword) {
      errs.newPassword = "New password is required.";
    } else if (form.newPassword.length < 8) {
      errs.newPassword = "Password must be at least 8 characters.";
    } else if (!/[A-Z]/.test(form.newPassword)) {
      errs.newPassword = "Password must contain at least one uppercase letter.";
    } else if (!/\d/.test(form.newPassword)) {
      errs.newPassword = "Password must contain at least one number.";
    }
    if (!form.confirmPassword) {
      errs.confirmPassword = "Please confirm your new password.";
    } else if (form.newPassword !== form.confirmPassword) {
      errs.confirmPassword = "Passwords do not match.";
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setIsSaving(true);
    try {
      await changePassword({
        currentPassword: form.currentPassword,
        newPassword:     form.newPassword,
      });
      toast.success("Password changed successfully.");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      const msg = err.response?.data?.message || "Could not change password.";
      // Map known backend messages to the correct field
      if (msg.toLowerCase().includes("current")) {
        setErrors({ currentPassword: msg });
      } else {
        toast.error(msg);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = (name) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
      errors[name]
        ? "border-red-400 focus:ring-red-200 bg-red-50"
        : "border-gray-300 focus:ring-[#1B4F8A]/30 focus:border-[#1B4F8A]"
    }`;

  return (
    <div className="max-w-md">
      <h3 className="font-semibold text-gray-900 mb-5">Change Password</h3>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">

        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
            Current password
          </label>
          <input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password"
            value={form.currentPassword} onChange={handleChange} className={inputClass("currentPassword")} />
          {errors.currentPassword && (
            <p className="mt-1 text-xs text-red-600">{errors.currentPassword}</p>
          )}
        </div>

        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
            New password
          </label>
          <input id="newPassword" name="newPassword" type="password" autoComplete="new-password"
            value={form.newPassword} onChange={handleChange} placeholder="Min 8 chars, 1 uppercase, 1 number"
            className={inputClass("newPassword")} />
          {errors.newPassword && (
            <p className="mt-1 text-xs text-red-600">{errors.newPassword}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
            Confirm new password
          </label>
          <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password"
            value={form.confirmPassword} onChange={handleChange}
            className={inputClass("confirmPassword")} />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1B4F8A] hover:bg-[#163F70] disabled:opacity-60 text-white font-medium text-sm transition-colors"
        >
          {isSaving ? (
            <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />Changing…</>
          ) : (
            <><Lock className="w-4 h-4" aria-hidden="true" />Change Password</>
          )}
        </button>
      </form>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   DashboardPage — Root component
   ══════════════════════════════════════════════════════════════ */
const DashboardPage = () => {
  const { currentUser, logout, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState("bookings");

  const isStaff = currentUser?.role === "staff" || currentUser?.role === "admin";

  const TABS = [
    {
      id:    "bookings",
      label: isStaff ? "All Bookings" : "My Bookings",
      Icon:  CalendarDays,
    },
    { id: "profile",  label: "Profile",          Icon: User  },
    { id: "password", label: "Change Password",   Icon: Lock  },
  ];

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">

      {/* ── Page header ── */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-custom py-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isStaff ? "Staff Dashboard" : "My Dashboard"}
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">
                Welcome back, {currentUser?.fullName?.split(" ")[0] || "there"} 👋
              </p>
            </div>

            <button
              onClick={logout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:text-red-600 hover:border-red-200 text-sm font-medium transition-all"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              Sign Out
            </button>
          </div>

          {/* Tab bar */}
          <div className="flex gap-1 mt-5 -mb-px overflow-x-auto">
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === id
                    ? "border-[#1B4F8A] text-[#1B4F8A]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab content ── */}
      <div className="container-custom py-8">
        {activeTab === "bookings" && (
          <BookingsTab role={currentUser?.role} />
        )}
        {activeTab === "profile" && (
          // Pass refreshUser so the navbar syncs immediately after saving
          <ProfileTab currentUser={currentUser} onProfileSaved={refreshUser} />
        )}
        {activeTab === "password" && (
          <ChangePasswordTab />
        )}
      </div>

    </div>
  );
};

export default DashboardPage;
