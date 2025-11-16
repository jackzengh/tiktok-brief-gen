"use client";

import { useState, useEffect } from "react";
import MediaUpload, { GeminiFileInfo } from "@/components/VideoUpload";
import SavedResultsGrid from "@/components/SavedResultsGrid";
import VideoResultDetailModal from "@/components/VideoResultDetailModal";
import ImageResultDetailModal from "@/components/ImageResultDetailModal";
import {
  saveAnalysisResult,
  loadAllResults,
  deleteResult,
  SavedAnalysisResult,
} from "@/lib/storage";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedResults, setSavedResults] = useState<SavedAnalysisResult[]>([]);
  const [selectedResult, setSelectedResult] =
    useState<SavedAnalysisResult | null>(null);

  // Load saved results on mount
  useEffect(() => {
    const loaded = loadAllResults();
    setSavedResults(loaded);
  }, []);

  const handleMediaUpload = async (fileInfo: GeminiFileInfo) => {
    setLoading(true);
    setError(null);

    try {
      // Send only the Gemini file info (not the actual file)
      const response = await fetch("/api/analyze-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileUri: fileInfo.uri,
          mimeType: fileInfo.mimeType,
          fileName: fileInfo.fileName,
          sizeBytes: fileInfo.sizeBytes,
        }),
      });

      if (!response.ok) {
        // Handle errors based on status code and content type
        let errorMessage = "Failed to analyze media";

        // Check for specific status codes first
        if (response.status === 413) {
          errorMessage =
            "File size exceeds the upload limit. Please try a smaller file (under 50MB).";
        } else {
          // Try to read the response body only once
          const contentType = response.headers.get("content-type");
          try {
            if (contentType && contentType.includes("application/json")) {
              const errorData = await response.json();
              errorMessage = errorData.error || errorMessage;
            } else {
              const text = await response.text();
              if (text.includes("too large") || text.includes("Too Large")) {
                errorMessage =
                  "File size is too large. Please try a smaller file (under 50MB).";
              } else {
                errorMessage = `Server error (${response.status})`;
              }
            }
          } catch {
            errorMessage = `Server error (${response.status})`;
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Save to local storage
      const savedResult = saveAnalysisResult(data, fileInfo.fileName);
      setSavedResults((prev) => [savedResult, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectResult = (result: SavedAnalysisResult) => {
    setSelectedResult(result);
  };

  const handleCloseModal = () => {
    setSelectedResult(null);
  };

  const handleDeleteResult = (id: string) => {
    deleteResult(id);
    setSavedResults((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl sm:text-6xl font-bold text-black dark:text-white mb-6 tracking-tight">
            LFG Superpower Ad Copy Generator
          </h1>
          <p className="text-xl text-secondary max-w-3xl mx-auto leading-relaxed">
            Upload a video for transcription and scene analysis, or an image for
            ad copy and marketing insights
          </p>
        </div>

        {/* Upload Section */}
        <div className="mb-16">
          <MediaUpload
            onUpload={handleMediaUpload}
            loading={loading}
            error={error}
          />
        </div>

        {/* Results Grid */}
        <SavedResultsGrid
          results={savedResults}
          onSelectResult={handleSelectResult}
          onDeleteResult={handleDeleteResult}
        />

        {/* Result Detail Modals */}
        {selectedResult && selectedResult.type === "video" && (
          <VideoResultDetailModal
            result={selectedResult}
            onClose={handleCloseModal}
          />
        )}
        {selectedResult && selectedResult.type === "image" && (
          <ImageResultDetailModal
            result={selectedResult}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </div>
  );
}
