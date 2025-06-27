"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { UploadCloud, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { createDuck } from "@/actions/duck/create-duck";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUploadThing } from "@/hooks/use-upload-file";

export default function DuckUploadPage() {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const { startUpload, isUploading } = useUploadThing("duckUploader", {
    onClientUploadComplete: async (res) => {
      toast.dismiss("duck-upload");
      if (res && res[0]) {
        const result = await createDuck({ title, imageUrl: res[0].url });
        if (result.success) {
          toast.success("Quack! Your duck has been posted.");
          router.push("/career/jobs");
        } else {
          toast.error(result.error);
          setIsSubmitting(false);
        }
      }
    },
    onUploadError: (error) => {
      toast.dismiss("duck-upload");
      toast.error(`Upload failed: ${error.message}`);
      setIsSubmitting(false);
    },
    onUploadBegin: () => {
      toast.loading("Your duck is taking flight...", { id: "duck-upload" });
    },
    onUploadProgress: (progress) => {
      // You could update the loading toast with progress here
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file || !title) {
      toast.error("Please provide a title and select a duck picture.");
      return;
    }
    setIsSubmitting(true);
    await startUpload([file]);
  };

  const isLoading = isUploading || isSubmitting;

  return (
    <div className="container mx-auto py-8 flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Secret Duck Upload</CardTitle>
          <CardDescription>
            You have found the secret duck upload page! Post a picture of a duck
            and it will appear on the job board. For fun.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Duck Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Sir Quacks-a-Lot"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label>Duck Picture</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
                <input
                  id="duck-upload-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isLoading}
                />
                <label htmlFor="duck-upload-input" className="cursor-pointer">
                  {previewUrl ? (
                    <div className="relative w-full h-64">
                      <Image
                        src={previewUrl}
                        alt="Duck preview"
                        fill
                        className="object-contain rounded-md"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <UploadCloud className="h-12 w-12" />
                      <span>Click or drag to upload a duck picture</span>
                      <span className="text-xs">Max 4MB</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting Duck...
                </>
              ) : (
                "Post Duck"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
