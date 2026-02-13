<script lang="ts">
	import { BRAND } from '$lib/brand';
	import { onMount } from 'svelte';
	import CollapsibleSection from './shared/CollapsibleSection.svelte';

	interface UrgentItem {
		calls: string[];
		deadlines: Array<{ file: string; text: string; date?: string }>;
		waiting: Array<{ text: string; since: string; days: number }>;
		reminders: Array<{ text: string; date: string }>;
		timestamp: string;
		summary: {
			calls_count: number;
			deadlines_count: number;
			waiting_count: number;
			reminders_count: number;
		};
	}

	let urgentData = $state<UrgentItem | null>(null);
	let isLoading = $state(true);
	let error = $state<string | null>(null);

	onMount(async () => {
		await loadUrgentItems();
		// Refresh every 5 minutes
		const interval = setInterval(loadUrgentItems, 5 * 60 * 1000);
		return () => clearInterval(interval);
	});

	async function loadUrgentItems() {
		isLoading = true;
		error = null;

		try {
			// Fetch from secure server-side proxy endpoint
			const response = await fetch('/api/urgent');

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.message || `API error: ${response.status}`);
			}

			urgentData = await response.json();
		} catch (err) {
			console.error('Error loading urgent items:', err);
			error = err instanceof Error ? err.message : 'Failed to load urgent items';
			urgentData = null;
		} finally {
			isLoading = false;
		}
	}

	function getDaysColor(days: number): string {
		if (days >= 7) return 'text-red-400 font-medium';
		if (days >= 3) return 'text-orange-400 font-medium';
		return 'text-slate-400';
	}
</script>

<div class="space-y-6">
	{#if isLoading && !urgentData}
		<div class="bg-midnight-900 rounded-lg border border-white/10 p-8">
			<p class="text-slate-400 text-center">Loading urgent items...</p>
		</div>
	{:else if error}
		<div class="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
			<div class="flex items-start gap-4">
				<div>
					<p class="text-white font-medium">Could not load urgent items</p>
					<p class="text-slate-300 text-sm mt-2">{error}</p>
					<p class="text-slate-400 text-sm mt-2">
						Make sure the Journal API server is running at http://localhost:3001
					</p>
					<button
						onclick={loadUrgentItems}
						class="mt-4 px-4 py-3 bg-electric-500 text-white rounded-lg hover:bg-electric-600 transition-colors text-sm font-medium"
					>
						Retry
					</button>
				</div>
			</div>
		</div>
	{:else if urgentData}
		<!-- Summary Card -->
		<div class="bg-midnight-900 rounded-lg border border-white/10 p-8">
			<h2 class="text-lg font-medium text-white mb-6">Today's Priorities</h2>
			<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
				<div class="bg-midnight-800/50 rounded-lg p-5 border border-white/5">
					<div class="text-2xl font-semibold text-white">{urgentData.summary.calls_count}</div>
					<div class="text-sm text-slate-400 mt-2">Calls Required</div>
				</div>
				<div class="bg-midnight-800/50 rounded-lg p-5 border border-white/5">
					<div class="text-2xl font-semibold text-white">{urgentData.summary.deadlines_count}</div>
					<div class="text-sm text-slate-400 mt-2">Deadlines (3d)</div>
				</div>
				<div class="bg-midnight-800/50 rounded-lg p-5 border border-white/5">
					<div class="text-2xl font-semibold text-white">{urgentData.summary.waiting_count}</div>
					<div class="text-sm text-slate-400 mt-2">Stale Items</div>
				</div>
				<div class="bg-midnight-800/50 rounded-lg p-5 border border-white/5">
					<div class="text-2xl font-semibold text-white">{urgentData.summary.reminders_count}</div>
					<div class="text-sm text-slate-400 mt-2">Reminders</div>
				</div>
			</div>
			<p class="text-sm text-slate-500 mt-6">
				Last updated: {new Date(urgentData.timestamp).toLocaleTimeString()}
			</p>
		</div>

		<!-- Calls Required -->
		{#if urgentData.calls.length > 0}
			<CollapsibleSection title="Calls Required" badge={urgentData.calls.length} defaultOpen>
				<div class="space-y-3">
					{#each urgentData.calls as call}
						<div class="flex items-start gap-4 p-4 bg-midnight-900/50 border border-white/5 rounded-lg">
							<p class="text-slate-300 flex-1">{call}</p>
						</div>
					{/each}
				</div>
			</CollapsibleSection>
		{/if}

		<!-- Deadlines -->
		{#if urgentData.deadlines.length > 0}
			<CollapsibleSection title="Deadlines (Next 3 Days)" badge={urgentData.deadlines.length}>
				<div class="space-y-3">
					{#each urgentData.deadlines as deadline}
						<div class="flex items-start gap-4 p-4 bg-midnight-900/50 border border-white/5 rounded-lg">
							<div class="flex-1">
								<p class="text-slate-300">{deadline.text}</p>
								{#if deadline.date}
									<p class="text-sm text-slate-400 mt-2">Due: {deadline.date}</p>
								{/if}
								<p class="text-xs text-slate-500 mt-1">From: {deadline.file}</p>
							</div>
						</div>
					{/each}
				</div>
			</CollapsibleSection>
		{/if}

		<!-- Waiting (Stale) -->
		{#if urgentData.waiting.length > 0}
			<CollapsibleSection
				title="Waiting (Stale >3 Days)"
				badge={urgentData.waiting.length}
			>
				<div class="space-y-3">
					{#each urgentData.waiting as item}
						<div
							class="flex items-start gap-4 p-4 bg-midnight-900/50 border border-white/5 rounded-lg"
						>
							<div class="flex-1">
								<p class="text-slate-300">{item.text}</p>
								<p class="text-sm {getDaysColor(item.days)} mt-2">
									Waiting for {item.days} days (since {item.since})
								</p>
							</div>
						</div>
					{/each}
				</div>
			</CollapsibleSection>
		{/if}

		<!-- Reminders -->
		{#if urgentData.reminders.length > 0}
			<CollapsibleSection title="Reminders (Today)" badge={urgentData.reminders.length}>
				<div class="space-y-3">
					{#each urgentData.reminders as reminder}
						<div class="flex items-start gap-4 p-4 bg-midnight-900/50 border border-white/5 rounded-lg">
							<p class="text-slate-300 flex-1">{reminder.text}</p>
						</div>
					{/each}
				</div>
			</CollapsibleSection>
		{/if}

		<!-- No urgent items -->
		{#if urgentData.summary.calls_count === 0 && urgentData.summary.deadlines_count === 0 && urgentData.summary.waiting_count === 0 && urgentData.summary.reminders_count === 0}
			<div class="bg-midnight-900/50 border border-white/5 rounded-lg p-8 text-center">
				<p class="text-white font-medium mt-2">All caught up</p>
				<p class="text-slate-400 text-sm mt-2">No urgent items for today</p>
			</div>
		{/if}
	{/if}
</div>
