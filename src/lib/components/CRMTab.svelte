<script lang="ts">
	import type { Contact } from '$lib/types';
	import {
		dataStore,
		getContactInteractions,
		getDaysSinceLastContact
	} from '$lib/stores/data.svelte';

	let searchQuery = $state('');
	let selectedTag = $state<string | null>(null);
	let showFollowUpOnly = $state(false);
	let selectedContact = $state<Contact | null>(null);

	// Compute all unique tags
	const allTags = $derived.by(() => {
		const tagSet = new Set<string>();
		dataStore.contacts.forEach((c) => c.tags.forEach((t) => tagSet.add(t)));
		return Array.from(tagSet).sort();
	});

	// Filter contacts
	const filteredContacts = $derived.by(() => {
		let filtered = dataStore.contacts;

		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(c) =>
					c.name.toLowerCase().includes(query) ||
					c.company?.toLowerCase().includes(query) ||
					c.tags.some((t) => t.toLowerCase().includes(query)) ||
					c.notes.toLowerCase().includes(query)
			);
		}

		if (selectedTag) {
			filtered = filtered.filter((c) => c.tags.includes(selectedTag));
		}

		if (showFollowUpOnly) {
			filtered = filtered.filter((c) => {
				const days = getDaysSinceLastContact(c.handle);
				return days === null || days > 30;
			});
		}

		return filtered.toSorted((a, b) => a.name.localeCompare(b.name));
	});
</script>

