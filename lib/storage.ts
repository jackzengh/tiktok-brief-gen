import { MediaAnalysisResult } from "@/lib/gemini";

export interface SavedAnalysisResult extends MediaAnalysisResult {
  id: string;
  timestamp: number;
  fileName: string;
}

const STORAGE_KEY = "saved-analysis-results";

/**
 * Save a new analysis result to local storage
 */
export function saveAnalysisResult(
  result: MediaAnalysisResult,
  fileName: string
): SavedAnalysisResult {
  const savedResult: SavedAnalysisResult = {
    ...result,
    id: `${Date.now()}-${fileName}`,
    timestamp: Date.now(),
    fileName,
  };

  const existingResults = loadAllResults();
  const updatedResults = [savedResult, ...existingResults]; // Add new result at the beginning

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedResults));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }

  return savedResult;
}

/**
 * Load all saved analysis results from local storage
 */
export function loadAllResults(): SavedAnalysisResult[] {
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
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing localStorage:", error);
  }
}
