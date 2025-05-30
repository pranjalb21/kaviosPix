import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import imageRouter from "./routes/image.route.js";
import initializeDB from "./utils/db/db.connect.js";
import userRouter from "./routes/user.route.js";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());

app.use("/api/v1/images", imageRouter);
app.use("/api/v1/users", userRouter);

initializeDB();

app.listen(PORT, () => {
    console.log("Server is running on PORT:", PORT);
});
