/**
 * errorMiddleware.js — Global Error Handler
 * ------------------------------------------
 * Catches all errors thrown in Express route handlers and
 * controllers, returning a consistent JSON error response.
 * Must be the LAST middleware registered in server.js.
 */

/**
 * notFound — Handles requests to undefined routes (404).
 * Creates a new error and forwards it to the global error handler.
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error); // Pass the error to the global error handler below
};

/**
 * globalErrorHandler — Central error-handling middleware.
 * Express identifies this as an error handler because it takes 4 arguments (err, req, res, next).
 *
 * @param {Error}  err  - The error object thrown or passed via next(error)
 * @param {Object} req  - Express request object
 * @param {Object} res  - Express response object
 * @param {Function} next - Express next function
 */
const globalErrorHandler = (err, req, res, next) => {
  // If status code is still 200 (no error code was set), default to 500
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Build the error response object
  const errorResponse = {
    success: false,
    message: err.message || "An unexpected server error occurred.",
    // Include the stack trace only in development mode for easier debugging
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  };

  res.status(statusCode).json(errorResponse);
};

module.exports = { notFound, globalErrorHandler };
