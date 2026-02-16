/**
 * AMK Journal Command Center API Client
 *
 * Type-safe API client for accessing the Command Center backend.
 * Uses the @amk/command-center-sdk package for full type safety.
 */

import { CommandCenterClient } from "@amk/command-center-sdk";

// Get API configuration from environment variables
const API_URL =
  import.meta.env.VITE_JOURNAL_API_URL || "http://localhost:3002/api/v1";
const API_KEY = import.meta.env.VITE_JOURNAL_API_KEY;

// Initialize the Command Center API client
export const api = new CommandCenterClient({
  baseUrl: API_URL,
  apiKey: API_KEY,
  workspace: "amk", // Personal journal workspace
  timeout: 60000, // 60 seconds
});

// Export types for convenience
export type {
  EntryFrontmatter,
  EntryDetail,
  EntriesListResponse,
  CreateEntryRequest,
  CreateEntryResponse,
  ExtractRequest,
  ExtractResponse,
  HabitStreaksResponse,
  Sleep,
  Habits,
  Gratitude,
  FoodEntry,
  UncertainField,
  EnergyLevel,
} from "@amk/command-center-sdk";
