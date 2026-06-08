const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadToMinio } = require('../controllers/uploadController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed.'), false);
    }
  },
});

router.post('/', authMiddleware, roleMiddleware('admin'), upload.single('image'), uploadToMinio);

module.exports = router;
