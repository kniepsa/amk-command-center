/**
 * Storage API Interface
 * Defines the contract for data persistence - can be implemented by localStorage, Supabase, etc.
 *
 * Benefits:
 * - Easy to swap backends (localStorage → Supabase)
 * - Testable (mock implementations)
 * - Type-safe
 */

export interface StorageAPI {
  /**
   * Get item from storage
   * @returns Parsed JSON value or null if not found
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Set item in storage
   * @param key Storage key
   * @param value Value to store (will be JSON.stringify'd)
   */
  set<T>(key: string, value: T): Promise<void>;

  /**
   * Remove item from storage
   */
  remove(key: string): Promise<void>;

  /**
   * Clear all storage
   */
  clear(): Promise<void>;

  /**
   * Get all keys
   */
  keys(): Promise<string[]>;
}

/**
 * Query options for filtering/sorting data
 */
export interface QueryOptions {
  filter?: Record<string, unknown>;
  sort?: { field: string; direction: "asc" | "desc" };
  limit?: number;
  offset?: number;
}

/**
 * Generic result type for API operations
 */
export interface Result<T> {
  success: boolean;
  data?: T;
  error?: string;
}
