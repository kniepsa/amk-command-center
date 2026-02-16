/**
 * Extraction History Store
 *
 * Tracks all AI extractions for transparency and debugging.
 * Persists to localStorage, keeps last 50 entries.
 *
 * Usage:
 *   import { extractionHistory } from '$lib/stores/extraction-history.svelte';
 *
 *   extractionHistory.record({
 *     type: 'voice',
 *     fields: ['sleep', 'energy'],
 *     confidence: 85,
 *     summary: 'Extracted 2 fields',
 *     extractedData: { sleep: {...}, energy: 'high' }
 *   });
 */

import { browser } from "$app/environment";
import type { ActivityLogEntry, ExtractionType } from "$lib/types/extraction";

const STORAGE_KEY = "extraction-history";
const MAX_ENTRIES = 50;

class ExtractionHistoryStore {
  private history = $state<ActivityLogEntry[]>([]);

  constructor() {
    if (browser) {
      this.loadFromStorage();
    }
  }

  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.history = parsed.map((e: any) => ({
          ...e,
          timestamp: new Date(e.timestamp),
        }));
      }
    } catch (error) {
      console.error("Failed to load extraction history:", error);
      this.history = [];
    }
  }

  private saveToStorage(): void {
    if (!browser) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.history));
    } catch (error) {
      console.error("Failed to save extraction history:", error);
    }
  }

  get entries(): ActivityLogEntry[] {
    return this.history;
  }

  record(params: {
    type: ExtractionType;
    fields: string[];
    confidence: number;
    summary: string;
    extractedData?: any;
  }): void {
    const entry: ActivityLogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      ...params,
      confidenceLevel:
        params.confidence >= 80
          ? "high"
          : params.confidence >= 60
            ? "medium"
            : "low",
    };

    // Add to beginning and limit size
    this.history = [entry, ...this.history].slice(0, MAX_ENTRIES);
    this.saveToStorage();
  }

  clear(): void {
    this.history = [];
    if (browser) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}

export const extractionHistory = new ExtractionHistoryStore();
