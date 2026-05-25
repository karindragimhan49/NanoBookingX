const express = require('express');
const router = express.Router();
const { register, login, getMe, getAllUsers, updateUser } = require('../controllers/authController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/users', protect, restrictTo('admin'), getAllUsers);
router.patch('/users/:id', protect, restrictTo('admin'), updateUser);

module.exports = router;
