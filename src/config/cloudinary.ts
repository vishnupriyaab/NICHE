import { v2 as cloudinary } from "cloudinary";
import sharp from "sharp";

// Ensure these environment variables are properly set
const cloudName = process.env.CLOUD_NAME;
const apiKey = process.env.CLOUD_API_KEY;
const apiSecret = process.env.CLOUD_API_SECRET;

// Check if environment variables are properly set
if (!cloudName || !apiKey || !apiSecret) {
  console.error(
    "Cloudinary configuration error: CLOUD_NAME, CLOUD_API_KEY, and CLOUD_API_SECRET are required."
  );
}

export default async function cloudinaryUploadImage(imgArr: any[]) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  return new Promise((resolve, reject) => {
    const uploadPromises = [];
    for (const image of imgArr) {
      uploadPromises.push(
        new Promise((resolve, reject) => {
          cloudinary.uploader.upload(
            image,
            { resource_type: "image", folder: "NICHE", width: 400, height: 400, crop: "fill" },
            (error, result) => {
              if (result && result.secure_url) {
                resolve(result.secure_url);
              } else {
                reject(error);
              }
            }
          );
        })
      );
    }

    // Upload all images in parallel
    Promise.all(uploadPromises)
      .then((urls) => {
        resolve(urls);
      })
      .catch((error) => {
        reject(error);
      });
  });
}
