/**
 * LoginPage.jsx — User Login
 * ---------------------------
 * Split layout: Deep Ocean Blue brand panel (desktop left) + white form (right).
 * Submits credentials via AuthContext.login(), then redirects to the
 * page the user was trying to reach (or /dashboard as fallback).
 */

import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, LogIn, Globe, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

// Trust-building bullet points shown on the left brand panel
const BRAND_POINTS = [
  "Access your bookings anytime",
  "Manage and customise your tours",
  "Get exclusive member-only deals",
  "Real-time trip status updates",
];

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Where to go after a successful login
  const redirectTo = location.state?.from?.pathname || "/dashboard";

  // ---- Form state ----
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg]         = useState("");

  // ---- Submit handler ----
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    // Basic client-side validation
    if (!email.trim() || !password) {
      setErrorMsg("Please enter your email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email: email.trim().toLowerCase(), password });
      toast.success("Welcome back! 👋");
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Login failed. Please check your credentials and try again.";
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex animate-fade-in">

      {/* ── LEFT: Brand panel (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-2/5 bg-[#1B4F8A] flex-col justify-between p-12 relative overflow-hidden">

        {/* Decorative background blobs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" aria-hidden="true" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" aria-hidden="true" />

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <span className="text-white font-bold text-lg">
            Globe<span className="text-blue-200">Trek</span> Adventures
          </span>
        </div>

        {/* Main message */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-4 leading-snug">
            Your next Sri Lanka<br />adventure starts here.
          </h2>
          <p className="text-blue-200 mb-8 leading-relaxed">
            Sign in to manage your bookings, track your trips, and unlock
            exclusive member benefits.
          </p>

          {/* Benefit list */}
          <ul className="space-y-3">
            {BRAND_POINTS.map((point) => (
              <li key={point} className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-blue-300 shrink-0" aria-hidden="true" />
                <span className="text-blue-100 text-sm">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer quote */}
        <p className="text-blue-300 text-sm">
          "Travel is the only thing you buy that makes you richer."
        </p>
      </div>

      {/* ── RIGHT: Form panel ── */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-md">

          {/* Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">

            {/* Header */}
            <div className="mb-7">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
              <p className="text-gray-500 text-sm">Sign in to your GlobeTrek account</p>
            </div>

            {/* Error banner */}
            {errorMsg && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-3 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm"
              >
                <span className="font-medium">{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-5">

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4F8A]/30 focus:border-[#1B4F8A] transition-colors"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-2.5 pr-11 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4F8A]/30 focus:border-[#1B4F8A] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword
                      ? <EyeOff className="w-4 h-4" />
                      : <Eye className="w-4 h-4" />
                    }
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1B4F8A] hover:bg-[#163F70] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all duration-200 shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                    Signing in…
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" aria-hidden="true" />
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400 uppercase tracking-wide">or</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Register link */}
            <p className="text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-[#1B4F8A] font-semibold hover:underline"
              >
                Create one for free →
              </Link>
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};

export default LoginPage;
