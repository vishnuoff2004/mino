const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const adminOnly = [authMiddleware, roleMiddleware('admin')];

router.get('/dashboard', ...adminOnly, adminController.getAdminDashboardStats);
router.get('/bookings', ...adminOnly, adminController.getAllBookings);
router.put('/bookings/:id/status', ...adminOnly, adminController.updateBookingStatus);
router.get('/users', ...adminOnly, adminController.getAllUsers);

module.exports = router;
