/**
 * App.jsx — Root Application Component & Route Configuration
 * -----------------------------------------------------------
 * Bootstraps the entire client-side application:
 *   1. BrowserRouter  — enables client-side URL routing.
 *   2. AuthProvider   — provides global auth state to all components.
 *   3. Toaster        — global toast notification system (light theme).
 *   4. AppRoutes      — the full route tree (separated to allow useAuth inside AuthProvider).
 *
 * Route Structure:
 *  /                     → HomePage           (public)
 *  /tours                → ToursPage          (public)
 *  /tours/:id            → TourDetailPage     (public)
 *  /about                → AboutPage          (public)
 *  /contact              → ContactPage        (public)
 *  /login                → LoginPage          (public, redirects if already authenticated)
 *  /register             → RegisterPage       (public, redirects if already authenticated)
 *  /dashboard            → DashboardPage      (protected — any authenticated user)
 *  /admin                → DashboardPage      (protected — admin role only)
 *  *                     → NotFoundPage       (404 catch-all)
 *
 * Lazy loading:
 *   All pages except HomePage and NotFoundPage are lazy-loaded via React.lazy().
 *   This splits the JS bundle so the initial download is smaller, and each
 *   page's code only loads when the user first navigates to it.
 */

import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// ---- Context ----
import { AuthProvider, useAuth } from "./context/AuthContext";

// ---- Layout & Guards ----
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { PageSpinner } from "./components/common/LoadingSpinner";

// ---- Eagerly loaded pages (small, always needed) ----
import HomePage    from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";

// ---- Lazily loaded pages (split into separate chunks) ----
const ToursPage      = lazy(() => import("./pages/ToursPage"));
const TourDetailPage = lazy(() => import("./pages/TourDetailPage"));
const LoginPage      = lazy(() => import("./pages/LoginPage"));
const RegisterPage   = lazy(() => import("./pages/RegisterPage"));
const DashboardPage  = lazy(() => import("./pages/DashboardPage"));
const AboutPage      = lazy(() => import("./pages/AboutPage"));
const ContactPage    = lazy(() => import("./pages/ContactPage"));

/* ──────────────────────────────────────────────────────────────
   PageLoader — Suspense fallback shown while a lazy page bundle
   is downloading. Uses the shared PageSpinner for consistency.
   ────────────────────────────────────────────────────────────── */
const PageLoader = () => <PageSpinner label="Loading page…" />;

/* ──────────────────────────────────────────────────────────────
   PublicOnlyRoute — Redirects authenticated users away from
   the login and register pages (they don't need to see them).
   ────────────────────────────────────────────────────────────── */
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, isLoadingAuth } = useAuth();

  // Wait for auth restoration before deciding where to redirect
  if (isLoadingAuth) return <PageLoader />;

  // If already logged in, send to dashboard instead of showing login/register
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

/* ──────────────────────────────────────────────────────────────
   AppRoutes — The complete route tree.
   Separated from App so that useAuth() can be called inside
   the AuthProvider context (it throws if used outside).
   ────────────────────────────────────────────────────────────── */
const AppRoutes = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>

      {/* Every route is wrapped in Layout (Navbar + Footer) */}
      <Route element={<Layout />}>

        {/* ── Public routes — no login required ── */}
        <Route path="/"         element={<HomePage />} />
        <Route path="/tours"    element={<ToursPage />} />
        <Route path="/tours/:id" element={<TourDetailPage />} />
        <Route path="/about"    element={<AboutPage />} />
        <Route path="/contact"  element={<ContactPage />} />

        {/* ── Auth routes — redirect away if already logged in ── */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          }
        />

        {/* ── Protected routes — any authenticated user ── */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>

        {/* ── Admin-only routes ── */}
        <Route element={<ProtectedRoute requiredRole="admin" />}>
          <Route path="/admin" element={<DashboardPage />} />
        </Route>

        {/* ── 404 catch-all ── */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>

    </Routes>
  </Suspense>
);

/* ══════════════════════════════════════════════════════════════
   App — Root component.
   Wraps everything in the router, auth provider, and toast system.
   ══════════════════════════════════════════════════════════════ */
const App = () => (
  <BrowserRouter>
    <AuthProvider>
      {/* ── Global toast notifications (light theme) ── */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            /* White card with a subtle border — matches the app's light theme */
            background:   "#ffffff",
            color:        "#111827",   /* gray-900 */
            border:       "1px solid #E5E7EB", /* gray-200 */
            borderRadius: "0.75rem",   /* 12px */
            fontSize:     "0.875rem",  /* 14px */
            boxShadow:    "0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)",
            padding:      "12px 16px",
            maxWidth:     "380px",
          },
          /* Success icon in emerald green */
          success: {
            iconTheme: { primary: "#059669", secondary: "#ffffff" },
          },
          /* Error icon in red */
          error: {
            iconTheme: { primary: "#DC2626", secondary: "#ffffff" },
          },
        }}
      />

      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
