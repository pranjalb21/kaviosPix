import Album from "../models/album.model.js";

export const getAllAlbums = async (req, res) => {
    try {
        const albums = await Album.find();
        res.status(200).json({
            message: "albums fetched successfully.",
            data: albums,
        });
    } catch (error) {
        console.log(`Error occurred while fetching albums: ${error.message}`);
        res.status(500).json({ error: `Internal Server Error` });
    }
};
