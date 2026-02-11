/**
 * localStorage Implementation of CRMAPI
 * Contact and interaction management with localStorage persistence
 */

import type { Contact, Interaction } from "$lib/types";
import type { CRMAPI } from "$lib/api/interfaces/crm.api";
import type { Result, QueryOptions } from "$lib/api/interfaces/storage.api";
import { localStorageService } from "./storage.service";
import { STORAGE_KEYS, FOLLOW_UP_THRESHOLD_DAYS } from "$lib/utils/constants";

class LocalStorageCRMService implements CRMAPI {
  // ===== Contacts =====

  async getContacts(options?: QueryOptions): Promise<Result<Contact[]>> {
    try {
      let contacts =
        (await localStorageService.get<Contact[]>(STORAGE_KEYS.CONTACTS)) || [];

      // Apply filtering
      if (options?.filter) {
        contacts = contacts.filter((contact) => {
          return Object.entries(options.filter!).every(
            ([key, value]) => contact[key as keyof Contact] === value,
          );
        });
      }

      // Apply sorting
      if (options?.sort) {
        const { field, direction } = options.sort;
        contacts.sort((a, b) => {
          const aVal = a[field as keyof Contact];
          const bVal = b[field as keyof Contact];
          if (aVal < bVal) return direction === "asc" ? -1 : 1;
          if (aVal > bVal) return direction === "asc" ? 1 : -1;
          return 0;
        });
      }

      // Apply pagination
      if (options?.offset !== undefined || options?.limit !== undefined) {
        const start = options.offset || 0;
        const end = options.limit ? start + options.limit : undefined;
        contacts = contacts.slice(start, end);
      }

      return { success: true, data: contacts };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get contacts: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  async getContact(handle: string): Promise<Result<Contact | null>> {
    try {
      const contacts =
        (await localStorageService.get<Contact[]>(STORAGE_KEYS.CONTACTS)) || [];
      const contact = contacts.find((c) => c.handle === handle) || null;
      return { success: true, data: contact };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get contact: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  async createContact(
    contact: Omit<Contact, "created" | "updated">,
  ): Promise<Result<Contact>> {
    try {
      const contacts =
        (await localStorageService.get<Contact[]>(STORAGE_KEYS.CONTACTS)) || [];

      // Check if handle already exists
      if (contacts.some((c) => c.handle === contact.handle)) {
        return {
          success: false,
          error: `Contact with handle @${contact.handle} already exists`,
        };
      }

      const now = new Date().toISOString();
      const newContact: Contact = {
        ...contact,
        created: now,
        updated: now,
      };

      contacts.push(newContact);
      await localStorageService.set(STORAGE_KEYS.CONTACTS, contacts);

      return { success: true, data: newContact };
    } catch (error) {
      return {
        success: false,
        error: `Failed to create contact: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  async updateContact(
    handle: string,
    updates: Partial<Contact>,
  ): Promise<Result<Contact>> {
    try {
      const contacts =
        (await localStorageService.get<Contact[]>(STORAGE_KEYS.CONTACTS)) || [];
      const index = contacts.findIndex((c) => c.handle === handle);

      if (index === -1) {
        return { success: false, error: `Contact @${handle} not found` };
      }

      const updatedContact: Contact = {
        ...contacts[index],
        ...updates,
        handle: contacts[index].handle, // Prevent handle changes
        created: contacts[index].created, // Preserve created date
        updated: new Date().toISOString(),
      };

      contacts[index] = updatedContact;
      await localStorageService.set(STORAGE_KEYS.CONTACTS, contacts);

      return { success: true, data: updatedContact };
    } catch (error) {
      return {
        success: false,
        error: `Failed to update contact: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  async deleteContact(handle: string): Promise<Result<void>> {
    try {
      const contacts =
        (await localStorageService.get<Contact[]>(STORAGE_KEYS.CONTACTS)) || [];
      const filtered = contacts.filter((c) => c.handle !== handle);

      if (filtered.length === contacts.length) {
        return { success: false, error: `Contact @${handle} not found` };
      }

      await localStorageService.set(STORAGE_KEYS.CONTACTS, filtered);

      // Also delete associated interactions
      const interactions =
        (await localStorageService.get<Interaction[]>(
          STORAGE_KEYS.INTERACTIONS,
        )) || [];
      const filteredInteractions = interactions.filter(
        (i) => i.contact !== handle,
      );
      await localStorageService.set(
        STORAGE_KEYS.INTERACTIONS,
        filteredInteractions,
      );

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `Failed to delete contact: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  async searchContacts(query: string): Promise<Result<Contact[]>> {
    try {
      const contacts =
        (await localStorageService.get<Contact[]>(STORAGE_KEYS.CONTACTS)) || [];
      const lowerQuery = query.toLowerCase();

      const filtered = contacts.filter(
        (contact) =>
          contact.name.toLowerCase().includes(lowerQuery) ||
          contact.handle.toLowerCase().includes(lowerQuery) ||
          contact.email?.toLowerCase().includes(lowerQuery) ||
          contact.company?.toLowerCase().includes(lowerQuery) ||
          contact.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)),
      );

      return { success: true, data: filtered };
    } catch (error) {
      return {
        success: false,
        error: `Failed to search contacts: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  // ===== Interactions =====

  async getInteractions(
    options?: QueryOptions,
  ): Promise<Result<Interaction[]>> {
    try {
      let interactions =
        (await localStorageService.get<Interaction[]>(
          STORAGE_KEYS.INTERACTIONS,
        )) || [];

      // Apply filtering
      if (options?.filter) {
        interactions = interactions.filter((interaction) => {
          return Object.entries(options.filter!).every(
            ([key, value]) => interaction[key as keyof Interaction] === value,
          );
        });
      }

      // Apply sorting (default: newest first)
      if (options?.sort) {
        const { field, direction } = options.sort;
        interactions.sort((a, b) => {
          const aVal = a[field as keyof Interaction];
          const bVal = b[field as keyof Interaction];
          if (aVal < bVal) return direction === "asc" ? -1 : 1;
          if (aVal > bVal) return direction === "asc" ? 1 : -1;
          return 0;
        });
      } else {
        // Default sort by date descending
        interactions.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
      }

      // Apply pagination
      if (options?.offset !== undefined || options?.limit !== undefined) {
        const start = options.offset || 0;
        const end = options.limit ? start + options.limit : undefined;
        interactions = interactions.slice(start, end);
      }

      return { success: true, data: interactions };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get interactions: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  async getContactInteractions(handle: string): Promise<Result<Interaction[]>> {
    try {
      const interactions =
        (await localStorageService.get<Interaction[]>(
          STORAGE_KEYS.INTERACTIONS,
        )) || [];
      const filtered = interactions
        .filter((i) => i.contact === handle)
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );

      return { success: true, data: filtered };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get contact interactions: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  async createInteraction(
    interaction: Omit<Interaction, "id" | "created">,
  ): Promise<Result<Interaction>> {
    try {
      const interactions =
        (await localStorageService.get<Interaction[]>(
          STORAGE_KEYS.INTERACTIONS,
        )) || [];

      const newInteraction: Interaction = {
        ...interaction,
        id: crypto.randomUUID(),
        created: new Date().toISOString(),
      };

      interactions.push(newInteraction);
      await localStorageService.set(STORAGE_KEYS.INTERACTIONS, interactions);

      return { success: true, data: newInteraction };
    } catch (error) {
      return {
        success: false,
        error: `Failed to create interaction: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  async deleteInteraction(id: string): Promise<Result<void>> {
    try {
      const interactions =
        (await localStorageService.get<Interaction[]>(
          STORAGE_KEYS.INTERACTIONS,
        )) || [];
      const filtered = interactions.filter((i) => i.id !== id);

      if (filtered.length === interactions.length) {
        return { success: false, error: `Interaction ${id} not found` };
      }

      await localStorageService.set(STORAGE_KEYS.INTERACTIONS, filtered);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `Failed to delete interaction: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  // ===== Analytics =====

  async getDaysSinceLastContact(
    handle: string,
  ): Promise<Result<number | null>> {
    try {
      const result = await this.getContactInteractions(handle);
      if (!result.success || !result.data) {
        return { success: false, error: result.error };
      }

      const interactions = result.data;
      if (interactions.length === 0) {
        return { success: true, data: null };
      }

      const lastInteraction = interactions[0]; // Already sorted newest first
      const lastDate = new Date(lastInteraction.date);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return { success: true, data: diffDays };
    } catch (error) {
      return {
        success: false,
        error: `Failed to calculate days since last contact: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  async getContactsNeedingFollowUp(): Promise<Result<Contact[]>> {
    try {
      const contactsResult = await this.getContacts();
      if (!contactsResult.success || !contactsResult.data) {
        return { success: false, error: contactsResult.error };
      }

      const needsFollowUp: Contact[] = [];

      for (const contact of contactsResult.data) {
        const daysResult = await this.getDaysSinceLastContact(contact.handle);
        if (daysResult.success) {
          const days = daysResult.data;
          if (days === null || days > FOLLOW_UP_THRESHOLD_DAYS) {
            needsFollowUp.push(contact);
          }
        }
      }

      return { success: true, data: needsFollowUp };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get contacts needing follow-up: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  async getStats(): Promise<
    Result<{
      totalContacts: number;
      totalInteractions: number;
      thisWeekInteractions: number;
      needsFollowUp: number;
    }>
  > {
    try {
      const contactsResult = await this.getContacts();
      const interactionsResult = await this.getInteractions();
      const followUpResult = await this.getContactsNeedingFollowUp();

      if (
        !contactsResult.success ||
        !interactionsResult.success ||
        !followUpResult.success
      ) {
        return {
          success: false,
          error: "Failed to calculate stats",
        };
      }

      const interactions = interactionsResult.data || [];
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const thisWeekInteractions = interactions.filter((i) => {
        const iDate = new Date(i.date);
        return iDate >= weekAgo;
      }).length;

      return {
        success: true,
        data: {
          totalContacts: contactsResult.data?.length || 0,
          totalInteractions: interactions.length,
          thisWeekInteractions,
          needsFollowUp: followUpResult.data?.length || 0,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get stats: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }
}

export const localStorageCRM = new LocalStorageCRMService();
