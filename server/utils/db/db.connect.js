const mongoose = require("mongoose");
require("dotenv").config();

const URL = process.env.MONGO_URI;

const initializeDB = async () => {
    await mongoose
        .connect(URL)
        .then(() => console.log("DB connected successfully."))
        .catch((err) => console.log("Error connecting DB.", err.message));
};
module.exports = initializeDB;
