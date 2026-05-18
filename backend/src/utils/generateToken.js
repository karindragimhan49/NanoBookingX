/**
 * generateToken.js — JWT Token Utility
 * ----------------------------------------
 * Provides a reusable function for generating signed JWTs.
 * Centralizes token creation to avoid duplication across controllers.
 */

const jwt = require("jsonwebtoken");

/**
 * generateToken — Signs and returns a JWT for the given user ID.
 *
 * @param {string} userId - The MongoDB _id of the user
 * @returns {string} - A signed JWT string
 */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

module.exports = generateToken;
