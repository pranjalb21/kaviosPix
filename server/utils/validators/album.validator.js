import { z } from "zod";

const albumValidator = z.object({
    name: z
        .string({ required_error: "Album name is required." })
        .trim()
        .nonempty({ message: "Please provide album name" }),
    description: z.string().trim().default(""),
    ownerId: z
        .string({ required_error: "Owner is required." })
        .trim()
        .regex(/^[a-fA-F0-9]{24}$/, "Invalid Owner ID"),
    sharedUsers: z
        .array(
            z
                .string()
                .trim()
                .regex(/^[a-fA-F0-9]{24}$/, "Invalid User ID")
        )
        .default([]),
});
export default albumValidator;
