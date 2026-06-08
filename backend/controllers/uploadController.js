const { minioClient, BUCKET_NAME, ensureBucket, getFileUrl } = require('../utils/minioClient');
const crypto = require('crypto');
const path = require('path');

const uploadToMinio = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    await ensureBucket();

    const ext = path.extname(req.file.originalname);
    const fileName = `providers/${crypto.randomUUID()}${ext}`;

    await minioClient.putObject(BUCKET_NAME, fileName, req.file.buffer, req.file.size, {
      'Content-Type': req.file.mimetype,
    });

    const fileUrl = getFileUrl(fileName);

    res.json({ message: 'File uploaded successfully.', url: fileUrl, fileName });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadToMinio };
