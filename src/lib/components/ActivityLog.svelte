<script lang="ts">
	import { extractionHistory } from '$lib/stores/extraction-history.svelte';
	import type { ActivityLogEntry } from '$lib/types/extraction';

	let expandedEntries = $state<Set<string>>(new Set());

	// Reactive entries from store
	const entries = $derived(extractionHistory.entries);

	function toggleExpanded(id: string) {
		const newSet = new Set(expandedEntries);
		if (newSet.has(id)) {
			newSet.delete(id);
		} else {
			newSet.add(id);
		}
		expandedEntries = newSet;
	}

	function clearHistory() {
		if (confirm('Clear all extraction history? This cannot be undone.')) {
			extractionHistory.clear();
			expandedEntries = new Set();
		}
	}

	function formatRelativeTime(date: Date): string {
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffSec = Math.floor(diffMs / 1000);
		const diffMin = Math.floor(diffSec / 60);
		const diffHour = Math.floor(diffMin / 60);
		const diffDay = Math.floor(diffHour / 24);

		if (diffSec < 60) return 'just now';
		if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
		if (diffHour < 24) return `${diffHour} hour${diffHour === 1 ? '' : 's'} ago`;
		if (diffDay < 7) return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;

		// Fall back to date
		return date.toLocaleDateString();
	}

	function getConfidenceBadgeColor(level: ActivityLogEntry['confidenceLevel']): string {
		switch (level) {
			case 'high':
				return 'bg-green-100 text-green-700 border-green-200';
			case 'medium':
				return 'bg-yellow-100 text-yellow-700 border-yellow-200';
			case 'low':
				return 'bg-red-100 text-red-700 border-red-200';
		}
	}

	function getTypeIcon(type: ActivityLogEntry['type']): string {
		switch (type) {
			case 'voice':
				return '🎤';
			case 'text':
				return '💬';
			case 'morning-ritual':
				return '☀️';
			case 'manual':
				return '✍️';
		}
	}

	function formatExtractedData(data: any): string {
		if (!data) return '';

		const parts: string[] = [];

		if (data.sleep) {
			parts.push(
				`Sleep: ${data.sleep.bedtime || '?'} - ${data.sleep.wake_time || '?'} (${data.sleep.duration || '?'}h)`
			);
		}

		if (data.energy) {
			parts.push(`Energy: ${data.energy}`);
		}

		if (data.intentions && data.intentions.length > 0) {
			parts.push(`Intentions: ${data.intentions.join(', ')}`);
		}

		if (data.gratitude && data.gratitude.length > 0) {
			parts.push(`Gratitude: ${data.gratitude.map((g: any) => g.thing).join(', ')}`);
		}

		if (data.habits) {
			const completed = Object.entries(data.habits)
				.filter(([_, val]) => val === true)
				.map(([key]) => key);
			if (completed.length > 0) {
				parts.push(`Habits: ${completed.join(', ')}`);
			}
		}

		return parts.join('\n');
	}
</script>

<div class="bg-white rounded-lg border border-cloud-200">
	<!-- Header -->
	<div class="px-6 py-4 border-b border-cloud-200 flex items-center justify-between">
		<div>
			<h3 class="text-base font-medium text-cloud-800">Activity Log</h3>
			<p class="text-xs text-cloud-400 mt-1">AI extraction history for transparency</p>
		</div>
		{#if entries.length > 0}
			<button
				onclick={clearHistory}
				class="text-xs text-cloud-400 hover:text-cloud-600 transition-colors"
			>
				Clear All
			</button>
		{/if}
	</div>

	<!-- Timeline -->
	<div class="px-6 py-4">
		{#if entries.length === 0}
			<div class="text-center py-12">
				<p class="text-cloud-400 text-sm">No extractions yet</p>
				<p class="text-cloud-400 text-xs mt-2">Start chatting or use voice to see activity here</p>
			</div>
		{:else}
			<div class="space-y-4">
				{#each entries as entry (entry.id)}
					<div class="relative pl-8 pb-4 border-l-2 border-cloud-200 last:border-l-0">
						<!-- Timeline dot -->
						<div
							class="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-cloud-200 bg-white"
						></div>

						<!-- Entry content -->
						<button
							onclick={() => toggleExpanded(entry.id)}
							class="w-full text-left hover:bg-cloud-50 -ml-2 pl-2 pr-2 py-2 rounded-lg transition-colors"
						>
							<div class="flex items-start justify-between gap-4">
								<div class="flex-1 min-w-0">
									<!-- Header line -->
									<div class="flex items-center gap-2 mb-1">
										<span class="text-lg">{getTypeIcon(entry.type)}</span>
										<span class="text-sm font-medium text-cloud-800">{entry.summary}</span>
										<span
											class="px-2 py-0.5 text-xs font-medium rounded-full border {getConfidenceBadgeColor(
												entry.confidenceLevel
											)}"
										>
											{entry.confidence}%
										</span>
									</div>

									<!-- Fields extracted -->
									<div class="text-xs text-cloud-500">
										{entry.fields.length} field{entry.fields.length === 1 ? '' : 's'}: {entry.fields.join(
											', '
										)}
									</div>
								</div>

								<!-- Timestamp -->
								<div class="flex items-center gap-2 flex-shrink-0">
									<span class="text-xs text-cloud-400">{formatRelativeTime(entry.timestamp)}</span>
									<span class="text-cloud-300">
										{expandedEntries.has(entry.id) ? '▼' : '▶'}
									</span>
								</div>
							</div>
						</button>

						<!-- Expanded details -->
						{#if expandedEntries.has(entry.id)}
							<div class="mt-3 pl-2 pr-2">
								{#if entry.extractedData}
									<div class="bg-cloud-50 rounded-lg p-3 border border-cloud-200">
										<h4 class="text-xs font-medium text-cloud-600 mb-2">Extracted Data</h4>
										<pre
											class="text-xs text-cloud-600 whitespace-pre-wrap font-mono">{formatExtractedData(
												entry.extractedData
											)}</pre>
									</div>
								{:else}
									<p class="text-xs text-cloud-400 italic">No data details available</p>
								{/if}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
