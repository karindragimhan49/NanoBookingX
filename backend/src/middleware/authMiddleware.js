/**
 * authMiddleware.js — JWT Authentication Middleware
 * --------------------------------------------------
 * Protects private routes by verifying the JSON Web Token
 * attached to incoming requests. Attaches the decoded user
 * payload to `req.user` so downstream controllers can use it.
 */

const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * protect — Middleware that guards routes requiring authentication.
 * Expects the token in the Authorization header as "Bearer <token>".
 */
const protect = async (req, res, next) => {
  let token;

  // Check if the Authorization header exists and starts with "Bearer"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract the token part (split "Bearer <token>" and take the second element)
      token = req.headers.authorization.split(" ")[1];

      // Verify the token using the secret key from environment variables
      const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user by the ID stored in the token payload
      // Exclude the password field from the returned user object
      req.user = await User.findById(decodedPayload.id).select("-password");

      // If no user is found (e.g., account deleted), deny access
      if (!req.user) {
        return res.status(401).json({ message: "User not found. Access denied." });
      }

      // Token is valid — proceed to the next middleware or controller
      next();
    } catch (error) {
      // Token verification failed (expired, tampered, etc.)
      console.error("Token verification failed:", error.message);
      return res.status(401).json({ message: "Not authorized. Invalid token." });
    }
  } else {
    // No token was provided in the header
    return res.status(401).json({ message: "Not authorized. No token provided." });
  }
};

/**
 * authorizeRoles — Middleware factory that restricts access based on user roles.
 * Usage: router.get('/admin-only', protect, authorizeRoles('admin'))
 *
 * @param {...string} roles - Allowed roles (e.g., 'admin', 'guide', 'customer')
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Check if the current user's role is in the list of allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access forbidden. Role '${req.user.role}' is not permitted to access this resource.`,
      });
    }
    next();
  };
};

module.exports = { protect, authorizeRoles };
