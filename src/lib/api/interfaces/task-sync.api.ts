/**
 * Task Sync API Interface
 * Integration with external project management tools (Notion, Asana, Linear, etc.)
 *
 * VISION:
 * - User's personal tasks CAN BE UPDATED from Command Center
 * - Team tasks are READ-ONLY (team uses PM tools)
 * - Bi-directional sync for personal workspace
 * - One-way sync (read) for team workspaces
 */

import type { Result } from "./storage.api";
import type { Task as LocalTask } from "./planning.api";

export type PMToolType =
  | "notion"
  | "asana"
  | "linear"
  | "jira"
  | "todoist"
  | "clickup";

export type TaskSource =
  | "local"
  | "notion"
  | "asana"
  | "linear"
  | "jira"
  | "todoist"
  | "clickup";

export type SyncDirection = "bidirectional" | "read-only" | "write-only";

export interface ExternalTask {
  id: string; // External task ID
  externalId: string; // ID in external system
  source: TaskSource;
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string; // ISO date
  assignee?: string;
  workspace: WorkspaceConfig;
  url?: string; // Link to task in external system
  tags?: string[];
  created: string;
  updated: string;
  lastSynced: string;
}

export type TaskStatus =
  | "todo"
  | "in-progress"
  | "blocked"
  | "review"
  | "done"
  | "archived"
  | "braindump" // Command Center specific
  | "priority" // Command Center specific
  | "parking" // Command Center specific
  | "drop"; // Command Center specific

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface WorkspaceConfig {
  id: string;
  name: string;
  type: PMToolType;
  syncDirection: SyncDirection;
  isPersonal: boolean; // true = bidirectional allowed, false = read-only
  filters?: TaskFilter; // Which tasks to sync
  credentials?: {
    apiKey?: string;
    token?: string;
    workspaceId?: string;
  };
  lastSync?: string; // ISO timestamp
  enabled: boolean;
}

export interface TaskFilter {
  assignedToMe?: boolean;
  statuses?: TaskStatus[];
  tags?: string[];
  dateRange?: {
    start?: string;
    end?: string;
  };
}

export interface SyncResult {
  success: boolean;
  workspaceId: string;
  imported: number;
  updated: number;
  deleted: number;
  errors: SyncError[];
  timestamp: string;
}

export interface SyncError {
  taskId: string;
  message: string;
  type: "import" | "export" | "conflict";
}

export interface TaskMapping {
  localTaskId: string; // Command Center task ID
  externalTaskId: string; // External system task ID
  source: TaskSource;
  workspaceId: string;
  lastSynced: string;
  conflicts?: TaskConflict[];
}

export interface TaskConflict {
  field: string;
  localValue: unknown;
  externalValue: unknown;
  timestamp: string;
  resolved: boolean;
}

export interface TaskSyncAPI {
  // ===== Workspace Management =====

  /**
   * Get all configured workspaces
   */
  getWorkspaces(): Promise<Result<WorkspaceConfig[]>>;

  /**
   * Get workspace by ID
   */
  getWorkspace(id: string): Promise<Result<WorkspaceConfig | null>>;

  /**
   * Add new workspace integration
   */
  addWorkspace(
    workspace: Omit<WorkspaceConfig, "id" | "lastSync">,
  ): Promise<Result<WorkspaceConfig>>;

  /**
   * Update workspace configuration
   */
  updateWorkspace(
    id: string,
    updates: Partial<WorkspaceConfig>,
  ): Promise<Result<WorkspaceConfig>>;

  /**
   * Remove workspace integration
   */
  removeWorkspace(id: string): Promise<Result<void>>;

  /**
   * Test workspace connection (validates credentials)
   */
  testConnection(workspaceId: string): Promise<Result<boolean>>;

  // ===== Sync Operations =====

  /**
   * Sync tasks from all enabled workspaces
   */
  syncAll(): Promise<Result<SyncResult[]>>;

  /**
   * Sync tasks from specific workspace
   */
  syncWorkspace(workspaceId: string): Promise<Result<SyncResult>>;

  /**
   * Import tasks from external source (one-time)
   */
  importTasks(
    workspaceId: string,
    taskIds?: string[],
  ): Promise<Result<ExternalTask[]>>;

  /**
   * Export local task to external workspace (for bidirectional sync)
   */
  exportTask(
    localTaskId: string,
    workspaceId: string,
  ): Promise<Result<ExternalTask>>;

  /**
   * Stop syncing specific task
   */
  unsyncTask(localTaskId: string, workspaceId: string): Promise<Result<void>>;

  // ===== Task Retrieval =====

  /**
   * Get all synced external tasks
   */
  getExternalTasks(workspaceId?: string): Promise<Result<ExternalTask[]>>;

  /**
   * Get external task by ID
   */
  getExternalTask(
    externalId: string,
    source: TaskSource,
  ): Promise<Result<ExternalTask | null>>;

  /**
   * Get task mappings (local ↔ external)
   */
  getTaskMappings(localTaskId?: string): Promise<Result<TaskMapping[]>>;

  // ===== Conflict Resolution =====

  /**
   * Get unresolved conflicts
   */
  getConflicts(): Promise<Result<TaskConflict[]>>;

  /**
   * Resolve conflict (choose local or external version)
   */
  resolveConflict(
    conflictId: string,
    resolution: "local" | "external" | "merge",
  ): Promise<Result<void>>;

  // ===== Conversion Utilities =====

  /**
   * Convert external task to local task format
   */
  toLocalTask(externalTask: ExternalTask): Promise<Result<LocalTask>>;

  /**
   * Convert local task to external format
   */
  toExternalTask(
    localTask: LocalTask,
    targetSource: TaskSource,
  ): Promise<Result<ExternalTask>>;

  // ===== Analytics =====

  /**
   * Get sync statistics
   */
  getSyncStats(): Promise<
    Result<{
      totalWorkspaces: number;
      activeWorkspaces: number;
      totalSyncedTasks: number;
      lastSyncTime: string | null;
      conflictsCount: number;
    }>
  >;
}
