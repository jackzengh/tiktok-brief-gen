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
  onUpload: (fileInfos: GeminiFileInfo[]) => void;
  activeUploads: number;
}

export default function MediaUpload({ onUpload }: MediaUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    // Filter valid files
    const validFiles = files.filter(
      (file) => file.type.startsWith("video/") || file.type.startsWith("image/")
    );

    if (validFiles.length === 0) {
      alert("Please upload video or image files only");
      return;
    }

    if (validFiles.length < files.length) {
      alert(
        `${files.length - validFiles.length} file(s) skipped (not video/image)`
      );
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
  };

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      console.log(`Uploading ${selectedFiles.length} files to Vercel Blob...`);

      // Upload all files to Blob concurrently
      const uploadPromises = selectedFiles.map(async (file) => {
        try {
          const blob = await upload(file.name, file, {
            access: "public",
            handleUploadUrl: "/api/upload",
          });

          return {
            blobUrl: blob.url,
            mimeType: file.type,
            fileName: file.name,
            sizeBytes: file.size,
          };
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          throw new Error(
            `${file.name}: ${
              error instanceof Error ? error.message : "Upload failed"
            }`
          );
        }
      });

      // Wait for all uploads to complete
      const uploadedFiles = await Promise.all(uploadPromises);

      console.log(
        `Successfully uploaded ${uploadedFiles.length} files to Blob`
      );

      onUpload(uploadedFiles);

      // Clear selected files after successful upload
      setSelectedFiles([]);
    } catch (error) {
      console.error("Error during bulk upload:", error);
      setUploadError(
        error instanceof Error ? error.message : "Bulk upload failed"
      );
    } finally {
      setIsUploading(false);
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
          multiple
          onChange={handleChange}
          className="hidden"
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

          {selectedFiles.length === 0 ? (
            <>
              <div className="text-foreground">
                <button
                  onClick={handleButtonClick}
                  className="font-semibold text-primary hover:text-primary-dark transition-colors"
                >
                  Click to upload
                </button>{" "}
                or drag and drop multiple files
              </div>
              <p className="text-sm text-secondary">
                Videos: MP4, MOV, AVI | Images: JPG, PNG, WebP (up to 100MB
                each)
              </p>
              {/* {activeUploads > 0 && (
                <div className="mt-4 px-4 py-2 bg-primary/10 text-primary rounded-lg inline-flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-sm font-medium">
                    {activeUploads} {activeUploads === 1 ? "upload" : "uploads"}{" "}
                    processing...
                  </span>
                </div>
              )} */}
            </>
          ) : (
            <div className="space-y-6 w-full">
              <div className="text-sm text-foreground">
                <span className="font-semibold">
                  Selected {selectedFiles.length} file(s):
                </span>
              </div>

              {/* File list */}
              <div className="max-h-48 overflow-y-auto space-y-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between p-2 bg-primary/5 rounded-lg text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-secondary">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setSelectedFiles((prev) =>
                          prev.filter((_, i) => i !== index)
                        )
                      }
                      disabled={isUploading}
                      className="ml-2 p-1 hover:bg-primary/10 rounded transition-colors disabled:opacity-50"
                      title="Remove"
                    >
                      <svg
                        className="w-4 h-4 text-secondary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => handleSubmit().catch(console.error)}
                  disabled={isUploading}
                  className="px-8 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark disabled:bg-secondary disabled:cursor-not-allowed transition-all font-medium"
                >
                  {isUploading
                    ? `Uploading ${selectedFiles.length} files...`
                    : `Upload & Analyze All (${selectedFiles.length})`}
                </button>
                <button
                  onClick={() => setSelectedFiles([])}
                  disabled={isUploading}
                  className="px-8 py-3 bg-transparent border border-border text-foreground rounded-xl hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {uploadError && (
        <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="text-sm text-red-600 dark:text-red-400">
            {uploadError}
          </p>
        </div>
      )}
    </div>
  );
}
