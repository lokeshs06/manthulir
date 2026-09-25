import { cloudinary } from '../config/cloudinary.js';

// Cloudinary's transformation pipeline strips EXIF/GPS metadata by default
// once any transformation is applied — `quality: auto` doubles as both a
// size-saving measure and the trigger for that stripping, so no raw photo
// (with embedded GPS coordinates) is ever stored as-is.
export const uploadImageBuffer = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        quality: 'auto',
        fetch_format: 'auto',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    stream.end(buffer);
  });

export const deleteImage = (publicId) => cloudinary.uploader.destroy(publicId);
