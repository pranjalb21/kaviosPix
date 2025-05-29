import { z } from "zod";

const imageValidator = z.object({
    albumId: z
        .string({ required_error: "Album is required." })
        .trim()
        .regex(/^[a-fA-F0-9]{24}$/, "Invalid album"),
    tags: z
        .array(
            z
                .string()
                .trim()
                .transform((val) => val.toLowerCase())
        )
        .default([]),
    personsTagged: z
        .array(
            z
                .string()
                .trim()
                .regex(/^[a-fA-F0-9]{24}$/, "Invalid User")
        )
        .default([]),
    isFavorite: z.boolean().default(false),
    comments: z.array(z.string().trim()).default([]),
});
export default imageValidator;
