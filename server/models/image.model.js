const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
    {
        imageUid: {
            type: String,
            unique: true,
            required: true,
        },
        albumId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Album",
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        imageInfo: {
            imageUrl: {
                type: String,
                required: true,
            },
            public_id: {
                type: String,
                required: true,
            },
        },
        tags: [{ type: String }],
        personsTagged: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        isFavorite: {
            type: Boolean,
            default: false,
        },
        comments: [{ type: String }],
        size: {
            type: Number,
        },
        uploadedAt: {
            type: Date,
            default: Date.now(),
        },
    },
    {
        timestamps: true,
    }
);
const Image = mongoose.model("Image", imageSchema);
module.exports = Image;
