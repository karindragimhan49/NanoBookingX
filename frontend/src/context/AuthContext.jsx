/**
 * AuthContext.jsx — Global Authentication State Manager
 * -------------------------------------------------------
 * Provides the current user's authentication state to the entire app
 * via React Context. Handles login, logout, and persistent auth on refresh.
 *
 * Wrap your app's root component with <AuthProvider> to make the
 * `useAuth` hook available everywhere.
 */

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { loginUser, registerUser, getMyProfile } from "../api/authApi";

// ---- Create the Auth Context ----
// This is the "container" that will hold and share the auth state
const AuthContext = createContext(null);

// ---- Storage Keys ----
// Using constants prevents typos when reading/writing to localStorage
const TOKEN_KEY = "globetrek_token";
const USER_KEY = "globetrek_user";

/**
 * AuthProvider — Wraps children with the AuthContext so they can consume auth state.
 *
 * @param {ReactNode} children - All child components that need auth access
 */
export const AuthProvider = ({ children }) => {
  // The current authenticated user object (or null if logged out)
  const [currentUser, setCurrentUser] = useState(null);

  // True while we're verifying an existing session on app load
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  /**
   * On initial mount, check if there's a saved token in localStorage.
   * If yes, verify it with the backend and restore the user session.
   * This prevents users from being logged out on page refresh.
   */
  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem(TOKEN_KEY);

      if (savedToken) {
        try {
          // Verify the token is still valid by fetching the user profile
          const response = await getMyProfile();
          setCurrentUser(response.data.user);
        } catch (error) {
          // Token is expired or invalid — clear stale data
          console.warn("Session restoration failed. Clearing auth data.");
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
        }
      }

      // Stop showing the loading state regardless of outcome
      setIsLoadingAuth(false);
    };

    restoreSession();
  }, []);

  /**
   * login — Authenticates a user and stores their session data.
   *
   * @param {Object} credentials - { email, password }
   * @returns {Object} The logged-in user's data
   */
  const login = useCallback(async (credentials) => {
    const response = await loginUser(credentials);
    const { token, user } = response.data;

    // Persist the token and user data in localStorage for session restoration
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    setCurrentUser(user);
    return user;
  }, []);

  /**
   * register — Creates a new account and automatically logs the user in.
   *
   * @param {Object} userData - { fullName, email, password, phoneNumber }
   * @returns {Object} The newly registered user's data
   */
  const register = useCallback(async (userData) => {
    const response = await registerUser(userData);
    const { token, user } = response.data;

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    setCurrentUser(user);
    return user;
  }, []);

  /**
   * logout — Clears the session and resets the auth state.
   */
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setCurrentUser(null);
  }, []);

  /**
   * refreshUser — Re-fetches the user's profile from the backend and updates
   * the in-memory state. Call this after a profile update so the navbar and
   * any other consumers immediately reflect the new data.
   */
  const refreshUser = useCallback(async () => {
    try {
      const response = await getMyProfile();
      const updatedUser = response.data.user;
      setCurrentUser(updatedUser);
      // Keep localStorage in sync with the refreshed profile
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    } catch (error) {
      // Silently ignore refresh failures — the stale data is still valid
      console.warn("Could not refresh user profile:", error.message);
    }
  }, []);

  // The value object exposed to all consumers of this context
  const contextValue = {
    currentUser,         // The authenticated user object (or null)
    isLoadingAuth,       // True while checking localStorage on first load
    isAuthenticated: !!currentUser, // Convenient boolean for auth checks
    isAdmin: currentUser?.role === "admin",
    login,
    register,
    logout,
    refreshUser,         // Call after profile updates to sync navbar/header
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth — Custom hook for consuming the AuthContext.
 * Usage: const { currentUser, login, logout } = useAuth();
 *
 * Throws an error if used outside of <AuthProvider> to catch mistakes early.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an <AuthProvider>. Wrap your app root with <AuthProvider>.");
  }

  return context;
};
