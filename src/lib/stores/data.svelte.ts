import type { Contact, Interaction } from "$lib/types";

/**
 * Reactive state using Svelte 5 runes
 * Data loaded from backend API, not localStorage
 * NOTE: This store is DEPRECATED - use SDK directly in components
 * Kept for backwards compatibility during migration
 */
export const dataStore = $state({
  contacts: [] as Contact[],
  interactions: [] as Interaction[],
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
