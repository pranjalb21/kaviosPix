import express from "express";
import { getAllAlbums } from "../apis/album.api.js";

const router = express.Router();

router.get("/", getAllAlbums);

export default router;
