const multer = require('multer');
const path = require('path');
const fs = require('fs');
const asyncHandler = require('express-async-handler');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { isCloudinaryConfigured, uploadToCloudinary } = require('../utils/cloudinary');

const router = require('express').Router();

// Ensure local uploads dir exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Always use memory storage so we can decide dynamically (Cloudinary vs local)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMime = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedMime.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, png, webp, gif)'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
});

/**
 * POST /api/upload
 * Upload images — uses Cloudinary if configured, else local disk
 */
router.post(
  '/',
  protect,
  adminOnly,
  upload.array('images', 10),
  asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
      res.status(400);
      throw new Error('No files uploaded');
    }

    const results = [];

    if (isCloudinaryConfigured()) {
      // Upload all files to Cloudinary in parallel
      const uploads = req.files.map((file) => uploadToCloudinary(file.buffer));
      const cloudResults = await Promise.all(uploads);
      cloudResults.forEach((r) => results.push({ url: r.url, publicId: r.publicId }));
    } else {
      // Save to local disk
      for (const file of req.files) {
        const ext = path.extname(file.originalname) || '.jpg';
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
        const filepath = path.join(uploadDir, filename);
        fs.writeFileSync(filepath, file.buffer);
        results.push({
          url: `/uploads/${filename}`,
          publicId: '',
        });
      }
    }

    res.json({ success: true, images: results });
  })
);

/**
 * DELETE /api/upload
 * Delete a Cloudinary image by publicId
 */
router.delete(
  '/',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const { publicId } = req.body;
    if (!publicId) {
      return res.json({ success: true, message: 'No publicId — local file, skip' });
    }
    const { deleteFromCloudinary } = require('../utils/cloudinary');
    await deleteFromCloudinary(publicId);
    res.json({ success: true, message: 'Image deleted' });
  })
);

module.exports = router;
