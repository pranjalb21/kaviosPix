import express from "express";
import upload from "../utils/cloudinary/fileUpload.js";

import {
    uploadImage,
    deleteImage,
    updateImage,
    getAllImages,
    getImageById,
    getImagesByOwner,
    getImagesByAlbum,
} from "../apis/image.api.js";
import { verifyJwt } from "../utils/auth/user.auth.js";

const router = express.Router();

router
    .use(verifyJwt)
    .post("/", upload.single("image"), uploadImage)
    .delete("/:imageUid", deleteImage)
    .patch("/:imageUid", updateImage)
    .get("/", getAllImages)
    .get("/:imageUid", getImageById)
    .get("/owner/:userUid", getImagesByOwner)
    .get("/album/:albumUid", getImagesByAlbum);

export default router;
