import type { FileRouter } from "uploadthing/next";
import { createUploadthing } from "uploadthing/next";

import { prisma } from "@/lib/db/prisma";

const f = createUploadthing();

export const ourFileRouter = {
  editorUploader: f(["image", "text", "blob", "pdf", "video", "audio"])
    .middleware(() => {
      return {};
    })
    .onUploadComplete(({ file }) => {
      return {
        key: file.key,
        name: file.name,
        size: file.size,
        type: file.type,
        url: file.ufsUrl,
      };
    }),
  duckUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      return {};
    })
    .onUploadComplete(async ({ file }) => {
      console.log("Upload complete for file:", file.url);
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
