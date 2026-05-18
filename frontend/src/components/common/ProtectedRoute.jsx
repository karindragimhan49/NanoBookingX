/**
 * ProtectedRoute.jsx — Route Guard Component
 * --------------------------------------------
 * Prevents unauthenticated users from accessing protected pages.
 * If not logged in, the user is redirected to the login page.
 * Supports role-based access control (e.g., admin-only routes).
 *
 * Usage:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/dashboard" element={<Dashboard />} />
 *   </Route>
 *
 *   // Admin-only:
 *   <Route element={<ProtectedRoute requiredRole="admin" />}>
 *     <Route path="/admin" element={<AdminPanel />} />
 *   </Route>
 */

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * ProtectedRoute — Guards routes that require authentication.
 *
 * @param {string} requiredRole - Optional role required (e.g., "admin")
 */
const ProtectedRoute = ({ requiredRole = null }) => {
  const { isAuthenticated, currentUser, isLoadingAuth } = useAuth();
  const location = useLocation(); // Capture the current path for redirect-back

  // Show nothing (or a spinner) while the auth state is being determined
  // This prevents a flash of the login page on refresh for authenticated users
  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If not authenticated, redirect to login page.
  // Save the current path in state so we can redirect back after login.
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If a specific role is required, verify the user has it
  if (requiredRole && currentUser?.role !== requiredRole) {
    // User is logged in but doesn't have the required role — redirect home
    return <Navigate to="/" replace />;
  }

  // Access granted — render the child route(s)
  return <Outlet />;
};

export default ProtectedRoute;
