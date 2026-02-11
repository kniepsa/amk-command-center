/**
 * localStorage Implementation of PlanningAPI
 * Weekly planning and task management (Warren Buffett 25/5 method)
 */

import type {
  WeeklyPlan,
  Task,
  TaskCategory,
  PlanningAPI,
} from "$lib/api/interfaces/planning.api";
import type { Result } from "$lib/api/interfaces/storage.api";
import { localStorageService } from "./storage.service";
import { STORAGE_KEYS, MAX_WEEKLY_PRIORITIES } from "$lib/utils/constants";
import { getWeekNumber } from "$lib/utils/metrics";

class LocalStoragePlanningService implements PlanningAPI {
  /**
   * Get week string in YYYY-WXX format
   */
  private getWeekString(date: Date): string {
    const year = date.getFullYear();
    const week = getWeekNumber(date);
    return `${year}-W${week}`;
  }

  async getWeeklyPlan(week: string): Promise<Result<WeeklyPlan | null>> {
    try {
      const plans =
        (await localStorageService.get<WeeklyPlan[]>(
          STORAGE_KEYS.WEEKLY_PLANS,
        )) || [];
      const plan = plans.find((p) => p.week === week) || null;
      return { success: true, data: plan };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get weekly plan: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  async getCurrentWeekPlan(): Promise<Result<WeeklyPlan | null>> {
    try {
      const currentWeek = this.getWeekString(new Date());
      return await this.getWeeklyPlan(currentWeek);
    } catch (error) {
      return {
        success: false,
        error: `Failed to get current week plan: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  async saveWeeklyPlan(
    plan: Omit<WeeklyPlan, "id" | "created" | "updated">,
  ): Promise<Result<WeeklyPlan>> {
    try {
      const plans =
        (await localStorageService.get<WeeklyPlan[]>(
          STORAGE_KEYS.WEEKLY_PLANS,
        )) || [];

      // Check if plan for this week already exists
      const existingIndex = plans.findIndex((p) => p.week === plan.week);

      const now = new Date().toISOString();
      const savedPlan: WeeklyPlan = {
        ...plan,
        id: existingIndex >= 0 ? plans[existingIndex].id : crypto.randomUUID(),
        created: existingIndex >= 0 ? plans[existingIndex].created : now,
        updated: now,
      };

      if (existingIndex >= 0) {
        plans[existingIndex] = savedPlan;
      } else {
        plans.push(savedPlan);
      }

      await localStorageService.set(STORAGE_KEYS.WEEKLY_PLANS, plans);
      return { success: true, data: savedPlan };
    } catch (error) {
      return {
        success: false,
        error: `Failed to save weekly plan: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  async addTask(
    text: string,
    category: TaskCategory = "braindump",
  ): Promise<Result<Task>> {
    try {
      // Get current week plan
      const currentWeek = this.getWeekString(new Date());
      const planResult = await this.getWeeklyPlan(currentWeek);

      if (!planResult.success) {
        return { success: false, error: planResult.error };
      }

      // Create plan if it doesn't exist
      let plan = planResult.data;
      if (!plan) {
        const newPlanResult = await this.saveWeeklyPlan({
          week: currentWeek,
          tasks: [],
        });
        if (!newPlanResult.success || !newPlanResult.data) {
          return { success: false, error: newPlanResult.error };
        }
        plan = newPlanResult.data;
      }

      // Check priority limit
      if (category === "priority") {
        const priorityCount = plan.tasks.filter(
          (t) => t.category === "priority",
        ).length;
        if (priorityCount >= MAX_WEEKLY_PRIORITIES) {
          return {
            success: false,
            error: `Maximum ${MAX_WEEKLY_PRIORITIES} priorities allowed. Move existing priority to parking lot or drop list first.`,
          };
        }
      }

      // Create new task
      const newTask: Task = {
        id: crypto.randomUUID(),
        text,
        category,
        created: new Date().toISOString(),
      };

      // Add task and save
      plan.tasks.push(newTask);
      const saveResult = await this.saveWeeklyPlan({
        week: plan.week,
        tasks: plan.tasks,
      });

      if (!saveResult.success) {
        return { success: false, error: saveResult.error };
      }

      return { success: true, data: newTask };
    } catch (error) {
      return {
        success: false,
        error: `Failed to add task: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  async moveTask(
    taskId: string,
    newCategory: TaskCategory,
  ): Promise<Result<Task>> {
    try {
      // Get current week plan
      const currentWeek = this.getWeekString(new Date());
      const planResult = await this.getWeeklyPlan(currentWeek);

      if (!planResult.success || !planResult.data) {
        return {
          success: false,
          error: planResult.error || "No plan found for current week",
        };
      }

      const plan = planResult.data;
      const task = plan.tasks.find((t) => t.id === taskId);

      if (!task) {
        return { success: false, error: `Task ${taskId} not found` };
      }

      // Check priority limit if moving to priority
      if (newCategory === "priority" && task.category !== "priority") {
        const priorityCount = plan.tasks.filter(
          (t) => t.category === "priority",
        ).length;
        if (priorityCount >= MAX_WEEKLY_PRIORITIES) {
          return {
            success: false,
            error: `Maximum ${MAX_WEEKLY_PRIORITIES} priorities allowed. Move existing priority to parking lot or drop list first.`,
          };
        }
      }

      // Update task category
      task.category = newCategory;

      // Save updated plan
      const saveResult = await this.saveWeeklyPlan({
        week: plan.week,
        tasks: plan.tasks,
      });

      if (!saveResult.success) {
        return { success: false, error: saveResult.error };
      }

      return { success: true, data: task };
    } catch (error) {
      return {
        success: false,
        error: `Failed to move task: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  async deleteTask(taskId: string): Promise<Result<void>> {
    try {
      // Get current week plan
      const currentWeek = this.getWeekString(new Date());
      const planResult = await this.getWeeklyPlan(currentWeek);

      if (!planResult.success || !planResult.data) {
        return {
          success: false,
          error: planResult.error || "No plan found for current week",
        };
      }

      const plan = planResult.data;
      const filteredTasks = plan.tasks.filter((t) => t.id !== taskId);

      if (filteredTasks.length === plan.tasks.length) {
        return { success: false, error: `Task ${taskId} not found` };
      }

      // Save updated plan
      const saveResult = await this.saveWeeklyPlan({
        week: plan.week,
        tasks: filteredTasks,
      });

      if (!saveResult.success) {
        return { success: false, error: saveResult.error };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `Failed to delete task: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  async getTasksByCategory(category: TaskCategory): Promise<Result<Task[]>> {
    try {
      const planResult = await this.getCurrentWeekPlan();

      if (!planResult.success) {
        return { success: false, error: planResult.error };
      }

      const plan = planResult.data;
      if (!plan) {
        return { success: true, data: [] };
      }

      const tasks = plan.tasks.filter((t) => t.category === category);
      return { success: true, data: tasks };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get tasks by category: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  async getPriorityCount(): Promise<Result<number>> {
    try {
      const result = await this.getTasksByCategory("priority");

      if (!result.success || !result.data) {
        return { success: false, error: result.error };
      }

      return { success: true, data: result.data.length };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get priority count: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }
}

export const localStoragePlanning = new LocalStoragePlanningService();
