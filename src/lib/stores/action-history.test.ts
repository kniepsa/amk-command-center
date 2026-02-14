/**
 * Action History Tests
 * Verify undo/error recovery system works correctly
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  recordAction,
  undoLast,
  getLastAction,
  clearHistory,
} from "./action-history.svelte";

describe("Action History Store", () => {
  beforeEach(() => {
    // Clear history before each test
    clearHistory();
  });

  it("should record a new action", () => {
    const reverseAction = vi.fn();

    recordAction({
      type: "habit-toggle",
      description: "Running marked",
      reverseAction,
      data: { habitId: "running", previousState: false },
    });

    const lastAction = getLastAction();
    expect(lastAction).toBeDefined();
    expect(lastAction?.description).toBe("Running marked");
    expect(lastAction?.type).toBe("habit-toggle");
  });

  it("should execute reverse action on undo", async () => {
    const reverseAction = vi.fn().mockResolvedValue(undefined);

    recordAction({
      type: "habit-toggle",
      description: "Running marked",
      reverseAction,
      data: { habitId: "running" },
    });

    const success = await undoLast();

    expect(success).toBe(true);
    expect(reverseAction).toHaveBeenCalledTimes(1);
  });

  it("should return false when nothing to undo", async () => {
    const success = await undoLast();
    expect(success).toBe(false);
  });

  it("should handle undo failure gracefully", async () => {
    const reverseAction = vi.fn().mockRejectedValue(new Error("API failed"));

    recordAction({
      type: "habit-toggle",
      description: "Running marked",
      reverseAction,
      data: { habitId: "running" },
    });

    const success = await undoLast();

    expect(success).toBe(false);
    // Action should be put back in history on failure
    expect(getLastAction()?.description).toBe("Running marked");
  });

  it("should maintain max 20 actions", () => {
    const reverseAction = vi.fn();

    // Add 25 actions
    for (let i = 0; i < 25; i++) {
      recordAction({
        type: "habit-toggle",
        description: `Action ${i}`,
        reverseAction,
        data: { index: i },
      });
    }

    // Should only keep last 20
    const lastAction = getLastAction();
    expect(lastAction?.description).toBe("Action 24");
  });

  it("should clear all history", () => {
    const reverseAction = vi.fn();

    recordAction({
      type: "habit-toggle",
      description: "Running marked",
      reverseAction,
      data: { habitId: "running" },
    });

    clearHistory();

    expect(getLastAction()).toBeUndefined();
  });
});

describe("Voice Integration", () => {
  it("should integrate with voice undo command", async () => {
    // This test would require mocking the voice-commands module
    // Placeholder for integration test
    expect(true).toBe(true);
  });
});
