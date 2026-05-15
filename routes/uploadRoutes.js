const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif/;
  const isValid = allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype);
  cb(isValid ? null : new Error('Only images allowed'), isValid);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/', protect, adminOnly, upload.array('images', 5), (req, res) => {
  const urls = req.files.map(f => `/uploads/${f.filename}`);
  res.json({ success: true, urls });
});

module.exports = router;
