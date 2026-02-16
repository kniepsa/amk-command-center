import { describe, it, expect, beforeEach } from "vitest";
import { shortcuts } from "./shortcuts.svelte";

describe("ShortcutsStore", () => {
  beforeEach(() => {
    shortcuts.close();
  });

  it("should start with modal closed", () => {
    expect(shortcuts.isOpen).toBe(false);
  });

  it("should open modal", () => {
    shortcuts.open();
    expect(shortcuts.isOpen).toBe(true);
  });

  it("should close modal", () => {
    shortcuts.open();
    shortcuts.close();
    expect(shortcuts.isOpen).toBe(false);
  });

  it("should toggle modal", () => {
    expect(shortcuts.isOpen).toBe(false);
    shortcuts.toggle();
    expect(shortcuts.isOpen).toBe(true);
    shortcuts.toggle();
    expect(shortcuts.isOpen).toBe(false);
  });

  it("should have all shortcuts defined", () => {
    const allShortcuts = shortcuts.allShortcuts;
    expect(allShortcuts.length).toBeGreaterThan(0);

    // Check that all shortcuts have required fields
    allShortcuts.forEach((shortcut) => {
      expect(shortcut.key).toBeTruthy();
      expect(shortcut.description).toBeTruthy();
      expect(shortcut.category).toBeTruthy();
    });
  });

  it("should categorize shortcuts correctly", () => {
    const categorized = shortcuts.categorized;

    // Should have multiple categories
    const categories = Object.keys(categorized);
    expect(categories.length).toBeGreaterThan(0);

    // Check expected categories exist
    expect(categories).toContain("Global");
    expect(categories).toContain("Tasks");

    // Each category should have shortcuts
    categories.forEach((category) => {
      expect(categorized[category].length).toBeGreaterThan(0);
    });
  });

  it("should have ⌘K shortcut in Global category", () => {
    const globalShortcuts = shortcuts.categorized["Global"];
    const cmdKShortcut = globalShortcuts.find((s) => s.key.includes("⌘K"));
    expect(cmdKShortcut).toBeTruthy();
    expect(cmdKShortcut?.description).toContain("keyboard shortcuts");
  });
});
