/**
 * CRM Service
 * Exports the CRM API implementation (currently localStorage)
 *
 * To switch to a different backend (e.g., Supabase):
 * 1. Implement SupabaseCRMService in src/lib/api/implementations/supabase/crm.service.ts
 * 2. Change the import below from localStorageCRM to supabaseCRM
 * 3. No component changes required!
 */

import { localStorageCRM } from "$lib/api/implementations/localStorage/crm.service";

export const crmService = localStorageCRM;
