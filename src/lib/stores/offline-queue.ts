/**
 * Offline Queue using IndexedDB
 * Stores draft entries, voice recordings, and pending API requests for later sync
 */

import { browser } from "$app/environment";

const DB_NAME = "amk-command-center-offline";
const DB_VERSION = 1;
const STORES = {
  DRAFTS: "drafts",
  VOICE_RECORDINGS: "voice-recordings",
  PENDING_REQUESTS: "pending-requests",
} as const;

type QueueItem = {
  id: string;
  timestamp: number;
  data: unknown;
  type: "draft" | "voice" | "api-request";
  retryCount?: number;
};

type VoiceRecording = {
  id: string;
  timestamp: number;
  audioBlob: Blob;
  transcription?: string;
  metadata?: {
    duration?: number;
    size?: number;
    mimeType?: string;
  };
};

type PendingRequest = {
  id: string;
  timestamp: number;
  url: string;
  method: string;
  body?: unknown;
  headers?: Record<string, string>;
  retryCount: number;
};

class OfflineQueue {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize IndexedDB database
   */
  async init(): Promise<void> {
    if (!browser) return;
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error("[OfflineQueue] Failed to open database:", request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log("[OfflineQueue] Database opened successfully");
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains(STORES.DRAFTS)) {
          const draftStore = db.createObjectStore(STORES.DRAFTS, {
            keyPath: "id",
          });
          draftStore.createIndex("timestamp", "timestamp", { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.VOICE_RECORDINGS)) {
          const voiceStore = db.createObjectStore(STORES.VOICE_RECORDINGS, {
            keyPath: "id",
          });
          voiceStore.createIndex("timestamp", "timestamp", { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.PENDING_REQUESTS)) {
          const requestStore = db.createObjectStore(STORES.PENDING_REQUESTS, {
            keyPath: "id",
          });
          requestStore.createIndex("timestamp", "timestamp", { unique: false });
          requestStore.createIndex("retryCount", "retryCount", {
            unique: false,
          });
        }

        console.log("[OfflineQueue] Database upgraded to version", DB_VERSION);
      };
    });

    return this.initPromise;
  }

  /**
   * Add item to queue
   */
  async add<T>(storeName: string, item: T): Promise<void> {
    await this.init();
    if (!this.db) throw new Error("Database not initialized");

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.add(item);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all items from queue
   */
  async getAll<T>(storeName: string): Promise<T[]> {
    await this.init();
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result as T[]);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Remove item from queue
   */
  async remove(storeName: string, id: string): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all items from queue
   */
  async clear(storeName: string): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Save voice recording for offline use
   */
  async saveVoiceRecording(
    recording: Omit<VoiceRecording, "id">,
  ): Promise<string> {
    const id = `voice-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const item: VoiceRecording = {
      id,
      ...recording,
    };

    await this.add(STORES.VOICE_RECORDINGS, item);
    console.log("[OfflineQueue] Voice recording saved:", id);
    return id;
  }

  /**
   * Get all pending voice recordings
   */
  async getVoiceRecordings(): Promise<VoiceRecording[]> {
    return this.getAll<VoiceRecording>(STORES.VOICE_RECORDINGS);
  }

  /**
   * Remove synced voice recording
   */
  async removeVoiceRecording(id: string): Promise<void> {
    await this.remove(STORES.VOICE_RECORDINGS, id);
    console.log("[OfflineQueue] Voice recording removed:", id);
  }

  /**
   * Save draft entry
   */
  async saveDraft(draft: {
    content: string;
    metadata?: Record<string, unknown>;
  }): Promise<string> {
    const id = `draft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const item: QueueItem = {
      id,
      timestamp: Date.now(),
      type: "draft",
      data: draft,
    };

    await this.add(STORES.DRAFTS, item);
    console.log("[OfflineQueue] Draft saved:", id);
    return id;
  }

  /**
   * Get all pending drafts
   */
  async getDrafts(): Promise<QueueItem[]> {
    return this.getAll<QueueItem>(STORES.DRAFTS);
  }

  /**
   * Remove synced draft
   */
  async removeDraft(id: string): Promise<void> {
    await this.remove(STORES.DRAFTS, id);
    console.log("[OfflineQueue] Draft removed:", id);
  }

  /**
   * Queue API request for later retry
   */
  async queueRequest(
    request: Omit<PendingRequest, "id" | "timestamp" | "retryCount">,
  ): Promise<string> {
    const id = `request-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const item: PendingRequest = {
      id,
      timestamp: Date.now(),
      retryCount: 0,
      ...request,
    };

    await this.add(STORES.PENDING_REQUESTS, item);
    console.log("[OfflineQueue] Request queued:", id, request.url);
    return id;
  }

  /**
   * Get all pending requests
   */
  async getPendingRequests(): Promise<PendingRequest[]> {
    return this.getAll<PendingRequest>(STORES.PENDING_REQUESTS);
  }

  /**
   * Remove processed request
   */
  async removeRequest(id: string): Promise<void> {
    await this.remove(STORES.PENDING_REQUESTS, id);
    console.log("[OfflineQueue] Request removed:", id);
  }

  /**
   * Increment retry count for failed request
   */
  async incrementRetryCount(id: string): Promise<void> {
    await this.init();
    if (!this.db) return;

    const requests = await this.getPendingRequests();
    const request = requests.find((r) => r.id === id);

    if (!request) return;

    request.retryCount++;

    // Remove and re-add with updated retry count
    await this.remove(STORES.PENDING_REQUESTS, id);
    await this.add(STORES.PENDING_REQUESTS, request);
  }

  /**
   * Get count of pending items
   */
  async getPendingCount(): Promise<{
    drafts: number;
    voices: number;
    requests: number;
  }> {
    const [drafts, voices, requests] = await Promise.all([
      this.getDrafts(),
      this.getVoiceRecordings(),
      this.getPendingRequests(),
    ]);

    return {
      drafts: drafts.length,
      voices: voices.length,
      requests: requests.length,
    };
  }
}

// Export singleton instance
export const offlineQueue = new OfflineQueue();

// Initialize on module load if in browser
if (browser) {
  offlineQueue.init().catch((error) => {
    console.error("[OfflineQueue] Initialization failed:", error);
  });
}
