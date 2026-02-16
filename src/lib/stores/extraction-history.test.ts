/**
 * Test extraction history store
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { extractionHistory } from "./extraction-history.svelte";

// Mock browser environment
vi.mock("$app/environment", () => ({
  browser: true,
}));

describe("ExtractionHistoryStore", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    extractionHistory.clear();
  });

  it("should record extraction entry", () => {
    extractionHistory.record({
      type: "voice",
      fields: ["sleep", "energy"],
      confidence: 85,
      summary: "Extracted sleep and energy",
      extractedData: { sleep: { duration: 8 }, energy: "high" },
    });

    const entries = extractionHistory.entries;
    expect(entries).toHaveLength(1);
    expect(entries[0].type).toBe("voice");
    expect(entries[0].fields).toEqual(["sleep", "energy"]);
    expect(entries[0].confidence).toBe(85);
    expect(entries[0].confidenceLevel).toBe("high");
  });

  it("should calculate confidence levels correctly", () => {
    // High confidence (>= 80)
    extractionHistory.record({
      type: "text",
      fields: ["energy"],
      confidence: 90,
      summary: "High confidence",
    });

    // Medium confidence (60-79)
    extractionHistory.record({
      type: "text",
      fields: ["energy"],
      confidence: 70,
      summary: "Medium confidence",
    });

    // Low confidence (< 60)
    extractionHistory.record({
      type: "text",
      fields: ["energy"],
      confidence: 50,
      summary: "Low confidence",
    });

    const entries = extractionHistory.entries;
    expect(entries[0].confidenceLevel).toBe("low"); // Most recent first
    expect(entries[1].confidenceLevel).toBe("medium");
    expect(entries[2].confidenceLevel).toBe("high");
  });

  it("should limit to 50 entries", () => {
    // Add 60 entries
    for (let i = 0; i < 60; i++) {
      extractionHistory.record({
        type: "text",
        fields: ["test"],
        confidence: 100,
        summary: `Entry ${i}`,
      });
    }

    const entries = extractionHistory.entries;
    expect(entries).toHaveLength(50);
    expect(entries[0].summary).toBe("Entry 59"); // Most recent
    expect(entries[49].summary).toBe("Entry 10"); // 50th from end
  });

  it("should persist to localStorage", () => {
    extractionHistory.record({
      type: "voice",
      fields: ["sleep"],
      confidence: 95,
      summary: "Test persistence",
    });

    const stored = localStorage.getItem("extraction-history");
    expect(stored).not.toBeNull();

    const parsed = JSON.parse(stored!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].summary).toBe("Test persistence");
  });

  it("should clear all entries", () => {
    // Add some entries
    extractionHistory.record({
      type: "text",
      fields: ["energy"],
      confidence: 80,
      summary: "Entry 1",
    });

    extractionHistory.record({
      type: "voice",
      fields: ["sleep"],
      confidence: 90,
      summary: "Entry 2",
    });

    expect(extractionHistory.entries).toHaveLength(2);

    // Clear
    extractionHistory.clear();

    expect(extractionHistory.entries).toHaveLength(0);
    expect(localStorage.getItem("extraction-history")).toBeNull();
  });
});
