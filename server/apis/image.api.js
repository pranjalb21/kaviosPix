import { nanoid } from "nanoid";
import Image from "../models/image.model.js";
import Album from "../models/album.model.js";
import User from "../models/user.model.js";
import { v2 } from "cloudinary";
import imageValidator from "../utils/validators/image.validator.js";
import { ZodError } from "zod";

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

        const user = await User.findOne({ userUid: req.user?.userUid });
        // Create imageData for uploading into Database
        const imageData = {
            imageUid,
            albumId: parsedBody.albumId,
            name: file.originalname,
            imageInfo: {
                imageUrl: uploadedFile.secure_url,
                public_id: uploadedFile.public_id,
            },
            ownerId: user._id,
            tags: parsedBody.tags,
            personsTagged: parsedBody.personsTagged,
            isFavorite: parsedBody.isFavorite,
            comments: parsedBody.comments,
            size: uploadedFile.bytes,
        };

        // Post image data into database and check if it's successfull
        const savedImage = await Image.create(imageData);
        await savedImage.populate([
            { path: "ownerId", select: "userUid email" },
            { path: "albumId" },
            { path: "personsTagged", select: "userUid email" },
        ]);
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
            const errorMessages = error.errors.map((err) => {
                return err.message;
            });
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
        if (tags) {
            const lowerCasedTags = tags.map((tag) => tag.toLowerCase());
            updatedData.tags = lowerCasedTags;
        }
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
        await updatedImage.populate([
            { path: "ownerId", select: "userUid email" },
            { path: "albumId" },
            { path: "personsTagged", select: "userUid email" },
        ]);
        res.status(200).json({
            message: "Post updated successfully.",
            data: updatedImage,
        });
    } catch (error) {
        console.log(`Error occurred while updating post: ${error.message}`);
        res.status(500).json({ error: `Internal Server Error` });
    }
};

export const getAllImages = async (req, res) => {
    try {
        // Fetch all the avaiable images from Database with reference populated fields
        const images = await Image.find().populate([
            { path: "ownerId", select: "userUid email" },
            { path: "albumId" },
            { path: "personsTagged", select: "userUid email" },
        ]);
        res.status(200).json({
            message: "Posts fetched successfully.",
            data: images,
        });
    } catch (error) {
        console.log(
            `Error occurred while fetching post: ${error.message}`,
            error
        );
        res.status(500).json({ error: `Internal Server Error` });
    }
};

export const getImageById = async (req, res) => {
    try {
        // Get image UID from params
        const { imageUid } = req.params;

        // Fetch the image with the UID from Database with reference populated fields
        const image = await Image.findOne({ imageUid }).populate([
            { path: "ownerId", select: "userUid email" },
            { path: "albumId" },
            { path: "personsTagged", select: "userUid email" },
        ]);

        // Check if image with the provided UID exists or not
        if (!image) {
            return res.status(404).json({ error: "Image not found." });
        }

        res.status(200).json({
            message: "Post fetched successfully.",
            data: image,
        });
    } catch (error) {
        console.log(`Error occurred while fetching post: ${error.message}`);
        res.status(500).json({ error: `Internal Server Error` });
    }
};

export const getImagesByOwner = async (req, res) => {
    try {
        const { userUid } = req.params;
        const owner = await User.findOne({ userUid });

        if (!owner) {
            return res.status(404).json({ error: "User not found." });
        }

        const images = await Image.find({ ownerId: owner._id }).populate([
            { path: "ownerId", select: "userUid email" },
            { path: "albumId" },
            { path: "personsTagged", select: "userUid email" },
        ]);

        res.status(200).json({
            message: "Post fetched successfully.",
            data: images,
        });
    } catch (error) {
        console.log(`Error occurred while fetching post: ${error.message}`);
        res.status(500).json({ error: `Internal Server Error` });
    }
};
export const getImagesBySharedOwner = async (req, res) => {
    try {
        const { userUid } = req.params;
        const owner = await User.findOne({ userUid });

        if (!owner) {
            return res.status(404).json({ error: "User not found." });
        }

        const images = await Image.find({ personsTagged: {} }).populate([
            { path: "ownerId", select: "userUid email" },
            { path: "albumId" },
            { path: "personsTagged", select: "userUid email" },
        ]);

        res.status(200).json({
            message: "Post fetched successfully.",
            data: images,
        });
    } catch (error) {
        console.log(`Error occurred while fetching post: ${error.message}`);
        res.status(500).json({ error: `Internal Server Error` });
    }
};

export const getImagesByAlbum = async (req, res) => {
    try {
        const { albumUid } = req.params;
        const album = await Album.findOne({ albumUid });

        if (!album) {
            return res.status(404).json({ error: "Album not found." });
        }

        const images = await Image.find({ albumId: album._id }).populate([
            { path: "ownerId", select: "userUid email" },
            { path: "albumId" },
            { path: "personsTagged", select: "userUid email" },
        ]);
        res.status(200).json({
            message: "Post fetched successfully.",
            data: images,
        });
    } catch (error) {
        console.log(`Error occurred while fetching post: ${error.message}`);
        res.status(500).json({ error: `Internal Server Error` });
    }
};
