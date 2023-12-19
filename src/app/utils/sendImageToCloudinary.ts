import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import config from '../config';
export const sendImageToCloudinary = async () => {
    cloudinary.config({
        cloud_name: config.cloudinary_cloud_name as string,
        api_key: config.cloudinary_api_key as string,
        api_secret: config.cloudinary_api_secret as string,
    });

    cloudinary.uploader.upload(
        'https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg',
        { public_id: 'olympic_flag' },
        function (error, result) {
            console.log(result);
        },
    );
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
