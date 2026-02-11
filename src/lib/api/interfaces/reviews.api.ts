/**
 * Reviews API Interface
 * Morning and Evening review management
 */

import type { Result } from "./storage.api";
import type { EnergyLevel, SleepQuality } from "$lib/utils/constants";
import type { HabitData, FoodEntry } from "$lib/types";

export interface MorningReview {
  id: string;
  date: string; // YYYY-MM-DD
  sleep: {
    bedtime: string; // HH:MM
    wakeTime: string; // HH:MM
    duration: string; // hours
    quality: SleepQuality;
    blueBlockers: boolean;
    screenCurfew: boolean;
  };
  energy: EnergyLevel;
  habits: HabitData;
  intentions: string[];
  created: string; // ISO timestamp
}

export interface EveningReview {
  id: string;
  date: string; // YYYY-MM-DD
  gratitude: Array<{ thing: string; why: string }>;
  food: FoodEntry[];
  tomorrowIntentions: string[];
  planTomorrowCompleted: boolean;
  created: string; // ISO timestamp
}

export interface ReviewsAPI {
  // ===== Morning Reviews =====

  /**
   * Get morning review for a specific date
   */
  getMorningReview(date: string): Promise<Result<MorningReview | null>>;

  /**
   * Get all morning reviews (with optional date range)
   */
  getMorningReviews(
    startDate?: string,
    endDate?: string,
  ): Promise<Result<MorningReview[]>>;

  /**
   * Create or update morning review
   */
  saveMorningReview(
    review: Omit<MorningReview, "id" | "created">,
  ): Promise<Result<MorningReview>>;

  /**
   * Delete morning review
   */
  deleteMorningReview(id: string): Promise<Result<void>>;

  // ===== Evening Reviews =====

  /**
   * Get evening review for a specific date
   */
  getEveningReview(date: string): Promise<Result<EveningReview | null>>;

  /**
   * Get all evening reviews (with optional date range)
   */
  getEveningReviews(
    startDate?: string,
    endDate?: string,
  ): Promise<Result<EveningReview[]>>;

  /**
   * Create or update evening review
   */
  saveEveningReview(
    review: Omit<EveningReview, "id" | "created">,
  ): Promise<Result<EveningReview>>;

  /**
   * Delete evening review
   */
  deleteEveningReview(id: string): Promise<Result<void>>;

  // ===== Analytics =====

  /**
   * Get habit streak for a specific habit
   */
  getHabitStreak(
    habitKey: keyof HabitData,
  ): Promise<Result<{ current: number; best: number }>>;

  /**
   * Get average sleep hours for date range
   */
  getAverageSleep(startDate: string, endDate: string): Promise<Result<number>>;

  /**
   * Get average energy for date range
   */
  getAverageEnergy(startDate: string, endDate: string): Promise<Result<number>>;
}
