/**
 * Learning API Interface
 * Training program management (sales, vibe coding, storytelling, etc.)
 */

import type { Result } from "./storage.api";

export interface Lesson {
  id: string;
  day: number; // Day number in curriculum (1-30)
  title: string;
  content: string; // Markdown content
  duration: number; // Estimated minutes
  tags: string[];
  resources?: LessonResource[];
}

export interface LessonResource {
  type: "article" | "video" | "exercise" | "book" | "podcast";
  title: string;
  url?: string;
  notes?: string;
}

export interface Curriculum {
  id: string;
  slug: string; // e.g., 'sales-month-01', 'vibe-coding'
  title: string;
  description: string;
  duration: number; // Total days (usually 30)
  category: CurriculumCategory;
  lessons: Lesson[];
  created: string;
  updated: string;
}

export type CurriculumCategory =
  | "sales"
  | "capital-raising"
  | "public-speaking"
  | "vibe-coding"
  | "leadership"
  | "product"
  | "marketing";

export interface LearningProgress {
  id: string;
  userId: string;
  curriculumId: string;
  currentDay: number;
  completedLessons: number[]; // Array of lesson day numbers
  startDate: string; // ISO date when started
  lastActivityDate: string; // ISO date of last lesson completion
  notes: LessonNote[];
  streak: number; // Consecutive days
  status: "active" | "paused" | "completed";
  created: string;
  updated: string;
}

export interface LessonNote {
  lessonId: string;
  day: number;
  content: string;
  created: string;
}

export interface LearningStats {
  totalCurricula: number;
  activeCurricula: number;
  completedCurricula: number;
  currentStreak: number;
  bestStreak: number;
  totalLessonsCompleted: number;
  averageCompletionRate: number; // 0-100%
}

export interface LearningAPI {
  // ===== Curricula =====

  /**
   * Get all available curricula
   */
  getCurricula(category?: CurriculumCategory): Promise<Result<Curriculum[]>>;

  /**
   * Get curriculum by slug or ID
   */
  getCurriculum(slugOrId: string): Promise<Result<Curriculum | null>>;

  /**
   * Create new curriculum
   */
  createCurriculum(
    curriculum: Omit<Curriculum, "id" | "created" | "updated">,
  ): Promise<Result<Curriculum>>;

  /**
   * Update curriculum
   */
  updateCurriculum(
    id: string,
    updates: Partial<Curriculum>,
  ): Promise<Result<Curriculum>>;

  /**
   * Delete curriculum
   */
  deleteCurriculum(id: string): Promise<Result<void>>;

  // ===== Lessons =====

  /**
   * Get lesson by day number within curriculum
   */
  getLesson(curriculumId: string, day: number): Promise<Result<Lesson | null>>;

  /**
   * Get today's lesson for active curricula
   */
  getTodayLessons(): Promise<Result<Lesson[]>>;

  /**
   * Add lesson to curriculum
   */
  addLesson(
    curriculumId: string,
    lesson: Omit<Lesson, "id">,
  ): Promise<Result<Lesson>>;

  // ===== Progress Tracking =====

  /**
   * Get learning progress for specific curriculum
   */
  getProgress(curriculumId: string): Promise<Result<LearningProgress | null>>;

  /**
   * Get all active learning progress
   */
  getActiveProgress(): Promise<Result<LearningProgress[]>>;

  /**
   * Start new curriculum
   */
  startCurriculum(curriculumId: string): Promise<Result<LearningProgress>>;

  /**
   * Mark lesson as completed
   */
  completeLesson(
    curriculumId: string,
    day: number,
  ): Promise<Result<LearningProgress>>;

  /**
   * Add note to lesson
   */
  addLessonNote(
    curriculumId: string,
    lessonId: string,
    content: string,
  ): Promise<Result<LearningProgress>>;

  /**
   * Pause curriculum
   */
  pauseCurriculum(curriculumId: string): Promise<Result<LearningProgress>>;

  /**
   * Resume paused curriculum
   */
  resumeCurriculum(curriculumId: string): Promise<Result<LearningProgress>>;

  // ===== Analytics =====

  /**
   * Get learning statistics
   */
  getStats(): Promise<Result<LearningStats>>;

  /**
   * Get completion rate for curriculum
   */
  getCompletionRate(curriculumId: string): Promise<Result<number>>;

  /**
   * Get current learning streak
   */
  getStreak(): Promise<Result<{ current: number; best: number }>>;
}
