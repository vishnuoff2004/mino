const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// User routes
router.get('/stats', authMiddleware, roleMiddleware('user'), bookingController.getUserDashboardStats);
router.post('/', authMiddleware, roleMiddleware('user'), bookingController.createBooking);
router.get('/my', authMiddleware, bookingController.getUserBookings);
router.get('/:id', authMiddleware, bookingController.getBookingById);

module.exports = router;
