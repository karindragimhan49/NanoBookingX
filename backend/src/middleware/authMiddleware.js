/**
 * authMiddleware.js — JWT Authentication & Role Authorization Middleware
 * =======================================================================
 *
 * `protect` — Verifies the JWT in the Authorization header.
 *   On success: populates `req.user` with the authenticated user's data.
 *   On failure: returns a 401 Unauthorized response.
 *
 * `optionalAuth` — Same as `protect` but does NOT block unauthenticated requests.
 *   If a valid token is present, `req.user` is populated.
 *   If no token is present, `req.user` stays null and the request continues.
 *   Used for public routes where auth enhances but is not required
 *   (e.g., the inquiry submission endpoint, which auto-links to a user if logged in).
 *
 * `authorizeRoles(...roles)` — A middleware factory that blocks users whose
 *   role is not in the allowed list. Must be used AFTER `protect`.
 *   Usage: router.post('/admin-only', protect, authorizeRoles('admin'), handler)
 */

const jwt = require("jsonwebtoken");
const { findUserById } = require("../queries/userQueries");

/**
 * protect — Guards routes that require a valid JWT.
 * Expects: Authorization: Bearer <token>
 */
const protect = async (req, res, next) => {
  let token;

  // Check if the Authorization header exists and follows "Bearer <token>" format
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No authentication token provided.",
    });
  }

  try {
    // Verify the token's signature and check it hasn't expired
    const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the latest user data from PostgreSQL using the ID embedded in the token.
    // This ensures that deactivated accounts can't continue using old tokens.
    const userResult = await findUserById(decodedPayload.id);
    const user = userResult.rows[0];

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "The user associated with this token no longer exists.",
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "This account has been deactivated. Please contact support.",
      });
    }

    // Attach the user object to the request so downstream controllers can use it
    req.user = user;
    next();
  } catch (error) {
    // jwt.verify throws for expired, malformed, or tampered tokens
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Your session has expired. Please log in again.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid authentication token.",
    });
  }
};

/**
 * optionalAuth — Like `protect`, but allows unauthenticated requests through.
 * Sets req.user if a valid token is provided; leaves it null otherwise.
 */
const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // No token provided — continue as a guest (req.user remains undefined)
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
    const userResult = await findUserById(decodedPayload.id);
    req.user = userResult.rows[0] || null;
    next();
  } catch (error) {
    // Invalid token on an optional route is silently ignored
    req.user = null;
    next();
  }
};

/**
 * authorizeRoles — Middleware factory for role-based access control.
 * Must always be placed AFTER `protect` in the middleware chain.
 *
 * @param {...string} roles — The roles permitted to access the route
 *                           e.g., authorizeRoles('staff', 'admin')
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access forbidden. Your role ('${req.user?.role}') does not have permission to perform this action.`,
      });
    }
    next();
  };
};

module.exports = { protect, optionalAuth, authorizeRoles };
