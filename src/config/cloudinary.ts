import { v2 as cloudinary } from 'cloudinary';

// Ensure these environment variables are properly set
const cloudName = process.env.CLOUD_NAME;
const apiKey = process.env.CLOUD_API_KEY;
const apiSecret = process.env.CLOUD_API_SECRET;

// Check if environment variables are properly set
if (!cloudName || !apiKey || !apiSecret) {
  console.error("Cloudinary configuration error: CLOUD_NAME, CLOUD_API_KEY, and CLOUD_API_SECRET are required.");
}




export default async function cloudinaryUploadImage(imgArr: string[]) {
  console.log("wowww");

  
cloudinary.config({ 
  cloud_name: cloudName, 
  api_key: apiKey, 
  api_secret: apiSecret
});

console.log(cloudName,apiKey,apiSecret,"whatt");
  
  return new Promise((resolve, reject) => {
    console.log("One");
    
    const uploadPromises = [];
    console.log("Two");
    // console.log(imgArr,"imageeeeeeeeeeeeeeeeeee");
    
    for (const image of imgArr) {
    // console.log(image,"iiiiiiiiiiiiiiiiiiiiiiii");
    
      console.log("Three");
      uploadPromises.push(
        new Promise((resolve, reject) => {
          console.log("Four");
          cloudinary.uploader.upload(image, { resource_type: 'image', folder: 'NICHE' },(error, result) => {
            console.log("five");
            if (result && result.secure_url) {
              console.log("six");
              resolve(result.secure_url);
              console.log("seven");
            } else {
              console.log("eight");
              reject(error);
            }
          });
        })
      );
    }

    // Upload all images in parallel
    Promise.all(uploadPromises)
    .then((urls) => {
      // Once all images are uploaded, resolve with an array of secure URLs
      resolve(urls);
      
      
    })
    .catch((error) => {
      // If any upload fails, reject with the error
      reject(error);
    });
    });
}
