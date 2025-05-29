import { v2 } from "cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
const api_key = process.env.CLOUDINARY_API_KEY;
const api_secret = process.env.CLOUDINARY_API_SECRET;

v2.config({
    cloud_name,
    api_key,
    api_secret,
});
const storage = multer.diskStorage({});
const upload = multer({ storage });

export default upload;
