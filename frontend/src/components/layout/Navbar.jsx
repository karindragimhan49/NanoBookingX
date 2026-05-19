/**
 * Navbar.jsx — Global Navigation Bar
 * =====================================
 * A sticky, responsive, role-aware navigation bar for GlobeTrek Adventures.
 *
 * DESIGN: Crisp white background (#FFFFFF) with a subtle bottom border shadow.
 *         Deep Ocean Blue (#1D4ED8) for active links, badges, and accents.
 *
 * ROLE-BASED NAVIGATION:
 * ┌──────────┬───────────────────────────────────────────────────────────────┐
 * │ Role     │ Nav Links                         │ Right Side                │
 * ├──────────┼───────────────────────────────────┼───────────────────────────┤
 * │ Guest    │ Home, Packages, About, Contact    │ Sign In / Get Started     │
 * │ Customer │ Home, Packages, My Bookings       │ User avatar + dropdown    │
 * │ Staff    │ Home, Packages, All Bookings,     │ Staff badge + dropdown    │
 * │          │ Inquiries                         │                           │
 * │ Admin    │ Home, Packages, Bookings, Users,  │ Admin badge + dropdown    │
 * │          │ Inquiries                         │                           │
 * └──────────┴───────────────────────────────────┴───────────────────────────┘
 *
 * BEHAVIOUR:
 *  - Desktop: horizontal links + user dropdown (click to open).
 *  - Mobile:  hamburger icon → full-width slide-down menu.
 *  - Active links: underline indicator using NavLink's `isActive` flag.
 *  - Dropdown closes on: outside click, Escape key, route change.
 *  - On scroll > 8px: subtle box-shadow appears on the navbar.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Globe, Menu, X, ChevronDown, LogOut, User, LayoutDashboard,
  BookOpen, MessageSquare, Users, Package,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import useClickOutside from "../../hooks/useClickOutside";
import toast from "react-hot-toast";

/* ─────────────────────────────────────────────────────────────
   NAVIGATION LINK DEFINITIONS
   Each role gets its own array of { label, to, icon }.
   ───────────────────────────────────────────────────────────── */

/** Links shown to unauthenticated (guest) visitors */
const GUEST_NAV_LINKS = [
  { label: "Home",     to: "/",        icon: null },
  { label: "Packages", to: "/tours",   icon: null },
  { label: "About",    to: "/about",   icon: null },
  { label: "Contact",  to: "/contact", icon: null },
];

/** Links shown to logged-in customers */
const CUSTOMER_NAV_LINKS = [
  { label: "Home",        to: "/",          icon: null      },
  { label: "Packages",    to: "/tours",     icon: Package   },
  { label: "My Bookings", to: "/dashboard", icon: BookOpen  },
  { label: "Contact",     to: "/contact",   icon: null      },
];

/** Links shown to staff members */
const STAFF_NAV_LINKS = [
  { label: "Home",      to: "/",          icon: null           },
  { label: "Packages",  to: "/tours",     icon: Package        },
  { label: "Bookings",  to: "/dashboard", icon: BookOpen       },
  { label: "Inquiries", to: "/contact",   icon: MessageSquare  },
];

/** Links shown to admins */
const ADMIN_NAV_LINKS = [
  { label: "Home",      to: "/",          icon: null           },
  { label: "Packages",  to: "/tours",     icon: Package        },
  { label: "Bookings",  to: "/dashboard", icon: BookOpen       },
  { label: "Users",     to: "/admin",     icon: Users          },
  { label: "Inquiries", to: "/contact",   icon: MessageSquare  },
];

/* ─────────────────────────────────────────────────────────────
   HELPER — Get navigation links for the current user's role
   ───────────────────────────────────────────────────────────── */
const getNavLinks = (user) => {
  if (!user) return GUEST_NAV_LINKS;
  if (user.role === "admin")  return ADMIN_NAV_LINKS;
  if (user.role === "staff")  return STAFF_NAV_LINKS;
  return CUSTOMER_NAV_LINKS;
};

/* ─────────────────────────────────────────────────────────────
   HELPER — Generate initials avatar from a full name
   e.g. "John Doe" → "JD"
   ───────────────────────────────────────────────────────────── */
const getInitials = (fullName = "") =>
  fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");

/* ─────────────────────────────────────────────────────────────
   SUB-COMPONENT — Role Badge
   Small pill shown next to the user's name indicating their role.
   ───────────────────────────────────────────────────────────── */
