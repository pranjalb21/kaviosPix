import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { getCookieOption } from "../utils/cookieOptions.js";
import userValidator from "../utils/validators/user.validator.js";
import { ZodError } from "zod";
import { nanoid } from "nanoid";

export const getAllUsers = async (req, res) => {
    try {
        // Fetch all the available users from Database
        const users = await User.find().select("-password");

        // If no users exist, return 404
        if (users.length === 0) {
            return res.status(404).json({ error: "No users found." });
        }

        res.status(200).json({
            message: "Users fetched successfully.",
            data: users,
        });
    } catch (error) {
        console.error(`Error occurred while fetching users: ${error.message}`);
        res.status(500).json({ error: `Internal Server Error` });
    }
};

export const signUp = async (req, res) => {
    try {
        // Check and validate user data received from frontend.
        const parsedBody = userValidator.parse(req.body);

        // Check if user already exists with the same email
        const existingUser = await User.findOne({ email: parsedBody.email });
        if (existingUser) {
            return res.status(409).json({ error: "Email ID already exists." });
        }

        // Create new user object with generating an unique user ID
        const userUid = nanoid();
        const userData = {
            userUid,
            email: parsedBody.email,
            password: parsedBody.password,
        };

        // Create user
        const newUser = await User.create(userData);

        // Check if user successfully registered
        if (!newUser) {
            return res.status(400).json({ error: "Unable to create User." });
        }

        // Generate JWT token
        const token = jwt.sign(
            { email: newUser.email, userUid: newUser.userUid },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // Send response with saving authToken in client site cookie
        res.status(201)
            .cookie("authToken", token, getCookieOption())
            .json({
                message: "User successfully registered.",
                data: { email: newUser.email, userUid: newUser.userUid },
                token,
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
        console.error(`Error occurred while creating user: ${error.message}`);
        res.status(500).json({ error: `Internal Server Error` });
    }
};

export const getUserByUid = async (req, res) => {
    try {
        // Get user uid from params
        const { userUid } = req.params;

        // Fetch user with the userUid
        const user = await User.findOne({ userUid }).select("-password");

        // Check if user exists
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        res.status(200).json({
            message: "User fetched successfully.",
            data: user,
        });
    } catch (error) {
        console.error(
            `Error occurred while fetching the user: ${error.message}`
        );
        res.status(500).json({ error: `Internal Server Error` });
    }
};

export const logIn = async (req, res) => {
    try {
        // Get email and password from request body
        const { email, password } = userValidator.parse(req.body);

        // Fetch user with the email ID
        const user = await User.findOne({ email });

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ error: "User is not registered." });
        }

        // Check if the user password valid
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: "Invalid credentials." });
        }

        // Generate JWT token with email ID and userUid
        const token = jwt.sign(
            {
                email: user.email,
                userUid: user.userUid,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // Send resoponse with saving authToken in client site cookie
        res.status(200)
            .cookie("authToken", token, getCookieOption())
            .json({
                message: "User logged in successfully.",
                data: { email: user.email, userUid: user.userUid },
                token
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
        console.error(
            `Error occurred while fetching the user: ${error.message}`
        );
        res.status(500).json({ error: `Internal Server Error` });
    }
};
