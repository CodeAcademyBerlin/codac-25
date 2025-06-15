'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from "@/lib/db";

export async function createDoc(title: string) {
    // ⚠️  TODO: Provide full document data (content, author) once auth flow is connected.
    const doc = await (prisma as any).document.create({
        data: {
            title,
        },
    });
    // Ensure any server components that rely on the list of documents are revalidated
    revalidatePath("/");
    return doc;
}