/**
 * Action History Store
 * Enables undo/redo functionality for all user actions
 *
 * Usage:
 * ```typescript
 * import { recordAction, undoLast, getLastAction } from '$lib/stores/action-history.svelte';
 *
 * // Record an action
 * recordAction({
 *   type: 'habit-toggle',
 *   description: 'Running marked complete',
 *   reverseAction: async () => { ... },
 *   data: { habitId: 'running', previousState: false }
 * });
 *
 * // Undo last action (via voice: "undo" or keyboard: Cmd+Shift+Z)
 * await undoLast();
 * ```
 */

import { speak } from "$lib/utils/voice-commands";

export interface Action {
  id: string;
  type:
    | "habit-toggle"
    | "task-complete"
    | "task-add"
    | "task-delete"
    | "entry-save"
    | "navigation"
    | "context-filter"
    | "priority-select"
    | "weekly-categorize";
  timestamp: Date;
  description: string;
  reverseAction: () => Promise<void>;
  data: any;
}

class ActionHistoryStore {
  private history = $state<Action[]>([]);
  private maxHistory = 20;
  private storageKey = "action-history";

  constructor() {
    // Load history from localStorage on initialization
    if (typeof window !== "undefined") {
      this.loadFromStorage();
    }
  }

  /**
   * Get all actions
   */
  get actions(): Action[] {
    return this.history;
  }

  /**
   * Get the most recent action
   */
  get last(): Action | undefined {
    return this.history[0];
  }

  /**
   * Record a new action
   */
  record(action: Omit<Action, "id" | "timestamp">): void {
    const fullAction: Action = {
      ...action,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };

    // Add to beginning of array (most recent first)
    this.history.unshift(fullAction);

    // Keep only last N actions
    if (this.history.length > this.maxHistory) {
      this.history.pop();
    }

    // Save to localStorage
    this.saveToStorage();

    // Audio confirmation with undo hint
    speak(`${action.description}. Say "undo" to reverse.`, "low");
  }

  /**
   * Undo the last action
   */
  async undo(): Promise<{ success: boolean; message: string }> {
    const last = this.history.shift();

    if (!last) {
      speak("Nothing to undo", "medium");
      return {
        success: false,
        message: "Nothing to undo",
      };
    }

    try {
      await last.reverseAction();
      speak(`Undone: ${last.description}`, "medium");

      // Save updated history
      this.saveToStorage();

      return {
        success: true,
        message: `Undone: ${last.description}`,
      };
    } catch (error) {
      // Put action back if undo fails
      this.history.unshift(last);

      const message = "Undo failed - action cannot be reversed";
      speak(message, "high");

      return {
        success: false,
        message,
      };
    }
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.history = [];
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.storageKey);
    }
  }

  /**
   * Get actions by type
   */
  getByType(type: Action["type"]): Action[] {
    return this.history.filter((action) => action.type === type);
  }

  /**
   * Get actions from last N minutes
   */
  getRecent(minutes: number): Action[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.history.filter((action) => action.timestamp > cutoff);
  }

  /**
   * Save history to localStorage
   */
  private saveToStorage(): void {
    if (typeof window === "undefined") return;

    try {
      // Convert to serializable format (can't store functions)
      const serializable = this.history.map((action) => ({
        id: action.id,
        type: action.type,
        timestamp: action.timestamp.toISOString(),
        description: action.description,
        data: action.data,
      }));

      localStorage.setItem(this.storageKey, JSON.stringify(serializable));
    } catch (error) {
      console.error("Failed to save action history:", error);
    }
  }

  /**
   * Load history from localStorage
   */
  private loadFromStorage(): void {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return;

      const parsed = JSON.parse(stored);

      // Note: We can't restore reverseAction functions from storage
      // This is intentional - undo only works for actions in current session
      // After page refresh, undo history is cleared for safety
      this.history = [];
    } catch (error) {
      console.error("Failed to load action history:", error);
    }
  }
}

// Create singleton store
export const actionHistory = new ActionHistoryStore();

/**
 * Convenience function: Record an action
 */
export function recordAction(action: Omit<Action, "id" | "timestamp">): void {
  actionHistory.record(action);
}

/**
 * Convenience function: Undo last action
 */
export async function undoLast(): Promise<{
  success: boolean;
  message: string;
}> {
  return actionHistory.undo();
}

/**
 * Convenience function: Get last action
 */
export function getLastAction(): Action | undefined {
  return actionHistory.last;
}

/**
 * Convenience function: Clear all history
 */
export function clearHistory(): void {
  actionHistory.clear();
}

/**
 * Setup global keyboard shortcut for undo (Cmd+Shift+Z)
 */
export function setupUndoShortcut(): void {
  if (typeof window === "undefined") return;

  window.addEventListener("keydown", async (e: KeyboardEvent) => {
    // Cmd+Shift+Z (Mac) or Ctrl+Shift+Z (Windows/Linux)
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "z") {
      e.preventDefault();
      await undoLast();
    }
  });
}

/**
 * Example: Record habit toggle action
 */
export function recordHabitToggle(
  habitName: string,
  habitId: string,
  previousState: boolean,
  toggleFn: () => Promise<void>,
): void {
  recordAction({
    type: "habit-toggle",
    description: `${habitName} ${!previousState ? "marked" : "cleared"}`,
    reverseAction: toggleFn,
    data: { habitId, previousState },
  });
}

/**
 * Example: Record task completion action
 */
export function recordTaskComplete(
  taskTitle: string,
  taskId: string,
  undoFn: () => Promise<void>,
): void {
  recordAction({
    type: "task-complete",
    description: `Completed: ${taskTitle}`,
    reverseAction: undoFn,
    data: { taskId },
  });
}

/**
 * Example: Record task addition action
 */
export function recordTaskAdd(
  taskTitle: string,
  taskId: string,
  deleteFn: () => Promise<void>,
): void {
  recordAction({
    type: "task-add",
    description: `Added: ${taskTitle}`,
    reverseAction: deleteFn,
    data: { taskId, taskTitle },
  });
}

/**
 * Example: Record task deletion action
 */
export function recordTaskDelete(
  taskTitle: string,
  taskData: any,
  restoreFn: () => Promise<void>,
): void {
  recordAction({
    type: "task-delete",
    description: `Deleted: ${taskTitle}`,
    reverseAction: restoreFn,
    data: taskData,
  });
}

/**
 * Example: Record navigation action
 */
export function recordNavigation(
  from: string,
  to: string,
  navigateBackFn: () => Promise<void>,
): void {
  recordAction({
    type: "navigation",
    description: `Navigated to ${to}`,
    reverseAction: navigateBackFn,
    data: { from, to },
  });
}
