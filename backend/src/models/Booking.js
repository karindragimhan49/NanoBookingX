/**
 * Booking.js — Booking Mongoose Model
 * --------------------------------------
 * Represents a tour booking made by a customer.
 * Links a user to a specific tour with pricing and status tracking.
 */

const mongoose = require("mongoose");

/**
 * bookingSchema — Defines the structure of a booking document in MongoDB.
 */
const bookingSchema = new mongoose.Schema(
  {
    // Reference to the tour being booked
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
      required: [true, "A booking must reference a tour."],
    },

    // Reference to the customer who made the booking
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "A booking must reference a user."],
    },

    // The price paid at the time of booking (captured to handle future price changes)
    pricePaid: {
      type: Number,
      required: [true, "Booking price is required."],
    },

    // Number of participants/seats reserved
    numberOfParticipants: {
      type: Number,
      required: [true, "Number of participants is required."],
      min: [1, "At least 1 participant is required."],
    },

    // The date the tour starts for this booking
    tourStartDate: {
      type: Date,
      required: [true, "Tour start date is required."],
    },

    // Current status of the booking lifecycle
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },

    // Payment status (e.g., after integrating Stripe or PayPal)
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },

    // Unique payment reference ID from the payment gateway
    paymentReference: {
      type: String,
      default: null,
    },

    // Any special requests or notes from the customer
    specialRequests: {
      type: String,
      default: "",
    },
  },
  {
    // Adds createdAt and updatedAt fields automatically
    timestamps: true,
  }
);

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
