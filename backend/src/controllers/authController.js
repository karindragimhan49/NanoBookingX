/**
 * authController.js — Authentication Controller
 * -----------------------------------------------
 * Handles user registration, login, and profile retrieval.
 * All responses follow a consistent JSON structure for the frontend.
 */

const User = require("../models/User");
const jwt = require("jsonwebtoken");

/**
 * generateJWT — Creates and returns a signed JWT for the given user ID.
 * The token expiry is read from environment variables (default: 7 days).
 *
 * @param {string} userId - The MongoDB _id of the authenticated user
 * @returns {string} - A signed JWT string
 */
const generateJWT = (userId) => {
  return jwt.sign(
    { id: userId }, // Payload: store only the user ID to keep tokens small
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

// ============================================================
// @route   POST /api/auth/register
// @desc    Register a new user account
// @access  Public
// ============================================================
const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, phoneNumber } = req.body;

    // Check if a user with this email already exists in the database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email address already exists.",
      });
    }

    // Create a new user document (password is hashed by the pre-save hook in User.js)
    const newUser = await User.create({
      fullName,
      email,
      password,
      phoneNumber,
    });

    // Generate a JWT for the newly registered user
    const token = generateJWT(newUser._id);

    // Respond with the created user's public data and the token
    res.status(201).json({
      success: true,
      message: "Account created successfully. Welcome to GlobeTrek!",
      token,
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        profilePicture: newUser.profilePicture,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// @route   POST /api/auth/login
// @desc    Authenticate a user and return a JWT
// @access  Public
// ============================================================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation: ensure both fields are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and password.",
      });
    }

    // Find the user by email. "+password" explicitly includes the password
    // field since it has `select: false` in the schema.
    const user = await User.findOne({ email }).select("+password");

    // If no user found OR password doesn't match, return a generic error
    // (Don't reveal which specific part was wrong — security best practice)
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password. Please try again.",
      });
    }

    // Credentials are valid — generate a fresh JWT
    const token = generateJWT(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful. Welcome back!",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// @route   GET /api/auth/me
// @desc    Get the currently logged-in user's profile
// @access  Private (requires valid JWT via `protect` middleware)
// ============================================================
const getMyProfile = async (req, res) => {
  try {
    // `req.user` is populated by the `protect` middleware after JWT verification
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { registerUser, loginUser, getMyProfile };
