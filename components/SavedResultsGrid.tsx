"use client";

import { AnalysisItem } from "@/lib/storage";
import { useState } from "react";

interface SavedResultsGridProps {
  results: AnalysisItem[];
  onSelectResult: (result: AnalysisItem) => void;
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
    <div className="mt-20">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-black dark:text-white">
          Saved Ad Copy <span className="text-secondary">({results.length})</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((result) => {
          const isVideo = result.type === "video";
          const isPending = result.status === "pending" || result.status === "processing";
          const isError = result.status === "error";
          const isCompleted = result.status === "completed";

          const headline = isCompleted ? (result.claudeAdCopy?.headline || "No headline") : "";
          const description = isCompleted ? result.claudeAdCopy?.description : "";

          return (
            <div
              key={result.id}
              onClick={() => isCompleted && onSelectResult(result)}
              className={`bg-white dark:bg-black border border-border rounded-2xl overflow-hidden transition-all duration-200 ${
                isCompleted ? "cursor-pointer hover:border-primary hover:shadow-lg" : "cursor-default"
              } ${deletingId === result.id ? "opacity-50 scale-95" : ""} ${
                isPending ? "animate-pulse" : ""
              }`}
            >
              {/* Header with type badge and delete button */}
              <div className="p-6 border-b border-border flex justify-between items-start">
                <div className="flex-1">
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-2">
                    {isVideo ? "VIDEO" : "IMAGE"}
                  </span>
                  <p className="text-foreground text-sm font-medium truncate">
                    {result.fileName}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDelete(e, result.id)}
                  className="ml-2 p-2 hover:bg-primary/10 rounded-lg transition-colors group"
                  title="Delete"
                >
                  <svg
                    className="w-4 h-4 text-secondary group-hover:text-primary"
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
              <div className="p-6 space-y-4">
                {isPending && (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                    <p className="text-sm text-secondary font-medium">
                      {result.status === "pending" ? "Uploading..." : "Analyzing..."}
                    </p>
                  </div>
                )}

                {isError && (
                  <div className="flex flex-col items-center justify-center py-8">
                    <svg
                      className="w-12 h-12 text-red-500 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium text-center">
                      {result.status === "error" && "error" in result ? result.error : "Analysis failed"}
                    </p>
                  </div>
                )}

                {isCompleted && (
                  <>
                    {/* Headline */}
                    <h3 className="font-bold text-lg text-black dark:text-white line-clamp-2 leading-tight">
                      {headline}
                    </h3>

                    {/* Description preview */}
                    <p className="text-sm text-secondary line-clamp-3 leading-relaxed">
                      {truncateText(
                        description || "Claude failed to load copy",
                        120
                      )}
                    </p>

                    {/* Footer with timestamp */}
                    <div className="pt-4 border-t border-border flex justify-between items-center">
                      <p className="text-xs text-secondary">
                        {formatDate(result.timestamp)}
                      </p>
                      <svg
                        className="w-4 h-4 text-primary"
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
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
