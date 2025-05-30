import mongoose from "mongoose";
import bcrypt from "bcrypt";
const userSchema = new mongoose.Schema(
    {
        userUid: {
            type: String,
            unique: true,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);
userSchema.methods.comparePassword = function (userPassword) {
    return bcrypt.compare(userPassword, this.password);
};

userSchema.pre("save", async function () {
    if (this.isModified("password")) {
        const saltRounds = Number(process.env.SALT_ROUNDS) || 10;
        const salt = await bcrypt.genSalt(saltRounds);
        this.password = await bcrypt.hash(this.password, salt);
    }
});

const User = mongoose.model("User", userSchema);
export default User;
