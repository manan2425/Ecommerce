import dotenv from "dotenv";
dotenv.config();


import cloudinary from "cloudinary";
import multer from "multer";

 
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();

export const upload = multer({ storage });

// Utility to upload an image to Cloudinary
export const ImageUploadUtils = async (file) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.v2.uploader.upload_stream(
            { resource_type: "auto" },
            (error, result) => {
                if (error) {
                    console.error("Upload Error:", error);
                    return reject(error); // Reject promise on error
                }
                // console.log("Upload Result:", result);
                resolve(result); // Resolve promise with the result
            }
        );

        // Pipe the file buffer to the upload stream
        uploadStream.end(file.buffer);
    });
};
