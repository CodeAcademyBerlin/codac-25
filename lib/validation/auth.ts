import { z } from "zod";
import { userSchema } from "./user";

// Profile update schema (for user's own profile)
export const updateProfileSchema = userSchema
    .omit({ role: true, status: true })
    .partial()
    .extend({
        id: z.string().cuid('Invalid user ID'),
    });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>; 