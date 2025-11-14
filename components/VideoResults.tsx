"use client";

import { MediaAnalysisResult } from "@/lib/gemini";
import { useState } from "react";

interface MediaResultsProps {
  results: MediaAnalysisResult;
  onReset: () => void;
}

export default function MediaResults({ results, onReset }: MediaResultsProps) {
  const isVideo = results.type === "video";
  const [showDescription, setShowDescription] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isVideo ? "Video Analysis Results" : "Image Analysis Results"}
        </h2>
        <button
          onClick={onReset}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Analyze Another {isVideo ? "Video" : "Image"}
        </button>
      </div>

      <div className="space-y-6">
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
                {results.data.description}
              </p>
            </div>
          )}
        </div>

        {/* Claude Ad Copy Section */}
        {results.data.claudeAdCopy && (
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
                  {results.data.claudeAdCopy.headline}
                </h4>
              </div>
              {/* Description */}
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">
                  AD DESCRIPTION
                </p>
                <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
                  {results.data.claudeAdCopy.description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Video-specific sections */}
        {isVideo && (
          <>
            {results.data.scenes && results.data.scenes.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Scene Breakdown
                </h3>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
                  {results.data.scenes.map((scene, index) => (
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
                  {results.data.transcript}
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
                {results.data.adCopy.map((copy, index) => (
                  <div key={index} className="border-l-4 border-green-500 pl-4">
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
                  {results.data.visualElements.map((element, index) => (
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
    </div>
  );
}
