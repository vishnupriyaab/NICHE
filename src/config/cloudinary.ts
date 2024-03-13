import { v2 as cloudinary } from 'cloudinary';

// Ensure these environment variables are properly set
const cloudName = process.env.CLOUD_NAME;
const apiKey = process.env.CLOUD_API_KEY;
const apiSecret = process.env.CLOUD_API_SECRET;

// Check if environment variables are properly set
if (!cloudName || !apiKey || !apiSecret) {
  console.error("Cloudinary configuration error: CLOUD_NAME, CLOUD_API_KEY, and CLOUD_API_SECRET are required.");
}

cloudinary.config({ 
  CLOUD_NAME: cloudName, 
  api_key: apiKey, 
  api_secret: apiSecret
});

export default function cloudinaryUploadImage(images: string[]) {
  return new Promise((resolve, reject) => {
    const uploadPromises = [];
    for (const image of images) {
      uploadPromises.push(
        new Promise((resolve, reject) => {
          cloudinary.uploader.upload(image, (error, result) => {
            if (result && result.secure_url) {
              resolve(result.secure_url);
            } else {
              reject(error);
            }
          });
        })
      );
    }

    // Upload all images in parallel
    Promise.all(uploadPromises)
      .then(resolve)
      .catch(reject);
  });
}
