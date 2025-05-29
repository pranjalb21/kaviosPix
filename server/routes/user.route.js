import express from "express";
import { getAllUsers } from "../apis/user.api.js";

const router = express.Router();

router.get("/", getAllUsers);

export default router