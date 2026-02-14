/**
 * Auto-save utilities for session state
 * Automatically saves session every 10 seconds
 */

import { saveSession, type SessionState } from "$lib/stores/session.svelte";

let autoSaveInterval: number | null = null;
const AUTO_SAVE_INTERVAL = 10000; // 10 seconds

/**
 * Start auto-save interval
 */
export function startAutoSave(): void {
  if (typeof window === "undefined") return;

  // Clear existing interval if any
  if (autoSaveInterval !== null) {
    stopAutoSave();
  }

  // Save immediately
  saveSession();

  // Start interval
  autoSaveInterval = window.setInterval(() => {
    saveSession();
    console.log("[AutoSave] Session saved at", new Date().toLocaleTimeString());
  }, AUTO_SAVE_INTERVAL);

  console.log("[AutoSave] Started (every 10 seconds)");
}

/**
 * Stop auto-save interval
 */
export function stopAutoSave(): void {
  if (autoSaveInterval !== null) {
    clearInterval(autoSaveInterval);
    autoSaveInterval = null;
    console.log("[AutoSave] Stopped");
  }
}

/**
 * Force save immediately
 */
export function forceSave(): void {
  saveSession();
  console.log("[AutoSave] Force saved at", new Date().toLocaleTimeString());
}

/**
 * Check if auto-save is running
 */
export function isAutoSaveActive(): boolean {
  return autoSaveInterval !== null;
}

/**
 * Initialize auto-save on page load
 * Call this from +layout.svelte or app initialization
 */
export function initAutoSave(): void {
  if (typeof window === "undefined") return;

  // Start auto-save
  startAutoSave();

  // Save before page unload
  window.addEventListener("beforeunload", () => {
    forceSave();
  });

  // Save on visibility change (when tab becomes hidden)
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      forceSave();
    }
  });

  // Save on page hide (mobile Safari)
  window.addEventListener("pagehide", () => {
    forceSave();
  });

  console.log("[AutoSave] Initialized with event listeners");
}

/**
 * Cleanup auto-save (for component unmount)
 */
export function cleanupAutoSave(): void {
  stopAutoSave();
  forceSave();
}