{#if selectedContact}
	<!-- Contact Detail View -->
	<div>
		<button
			onclick={() => (selectedContact = null)}
			class="mb-6 flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
		>
			← Back to contacts
		</button>

		<div class="bg-white rounded-xl shadow-lg p-8 mb-6">
			<div class="flex items-start justify-between mb-6">
				<div>
					<h1 class="text-3xl font-bold text-slate-900 mb-2">{selectedContact.name}</h1>
					{#if selectedContact.company}
						<p class="text-lg text-slate-600 mb-4">{selectedContact.company}</p>
					{/if}
					<div class="flex flex-wrap gap-2">
						{#each selectedContact.tags as tag}
							<span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
								{tag}
							</span>
						{/each}
					</div>
				</div>
				{#if getDaysSinceLastContact(selectedContact.handle) !== null}
					{@const daysSince = getDaysSinceLastContact(selectedContact.handle)}
					<div
						class="px-4 py-2 rounded-lg {daysSince > 30
							? 'bg-red-100 text-red-700'
							: 'bg-green-100 text-green-700'}"
					>
						<p class="text-sm font-medium">{daysSince} days since last contact</p>
					</div>
				{/if}
			</div>

			{#if selectedContact.notes}
				<div class="mb-6">
					<h3 class="text-sm font-semibold text-slate-700 mb-2">Notes</h3>
					<p class="text-slate-600 leading-relaxed">{selectedContact.notes}</p>
				</div>
			{/if}
		</div>

		<div class="bg-white rounded-xl shadow-lg p-8">
			<h2 class="text-2xl font-bold text-slate-900 mb-6">Interaction Timeline</h2>

			{#if getContactInteractions(selectedContact.handle).length === 0}
				<p class="text-slate-500 text-center py-8">No interactions recorded yet</p>
			{:else}
				{@const contactInteractions = getContactInteractions(selectedContact.handle)}
				<div class="space-y-4">
					{#each contactInteractions as interaction}
						<div
							class="border-l-4 border-blue-500 pl-6 py-4 hover:bg-slate-50 transition-colors rounded-r-lg"
						>
							<div class="flex items-center gap-3 mb-2">
								<span class="text-sm font-medium text-slate-600">{interaction.date}</span>
								<div class="flex gap-2">
									{#each interaction.tags as tag}
										<span class="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
											{tag}
										</span>
									{/each}
								</div>
							</div>
							<p class="text-slate-800 mb-2">{interaction.summary}</p>
							{#if interaction.next_action}
								<div class="flex items-start gap-2 mt-3 p-3 bg-amber-50 rounded-lg">
									<span class="text-amber-600 font-bold">⚠️</span>
									<div>
										<p class="text-sm font-medium text-amber-900 mb-1">Next Action</p>
										<p class="text-sm text-amber-800">{interaction.next_action}</p>
									</div>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
{:else}
	<!-- Contact List View -->
	<div>
		<div class="bg-white rounded-xl shadow-lg p-6 mb-6">
			<div class="flex flex-col md:flex-row gap-4 mb-6">
				<div class="flex-1 relative">
					<input
						type="text"
						placeholder="Search contacts, companies, tags..."
						bind:value={searchQuery}
						class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					/>
				</div>
				<button
					onclick={() => (showFollowUpOnly = !showFollowUpOnly)}
					class="px-6 py-3 rounded-lg font-medium transition-colors {showFollowUpOnly
						? 'bg-red-500 text-white hover:bg-red-600'
						: 'bg-slate-200 text-slate-700 hover:bg-slate-300'}"
				>
					{showFollowUpOnly ? 'Showing: Follow-up Needed' : 'Show: Follow-up Needed'}
				</button>
			</div>

			<div class="flex flex-wrap gap-2">
				<button
					onclick={() => (selectedTag = null)}
					class="px-4 py-2 rounded-lg font-medium transition-colors {!selectedTag
						? 'bg-blue-500 text-white'
						: 'bg-slate-100 text-slate-700 hover:bg-slate-200'}"
				>
					All ({dataStore.contacts.length})
				</button>
				{#each allTags as tag}
					{@const count = dataStore.contacts.filter((c) => c.tags.includes(tag)).length}
					<button
						onclick={() => (selectedTag = tag === selectedTag ? null : tag)}
						class="px-4 py-2 rounded-lg font-medium transition-colors {selectedTag === tag
							? 'bg-blue-500 text-white'
							: 'bg-slate-100 text-slate-700 hover:bg-slate-200'}"
					>
						{tag} ({count})
					</button>
				{/each}
			</div>
		</div>

		<div class="grid gap-4">
			{#each filteredContacts as contact}
				{@const daysSince = getDaysSinceLastContact(contact.handle)}
				{@const needsFollowUp = daysSince === null || daysSince > 30}

				<div
					onclick={() => (selectedContact = contact)}
					class="bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer p-6 border-l-4 border-blue-500"
				>
					<div class="flex items-start justify-between">
						<div class="flex-1">
							<div class="flex items-center gap-3 mb-2">
								<h3 class="text-xl font-bold text-slate-900">{contact.name}</h3>
								{#if needsFollowUp}
									<span class="text-red-500" title="Needs follow-up">⚠️</span>
								{/if}
							</div>
							{#if contact.company}
								<p class="text-slate-600 mb-3">{contact.company}</p>
							{/if}
							<div class="flex flex-wrap gap-2 mb-3">
								{#each contact.tags as tag}
									<span class="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
										{tag}
									</span>
								{/each}
							</div>
							<p class="text-slate-600 text-sm line-clamp-2">{contact.notes}</p>
						</div>
						<div class="flex items-center gap-3">
							{#if daysSince !== null}
								<div
									class="text-sm font-medium px-3 py-1 rounded {needsFollowUp
										? 'bg-red-100 text-red-700'
										: 'bg-green-100 text-green-700'}"
								>
									{daysSince}d ago
								</div>
							{/if}
							<span class="text-slate-400">→</span>
						</div>
					</div>
				</div>
			{/each}

			{#if filteredContacts.length === 0}
				<div class="bg-white rounded-xl shadow-md p-12 text-center">
					<p class="text-xl text-slate-600 mb-2">No contacts found</p>
					<p class="text-slate-500">Try adjusting your search or filters</p>
				</div>
			{/if}
		</div>
	</div>
{/if}
