import { Document } from "@prisma/client";
import * as z from "zod";

export const docCreateSchema = z.object({
    title: z.string().min(3).max(32),
    content: z.string().min(3).max(10000),
    files: z.array(z.string()),
});


