"use client";

import { useState, useEffect } from "react";
import MediaUpload from "@/components/VideoUpload";
import SavedResultsGrid from "@/components/SavedResultsGrid";
import ResultDetailModal from "@/components/ResultDetailModal";
import { MediaAnalysisResult } from "@/lib/gemini";
import {
  saveAnalysisResult,
  loadAllResults,
  deleteResult,
  SavedAnalysisResult,
} from "@/lib/storage";

export default function Home() {
  const [results, setResults] = useState<MediaAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedResults, setSavedResults] = useState<SavedAnalysisResult[]>([]);
  const [selectedResult, setSelectedResult] =
    useState<SavedAnalysisResult | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string>("");

  // Load saved results on mount
  useEffect(() => {
    const loaded = loadAllResults();
    setSavedResults(loaded);
  }, []);

  const handleMediaUpload = async (file: File) => {
    setLoading(true);
    setError(null);
    setResults(null);
    setCurrentFileName(file.name);

    try {
      const formData = new FormData();
      formData.append("video", file);

      const response = await fetch("/api/analyze-video", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze media");
      }

      const data = await response.json();
      setResults(data);

      // Save to local storage
      const savedResult = saveAnalysisResult(data, file.name);
      setSavedResults((prev) => [savedResult, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setError(null);
    setCurrentFileName("");
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            LFG Superpower Ad Copy Generator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Upload a video for transcription and scene analysis, or an image for
            ad copy and marketing insights
          </p>
        </div>

        <MediaUpload
          onUpload={handleMediaUpload}
          loading={loading}
          error={error}
        />
        <SavedResultsGrid
          results={savedResults}
          onSelectResult={handleSelectResult}
          onDeleteResult={handleDeleteResult}
        />

        {/* Result Detail Modal */}
        <ResultDetailModal
          result={selectedResult}
          onClose={handleCloseModal}
        />
      </div>
    </div>
  );
}
