const express = require('express');
const router = express.Router();
const providerController = require('../controllers/providerController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Authenticated users can view providers
router.get('/', authMiddleware, providerController.getAllProviders);
router.get('/:id', authMiddleware, providerController.getProviderById);

// Admin only: create, update, delete
router.post('/', authMiddleware, roleMiddleware('admin'), providerController.createProvider);
router.put('/:id', authMiddleware, roleMiddleware('admin'), providerController.updateProvider);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), providerController.deleteProvider);

module.exports = router;
