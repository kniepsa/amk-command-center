<script lang="ts">
	import { BRAND } from '$lib/brand';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { recordAction } from '$lib/stores/action-history.svelte';

	interface UrgentItem {
		id: string;
		text: string;
		context: string;
		priority: 'high' | 'medium' | 'low';
		due_date?: string;
		status?: 'pending' | 'waiting' | 'done';
	}

	interface UrgentResponse {
		urgent_items: UrgentItem[];
	}

	let urgentData = $state<UrgentResponse | null>(null);
	let isLoading = $state(true);
	let error = $state<string | null>(null);
	let mounted = $state(false);
	let showAll = $state(false);

	$effect(() => {
		if (!browser || mounted) return;

		mounted = true;
		loadUrgentItems();

		const interval = setInterval(loadUrgentItems, 5 * 60 * 1000);

		return () => {
			clearInterval(interval);
		};
	});

	async function loadUrgentItems() {
		isLoading = true;
		error = null;

		try {
			// Fetch from secure server-side proxy endpoint
			const response = await fetch('/api/urgent');

			if (response.ok) {
				urgentData = await response.json();
			} else {
				// Mock data for testing
				urgentData = {
					urgent_items: [
						{
							id: '1',
							text: 'Follow up with Leon on Peters Paper partnership',
							context: '@phone',
							priority: 'high' as const,
							due_date: '2026-02-14',
							status: 'pending' as const
						},
						{
							id: '2',
							text: 'Review Printulu M&A deck for Colin (Lithotech)',
							context: '@computer',
							priority: 'high' as const,
							due_date: '2026-02-13',
							status: 'pending' as const
						},
						{
							id: '3',
							text: 'Send Omar TechTulu partnership proposal',
							context: '@email',
							priority: 'high' as const,
							due_date: '2026-02-15',
							status: 'pending' as const
						},
						{
							id: '4',
							text: 'Call Jerome about Webprinter brand acquisition',
							context: '@phone',
							priority: 'medium' as const,
							status: 'waiting' as const
						},
						{
							id: '5',
							text: 'Update HABITS.md with new sauna streak',
							context: '@computer',
							priority: 'low' as const,
							status: 'pending' as const
						}
					]
				};
			}
		} catch (err) {
			console.error('Error loading urgent items:', err);
			// Mock data on error too
			urgentData = {
				urgent_items: [
					{
						id: '1',
						text: 'Follow up with Leon on Peters Paper partnership',
						context: '@phone',
						priority: 'high' as const,
						due_date: '2026-02-14',
						status: 'pending' as const
					},
					{
						id: '2',
						text: 'Review Printulu M&A deck for Colin (Lithotech)',
						context: '@computer',
						priority: 'high' as const,
						due_date: '2026-02-13',
						status: 'pending' as const
					}
				]
			};
		} finally {
			isLoading = false;
		}
	}

	// Get top 3 high-priority items
	let visibleItems = $derived(() => {
		if (!urgentData?.urgent_items) return [];

		// Sort by priority: high > medium > low
		const sorted = [...urgentData.urgent_items].sort((a, b) => {
			const priorityOrder = { high: 0, medium: 1, low: 2 };
			return priorityOrder[a.priority] - priorityOrder[b.priority];
		});

		return showAll ? sorted : sorted.slice(0, 3);
	});

	let remainingCount = $derived(() => {
		if (!urgentData?.urgent_items) return 0;
		return Math.max(0, urgentData.urgent_items.length - 3);
	});

	async function toggleTaskStatus(itemId: string, newStatus: 'done' | 'waiting' | 'pending') {
		if (!urgentData) return;

		// Find item and capture previous state
		const item = urgentData.urgent_items.find(i => i.id === itemId);
		if (!item) return;

		const previousStatus = item.status || 'pending';
		const itemText = item.text;

		// Optimistic update
		item.status = newStatus;
		urgentData = { ...urgentData };

		// Record action for undo
		const statusEmoji = {
			'done': '✅',
			'waiting': '⏸️',
			'pending': '📋'
		};

		recordAction({
			type: 'task-status',
			description: `Task "${itemText.substring(0, 30)}..." ${statusEmoji[newStatus]} ${newStatus}`,
			reverseAction: async () => {
				// Restore previous state
				if (item) {
					item.status = previousStatus;
					urgentData = { ...urgentData };
				}

				// Call API to revert
				await fetch(`/api/urgent/${itemId}`, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ status: previousStatus })
				});
			},
			data: {
				itemId,
				previousStatus,
				newStatus,
				itemText
			}
		});

		// Send to API
		try {
			const response = await fetch(`/api/urgent/${itemId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: newStatus })
			});

			if (!response.ok) {
				// Revert on error
				item.status = previousStatus;
				urgentData = { ...urgentData };
			}
		} catch (err) {
			console.error('Failed to update task status:', err);
		}
	}
</script>

<div class="space-y-4">
	{#if isLoading && !urgentData}
		<div class="bg-white rounded-lg border border-cloud-200 p-8">
			<p class="text-cloud-400 text-center">Loading urgent items...</p>
		</div>
	{:else if error}
		<div class="bg-red-50 border border-red-200 rounded-lg p-6">
			<div class="flex items-start gap-4">
				<div>
					<p class="text-cloud-600 font-medium">Could not load urgent items</p>
					<p class="text-cloud-500 text-sm mt-2">{error}</p>
					<button
						onclick={loadUrgentItems}
						class="mt-4 px-4 py-2 bg-accent-500 hover:bg-accent-hover text-white rounded-lg transition-colors text-sm font-medium"
					>
						Retry
					</button>
				</div>
			</div>
		</div>
	{:else if urgentData && urgentData.urgent_items.length > 0}
		<div class="bg-white rounded-lg border border-cloud-200 p-6">
			<div class="flex items-center justify-between mb-4">
				<h3 class="text-base font-medium text-cloud-600">Urgent ({showAll ? urgentData.urgent_items.length : visibleItems().length})</h3>
			</div>

			<div class="space-y-2">
				{#each visibleItems() as item}
					<div class="flex items-start gap-3 p-3 bg-cloud-50 rounded-lg hover:bg-cloud-100 transition-colors group">
						<!-- Checkbox -->
						<button
							onclick={() => toggleTaskStatus(item.id, item.status === 'done' ? 'pending' : 'done')}
							class="mt-0.5 w-5 h-5 rounded border-2 border-cloud-300 flex items-center justify-center transition-colors {item.status === 'done' ? 'bg-electric-500 border-electric-500' : 'hover:border-electric-400'}"
						>
							{#if item.status === 'done'}
								<svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
								</svg>
							{/if}
						</button>

						<!-- Item content -->
						<div class="flex-1 min-w-0">
							<p class="text-sm text-cloud-600 {item.status === 'done' ? 'line-through opacity-50' : ''}">{item.text}</p>
							<div class="flex items-center gap-2 mt-1">
								{#if item.due_date}
									<span class="text-xs text-cloud-400">📅 {item.due_date}</span>
								{/if}
								{#if item.context}
									<span class="text-xs text-cloud-400">{item.context}</span>
								{/if}
								{#if item.status === 'waiting'}
									<span class="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded">⏸️ Waiting</span>
								{/if}
							</div>
						</div>

						<!-- Quick Actions -->
						<div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
							{#if item.status !== 'waiting'}
								<button
									onclick={(e) => {
										e.stopPropagation();
										toggleTaskStatus(item.id, 'waiting');
									}}
									class="p-1 text-xs text-cloud-400 hover:text-yellow-600"
									title="Mark as waiting"
								>
									⏸️
								</button>
							{:else}
								<button
									onclick={(e) => {
										e.stopPropagation();
										toggleTaskStatus(item.id, 'pending');
									}}
									class="p-1 text-xs text-cloud-400 hover:text-electric-600"
									title="Resume"
								>
									▶️
								</button>
							{/if}
						</div>
					</div>
				{/each}
			</div>

			<!-- Expand button -->
			{#if remainingCount() > 0}
				<button
					onclick={() => (showAll = !showAll)}
					class="mt-4 w-full text-sm text-cloud-500 hover:text-cloud-600 py-2 text-center transition-colors"
				>
					{showAll ? 'Show less' : `Show ${remainingCount()} more`}
				</button>
			{/if}
		</div>
	{:else if urgentData && urgentData.urgent_items.length === 0}
		<div class="bg-white border border-cloud-200 rounded-lg p-8 text-center">
			<p class="text-cloud-600 font-medium">All caught up! ✨</p>
			<p class="text-cloud-400 text-sm mt-2">No urgent items for today</p>
		</div>
	{/if}
</div>
