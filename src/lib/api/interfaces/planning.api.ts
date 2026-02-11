/**
 * Planning API Interface
 * Weekly planning and task management (Warren Buffett 25/5 method)
 */

import type { Result } from "./storage.api";

export type TaskCategory = "braindump" | "priority" | "parking" | "drop";

export interface Task {
  id: string;
  text: string;
  category: TaskCategory;
  created: string;
}

export interface WeeklyPlan {
  id: string;
  week: string; // Format: YYYY-WXX
  tasks: Task[];
  created: string;
  updated: string;
}

export interface PlanningAPI {
  /**
   * Get weekly plan for specific week
   * @param week Format: YYYY-WXX (e.g., "2026-W07")
   */
  getWeeklyPlan(week: string): Promise<Result<WeeklyPlan | null>>;

  /**
   * Get current week's plan
   */
  getCurrentWeekPlan(): Promise<Result<WeeklyPlan | null>>;

  /**
   * Save/update weekly plan
   */
  saveWeeklyPlan(
    plan: Omit<WeeklyPlan, "id" | "created" | "updated">,
  ): Promise<Result<WeeklyPlan>>;

  /**
   * Add task to current week
   */
  addTask(text: string, category?: TaskCategory): Promise<Result<Task>>;

  /**
   * Move task to different category
   */
  moveTask(taskId: string, newCategory: TaskCategory): Promise<Result<Task>>;

  /**
   * Delete task
   */
  deleteTask(taskId: string): Promise<Result<void>>;

  /**
   * Get tasks by category for current week
   */
  getTasksByCategory(category: TaskCategory): Promise<Result<Task[]>>;

  /**
   * Get priority count (for 25/5 validation)
   */
  getPriorityCount(): Promise<Result<number>>;
}
