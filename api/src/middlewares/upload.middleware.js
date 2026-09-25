import multer from 'multer';

// Memory storage — files are validated (magic bytes, size) and forwarded
// straight to Cloudinary/the ML service, never written to local disk.
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});
