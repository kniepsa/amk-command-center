import type { Contact, Interaction } from "$lib/types";
import { INITIAL_CONTACTS, INITIAL_INTERACTIONS } from "$lib/data/initial-data";
import { createPersistedState } from "$lib/utils/persistence.svelte";
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
 * Persisted reactive state using Svelte 5 runes + localStorage
 * Auto-saves on changes, SSR-safe
 */
export const contacts = createPersistedState({
  key: STORAGE_KEYS.CONTACTS,
  defaultValue: INITIAL_CONTACTS,
  validate: isContactArray,
  onError: (error) => console.error("Contacts persistence error:", error),
});

export const interactions = createPersistedState({
  key: STORAGE_KEYS.INTERACTIONS,
  defaultValue: INITIAL_INTERACTIONS,
  validate: isInteractionArray,
  onError: (error) => console.error("Interactions persistence error:", error),
});

/**
 * Helper functions with explicit return types (best practice)
 */
export function addContact(contact: Contact): void {
  contacts.push(contact);
}

export function updateContact(handle: string, updates: Partial<Contact>): void {
  const index = contacts.findIndex((c) => c.handle === handle);
  if (index !== -1) {
    contacts[index] = {
      ...contacts[index],
      ...updates,
      updated: new Date().toISOString(),
    };
  }
}

export function deleteContact(handle: string): void {
  const index = contacts.findIndex((c) => c.handle === handle);
  if (index !== -1) {
    contacts.splice(index, 1);
  }
}

export function addInteraction(interaction: Interaction): void {
  interactions.push(interaction);
}

export function deleteInteraction(id: string): void {
  const index = interactions.findIndex((i) => i.id === id);
  if (index !== -1) {
    interactions.splice(index, 1);
  }
}

/**
 * Get all interactions for a contact, sorted by date (newest first)
 */
export function getContactInteractions(handle: string): Interaction[] {
  return interactions
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
