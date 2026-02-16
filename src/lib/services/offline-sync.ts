/**
 * Offline Sync Service
 * Handles background synchronization of offline data when connection is restored
 */

import { browser } from "$app/environment";
import { offlineQueue } from "$lib/stores/offline-queue";

type SyncStatus = {
  isSyncing: boolean;
  lastSyncTime: number | null;
  pendingCount: number;
  errors: string[];
};

class OfflineSyncService {
  private syncInProgress = false;
  private syncInterval: ReturnType<typeof setInterval> | null = null;
  private listeners: Set<(status: SyncStatus) => void> = new Set();

  /**
   * Initialize sync service
   */
  init(): void {
    if (!browser) return;

    // Listen for online/offline events
    window.addEventListener("online", () => this.handleOnline());
    window.addEventListener("offline", () => this.handleOffline());

    // Register service worker sync event
    if (
      "serviceWorker" in navigator &&
      "sync" in ServiceWorkerRegistration.prototype
    ) {
      navigator.serviceWorker.ready.then((registration) => {
        // Register periodic sync for background updates
        registration.sync.register("sync-offline-data").catch((error) => {
          console.error("[OfflineSync] Failed to register sync:", error);
        });
      });
    }

    // Initial sync if online
    if (navigator.onLine) {
      this.startPeriodicSync();
    }
  }

  /**
   * Handle online event
   */
  private handleOnline(): void {
    console.log("[OfflineSync] Connection restored, starting sync...");
    this.syncNow();
    this.startPeriodicSync();
  }

  /**
   * Handle offline event
   */
  private handleOffline(): void {
    console.log("[OfflineSync] Connection lost, pausing sync");
    this.stopPeriodicSync();
  }

  /**
   * Start periodic background sync (every 30 seconds)
   */
  private startPeriodicSync(): void {
    if (this.syncInterval) return;

    this.syncInterval = setInterval(() => {
      if (navigator.onLine) {
        this.syncNow();
      }
    }, 30000); // 30 seconds

    console.log("[OfflineSync] Periodic sync started");
  }

  /**
   * Stop periodic sync
   */
  private stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log("[OfflineSync] Periodic sync stopped");
    }
  }

  /**
   * Trigger immediate sync
   */
  async syncNow(): Promise<void> {
    if (this.syncInProgress) {
      console.log("[OfflineSync] Sync already in progress, skipping...");
      return;
    }

    if (!navigator.onLine) {
      console.log("[OfflineSync] Offline, skipping sync");
      return;
    }

    this.syncInProgress = true;
    const errors: string[] = [];

    try {
      this.notifyListeners({
        isSyncing: true,
        lastSyncTime: null,
        pendingCount: 0,
        errors: [],
      });

      // Sync pending requests
      const requests = await offlineQueue.getPendingRequests();
      console.log(`[OfflineSync] Found ${requests.length} pending requests`);

      for (const request of requests) {
        try {
          const response = await fetch(request.url, {
            method: request.method,
            headers: request.headers,
            body: request.body ? JSON.stringify(request.body) : undefined,
          });

          if (response.ok) {
            await offlineQueue.removeRequest(request.id);
            console.log("[OfflineSync] Request synced:", request.url);
          } else {
            await offlineQueue.incrementRetryCount(request.id);
            errors.push(
              `Failed to sync ${request.url}: ${response.statusText}`,
            );
          }
        } catch (error) {
          await offlineQueue.incrementRetryCount(request.id);
          errors.push(
            `Network error for ${request.url}: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        }
      }

      // Sync voice recordings
      const recordings = await offlineQueue.getVoiceRecordings();
      console.log(`[OfflineSync] Found ${recordings.length} voice recordings`);

      for (const recording of recordings) {
        try {
          const formData = new FormData();
          formData.append("audio", recording.audioBlob);
          if (recording.transcription) {
            formData.append("transcription", recording.transcription);
          }

          const response = await fetch("/api/voice/upload", {
            method: "POST",
            body: formData,
          });

          if (response.ok) {
            await offlineQueue.removeVoiceRecording(recording.id);
            console.log("[OfflineSync] Voice recording synced:", recording.id);
          } else {
            errors.push(
              `Failed to sync recording ${recording.id}: ${response.statusText}`,
            );
          }
        } catch (error) {
          errors.push(
            `Network error for recording ${recording.id}: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        }
      }

      // Sync drafts
      const drafts = await offlineQueue.getDrafts();
      console.log(`[OfflineSync] Found ${drafts.length} drafts`);

      for (const draft of drafts) {
        try {
          const response = await fetch("/api/entries/create", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(draft.data),
          });

          if (response.ok) {
            await offlineQueue.removeDraft(draft.id);
            console.log("[OfflineSync] Draft synced:", draft.id);
          } else {
            errors.push(
              `Failed to sync draft ${draft.id}: ${response.statusText}`,
            );
          }
        } catch (error) {
          errors.push(
            `Network error for draft ${draft.id}: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        }
      }

      // Get final pending count
      const pendingCount = await offlineQueue.getPendingCount();
      const totalPending =
        pendingCount.drafts + pendingCount.voices + pendingCount.requests;

      console.log("[OfflineSync] Sync complete. Pending:", totalPending);

      this.notifyListeners({
        isSyncing: false,
        lastSyncTime: Date.now(),
        pendingCount: totalPending,
        errors,
      });
    } catch (error) {
      console.error("[OfflineSync] Sync failed:", error);
      errors.push(error instanceof Error ? error.message : "Unknown error");

      this.notifyListeners({
        isSyncing: false,
        lastSyncTime: null,
        pendingCount: 0,
        errors,
      });
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Subscribe to sync status updates
   */
  subscribe(listener: (status: SyncStatus) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of status change
   */
  private notifyListeners(status: SyncStatus): void {
    this.listeners.forEach((listener) => listener(status));
  }

  /**
   * Get current pending count
   */
  async getPendingCount(): Promise<number> {
    const counts = await offlineQueue.getPendingCount();
    return counts.drafts + counts.voices + counts.requests;
  }

  /**
   * Clean up
   */
  destroy(): void {
    this.stopPeriodicSync();
    this.listeners.clear();
  }
}

// Export singleton instance
export const offlineSyncService = new OfflineSyncService();

// Initialize on module load if in browser
if (browser) {
  offlineSyncService.init();
}
