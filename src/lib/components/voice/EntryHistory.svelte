<script lang="ts">
	/**
	 * EntryHistory - Displays saved voice entries for today
	 *
	 * Features:
	 * - Collapsible list of today's entries
	 * - Shows time, preview, completeness %
	 * - Expand to see full transcription + extracted data
	 * - Delete individual entries
	 * - Progressive disclosure (collapsed by default)
	 */

	import type { ExtractedData } from '$lib/types';

	interface SavedEntry {
		id: string;
		timestamp: string;
		transcription: string;
		extractedData: ExtractedData;
		completeness: number;
	}

	interface Props {
		entries: SavedEntry[];
		onDelete?: (id: string) => void;
	}

	let { entries, onDelete }: Props = $props();

	// State
	let isExpanded = $state(false);
	let expandedEntryId = $state<string | null>(null);

	// Calculate completeness percentage
	function calculateCompleteness(data: ExtractedData): number {
		const fields = [
			'energy',
			'sleep',
			'habits',
			'intentions',
			'gratitude',
			'food',
			'people',
			'frameworks',
			'contexts'
		];

		let filled = 0;
		const total = fields.length;

		if (data.energy) filled++;
		if (data.sleep && Object.keys(data.sleep).length > 0) filled++;
		if (data.habits && Object.keys(data.habits).length > 0) filled++;
		if (data.intentions && data.intentions.length > 0) filled++;
		if (data.gratitude && data.gratitude.length > 0) filled++;
		if (data.food && data.food.length > 0) filled++;
		if (data.people && data.people.length > 0) filled++;
		if (data.frameworks && data.frameworks.length > 0) filled++;
		if (data.contexts && data.contexts.length > 0) filled++;

		return Math.round((filled / total) * 100);
	}

	// Get preview text (first 100 chars)
	function getPreview(text: string): string {
		return text.length > 100 ? text.substring(0, 100) + '...' : text;
	}

	// Format timestamp
	function formatTime(timestamp: string): string {
		const date = new Date(timestamp);
		return date.toLocaleTimeString('de-DE', {
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	// Toggle entry expansion
	function toggleEntry(entryId: string) {
		expandedEntryId = expandedEntryId === entryId ? null : entryId;
	}

	// Completeness color
	function getCompletenessColor(percentage: number): string {
		if (percentage >= 80) return 'text-green-600';
		if (percentage >= 50) return 'text-yellow-600';
		return 'text-red-600';
	}
</script>

{#if entries.length > 0}
	<div class="entry-history bg-white rounded-xl border border-slate-200 shadow-lg">
		<!-- Header -->
		<button
			onclick={() => (isExpanded = !isExpanded)}
			class="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors rounded-t-xl"
		>
			<div class="flex items-center gap-3">
				<span class="text-2xl">{isExpanded ? '📂' : '📁'}</span>
				<div class="text-left">
					<h3 class="font-semibold text-slate-800">Today's Entries</h3>
					<p class="text-sm text-slate-500">
						{entries.length} {entries.length === 1 ? 'entry' : 'entries'} saved
					</p>
				</div>
			</div>
			<span class="text-slate-400 text-xl">{isExpanded ? '▼' : '▶'}</span>
		</button>

		<!-- Entry List -->
		{#if isExpanded}
			<div class="border-t border-slate-200">
				{#each entries as entry, index (entry.id)}
					<div class="border-b border-slate-100 last:border-b-0">
						<!-- Entry Summary -->
						<button
							onclick={() => toggleEntry(entry.id)}
							class="w-full p-4 hover:bg-slate-50 transition-colors text-left"
						>
							<div class="flex items-start gap-4">
								<!-- Time Badge -->
								<div
									class="flex-shrink-0 w-16 h-16 bg-blue-100 rounded-lg flex flex-col items-center justify-center"
								>
									<span class="text-xs text-blue-600 font-semibold">Entry {index + 1}</span>
									<span class="text-sm font-mono text-blue-800">{formatTime(entry.timestamp)}</span>
								</div>

								<!-- Preview Content -->
								<div class="flex-1 min-w-0">
									<p class="text-sm text-slate-700 truncate mb-1">
										{getPreview(entry.transcription)}
									</p>
									<div class="flex items-center gap-3">
										<!-- Completeness Badge -->
										<span
											class="text-xs font-semibold {getCompletenessColor(entry.completeness)}"
										>
											{entry.completeness}% complete
										</span>
										<!-- Word Count -->
										<span class="text-xs text-slate-400">
											{entry.transcription.split(' ').length} words
										</span>
									</div>
								</div>

								<!-- Expand Icon -->
								<span class="text-slate-400 text-sm flex-shrink-0">
									{expandedEntryId === entry.id ? '▲' : '▼'}
								</span>
							</div>
						</button>

						<!-- Expanded Content -->
						{#if expandedEntryId === entry.id}
							<div class="px-4 pb-4 space-y-4 bg-slate-50">
								<!-- Full Transcription -->
								<div>
									<h4 class="text-xs font-semibold text-slate-600 uppercase mb-2">
										Transcription
									</h4>
									<div class="bg-white rounded-lg p-3 border border-slate-200">
										<p class="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
											{entry.transcription}
										</p>
									</div>
								</div>

								<!-- Extracted Data Summary -->
								<div>
									<h4 class="text-xs font-semibold text-slate-600 uppercase mb-2">
										Extracted Data
									</h4>
									<div class="grid grid-cols-2 gap-2 text-xs">
										{#if entry.extractedData.energy}
											<div class="bg-white rounded p-2 border border-slate-200">
												<span class="text-slate-500">Energy:</span>
												<span class="font-semibold text-slate-800 ml-1">
													{entry.extractedData.energy}
												</span>
											</div>
										{/if}

										{#if entry.extractedData.people && entry.extractedData.people.length > 0}
											<div class="bg-white rounded p-2 border border-slate-200">
												<span class="text-slate-500">People:</span>
												<span class="font-semibold text-slate-800 ml-1">
													{entry.extractedData.people.length}
												</span>
											</div>
										{/if}

										{#if entry.extractedData.food && entry.extractedData.food.length > 0}
											<div class="bg-white rounded p-2 border border-slate-200">
												<span class="text-slate-500">Meals:</span>
												<span class="font-semibold text-slate-800 ml-1">
													{entry.extractedData.food.length}
												</span>
											</div>
										{/if}

										{#if entry.extractedData.gratitude && entry.extractedData.gratitude.length > 0}
											<div class="bg-white rounded p-2 border border-slate-200">
												<span class="text-slate-500">Gratitude:</span>
												<span class="font-semibold text-slate-800 ml-1">
													{entry.extractedData.gratitude.length}
												</span>
											</div>
										{/if}
									</div>
								</div>

								<!-- Actions -->
								<div class="flex gap-2">
									{#if onDelete}
										<button
											onclick={() => onDelete && onDelete(entry.id)}
											class="px-3 py-1.5 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors font-medium"
										>
											🗑️ Delete Entry
										</button>
									{/if}
								</div>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>
{/if}
