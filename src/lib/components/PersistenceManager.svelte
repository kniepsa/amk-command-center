<script lang="ts">
	/**
	 * PersistenceManager - Handles auto-save to localStorage
	 * Uses $effect to save dataStore changes to localStorage
	 * Must be mounted in a component to use $effect properly
	 */
	import { saveToLocalStorage } from '$lib/utils/persistence.svelte';
	import { STORAGE_KEYS } from '$lib/utils/constants';
	import { dataStore } from '$lib/stores/data.svelte';

	// Auto-save contacts to localStorage on changes
	$effect(() => {
		// Save contacts array to localStorage
		saveToLocalStorage(STORAGE_KEYS.CONTACTS, dataStore.contacts);
	});

	// Auto-save interactions to localStorage on changes
	$effect(() => {
		// Save interactions array to localStorage
		saveToLocalStorage(STORAGE_KEYS.INTERACTIONS, dataStore.interactions);
	});
</script>

<!-- This component has no visual output - it only handles persistence -->
