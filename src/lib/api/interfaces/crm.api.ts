/**
 * CRM API Interface
 * Domain-specific API for contact and interaction management
 *
 * This interface can be implemented by:
 * - LocalStorageCRMService (current)
 * - SupabaseCRMService (future)
 * - MockCRMService (testing)
 */

import type { Contact, Interaction } from "$lib/types";
import type { Result, QueryOptions } from "./storage.api";

export interface CRMAPI {
  // ===== Contacts =====

  /**
   * Get all contacts
   */
  getContacts(options?: QueryOptions): Promise<Result<Contact[]>>;

  /**
   * Get contact by handle
   */
  getContact(handle: string): Promise<Result<Contact | null>>;

  /**
   * Create new contact
   */
  createContact(
    contact: Omit<Contact, "created" | "updated">,
  ): Promise<Result<Contact>>;

  /**
   * Update existing contact
   */
  updateContact(
    handle: string,
    updates: Partial<Contact>,
  ): Promise<Result<Contact>>;

  /**
   * Delete contact
   */
  deleteContact(handle: string): Promise<Result<void>>;

  /**
   * Search contacts by query
   */
  searchContacts(query: string): Promise<Result<Contact[]>>;

  // ===== Interactions =====

  /**
   * Get all interactions
   */
  getInteractions(options?: QueryOptions): Promise<Result<Interaction[]>>;

  /**
   * Get interactions for a specific contact
   */
  getContactInteractions(handle: string): Promise<Result<Interaction[]>>;

  /**
   * Create new interaction
   */
  createInteraction(
    interaction: Omit<Interaction, "id" | "created">,
  ): Promise<Result<Interaction>>;

  /**
   * Delete interaction
   */
  deleteInteraction(id: string): Promise<Result<void>>;

  // ===== Analytics =====

  /**
   * Get days since last contact
   */
  getDaysSinceLastContact(handle: string): Promise<Result<number | null>>;

  /**
   * Get contacts needing follow-up (>30 days)
   */
  getContactsNeedingFollowUp(): Promise<Result<Contact[]>>;

  /**
   * Get interaction statistics
   */
  getStats(): Promise<
    Result<{
      totalContacts: number;
      totalInteractions: number;
      thisWeekInteractions: number;
      needsFollowUp: number;
    }>
  >;
}
