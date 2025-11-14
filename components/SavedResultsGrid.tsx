"use client";

import { SavedAnalysisResult } from "@/lib/storage";
import { useState } from "react";

interface SavedResultsGridProps {
  results: SavedAnalysisResult[];
  onSelectResult: (result: SavedAnalysisResult) => void;
  onDeleteResult: (id: string) => void;
}

export default function SavedResultsGrid({
  results,
  onSelectResult,
  onDeleteResult,
}: SavedResultsGridProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (results.length === 0) {
    return null;
  }

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent card click event
    setDeletingId(id);
    onDeleteResult(id);
    setTimeout(() => setDeletingId(null), 300);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="mt-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Saved Ad Copy ({results.length})
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((result) => {
          const isVideo = result.type === "video";
          const headline = result.data.claudeAdCopy?.headline || "No headline";
          const description =
            result.data.claudeAdCopy?.description || result.data.description;

          return (
            <div
              key={result.id}
              onClick={() => onSelectResult(result)}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-xl ${
                deletingId === result.id ? "opacity-50 scale-95" : ""
              }`}
            >
              {/* Header with type badge and delete button */}
              <div className="p-4 bg-gradient-to-r from-purple-500 to-blue-500 flex justify-between items-start">
                <div className="flex-1">
                  <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full mb-2">
                    {isVideo ? "📹 VIDEO" : "🖼️ IMAGE"}
                  </span>
                  <p className="text-white text-xs font-medium truncate">
                    {result.fileName}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDelete(e, result.id)}
                  className="ml-2 p-1 hover:bg-white/20 rounded-full transition-colors"
                  title="Delete"
                >
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                {/* Headline */}
                <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2">
                  {headline}
                </h3>

                {/* Description preview */}
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                  {truncateText(description, 120)}
                </p>

                {/* Footer with timestamp */}
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(result.timestamp)}
                  </p>
                </div>
              </div>

              {/* Click to view indicator */}
              <div className="px-4 pb-4">
                <div className="flex items-center justify-between text-xs text-purple-600 dark:text-purple-400 font-medium">
                  <span>Click to view full details</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
