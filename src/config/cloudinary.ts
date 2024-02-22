import { v2 as cloudinary } from 'cloudinary';

// Ensure these environment variables are properly set
const cloudName = process.env.cloud_name;
const apiKey = process.env.cloud_api_key;
const apiSecret = process.env.cloud_api_secret;

// Check if environment variables are properly set
if (!cloudName || !apiKey || !apiSecret) {
  console.error("Cloudinary configuration error: cloud_name, cloud_api_key, and cloud_api_secret are required.");
}

cloudinary.config({ 
  cloud_name: cloudName, 
  api_key: apiKey, 
  api_secret: apiSecret
});

export default function cloudinaryUploadImage(images: string[]) {
  return new Promise((resolve, reject) => {
    const uploadPromises = [];

    console.log(images);
    
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
