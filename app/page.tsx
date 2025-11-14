"use client";

import { useState } from "react";
import MediaUpload from "@/components/VideoUpload";
import MediaResults from "@/components/VideoResults";
import { MediaAnalysisResult } from "@/lib/gemini";

export default function Home() {
  const [results, setResults] = useState<MediaAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMediaUpload = async (file: File) => {
    setLoading(true);
    setError(null);
    setResults(null);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Video & Image AI Analysis
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Upload a video for transcription and scene analysis, or an image for
            ad copy and marketing insights
          </p>
        </div>

        {!results && (
          <MediaUpload
            onUpload={handleMediaUpload}
            loading={loading}
            error={error}
          />
        )}

        {results && <MediaResults results={results} onReset={handleReset} />}
      </div>
    </div>
  );
}
