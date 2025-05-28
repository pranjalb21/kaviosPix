const { z } = require("zod");

const userValidator = z.object({
    email: z
        .string({ required_error: "Email is required." })
        .trim()
        .nonempty({ message: "Please provide and email ID." })
        .email({ message: "Invalid email address" })
        .toLowerCase(),
});
module.exports = userValidator;
