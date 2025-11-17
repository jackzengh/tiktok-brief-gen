"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";

export interface GeminiFileInfo {
  blobUrl: string;
  mimeType: string;
  fileName: string;
  sizeBytes: number;
}

interface MediaUploadProps {
  onUpload: (fileInfo: GeminiFileInfo) => void;
  loading: boolean;
  error: string | null;
}

export default function MediaUpload({
  onUpload,
  loading,
  error,
}: MediaUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("video/") && !file.type.startsWith("image/")) {
      alert("Please upload a video or image file");
      return;
    }
    setSelectedFile(file);
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    try {
      // fetch from Vercel Blob

      const blob = await upload(selectedFile.name, selectedFile, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });

      console.log("Blob uploaded:", blob);

      // Pass the Blob info to parent
      onUpload({
        blobUrl: blob.url,
        mimeType: selectedFile.type,
        fileName: selectedFile.name,
        sizeBytes: selectedFile.size,
      });
    } catch (error) {
      console.error("Error uploading to Vercel Blob:", error);
      // Let the parent component handle the error display
      throw error;
    }
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="bg-white dark:bg-black border border-border rounded-2xl p-8">
      <div
        className={`relative border-2 border-dashed rounded-xl p-16 text-center transition-all ${
          dragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/30"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept="video/*,image/*"
          onChange={handleChange}
          className="hidden"
          disabled={loading}
        />

        <div className="space-y-6">
          <svg
            className="mx-auto h-20 w-20 text-secondary"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {!selectedFile ? (
            <>
              <div className="text-foreground">
                <button
                  onClick={handleButtonClick}
                  className="font-semibold text-primary hover:text-primary-dark transition-colors"
                  disabled={loading}
                >
                  Click to upload
                </button>{" "}
                or drag and drop
              </div>
              <p className="text-sm text-secondary">
                Videos: MP4, MOV, AVI | Images: JPG, PNG, WebP (up to 100MB)
              </p>
            </>
          ) : (
            <div className="space-y-6">
              <div className="text-sm text-foreground">
                <span className="font-semibold">Selected:</span>{" "}
                {selectedFile.name}
              </div>
              <div className="text-xs text-secondary">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </div>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => handleSubmit().catch(console.error)}
                  disabled={loading}
                  className="px-8 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark disabled:bg-secondary disabled:cursor-not-allowed transition-all font-medium"
                >
                  {loading ? "Uploading & Analyzing..." : "Analyze Media"}
                </button>
                <button
                  onClick={() => setSelectedFile(null)}
                  disabled={loading}
                  className="px-8 py-3 bg-transparent border border-border text-foreground rounded-xl hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="mt-8 text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="mt-3 text-sm text-secondary">
            Processing your media... This may take a minute.
          </p>
        </div>
      )}

      {error && (
        <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
