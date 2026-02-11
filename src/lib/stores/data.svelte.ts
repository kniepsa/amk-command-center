import type { Contact, Interaction } from "$lib/types";
import { INITIAL_CONTACTS, INITIAL_INTERACTIONS } from "$lib/data/initial-data";
import { STORAGE_KEYS } from "$lib/utils/constants";

/**
 * Type guards for runtime validation
 */
function isContactArray(value: unknown): value is Contact[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        "handle" in item &&
        "name" in item &&
        typeof item.handle === "string" &&
        typeof item.name === "string",
    )
  );
}

function isInteractionArray(value: unknown): value is Interaction[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        "id" in item &&
        "contact" in item &&
        "date" in item &&
        typeof item.id === "string" &&
        typeof item.contact === "string",
    )
  );
}

/**
 * Load initial data from localStorage (SSR-safe)
 */
function loadContacts(): Contact[] {
  if (typeof window === "undefined") return INITIAL_CONTACTS;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CONTACTS);
    if (!stored) return INITIAL_CONTACTS;

    const parsed = JSON.parse(stored);
    if (!isContactArray(parsed)) {
      console.warn("Invalid contacts in localStorage, using defaults");
      return INITIAL_CONTACTS;
    }

    return parsed;
  } catch (error) {
    console.error("Failed to load contacts:", error);
    return INITIAL_CONTACTS;
  }
}

function loadInteractions(): Interaction[] {
  if (typeof window === "undefined") return INITIAL_INTERACTIONS;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.INTERACTIONS);
    if (!stored) return INITIAL_INTERACTIONS;

    const parsed = JSON.parse(stored);
    if (!isInteractionArray(parsed)) {
      console.warn("Invalid interactions in localStorage, using defaults");
      return INITIAL_INTERACTIONS;
    }

    return parsed;
  } catch (error) {
    console.error("Failed to load interactions:", error);
    return INITIAL_INTERACTIONS;
  }
}

/**
 * Persisted reactive state using Svelte 5 runes + localStorage
 * Wrapped in an object to allow safe module-level export
 * Auto-saves handled by PersistenceManager component
 */
export const dataStore = $state({
  contacts: loadContacts(),
  interactions: loadInteractions(),
});

/**
 * Helper functions with explicit return types (best practice)
 */
export function addContact(contact: Contact): void {
  dataStore.contacts.push(contact);
}

export function updateContact(handle: string, updates: Partial<Contact>): void {
  const index = dataStore.contacts.findIndex((c) => c.handle === handle);
  if (index !== -1) {
    dataStore.contacts[index] = {
      ...dataStore.contacts[index],
      ...updates,
      updated: new Date().toISOString(),
    };
  }
}

export function deleteContact(handle: string): void {
  const index = dataStore.contacts.findIndex((c) => c.handle === handle);
  if (index !== -1) {
    dataStore.contacts.splice(index, 1);
  }
}

export function addInteraction(interaction: Interaction): void {
  dataStore.interactions.push(interaction);
}

export function deleteInteraction(id: string): void {
  const index = dataStore.interactions.findIndex((i) => i.id === id);
  if (index !== -1) {
    dataStore.interactions.splice(index, 1);
  }
}

/**
 * Get all interactions for a contact, sorted by date (newest first)
 */
export function getContactInteractions(handle: string): Interaction[] {
  return dataStore.interactions
    .filter((i) => i.contact === handle)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getDaysSinceLastContact(handle: string): number | null {
  const contactInteractions = getContactInteractions(handle);
  if (contactInteractions.length === 0) return null;

  const lastDate = new Date(contactInteractions[0].date);
  const today = new Date();
  return Math.floor(
    (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24),
  );
}
