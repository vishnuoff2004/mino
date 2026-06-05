const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Public: get all services with search
router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);

// Admin only: create, update, delete
router.post('/', authMiddleware, roleMiddleware('admin'), serviceController.createService);
router.put('/:id', authMiddleware, roleMiddleware('admin'), serviceController.updateService);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), serviceController.deleteService);

module.exports = router;
