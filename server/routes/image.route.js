const express = require("express");
const upload = require("../utils/cloudinary/fileUpload");

const { uploadImage, deleteImage, updateImage } = require("../apis/image.api");
const Image = require("../models/image.model");

const router = express.Router();

router
    .post("/", upload("image"), uploadImage)
    .delete("/:imageUid", deleteImage)
    .patch("/:imageUid", updateImage);