const RoleBadge = ({ role }) => {
  const styles = {
    admin: "bg-purple-100 text-purple-700 border-purple-200",
    staff: "bg-blue-100   text-blue-700   border-blue-200",
  };

  // Only show a badge for staff and admin; customers don't get one
  if (!styles[role]) return null;

  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5
        rounded-full text-[10px] font-bold uppercase tracking-wider
        border ${styles[role]}
      `}
    >
      {role}
    </span>
  );
};

/* ─────────────────────────────────────────────────────────────
   SUB-COMPONENT — Desktop User Dropdown
   Opens on click; closes on outside click or Escape key.
   ───────────────────────────────────────────────────────────── */
const UserDropdown = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close the dropdown whenever user clicks outside it
  useClickOutside(dropdownRef, () => setIsOpen(false), isOpen);

  // Close on Escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const initials  = getInitials(user.full_name);
  const firstName = user.full_name?.split(" ")[0] ?? "Account";

  return (
    <div ref={dropdownRef} className="relative">

      {/* ── Avatar / Trigger Button ── */}
      <button
        id="user-dropdown-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="
          flex items-center gap-2 px-2.5 py-1.5
          rounded-xl border border-gray-200
          hover:border-blue-300 hover:bg-blue-50
          transition-all duration-200 group
        "
      >
        {/* Initials avatar circle */}
        <div className="
          w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center
          text-white text-xs font-bold flex-shrink-0
          group-hover:bg-blue-700 transition-colors
        ">
          {initials}
        </div>

        {/* Name and role */}
        <div className="hidden sm:flex flex-col items-start leading-tight">
          <span className="text-sm font-semibold text-gray-800">{firstName}</span>
          <RoleBadge role={user.role} />
        </div>

        {/* Chevron */}
        <ChevronDown
          className={`
            w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0
            ${isOpen ? "rotate-180" : ""}
          `}
          aria-hidden="true"
        />
      </button>

      {/* ── Dropdown Panel ── */}
      {isOpen && (
        <div
          role="menu"
          aria-label="User account menu"
          className="
            absolute right-0 top-full mt-2 w-64
            bg-white rounded-2xl border border-gray-100
            shadow-[0_8px_30px_rgba(0,0,0,0.10)]
            animate-slide-down z-50 overflow-hidden
          "
        >
          {/* User info header */}
          <div className="px-4 py-3.5 border-b border-gray-100 bg-gray-50">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user.full_name}
            </p>
            <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
            <RoleBadge role={user.role} />
          </div>

          {/* Menu items */}
          <nav className="p-1.5">

            {/* Profile — all authenticated users */}
            <Link
              to="/dashboard"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="
                flex items-center gap-3 px-3 py-2.5 rounded-xl
                text-sm text-gray-700 font-medium
                hover:bg-gray-50 hover:text-blue-700
                transition-colors duration-150
              "
            >
              <User className="w-4 h-4 text-gray-400" aria-hidden="true" />
              My Profile & Bookings
            </Link>

            {/* Admin Panel — admin only */}
            {user.role === "admin" && (
              <Link
                to="/admin"
                role="menuitem"
                onClick={() => setIsOpen(false)}
                className="
                  flex items-center gap-3 px-3 py-2.5 rounded-xl
                  text-sm text-gray-700 font-medium
                  hover:bg-purple-50 hover:text-purple-700
                  transition-colors duration-150
                "
              >
                <LayoutDashboard className="w-4 h-4 text-gray-400" aria-hidden="true" />
                Admin Dashboard
              </Link>
            )}

            {/* Divider before logout */}
            <hr className="my-1 border-gray-100" />

            {/* Logout */}
            <button
              role="menuitem"
              onClick={() => { setIsOpen(false); onLogout(); }}
              className="
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                text-sm font-medium text-red-600
                hover:bg-red-50
                transition-colors duration-150
              "
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              Sign Out
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};


/* ═════════════════════════════════════════════════════════════
   MAIN NAVBAR COMPONENT
   ═════════════════════════════════════════════════════════════ */
const Navbar = () => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  /* Controls the mobile hamburger menu visibility */
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  /* Tracks scroll position to show a stronger shadow on scroll */
  const [isScrolled, setIsScrolled] = useState(false);

  /* ── Close mobile menu when route changes ── */
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  /* ── Add shadow when user has scrolled down ── */
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ── Close mobile menu if screen resizes to desktop ── */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMobileMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ── Logout handler ── */
  const handleLogout = useCallback(() => {
    logout();
    toast.success("You've been signed out. See you soon! 👋");
    navigate("/");
  }, [logout, navigate]);

  /* ── Determine nav links for the current role ── */
  const navLinks = getNavLinks(currentUser);

  /* ── Active link CSS helper ── */
  const getNavLinkClass = ({ isActive }) =>
    isActive
      ? /* Active state: blue underline + bold text */
        "relative text-blue-700 font-semibold text-sm after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600 after:rounded-full"
      : /* Default state */
        "relative text-gray-600 font-medium text-sm hover:text-blue-700 transition-colors duration-150";

  return (
    <header
      className={`
        fixed top-0 inset-x-0 z-40 bg-white
        border-b border-gray-200
        transition-shadow duration-200
        ${isScrolled ? "shadow-[0_4px_20px_rgba(0,0,0,0.07)]" : "shadow-none"}
      `}
    >
      {/* ── Main nav row ────────────────────────────────────────── */}
      <nav
        className="container-custom flex items-center justify-between h-16 gap-4"
        aria-label="Main navigation"
      >

        {/* ── Brand Logo ── */}
        <Link
          to="/"
          id="navbar-logo"
          className="flex items-center gap-2.5 flex-shrink-0 group"
          aria-label="GlobeTrek Adventures — Go to home"
        >
          {/* Globe icon in brand blue */}
          <div className="
            w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center
            group-hover:bg-blue-700 transition-colors duration-200 shadow-sm
          ">
            <Globe className="w-5 h-5 text-white" strokeWidth={1.5} aria-hidden="true" />
          </div>
          {/* Brand name */}
          <div className="flex flex-col leading-none">
            <span className="font-bold text-gray-900 text-base tracking-tight">
              Globe<span className="text-blue-600">Trek</span>
            </span>
            <span className="text-[10px] font-medium text-gray-400 tracking-widest uppercase">
              Adventures
            </span>
          </div>
        </Link>

        {/* ── Desktop Nav Links (hidden on mobile) ── */}
        <ul
          className="hidden lg:flex items-center gap-6"
          role="list"
        >
          {navLinks.map(({ label, to }) => (
            <li key={to + label}>
              <NavLink
                to={to}
                end={to === "/"}          /* "end" prevents "/" matching all routes */
                className={getNavLinkClass}
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* ── Desktop Right Section ── */}
        <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
          {isAuthenticated && currentUser ? (
            /* ── Authenticated: show user dropdown ── */
            <UserDropdown user={currentUser} onLogout={handleLogout} />
          ) : (
            /* ── Guest: show auth buttons ── */
            <>
              <Link
                to="/login"
                id="navbar-signin-btn"
                className="btn btn-ghost btn-sm"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                id="navbar-getstarted-btn"
                className="btn btn-primary btn-sm"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* ── Mobile Hamburger Toggle ── */}
        <button
          id="navbar-mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          className="
            lg:hidden flex items-center justify-center
            w-10 h-10 rounded-xl border border-gray-200
            text-gray-500 hover:text-gray-800
            hover:bg-gray-50 hover:border-gray-300
            transition-all duration-150 flex-shrink-0
          "
        >
          {isMobileMenuOpen
            ? <X className="w-5 h-5" aria-hidden="true" />
            : <Menu className="w-5 h-5" aria-hidden="true" />
          }
        </button>
      </nav>

      {/* ══════════════════════════════════════════════════════════
          MOBILE MENU — Appears below the navbar on small screens
          ══════════════════════════════════════════════════════════ */}
      {isMobileMenuOpen && (
        <div
          id="mobile-menu"
          role="navigation"
          aria-label="Mobile navigation menu"
          className="
            lg:hidden border-t border-gray-100
            bg-white animate-slide-down
          "
        >
          <div className="container-custom py-3 space-y-1">

            {/* Navigation Links */}
            {navLinks.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to + label}
                to={to}
                end={to === "/"}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium
                   transition-colors duration-150
                   ${isActive
                     ? "bg-blue-50 text-blue-700 border border-blue-100"
                     : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                   }`
                }
              >
                {Icon && (
                  <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                )}
                {label}
              </NavLink>
            ))}

            {/* Divider between nav links and auth section */}
            <div className="h-px bg-gray-100 my-2" />

            {/* Auth section */}
            {isAuthenticated && currentUser ? (
              <>
                {/* User info strip */}
                <div className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-xl mb-1">
                  <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {getInitials(currentUser.full_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {currentUser.full_name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                  </div>
                  <RoleBadge role={currentUser.role} />
                </div>

                {/* Admin panel link (admin only) */}
                {currentUser.role === "admin" && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
                    Admin Dashboard
                  </Link>
                )}

                {/* Logout button */}
                <button
                  onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                  className="
                    w-full flex items-center gap-3 px-3 py-3 rounded-xl
                    text-sm font-medium text-red-600
                    hover:bg-red-50 transition-colors duration-150
                  "
                >
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                  Sign Out
                </button>
              </>
            ) : (
              /* Guest: stacked auth buttons */
              <div className="flex flex-col gap-2 pt-1 pb-2">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="btn btn-ghost btn-md w-full justify-center"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="btn btn-primary btn-md w-full justify-center"
                >
                  Get Started — It's Free
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
