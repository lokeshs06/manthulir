/**
 * Client-side image compression utility using HTML5 Canvas.
 * Resizes large photos to max dimension 1600px and compresses JPEG quality to ~0.75,
 * reducing typical phone camera photos from 5MB+ to ~200-400KB before uploading
 * over patchy 3G/4G connections.
 */
export const compressImage = async (
  file,
  { maxWidth = 1600, maxHeight = 1600, quality = 0.75 } = {}
) => {
  // If file is not an image (e.g. PDF for certification), return as is
  if (!file || !file.type.startsWith('image/')) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onerror = () => resolve(file); // fallback to original on error

    reader.onload = (e) => {
      const img = new Image();

      img.onerror = () => resolve(file);

      img.onload = () => {
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(file);
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              // If compressed is somehow larger than original, return original
              return resolve(file);
            }

            const compressedFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, '') + '.jpg',
              {
                type: 'image/jpeg',
                lastModified: Date.now(),
              }
            );

            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  });
};
