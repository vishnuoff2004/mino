const express = require('express');
const router = express.Router();
const multer = require('multer');
const serviceController = require('../controllers/serviceController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed (max 5MB).'), false);
    }
  },
});

// Public: get all services with search
router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);

// Admin only: create, update, delete
router.post('/', authMiddleware, roleMiddleware('admin'), upload.single('document'), serviceController.createService);
router.put('/:id', authMiddleware, roleMiddleware('admin'), upload.single('document'), serviceController.updateService);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), serviceController.deleteService);

module.exports = router;
