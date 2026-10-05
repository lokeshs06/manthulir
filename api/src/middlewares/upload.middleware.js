import multer from 'multer';

// Memory storage — files are validated (magic bytes, size) and forwarded
// straight to Cloudinary/the ML service, never written to local disk.
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadSingleFlexible = (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) return next(err);
    if (req.files && req.files.length > 0) {
      req.file =
        req.files.find((f) =>
          ['file', 'image', 'images', 'document', 'photo'].includes(f.fieldname),
        ) || req.files[0];
    }
    next();
  });
};
