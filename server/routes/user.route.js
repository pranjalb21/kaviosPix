import express from "express";
import { signUp, getAllUsers, getUserByUid, logIn } from "../apis/user.api.js";
import userValidator from "../utils/validators/user.validator.js";
import User from "../models/user.model.js";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import { getCookieOption } from "../utils/cookieOptions.js";
import { verifyJwt } from "../utils/auth/user.auth.js";

const router = express.Router();

router
    .get("/", verifyJwt, getAllUsers)
    .post("/signup", signUp)
    .get("/:userUid", verifyJwt, getUserByUid)
    .post("/login", logIn);

export default router;
