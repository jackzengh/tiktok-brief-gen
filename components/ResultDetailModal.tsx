"use client";

import { SavedAnalysisResult } from "@/lib/storage";
import { useState, useEffect } from "react";

interface ResultDetailModalProps {
  result: SavedAnalysisResult | null;
  onClose: () => void;
}

export default function ResultDetailModal({
  result,
  onClose,
}: ResultDetailModalProps) {
  const [showDescription, setShowDescription] = useState(false);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (result) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [result]);

  if (!result) return null;

  const isVideo = result.type === "video";

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-500 to-blue-500 p-6 flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm font-semibold rounded-full">
                {isVideo ? "📹 VIDEO" : "🖼️ IMAGE"}
              </span>
              <span className="text-white/80 text-sm">
                {formatDate(result.timestamp)}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white">{result.fileName}</h2>
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            title="Close"
          >
            <svg
              className="w-6 h-6 text-white"
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

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Collapsible Description Section */}
          <div>
            <button
              onClick={() => setShowDescription(!showDescription)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {isVideo ? "Video Description" : "Image Description"}
              </h3>
              <svg
                className={`w-5 h-5 text-gray-600 dark:text-gray-300 transition-transform ${
                  showDescription ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {showDescription && (
              <div className="mt-3 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {result.data.description}
                </p>
              </div>
            )}
          </div>

          {/* Claude Ad Copy Section */}
          {result.data.claudeAdCopy && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                AI-Generated Ad Copy
              </h3>
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-6 space-y-4 border-2 border-purple-200 dark:border-purple-800">
                {/* Headline */}
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">
                    HEADLINE
                  </p>
                  <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {result.data.claudeAdCopy.headline}
                  </h4>
                </div>
                {/* Description */}
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">
                    AD DESCRIPTION
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
                    {result.data.claudeAdCopy.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Video-specific sections */}
          {isVideo && (
            <>
              {result.data.scenes && result.data.scenes.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    Scene Breakdown
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
                    {result.data.scenes.map((scene, index) => (
                      <div key={index} className="flex gap-3 items-start">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </span>
                        <p className="text-gray-700 dark:text-gray-300 flex-1">
                          {scene}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Transcript
                </h3>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {result.data.transcript}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Image-specific sections */}
          {!isVideo && (
            <>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Ad Copy
                </h3>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3">
                  {result.data.adCopy.map((copy, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-green-500 pl-4"
                    >
                      <p className="text-gray-700 dark:text-gray-300">{copy}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Key Visual Elements
                </h3>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <div className="flex flex-wrap gap-2">
                    {result.data.visualElements.map((element, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                      >
                        {element}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-100 dark:bg-gray-700 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
