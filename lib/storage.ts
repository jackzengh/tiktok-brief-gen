import {
  VideoAnalysisResult,
  ImageAnalysisResult,
  MediaAnalysisResult,
} from "@/lib/gemini";

// Base fields shared by all analysis items
interface BaseAnalysisItem {
  id: string;
  timestamp: number;
  fileName: string;
  type: "video" | "image";
}

// Pending analysis (upload in progress)
export interface PendingAnalysis extends BaseAnalysisItem {
  status: "pending" | "processing";
}

// Error state for failed analysis
interface FailedAnalysis extends BaseAnalysisItem {
  status: "error";
  error: string;
}

// Completed video analysis result
export interface SavedVideoAnalysisResult
  extends BaseAnalysisItem,
    VideoAnalysisResult {
  type: "video";
  status: "completed";
}

// Completed image analysis result
export interface SavedImageAnalysisResult
  extends BaseAnalysisItem,
    ImageAnalysisResult {
  type: "image";
  status: "completed";
}

// Union type for completed results (internal use)
type SavedAnalysisResult = SavedVideoAnalysisResult | SavedImageAnalysisResult;

// Union type for all analysis items (pending, error, or completed)
export type AnalysisItem =
  | PendingAnalysis
  | FailedAnalysis
  | SavedAnalysisResult;

const STORAGE_KEY = "saved-analysis-results";

/**
 * Save a new analysis result to local storage (determines type automatically)
 */
export function saveAnalysisResult(
  result: MediaAnalysisResult,
  fileName: string
): SavedAnalysisResult {
  const isVideo = "transcript" in result || "scenes" in result;
  const baseFields = {
    id: `${Date.now()}-${fileName}`,
    timestamp: Date.now(),
    fileName,
    status: "completed" as const,
  };

  const savedResult: SavedAnalysisResult = isVideo
    ? {
        ...result,
        ...baseFields,
        type: "video",
      }
    : {
        ...result,
        ...baseFields,
        type: "image",
      };

  // Check if we're in a browser environment
  if (typeof window !== "undefined") {
    const existingResults = loadAllResults();
    const updatedResults = [savedResult, ...existingResults];

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedResults));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }

  return savedResult;
}

/**
 * Load all saved analysis results from local storage
 */
export function loadAllResults(): SavedAnalysisResult[] {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const results = JSON.parse(stored) as SavedAnalysisResult[];
    // Sort by timestamp, newest first
    return results.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error("Error loading from localStorage:", error);
    return [];
  }
}

/**
 * Delete a specific result by ID
 */
export function deleteResult(id: string): void {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    return;
  }

  const existingResults = loadAllResults();
  const updatedResults = existingResults.filter((r) => r.id !== id);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedResults));
  } catch (error) {
    console.error("Error deleting from localStorage:", error);
  }
}

/**
 * Clear all saved results
 */
export function clearAllResults(): void {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing localStorage:", error);
  }
}
