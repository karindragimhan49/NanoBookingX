/**
 * errorMiddleware.js — Global Error Handling Middleware
 * =======================================================
 * These two middleware functions must be registered LAST in server.js,
 * after all routes. Express identifies error handlers by their 4-argument
 * signature: (err, req, res, next).
 *
 * Errors flow here in two ways:
 *   1. A route/controller calls `next(error)` explicitly.
 *   2. An async controller throws an uncaught error (caught by Express 5+).
 *
 * The response always follows the same shape:
 *   { success: false, message: "...", errors: [...], stack: "..." }
 * This consistency lets the frontend handle all errors uniformly.
 */

/**
 * notFound — Handles HTTP requests to undefined routes (404 Not Found).
 * Creates a meaningful error and passes it to the global error handler below.
 */
const notFound = (req, res, next) => {
  const error = new Error(
    `Route not found: [${req.method}] ${req.originalUrl}`
  );
  res.status(404);
  next(error);
};

/**
 * globalErrorHandler — Catches all errors and sends a structured JSON response.
 *
 * PostgreSQL-specific error codes are handled here:
 *   23505 → Unique violation (e.g., duplicate email)
 *   23503 → Foreign key violation (e.g., referencing a deleted record)
 *   23514 → Check constraint violation (e.g., invalid role value)
 *   22P02 → Invalid input syntax (e.g., passing a string where an int is expected)
 *
 * @param {Error}    err  — The thrown error object
 * @param {Object}   req  — Express request
 * @param {Object}   res  — Express response
 * @param {Function} next — Next function (required for Express error handler signature)
 */
const globalErrorHandler = (err, req, res, next) => {
  // Determine the HTTP status code:
  // If res.status was already set (e.g., in a notFound call), use it.
  // If the error has its own status, use that.
  // Default to 500 Internal Server Error.
  let statusCode = res.statusCode !== 200 ? res.statusCode : (err.statusCode || 500);
  let message = err.message || "An unexpected server error occurred.";

  // ---- Handle specific PostgreSQL error codes ----
  if (err.code === "23505") {
    // Unique constraint violation (e.g., duplicate email on registration)
    statusCode = 409; // 409 Conflict
    message = "A record with this value already exists. Please use a different value.";

    // Extract the conflicting field name from the error detail for a better message
    const detail = err.detail || "";
    const match = detail.match(/Key \((.+?)\)=/);
    if (match) {
      message = `The value for '${match[1]}' is already taken. Please choose a different one.`;
    }
  } else if (err.code === "23503") {
    // Foreign key violation (referencing a record that doesn't exist)
    statusCode = 400;
    message = "Referenced record does not exist. Please check your input.";
  } else if (err.code === "23514") {
    // Check constraint violation (value outside allowed enum/range)
    statusCode = 400;
    message = "The provided value is not allowed for this field. Please check your input.";
  } else if (err.code === "22P02") {
    // Invalid text representation (e.g., non-integer ID passed to a query)
    statusCode = 400;
    message = "Invalid input format. Please check that IDs are numbers and values are correct types.";
  }

  // Build the JSON error response
  const errorResponse = {
    success: false,
    message,
    // Include full stack trace only in development — never expose in production
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  };

  // Log to server console for debugging (use a proper logger like Winston in production)
  if (process.env.NODE_ENV === "development") {
    console.error(`[ERROR] ${req.method} ${req.originalUrl} — ${err.message}`);
  }

  res.status(statusCode).json(errorResponse);
};

module.exports = { notFound, globalErrorHandler };
