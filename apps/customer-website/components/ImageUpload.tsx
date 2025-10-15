"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";

interface ImageUploadProps {
  onUpload: (url: string, metadata?: any) => void;
  onError?: (error: string) => void;
  productName?: string;
  folder?: string;
  removeBackground?: boolean;
  maxFiles?: number;
  multiple?: boolean;
  className?: string;
}

export function ImageUpload({
  onUpload,
  onError,
  productName,
  folder = "products",
  removeBackground = false,
  maxFiles = 10,
  multiple = true,
  className = "",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setUploading(true);
      setProgress(0);

      try {
        const totalFiles = acceptedFiles.length;

        for (let i = 0; i < acceptedFiles.length; i++) {
          const file = acceptedFiles[i];
          const formData = new FormData();
          formData.append("file", file);
          formData.append("folder", folder);
          if (productName) formData.append("productName", productName);
          if (removeBackground)
            formData.append("removeBackground", "true");

          const response = await fetch("/api/upload/image", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error("Upload failed");
          }

          const result = await response.json();

          if (result.success) {
            const imageData = {
              url: result.data.original?.url || result.data.url,
              publicId:
                result.data.original?.publicId || result.data.publicId,
              variations: result.data.variations,
              noBgUrl: result.data.noBgUrl,
            };

            setUploadedImages((prev) => [...prev, imageData]);
            onUpload(imageData.url, imageData);
          }

          setProgress(((i + 1) / totalFiles) * 100);
        }
      } catch (error) {
        console.error("Upload error:", error);
        onError?.(error instanceof Error ? error.message : "Upload failed");
      } finally {
        setUploading(false);
        setProgress(0);
      }
    },
    [folder, productName, removeBackground, onUpload, onError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    maxFiles,
    multiple,
    disabled: uploading,
  });

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
          ${
            isDragActive
              ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20"
              : "border-slate-300 hover:border-indigo-400 dark:border-slate-700 dark:hover:border-indigo-600"
          }
          ${uploading ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <input {...getInputProps()} />

        {uploading ? (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 mx-auto text-indigo-500 animate-spin" />
            <p className="text-slate-600 dark:text-slate-400">
              Uploading... {Math.round(progress)}%
            </p>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : isDragActive ? (
          <>
            <Upload className="w-12 h-12 mx-auto text-indigo-500 mb-4" />
            <p className="text-indigo-600 dark:text-indigo-400 font-medium">
              Drop the files here...
            </p>
          </>
        ) : (
          <>
            <ImageIcon className="w-12 h-12 mx-auto text-slate-400 mb-4" />
            <p className="text-slate-600 dark:text-slate-300 font-medium mb-2">
              Drag & drop images here, or click to select
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {multiple
                ? `Upload up to ${maxFiles} images`
                : "Upload one image"}{" "}
              (PNG, JPG, GIF, WebP)
            </p>
            {removeBackground && (
              <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2">
                Background will be automatically removed
              </p>
            )}
          </>
        )}
      </div>

      {/* Uploaded Images Preview */}
      {uploadedImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {uploadedImages.map((image, index) => (
            <div
              key={index}
              className="relative group rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700"
            >
              <img
                src={image.url}
                alt={`Upload ${index + 1}`}
                className="w-full h-40 object-cover"
              />

              {/* Remove button */}
              <button
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>

              {/* No background version indicator */}
              {image.noBgUrl && (
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-green-500 text-white text-xs rounded">
                  BG Removed
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
