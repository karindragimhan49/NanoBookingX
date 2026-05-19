/**
 * authController.js — Authentication Controller
 * ================================================
 * Handles user registration, login, and profile retrieval.
 *
 * Flow for Registration:
 *   1. Check if the email already exists in the database.
 *   2. Hash the plain-text password using bcryptjs (12 salt rounds).
 *   3. Insert the new user row into PostgreSQL.
 *   4. Sign and return a JWT so the user is immediately logged in.
 *
 * Flow for Login:
 *   1. Find the user by email (case-insensitive).
 *   2. Compare the submitted password against the stored bcrypt hash.
 *   3. Return a JWT on success; a generic error on failure.
 *
 * Security notes:
 *   - Login errors are intentionally vague ("invalid email or password")
 *     to prevent user enumeration attacks.
 *   - password_hash is never included in any API response.
 *   - Only 'customer' registration is open publicly. Staff/Admin accounts
 *     can only be created by an admin (a future endpoint).
 */

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { findUserByEmail, findUserById, createUser } = require("../queries/userQueries");

// ---- Constants ----
const BCRYPT_SALT_ROUNDS = 12; // Higher = more secure, but slower hashing

/**
 * generateJWT — Signs a JWT containing just the user's ID.
 * Keeping the payload small improves performance on every authenticated request.
 *
 * @param {number} userId — The user's integer primary key from PostgreSQL
 * @returns {string} A signed JWT string
 */
const generateJWT = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

/**
 * formatUserResponse — Builds a safe user object for API responses.
 * Ensures password_hash and internal fields are never accidentally sent.
 *
 * @param {Object} user — Raw row from the `users` table
 * @returns {Object} Clean user object safe for client consumption
 */
const formatUserResponse = (user) => ({
  id: user.id,
  fullName: user.full_name,
  email: user.email,
  role: user.role,
  phoneNumber: user.phone_number,
  profilePictureUrl: user.profile_picture_url,
  createdAt: user.created_at,
});

// ============================================================
// @route   POST /api/auth/register
// @desc    Register a new customer account
// @access  Public
// ============================================================
const registerUser = async (req, res, next) => {
  try {
    const { fullName, email, password, phoneNumber } = req.body;

    // --- Validate required fields ---
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, and password are required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long.",
      });
    }

    // --- Check for duplicate email ---
    const existingUserResult = await findUserByEmail(email);
    if (existingUserResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "An account with this email address already exists.",
      });
    }

    // --- Hash the password before storing ---
    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    // --- Create the user in PostgreSQL (role defaults to 'customer') ---
    const newUserResult = await createUser(
      fullName,
      email,
      passwordHash,
      "customer", // Public registration always creates a customer account
      phoneNumber
    );
    const newUser = newUserResult.rows[0];

    // --- Issue a JWT so the user is immediately authenticated ---
    const token = generateJWT(newUser.id);

    res.status(201).json({
      success: true,
      message: "Account created successfully. Welcome to GlobeTrek Adventures!",
      token,
      user: formatUserResponse(newUser),
    });
  } catch (error) {
    // Pass unexpected errors to the global error handler in errorMiddleware.js
    next(error);
  }
};

// ============================================================
// @route   POST /api/auth/login
// @desc    Authenticate a user and return a JWT
// @access  Public
// ============================================================
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // --- Validate required fields ---
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // --- Look up the user by email ---
    // `findUserByEmail` selects password_hash explicitly for comparison
    const userResult = await findUserByEmail(email);
    const user = userResult.rows[0];

    // --- Verify password against the stored hash ---
    // Run bcrypt.compare even if user is not found (prevents timing attacks)
    const isPasswordCorrect = user
      ? await bcrypt.compare(password, user.password_hash)
      : false;

    // --- Return a generic error if either check fails ---
    if (!user || !isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password. Please try again.",
      });
    }

    // --- Check if the account has been deactivated ---
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "This account has been deactivated. Please contact support.",
      });
    }

    // --- Issue a JWT ---
    const token = generateJWT(user.id);

    res.status(200).json({
      success: true,
      message: "Login successful. Welcome back!",
      token,
      user: formatUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// @route   GET /api/auth/me
// @desc    Return the currently authenticated user's profile
// @access  Private — any logged-in user
// ============================================================
const getMyProfile = async (req, res, next) => {
  try {
    // req.user is populated by the `protect` middleware after JWT verification
    // We re-fetch from the DB to ensure we have the latest data
    const userResult = await findUserById(req.user.id);
    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found.",
      });
    }

    res.status(200).json({
      success: true,
      user: formatUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { registerUser, loginUser, getMyProfile };
