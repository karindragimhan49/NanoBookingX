const express = require('express');
const router = express.Router();
const {
  createInquiry, getMyInquiries, getAllInquiries, updateInquiry, deleteInquiry
} = require('../controllers/inquiryController');
const { protect, optionalProtect, restrictTo } = require('../middleware/authMiddleware');

router.post('/', optionalProtect, createInquiry);
router.get('/my-inquiries', protect, getMyInquiries);
router.get('/', protect, restrictTo('staff', 'admin'), getAllInquiries);
router.patch('/:id', protect, restrictTo('staff', 'admin'), updateInquiry);
router.delete('/:id', protect, restrictTo('admin'), deleteInquiry);

module.exports = router;
