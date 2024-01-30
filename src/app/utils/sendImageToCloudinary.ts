import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import multer from 'multer';
import config from '../config';

cloudinary.config({
    cloud_name: config.cloudinary_cloud_name as string,
    api_key: config.cloudinary_api_key as string,
    api_secret: config.cloudinary_api_secret as string,
});

export const sendImageToCloudinary = async (
    imageName: string,
    path: string,
): Promise<Record<string, unknown>> => {
    return new Promise((resolve, reject) => {
        // upload to cloudinary
        cloudinary.uploader.upload(
            path,
            { public_id: imageName },
            function (error, result) {
                if (error) {
                    reject(error);
                }
                resolve(result);
                // remove the local file
                fs.unlink(path, (error) => {
                    // if any error
                    if (error) {
                        reject(error);
                        return;
                    } else {
                        resolve('Successfully deleted file!');
                    }
                });
            },
        );
    });
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, process.cwd() + '/uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix);
    },
});

export const upload = multer({ storage: storage });
