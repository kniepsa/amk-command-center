/**
 * Command Center SDK Client Singleton
 *
 * Provides a single, shared instance of the CommandCenterClient for the entire app.
 *
 * Usage:
 * ```typescript
 * import { api } from '$lib/api-client';
 *
 * const people = await api.people.list();
 * const buyers = await api.buyers.list();
 * ```
 */

import { CommandCenterClient } from "@amk/command-center-sdk";
import { browser } from "$app/environment";

/**
 * API Configuration
 * - baseUrl: Points to the Command Center API running on port 3002
 * - workspace: 'amk' for personal journal (vs 'ma' for M&A tracking)
 */
const API_CONFIG = {
  baseUrl: browser ? "http://localhost:3002/api/v1" : "",
  workspace: "amk",
  timeout: 30000, // 30 seconds
};

/**
 * Singleton client instance
 * Only initialized in browser context (SSR-safe)
 */
let clientInstance: CommandCenterClient | null = null;

/**
 * Get or create the SDK client instance
 */
export function getApiClient(): CommandCenterClient {
  if (!browser) {
    throw new Error("API client can only be used in browser context");
  }

  if (!clientInstance) {
    clientInstance = new CommandCenterClient(API_CONFIG);
  }

  return clientInstance;
}

/**
 * Convenience export for direct usage
 *
 * @example
 * ```typescript
 * import { api } from '$lib/api-client';
 * const people = await api.people.list();
 * ```
 */
export const api = new Proxy({} as CommandCenterClient, {
  get(_target, prop) {
    return getApiClient()[prop as keyof CommandCenterClient];
  },
});
