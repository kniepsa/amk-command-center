/**
 * localStorage Implementation of StorageAPI
 * Browser-based persistence with error handling
 */

import { browser } from "$app/environment";
import type { StorageAPI } from "$lib/api/interfaces/storage.api";

class LocalStorageService implements StorageAPI {
  async get<T>(key: string): Promise<T | null> {
    if (!browser) return null;

    try {
      const item = localStorage.getItem(key);
      if (item === null) return null;
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error reading from localStorage (key: ${key}):`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    if (!browser) return;

    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage (key: ${key}):`, error);
      throw error;
    }
  }

  async remove(key: string): Promise<void> {
    if (!browser) return;

    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage (key: ${key}):`, error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    if (!browser) return;

    try {
      localStorage.clear();
    } catch (error) {
      console.error("Error clearing localStorage:", error);
      throw error;
    }
  }

  async keys(): Promise<string[]> {
    if (!browser) return [];

    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.error("Error getting localStorage keys:", error);
      return [];
    }
  }
}

export const localStorageService = new LocalStorageService();
