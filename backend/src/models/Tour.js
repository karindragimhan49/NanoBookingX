/**
 * Tour.js — Tour Package Mongoose Model
 * -----------------------------------------
 * Defines the schema for a travel tour package offered by GlobeTrek Adventures.
 * Includes destination details, pricing, availability, and metadata.
 */

const mongoose = require("mongoose");

/**
 * tourSchema — Represents a travel package document in MongoDB.
 */
const tourSchema = new mongoose.Schema(
  {
    // The display name of the tour package (e.g., "Sigiriya Rock & Dambulla Cave Temple")
    name: {
      type: String,
      required: [true, "Tour name is required."],
      trim: true,
      unique: true,
      maxlength: [150, "Tour name cannot exceed 150 characters."],
    },

    // Short summary shown on tour cards (max 200 chars)
    summary: {
      type: String,
      required: [true, "Tour summary is required."],
      trim: true,
    },

    // Long-form description shown on the tour detail page
    description: {
      type: String,
      required: [true, "Tour description is required."],
    },

    // Cover image URL for the tour (stored externally, e.g., Cloudinary)
    coverImage: {
      type: String,
      required: [true, "Tour cover image URL is required."],
    },

    // Additional image gallery URLs for the tour detail page
    images: [{ type: String }],

    // Duration in days (e.g., 5 means a 5-day tour)
    duration: {
      type: Number,
      required: [true, "Tour duration is required."],
    },

    // Maximum number of participants allowed per booking
    maxGroupSize: {
      type: Number,
      required: [true, "Maximum group size is required."],
    },

    // Difficulty level helps customers choose the right tour
    difficulty: {
      type: String,
      required: [true, "Tour difficulty is required."],
      enum: ["easy", "moderate", "challenging"],
    },

    // Price per person in USD
    pricePerPerson: {
      type: Number,
      required: [true, "Price per person is required."],
    },

    // Optional discounted price (e.g., for early bird or group discounts)
    discountedPrice: {
      type: Number,
      default: null,
    },

    // Average rating (1–5) calculated from submitted reviews
    averageRating: {
      type: Number,
      default: 4.0,
      min: [1, "Rating must be at least 1."],
      max: [5, "Rating cannot exceed 5."],
      // Round to one decimal on retrieval (e.g., 4.666... becomes 4.7)
      set: (val) => Math.round(val * 10) / 10,
    },

    // Total number of reviews submitted for this tour
    ratingsCount: {
      type: Number,
      default: 0,
    },

    // Geographic start location of the tour
    startLocation: {
      // GeoJSON point format required for geospatial queries
      type: { type: String, default: "Point", enum: ["Point"] },
      coordinates: [Number], // [longitude, latitude]
      address: String,
      description: String,
    },

    // List of stops/locations visited during the tour
    locations: [
      {
        type: { type: String, default: "Point", enum: ["Point"] },
        coordinates: [Number],
        address: String,
        description: String,
        dayNumber: Number, // Which day of the tour this location is visited
      },
    ],

    // Tour guides assigned to this package (references to User documents)
    guides: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Whether the tour is currently available for booking
    isActive: {
      type: Boolean,
      default: true,
    },

    // A slug is a URL-friendly version of the name (e.g., "sigiriya-rock-tour")
    slug: {
      type: String,
      unique: true,
    },
  },
  {
    // Automatically adds `createdAt` and `updatedAt` fields
    timestamps: true,
    // Include virtual fields (like `durationWeeks`) when converting to JSON/Object
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ---- Index for faster geospatial queries ----
tourSchema.index({ startLocation: "2dsphere" });
tourSchema.index({ slug: 1 });

/**
 * Virtual field — Computes tour duration in weeks (not stored in DB).
 * Accessible as `tour.durationWeeks` after query.
 */
tourSchema.virtual("durationWeeks").get(function () {
  return (this.duration / 7).toFixed(1);
});

/**
 * Virtual populate — Links reviews to this tour without storing IDs in the tour document.
 * Allows `Tour.findOne().populate('reviews')` to work seamlessly.
 */
tourSchema.virtual("reviews", {
  ref: "Review",      // The model to reference
  foreignField: "tour", // Field in Review that references this Tour
  localField: "_id",  // Field in this Tour schema
});

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
