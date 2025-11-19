"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import MediaUpload, { GeminiFileInfo } from "@/components/VideoUpload";
import SavedResultsGrid from "@/components/SavedResultsGrid";
import VideoResultDetailModal from "@/components/VideoResultDetailModal";
import ImageResultDetailModal from "@/components/ImageResultDetailModal";
import Header from "@/components/Header";
import {
  saveAnalysisResult,
  loadAllResults,
  deleteResult,
  AnalysisItem,
  PendingAnalysis,
} from "@/lib/storage";

export default function Home() {
  const [savedResults, setSavedResults] = useState<AnalysisItem[]>([]);
  const [selectedResult, setSelectedResult] = useState<AnalysisItem | null>(
    null
  );
  const [activeUploads, setActiveUploads] = useState(0);

  // Load saved results on mount
  useEffect(() => {
    const loaded = loadAllResults();
    setSavedResults(loaded);
  }, []);

  const handleSelectResult = (result: AnalysisItem) => {
    // Only allow viewing completed results
    if (result.status === "completed") {
      setSelectedResult(result);
    }
  };

  const handleCloseModal = () => {
    setSelectedResult(null);
  };

  const handleDeleteResult = (id: string) => {
    deleteResult(id);
    setSavedResults((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSignOut = async () => {
    await signOut({ redirectTo: "/signin" });
  };

  const handleUpload = (fileInfos: GeminiFileInfo[]) => {
    // Create pending items for all files immediately
    const pendingItems: PendingAnalysis[] = fileInfos.map((fileInfo) => ({
      id: `pending-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      fileName: fileInfo.fileName,
      type: fileInfo.mimeType.startsWith("video/") ? "video" : "image",
      status: "pending" as const,
    }));

    // Add all pending items to the UI immediately
    setSavedResults((prev) => [...pendingItems, ...prev]);
    setActiveUploads((prev) => prev + fileInfos.length);

    // Process all files concurrently
    fileInfos.forEach((fileInfo, index) => {
      const pendingId = pendingItems[index].id;
      const mediaType = pendingItems[index].type;

      // Process this file (async, no await - fires and forgets)
      (async () => {
        try {
          // Update to processing status
          setSavedResults((prev) =>
            prev.map((item) =>
              item.id === pendingId
                ? { ...item, status: "processing" as const }
                : item
            )
          );

          // Send the Blob URL to the server for processing
          const response = await fetch("/api/analyze-video", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              blobUrl: fileInfo.blobUrl,
              mimeType: fileInfo.mimeType,
              fileName: fileInfo.fileName,
              sizeBytes: fileInfo.sizeBytes,
            }),
          });

          if (!response.ok) {
            let errorMessage = "Failed to analyze media";

            if (response.status === 413) {
              errorMessage =
                "File size exceeds the upload limit. Please try a smaller file (under 100MB).";
            } else {
              const contentType = response.headers.get("content-type");
              try {
                if (contentType && contentType.includes("application/json")) {
                  const errorData = await response.json();
                  errorMessage = errorData.error || errorMessage;
                } else {
                  const text = await response.text();
                  if (
                    text.includes("too large") ||
                    text.includes("Too Large")
                  ) {
                    errorMessage =
                      "File size is too large. Please try a smaller file (under 100MB).";
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

          // Replace pending item with completed result
          setSavedResults((prev) =>
            prev.map((item) => (item.id === pendingId ? savedResult : item))
          );
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "An error occurred";

          // Update pending item to error state
          setSavedResults((prev) =>
            prev.map((item) =>
              item.id === pendingId
                ? {
                    id: pendingId,
                    timestamp: Date.now(),
                    fileName: fileInfo.fileName,
                    type: mediaType,
                    status: "error" as const,
                    error: errorMessage,
                  }
                : item
            )
          );
        } finally {
          setActiveUploads((prev) => prev - 1);
        }
      })();
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black py-16 px-4 sm:px-6 lg:px-8 relative">
      <Header onSignOut={handleSignOut} />
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
          <MediaUpload onUpload={handleUpload} activeUploads={activeUploads} />
        </div>

        {/* Results Grid */}
        <SavedResultsGrid
          results={savedResults}
          onSelectResult={handleSelectResult}
          onDeleteResult={handleDeleteResult}
        />

        {/* Result Detail Modals */}
        {selectedResult &&
          selectedResult.status === "completed" &&
          selectedResult.type === "video" && (
            <VideoResultDetailModal
              result={selectedResult}
              onClose={handleCloseModal}
            />
          )}
        {selectedResult &&
          selectedResult.status === "completed" &&
          selectedResult.type === "image" && (
            <ImageResultDetailModal
              result={selectedResult}
              onClose={handleCloseModal}
            />
          )}
      </div>
    </div>
  );
}
