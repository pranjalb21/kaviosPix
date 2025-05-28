const { nanoid } = require("nanoid");
const Image = require("../models/image.model");
const { v2 } = require("cloudinary");
const imageValidator = require("../utils/validators/image.validator");

export const uploadImage = async (req, res) => {
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
            imageInfo: {
                imageUrl: uploadedFile.secure_url,
                public_id: uploadedFile.public_id,
            },
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

        console.log(`Error occurred while posting image: ${error.message}`);
        res.status(500).json({ error: `Internal Server Error` });
    }
};

export const deleteImage = async (req, res) => {
    try {
        // Check if image uid is provided
        const { imageUid } = req.params;
        if (!imageUid) {
            return res
                .status(400)
                .json({ error: "Please provide an image ID." });
        }

        // Check if the image exists in database
        const image = await Image.findOne({ imageUid });
        if (!image) {
            return res.status(404).json({ error: "Image not found." });
        }

        // Delete the image from database
        const deletedImage = await Image.findByIdAndDelete(image._id);
        if (!deletedImage) {
            return res.status(400).json({ error: "Unable to delete image." });
        }

        // Delete image from cloudinary after deleted from the database
        if (deletedImage.imageInfo && deletedImage.imageInfo.public_id) {
            await v2.uploader.destroy(deletedImage.imageInfo.public_id);
        }

        res.status(200).json({
            message: "Image deleted successfully.",
            data: deletedImage,
        });
    } catch (error) {
        console.log(`Error occurred while deleting post: ${error.message}`);
        res.status(500).json({ error: `Internal Server Error` });
    }
};

export const updateImage = async (req, res) => {
    try {
        // Check if image uid is provided
        const { imageUid } = req.params;
        if (!imageUid) {
            return res
                .status(400)
                .json({ error: "Please provide an image ID." });
        }

        // Check if the image exists in database
        const isImageExists = await Image.findOne({ imageUid });
        if (!isImageExists) {
            return res.status(404).json({ error: "Image not found." });
        }

        // Check if updated data provided and create an object with them
        const { tags, personsTagged, isFavorite, comments, name, albumId } =
            req.body;
        let updatedData = {};
        if (albumId) updatedData.albumId = albumId;
        if (isFavorite !== undefined) updatedData.isFavorite = isFavorite;
        if (name) updatedData.name = name;
        if (tags) updatedData.tags = tags;
        if (personsTagged) updatedData.personsTagged = personsTagged;
        if (comments) updatedData.comments = comments;

        // Update the post in database
        const updatedImage = await Image.findByIdAndUpdate(
            isImageExists._id,
            updatedData,
            { new: true }
        );

        // Check if data updated successfully in database
        if (!updatedImage) {
            return res
                .status(400)
                .json({ error: "Unable to update the post." });
        }

        res.status(200).json({
            message: "Post updated successfully.",
            data: updatedImage,
        });
    } catch (error) {
        console.log(`Error occurred while updating post: ${error.message}`);
        res.status(500).json({ error: `Internal Server Error` });
    }
};
