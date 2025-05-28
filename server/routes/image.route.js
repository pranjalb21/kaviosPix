const express = require("express");
const upload = require("../utils/cloudinary/fileUpload");
const { v2 } = require("cloudinary");
const imageValidator = require("../utils/validators/image.validator");
const { nanoid } = require("nanoid");
const Image = require("../models/image.model");

const router = express.Router();

router.post("/upload", upload("image"), async (req, res) => {
    try {
        // Check if any file uploaded
        if (!req.file) {
            return res.status(400).json({ message: "Please upload an image." });
        }

        // Check if file type is an image
        if (!req.file.mimetype.startsWith("image/")) {
            return res
                .status(400)
                .json({ message: "Uploaded file is not an image." });
        }

        // Upload the file to cloudinary
        const file = req.file;
        const uploadedFile = await v2.uploader.upload(file.path, {
            folder: "imageAlbum",
        });

        // Check if the file is uploaded to cloudinary
        if (!uploadedFile) {
            return res
                .status(400)
                .json({ error: "Unable to upload the image." });
        }

        // Validate the user inputs using zod validator
        const parsedBody = imageValidator.parse(req.body);

        // Generate unique imageUid using nanoid
        const imageUid = nanoid();

        // Create imageData for uploading into Database
        const imageData = {
            imageUid,
            albumId: parsedBody.albumId,
            name: uploadedFile.original_filename,
            imageUrl: uploadedFile.secure_url,
            tags: parsedBody.tags,
            personsTagged: parsedBody.personsTagged,
            isFavorite: parsedBody.isFavorite,
            comments: parsedBody.comments,
            size: uploadedFile.bytes,
        };

        // Post image data into database and check if it's successfull
        const savedImage = await Image.create(imageData);
        if (!savedImage) {
            return res.status(400).json({ error: "Unable to post the image." });
        }
        res.status(201).json({
            message: "Image posted successfully.",
            data: savedImage,
        });
    } catch (error) {
        // Check if any validation error received for zod validator
        if (error instanceof ZodError) {
            const errorMessages = error.errors.map((err) => err.message);
            console.error("Validation errors:", errorMessages);
            return res.status(400).json({ errors: errorMessages });
        }

        console.log(`Error occured while posting image: ${error.message}`);
        res.status(500).json({ error: `Internal Server Error` });
    }
});
