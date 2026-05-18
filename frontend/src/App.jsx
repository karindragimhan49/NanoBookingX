/**
 * App.jsx — Root Application Component & Route Configuration
 * -----------------------------------------------------------
 * Sets up the entire client-side routing tree using React Router v6.
 *
 * Route Structure:
 *  /                     → HomePage           (public)
 *  /tours                → ToursPage          (public)
 *  /tours/:id            → TourDetailPage     (public)
 *  /login                → LoginPage          (public, redirect if auth'd)
 *  /register             → RegisterPage       (public, redirect if auth'd)
 *  /dashboard            → DashboardPage      (protected — any logged-in user)
 *  /admin/*              → AdminLayout/Pages  (protected — admin only)
 *  /about                → AboutPage          (public)
 *  /contact              → ContactPage        (public)
 *  *                     → NotFoundPage       (404 catch-all)
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// ---- Context Providers ----
import { AuthProvider, useAuth } from "./context/AuthContext";

// ---- Layout ----
import Layout from "./components/layout/Layout";

// ---- Route Guard ----
import ProtectedRoute from "./components/common/ProtectedRoute";

// ---- Page Components ----
// Public pages
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";

// Lazy-loaded pages (reduces initial bundle size)
import { lazy, Suspense } from "react";

const ToursPage       = lazy(() => import("./pages/ToursPage"));
const TourDetailPage  = lazy(() => import("./pages/TourDetailPage"));
const LoginPage       = lazy(() => import("./pages/LoginPage"));
const RegisterPage    = lazy(() => import("./pages/RegisterPage"));
const DashboardPage   = lazy(() => import("./pages/DashboardPage"));
const AboutPage       = lazy(() => import("./pages/AboutPage"));
const ContactPage     = lazy(() => import("./pages/ContactPage"));

/**
 * PageLoader — Displayed while lazy-loaded pages are fetching their bundle.
 */
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

/**
 * PublicOnlyRoute — Redirects authenticated users away from login/register pages.
 * If a user is already logged in, they shouldn't need to re-register.
 */
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, isLoadingAuth } = useAuth();

  if (isLoadingAuth) return <PageLoader />;

  // Redirect authenticated users to the dashboard
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

/**
 * AppRoutes — Contains the full routing tree.
 * Separated from App to allow useAuth() to be called inside AuthProvider.
 */
const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* All routes wrapped in Layout (Navbar + Footer) */}
        <Route element={<Layout />}>

          {/* ---- Public Routes ---- */}
          <Route path="/" element={<HomePage />} />
          <Route path="/tours" element={<ToursPage />} />
          <Route path="/tours/:id" element={<TourDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* ---- Auth Routes (only for unauthenticated users) ---- */}
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

          {/* ---- Protected Routes (any logged-in user) ---- */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>

          {/* ---- Admin-Only Routes ---- */}
          <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route path="/admin" element={<DashboardPage />} />
          </Route>

          {/* ---- 404 Catch-All ---- */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

/**
 * App — The root component. Wraps everything with:
 *  - BrowserRouter: enables client-side routing
 *  - AuthProvider: provides global auth state
 *  - Toaster: enables toast notifications from anywhere in the app
 */
const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Global toast notification system (positioned top-right) */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1e293b",  // Matches --color-surface
              color: "#f1f5f9",       // Matches --color-text-primary
              border: "1px solid #334155",
              borderRadius: "0.75rem",
              fontSize: "0.875rem",
            },
            success: {
              iconTheme: { primary: "#0d9488", secondary: "#f1f5f9" },
            },
            error: {
              iconTheme: { primary: "#ef4444", secondary: "#f1f5f9" },
            },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
