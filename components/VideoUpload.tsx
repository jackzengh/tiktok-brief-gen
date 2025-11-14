"use client";

import { useRef, useState } from "react";

interface MediaUploadProps {
  onUpload: (file: File) => void;
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

  const handleSubmit = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
      <div
        className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
          dragActive
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "border-gray-300 dark:border-gray-600"
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

        <div className="space-y-4">
          <svg
            className="mx-auto h-16 w-16 text-gray-400"
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
              <div className="text-gray-600 dark:text-gray-300">
                <button
                  onClick={handleButtonClick}
                  className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400"
                  disabled={loading}
                >
                  Click to upload
                </button>{" "}
                or drag and drop
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Videos: MP4, MOV, AVI | Images: JPG, PNG, WebP (up to 50MB)
              </p>
            </>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-semibold">Selected:</span>{" "}
                {selectedFile.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </div>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Analyzing..." : "Analyze Media"}
                </button>
                <button
                  onClick={() => setSelectedFile(null)}
                  disabled={loading}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="mt-6 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Processing your media... This may take a minute.
          </p>
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
