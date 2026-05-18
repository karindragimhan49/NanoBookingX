/**
 * User.js — User Mongoose Model
 * --------------------------------
 * Defines the schema and behavior for a GlobeTrek user account.
 * Handles password hashing automatically before saving to the database.
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * userSchema — Defines the structure of a user document in MongoDB.
 */
const userSchema = new mongoose.Schema(
  {
    // Full name of the user (displayed on profile, bookings, etc.)
    fullName: {
      type: String,
      required: [true, "Full name is required."],
      trim: true,
      maxlength: [100, "Full name cannot exceed 100 characters."],
    },

    // Email is used as the unique login identifier
    email: {
      type: String,
      required: [true, "Email address is required."],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address."],
    },

    // Hashed password — never stored in plain text
    password: {
      type: String,
      required: [true, "Password is required."],
      minlength: [8, "Password must be at least 8 characters long."],
      select: false, // Exclude password field from query results by default
    },

    // Role determines what pages and actions the user can access
    role: {
      type: String,
      enum: ["customer", "guide", "admin"],
      default: "customer",
    },

    // Optional profile picture URL (stored externally, e.g., Cloudinary)
    profilePicture: {
      type: String,
      default: "",
    },

    // Phone number for contact during bookings
    phoneNumber: {
      type: String,
      default: "",
    },
  },
  {
    // Automatically adds `createdAt` and `updatedAt` timestamp fields
    timestamps: true,
  }
);

/**
 * Pre-save hook — Hashes the password before saving to the database.
 * Only runs if the password field was modified (prevents re-hashing on unrelated updates).
 */
userSchema.pre("save", async function (next) {
  // Skip hashing if the password wasn't changed
  if (!this.isModified("password")) {
    return next();
  }

  // Generate a salt with 12 rounds (higher = more secure but slower)
  const salt = await bcrypt.genSalt(12);

  // Hash the plain-text password with the generated salt
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Instance method — Compares a plain-text password against the stored hash.
 * Used during login to verify the user's credentials.
 *
 * @param {string} candidatePassword - The plain-text password entered by the user
 * @returns {Promise<boolean>} - True if passwords match, false otherwise
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
