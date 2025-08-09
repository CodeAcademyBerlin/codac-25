import { generateReactHelpers } from "@uploadthing/react";
import { useCallback, useState } from "react";

import { ourFileRouter } from "@/lib/editor/uploadthing";

export const { useUploadThing } = generateReactHelpers<typeof ourFileRouter>();

export const useHasActiveUploads = () => {
    const [hasActiveUploads, setHasActiveUploads] = useState(false);

    const setUploading = useCallback((uploading: boolean) => {
        setHasActiveUploads(uploading);
    }, []);

    return {
        hasActiveUploads,
        setUploading,
    };
};
