/**
 * Navbar.jsx — Global Navigation Bar
 * ------------------------------------
 * Responsive top navigation for GlobeTrek Adventures.
 * Shows different links based on the user's authentication status and role.
 * Includes a mobile hamburger menu for small screens.
 */

import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, Globe, LogOut, User, LayoutDashboard } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const Navbar = () => {
  const { isAuthenticated, currentUser, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  // Controls the mobile menu open/close state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handles logout: clears auth state and redirects to the home page
  const handleLogout = () => {
    logout();
    toast.success("You've been logged out. See you soon! 👋");
    navigate("/");
    setIsMobileMenuOpen(false);
  };

  // CSS for active NavLink (highlights the current page in the nav)
  const activeNavLinkClass = "text-teal-400 font-semibold";
  const defaultNavLinkClass = "text-slate-300 hover:text-teal-400 transition-colors duration-200";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-700/50 backdrop-blur-md bg-slate-900/80">
      <nav className="container-custom flex items-center justify-between h-16">

        {/* ---- Brand Logo ---- */}
        <Link to="/" className="flex items-center gap-2 group">
          <Globe
            className="w-7 h-7 text-teal-400 group-hover:rotate-12 transition-transform duration-300"
            strokeWidth={1.5}
          />
          <span className="text-lg font-bold text-white">
            Globe<span className="text-teal-400">Trek</span>
          </span>
        </Link>

        {/* ---- Desktop Navigation Links ---- */}
        <ul className="hidden md:flex items-center gap-7 text-sm font-medium">
          <li>
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive ? activeNavLinkClass : defaultNavLinkClass
              }
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/tours"
              className={({ isActive }) =>
                isActive ? activeNavLinkClass : defaultNavLinkClass
              }
            >
              Tours
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                isActive ? activeNavLinkClass : defaultNavLinkClass
              }
            >
              About
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                isActive ? activeNavLinkClass : defaultNavLinkClass
              }
            >
              Contact
            </NavLink>
          </li>
        </ul>

        {/* ---- Desktop Auth Actions ---- */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Show admin panel link if the user is an admin */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-teal-400 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Admin
                </Link>
              )}

              {/* User profile link */}
              <Link
                to="/dashboard"
                className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center">
                  <User className="w-4 h-4 text-teal-400" />
                </div>
                <span>{currentUser?.fullName?.split(" ")[0]}</span>
              </Link>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm text-slate-300 hover:text-white transition-colors px-4 py-2"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold px-5 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-white transition-all duration-200 shadow-lg shadow-teal-500/20"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* ---- Mobile Menu Toggle ---- */}
        <button
          className="md:hidden text-slate-300 hover:text-white transition-colors"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* ---- Mobile Dropdown Menu ---- */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-700/50 bg-slate-900/95 backdrop-blur-md">
          <ul className="container-custom flex flex-col gap-1 py-4 text-sm">
            {["/ Home", "/tours Tours", "/about About", "/contact Contact"].map((item) => {
              const [path, label] = item.split(" ");
              return (
                <li key={path}>
                  <NavLink
                    to={path}
                    end={path === "/"}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `block py-2.5 px-3 rounded-lg transition-colors ${
                        isActive
                          ? "text-teal-400 bg-teal-500/10 font-semibold"
                          : "text-slate-300 hover:bg-slate-800"
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                </li>
              );
            })}

            <li className="pt-2 border-t border-slate-700/50 mt-1">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="w-full text-left py-2.5 px-3 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout ({currentUser?.fullName?.split(" ")[0]})
                </button>
              ) : (
                <div className="flex flex-col gap-2 pt-1">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-2.5 px-3 rounded-lg text-center text-slate-300 hover:bg-slate-800 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-2.5 px-3 rounded-lg text-center bg-teal-500 hover:bg-teal-400 text-white font-semibold transition-colors"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default Navbar;
