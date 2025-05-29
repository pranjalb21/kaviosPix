import User from "../models/user.model.js";

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({
            message: "Users fetched successfully.",
            data: users,
        });
    } catch (error) {
        console.log(`Error occurred while fetching users: ${error.message}`);
        res.status(500).json({ error: `Internal Server Error` });
    }
};
