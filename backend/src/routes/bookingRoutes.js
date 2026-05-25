const express = require('express');
const router = express.Router();
const {
  createBooking, getMyBookings, getAllBookings, updateBookingStatus, cancelBooking
} = require('../controllers/bookingController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.get('/', protect, restrictTo('staff', 'admin'), getAllBookings);
router.patch('/:id/status', protect, restrictTo('staff', 'admin'), updateBookingStatus);
router.patch('/:id/cancel', protect, cancelBooking);

module.exports = router;
