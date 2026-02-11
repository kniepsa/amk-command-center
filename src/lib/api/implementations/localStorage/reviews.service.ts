/**
 * localStorage Implementation of ReviewsAPI
 * Morning and evening review management with analytics
 */

import type {
  MorningReview,
  EveningReview,
  ReviewsAPI,
} from "$lib/api/interfaces/reviews.api";
import type { Result } from "$lib/api/interfaces/storage.api";
import type { HabitData } from "$lib/types";
import { localStorageService } from "./storage.service";
import { STORAGE_KEYS } from "$lib/utils/constants";

class LocalStorageReviewsService implements ReviewsAPI {
  // ===== Morning Reviews =====

  async getMorningReview(date: string): Promise<Result<MorningReview | null>> {
    try {
      const reviews =
        (await localStorageService.get<MorningReview[]>(
          STORAGE_KEYS.MORNING_REVIEWS,
        )) || [];
      const review = reviews.find((r) => r.date === date) || null;
      return { success: true, data: review };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get morning review: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  async getMorningReviews(
    startDate?: string,
    endDate?: string,
  ): Promise<Result<MorningReview[]>> {
    try {
      let reviews =
        (await localStorageService.get<MorningReview[]>(
          STORAGE_KEYS.MORNING_REVIEWS,
        )) || [];

      // Filter by date range if provided
      if (startDate || endDate) {
        reviews = reviews.filter((r) => {
          const reviewDate = new Date(r.date);
          if (startDate && reviewDate < new Date(startDate)) return false;
          if (endDate && reviewDate > new Date(endDate)) return false;
          return true;
        });
      }

      // Sort by date descending
      reviews.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );

      return { success: true, data: reviews };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get morning reviews: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  async saveMorningReview(
    review: Omit<MorningReview, "id" | "created">,
  ): Promise<Result<MorningReview>> {
    try {
      const reviews =
        (await localStorageService.get<MorningReview[]>(
          STORAGE_KEYS.MORNING_REVIEWS,
        )) || [];

      // Check if review for this date already exists
      const existingIndex = reviews.findIndex((r) => r.date === review.date);

      const savedReview: MorningReview = {
        ...review,
        id:
          existingIndex >= 0 ? reviews[existingIndex].id : crypto.randomUUID(),
        created:
          existingIndex >= 0
            ? reviews[existingIndex].created
            : new Date().toISOString(),
      };

      if (existingIndex >= 0) {
        reviews[existingIndex] = savedReview;
      } else {
        reviews.push(savedReview);
      }

      await localStorageService.set(STORAGE_KEYS.MORNING_REVIEWS, reviews);
      return { success: true, data: savedReview };
    } catch (error) {
      return {
        success: false,
        error: `Failed to save morning review: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  async deleteMorningReview(id: string): Promise<Result<void>> {
    try {
      const reviews =
        (await localStorageService.get<MorningReview[]>(
          STORAGE_KEYS.MORNING_REVIEWS,
        )) || [];
      const filtered = reviews.filter((r) => r.id !== id);

      if (filtered.length === reviews.length) {
        return { success: false, error: `Morning review ${id} not found` };
      }

      await localStorageService.set(STORAGE_KEYS.MORNING_REVIEWS, filtered);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `Failed to delete morning review: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  // ===== Evening Reviews =====

  async getEveningReview(date: string): Promise<Result<EveningReview | null>> {
    try {
      const reviews =
        (await localStorageService.get<EveningReview[]>(
          STORAGE_KEYS.EVENING_REVIEWS,
        )) || [];
      const review = reviews.find((r) => r.date === date) || null;
      return { success: true, data: review };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get evening review: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  async getEveningReviews(
    startDate?: string,
    endDate?: string,
  ): Promise<Result<EveningReview[]>> {
    try {
      let reviews =
        (await localStorageService.get<EveningReview[]>(
          STORAGE_KEYS.EVENING_REVIEWS,
        )) || [];

      // Filter by date range if provided
      if (startDate || endDate) {
        reviews = reviews.filter((r) => {
          const reviewDate = new Date(r.date);
          if (startDate && reviewDate < new Date(startDate)) return false;
          if (endDate && reviewDate > new Date(endDate)) return false;
          return true;
        });
      }

      // Sort by date descending
      reviews.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );

      return { success: true, data: reviews };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get evening reviews: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  async saveEveningReview(
    review: Omit<EveningReview, "id" | "created">,
  ): Promise<Result<EveningReview>> {
    try {
      const reviews =
        (await localStorageService.get<EveningReview[]>(
          STORAGE_KEYS.EVENING_REVIEWS,
        )) || [];

      // Check if review for this date already exists
      const existingIndex = reviews.findIndex((r) => r.date === review.date);

      const savedReview: EveningReview = {
        ...review,
        id:
          existingIndex >= 0 ? reviews[existingIndex].id : crypto.randomUUID(),
        created:
          existingIndex >= 0
            ? reviews[existingIndex].created
            : new Date().toISOString(),
      };

      if (existingIndex >= 0) {
        reviews[existingIndex] = savedReview;
      } else {
        reviews.push(savedReview);
      }

      await localStorageService.set(STORAGE_KEYS.EVENING_REVIEWS, reviews);
      return { success: true, data: savedReview };
    } catch (error) {
      return {
        success: false,
        error: `Failed to save evening review: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  async deleteEveningReview(id: string): Promise<Result<void>> {
    try {
      const reviews =
        (await localStorageService.get<EveningReview[]>(
          STORAGE_KEYS.EVENING_REVIEWS,
        )) || [];
      const filtered = reviews.filter((r) => r.id !== id);

      if (filtered.length === reviews.length) {
        return { success: false, error: `Evening review ${id} not found` };
      }

      await localStorageService.set(STORAGE_KEYS.EVENING_REVIEWS, filtered);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `Failed to delete evening review: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  // ===== Analytics =====

  async getHabitStreak(
    habitKey: keyof HabitData,
  ): Promise<Result<{ current: number; best: number }>> {
    try {
      const reviewsResult = await this.getMorningReviews();
      if (!reviewsResult.success || !reviewsResult.data) {
        return { success: false, error: reviewsResult.error };
      }

      const reviews = reviewsResult.data;

      // Sort by date ascending for streak calculation
      const sortedReviews = [...reviews].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );

      let currentStreak = 0;
      let bestStreak = 0;
      let tempStreak = 0;

      for (const review of sortedReviews) {
        if (review.habits[habitKey]) {
          tempStreak++;
          bestStreak = Math.max(bestStreak, tempStreak);
        } else {
          tempStreak = 0;
        }
      }

      // Calculate current streak from most recent reviews
      const recentReviews = [...reviews].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );

      for (const review of recentReviews) {
        if (review.habits[habitKey]) {
          currentStreak++;
        } else {
          break;
        }
      }

      return {
        success: true,
        data: { current: currentStreak, best: bestStreak },
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to calculate habit streak: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  async getAverageSleep(
    startDate: string,
    endDate: string,
  ): Promise<Result<number>> {
    try {
      const reviewsResult = await this.getMorningReviews(startDate, endDate);
      if (!reviewsResult.success || !reviewsResult.data) {
        return { success: false, error: reviewsResult.error };
      }

      const reviews = reviewsResult.data;
      if (reviews.length === 0) {
        return { success: true, data: 0 };
      }

      const totalHours = reviews.reduce((sum, review) => {
        const hours = parseFloat(review.sleep.duration);
        return sum + (isNaN(hours) ? 0 : hours);
      }, 0);

      const average = totalHours / reviews.length;
      return { success: true, data: Math.round(average * 10) / 10 }; // Round to 1 decimal
    } catch (error) {
      return {
        success: false,
        error: `Failed to calculate average sleep: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  async getAverageEnergy(
    startDate: string,
    endDate: string,
  ): Promise<Result<number>> {
    try {
      const reviewsResult = await this.getMorningReviews(startDate, endDate);
      if (!reviewsResult.success || !reviewsResult.data) {
        return { success: false, error: reviewsResult.error };
      }

      const reviews = reviewsResult.data;
      if (reviews.length === 0) {
        return { success: true, data: 0 };
      }

      // Map energy levels to numeric values
      const energyMap = {
        drained: 1,
        low: 2,
        medium: 3,
        high: 4,
      };

      const totalEnergy = reviews.reduce((sum, review) => {
        return sum + (energyMap[review.energy] || 0);
      }, 0);

      const average = totalEnergy / reviews.length;
      return { success: true, data: Math.round(average * 10) / 10 }; // Round to 1 decimal
    } catch (error) {
      return {
        success: false,
        error: `Failed to calculate average energy: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }
}

export const localStorageReviews = new LocalStorageReviewsService();
