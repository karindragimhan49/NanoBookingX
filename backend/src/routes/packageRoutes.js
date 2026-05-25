const express = require('express');
const router = express.Router();
const {
  getAllPackages, getPackageById, createPackage, updatePackage, deletePackage
} = require('../controllers/packageController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.get('/', getAllPackages);
router.get('/:id', getPackageById);
router.post('/', protect, restrictTo('staff', 'admin'), createPackage);
router.patch('/:id', protect, restrictTo('staff', 'admin'), updatePackage);
router.delete('/:id', protect, restrictTo('admin'), deletePackage);

module.exports = router;
