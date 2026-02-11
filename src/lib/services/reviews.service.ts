/**
 * Reviews Service
 * Exports the Reviews API implementation (currently localStorage)
 *
 * To switch to a different backend (e.g., Supabase):
 * 1. Implement SupabaseReviewsService in src/lib/api/implementations/supabase/reviews.service.ts
 * 2. Change the import below from localStorageReviews to supabaseReviews
 * 3. No component changes required!
 */

import { localStorageReviews } from "$lib/api/implementations/localStorage/reviews.service";

export const reviewsService = localStorageReviews;
