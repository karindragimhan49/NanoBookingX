/**
 * ProtectedRoute.jsx — Route Authentication Guard
 * ==================================================
 * Prevents unauthenticated users from accessing protected pages.
 * Optionally enforces a required role (e.g., 'admin' only).
 *
 * Behaviour:
 *  - While auth session is being restored: shows the PageSpinner.
 *  - If not authenticated: redirects to /login, saving the intended
 *    destination in router state so the login page can redirect back.
 *  - If authenticated but wrong role: redirects to home (/).
 *  - If all checks pass: renders the child route via <Outlet />.
 *
 * Usage in App.jsx:
 *   // Any authenticated user:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/dashboard" element={<DashboardPage />} />
 *   </Route>
 *
 *   // Admin only:
 *   <Route element={<ProtectedRoute requiredRole="admin" />}>
 *     <Route path="/admin" element={<AdminPanel />} />
 *   </Route>
 *
 * Props:
 *   requiredRole (string | null) — If provided, the user's role must
 *                                   match this value, or they are redirected.
 */

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { PageSpinner } from "./LoadingSpinner";

const ProtectedRoute = ({ requiredRole = null }) => {
  const { isAuthenticated, currentUser, isLoadingAuth } = useAuth();
  const location = useLocation(); // Capture current URL for post-login redirect

  /* While auth state is being determined (token verification in progress),
     show a full-page spinner to avoid a flash of the wrong page */
  if (isLoadingAuth) {
    return <PageSpinner label="Checking your session…" />;
  }

  /* Not authenticated → redirect to login.
     Pass `from` in router state so the LoginPage can redirect back
     after a successful login (e.g., the user tried to access /dashboard). */
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  /* Authenticated but wrong role → redirect to home.
     This prevents e.g. a customer from accessing /admin. */
  if (requiredRole && currentUser?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  /* All checks passed — render the child route */
  return <Outlet />;
};

export default ProtectedRoute;
