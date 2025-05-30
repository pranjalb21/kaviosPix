import { z } from "zod";

const userValidator = z.object({
    email: z
        .string({ required_error: "Email is required." })
        .trim()
        .nonempty({ message: "Please provide an email ID." })
        .email({ message: "Invalid email address" })
        .toLowerCase(),
    password: z
        .string({ required_error: "Password is required." })
        .min(4, "Password should contain at least 4 characters.")
        .max(15, "Password cannot be more than 15 characters."),
});
export default userValidator;   
