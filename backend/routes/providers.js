const express = require('express');
const router = express.Router();
const multer = require('multer');
const providerController = require('../controllers/providerController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG and PNG images are allowed (max 5MB).'), false);
    }
  },
});

// Authenticated users can view providers
router.get('/', authMiddleware, providerController.getAllProviders);
router.get('/:id', authMiddleware, providerController.getProviderById);

// Admin only: create, update, delete
router.post('/', authMiddleware, roleMiddleware('admin'), upload.single('profile_image'), providerController.createProvider);
router.put('/:id', authMiddleware, roleMiddleware('admin'), upload.single('profile_image'), providerController.updateProvider);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), providerController.deleteProvider);

module.exports = router;
