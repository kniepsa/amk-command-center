import type { Contact, Interaction } from "$lib/types";
import { INITIAL_CONTACTS, INITIAL_INTERACTIONS } from "$lib/data/initial-data";

// Svelte 5 stores using runes
export const contacts = $state<Contact[]>(INITIAL_CONTACTS);
export const interactions = $state<Interaction[]>(INITIAL_INTERACTIONS);

// Helper functions
export function addContact(contact: Contact) {
  contacts.push(contact);
}

export function updateContact(handle: string, updates: Partial<Contact>) {
  const index = contacts.findIndex((c) => c.handle === handle);
  if (index !== -1) {
    contacts[index] = {
      ...contacts[index],
      ...updates,
      updated: new Date().toISOString(),
    };
  }
}

export function deleteContact(handle: string) {
  const index = contacts.findIndex((c) => c.handle === handle);
  if (index !== -1) {
    contacts.splice(index, 1);
  }
}

export function addInteraction(interaction: Interaction) {
  interactions.push(interaction);
}

export function getContactInteractions(handle: string) {
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
