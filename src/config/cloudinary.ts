import {v2 as cloudinary} from 'cloudinary';
          
cloudinary.config({ 
  cloud_name: process.env.cloud_name, 
  cloud_api_key: process.env.cloud_api_key, 
  cloud_api_secret: process.env.cloud_api_secret,
});

  export default function cloudinaryUploadImage(imgArr: string[]) {

    return new Promise((resolve, reject) => {
      const uploadPromises = [];
  
      for (const image of imgArr) {
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
      Promise.all(uploadPromises).then(resolve).catch(reject);
    });
  }
  