/**
 * Planning Service
 * Exports the Planning API implementation (currently localStorage)
 *
 * To switch to a different backend (e.g., Supabase):
 * 1. Implement SupabasePlanningService in src/lib/api/implementations/supabase/planning.service.ts
 * 2. Change the import below from localStoragePlanning to supabasePlanning
 * 3. No component changes required!
 */

import { localStoragePlanning } from "$lib/api/implementations/localStorage/planning.service";

export const planningService = localStoragePlanning;
