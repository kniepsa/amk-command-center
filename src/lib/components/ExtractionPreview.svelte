<script lang="ts">
	import { BRAND } from '$lib/brand';
	import type { ExtractEntryResponse } from '$lib/types';

	type Props = {
		extraction: ExtractEntryResponse['extracted'];
		onSave: () => void;
	};

	let { extraction, onSave }: Props = $props();

	// Simple energy labels
	function getEnergyLabel(energy: string): string {
		const labels: Record<string, string> = {
			high: 'High',
			medium: 'Medium',
			low: 'Low',
			drained: 'Drained'
		};
		return labels[energy] || 'Unknown';
	}
</script>

<div class="bg-glass-surface rounded-lg border border-white/10 p-8 h-full flex flex-col">
	<!-- Header -->
	<div class="mb-8">
		<h3 class="text-lg font-medium text-white">Extracted Data</h3>
		<p class="text-sm text-slate-400 mt-1">Review before saving</p>
	</div>

	<!-- Extracted Data -->
	<div class="flex-1 space-y-8 overflow-y-auto">
		<!-- Sleep -->
		{#if extraction.sleep}
			<div class="pb-6 border-b border-white/10">
				<h4 class="text-sm font-medium text-white mb-4">Sleep</h4>
				<div class="space-y-3 text-sm">
					<div class="flex items-center justify-between">
						<span class="text-slate-400">Bedtime</span>
						<span class="text-white">{extraction.sleep.bedtime}</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-slate-400">Wake</span>
						<span class="text-white">{extraction.sleep.wake_time}</span>
					</div>
					{#if extraction.sleep.duration}
						<div class="flex items-center justify-between">
							<span class="text-slate-400">Duration</span>
							<span class="text-white">{extraction.sleep.duration}h</span>
						</div>
					{/if}
					{#if extraction.sleep.quality}
						<div class="flex items-center justify-between">
							<span class="text-slate-400">Quality</span>
							<span class="text-white capitalize">{extraction.sleep.quality}</span>
						</div>
					{/if}
				</div>
			</div>
		{/if}

		<!-- Energy -->
		{#if extraction.energy}
			<div class="pb-6 border-b border-white/10">
				<h4 class="text-sm font-medium text-white mb-4">Energy</h4>
				<div class="text-white text-base">{getEnergyLabel(extraction.energy)}</div>
			</div>
		{/if}

		<!-- Intentions -->
		{#if extraction.intentions && extraction.intentions.length > 0}
			<div class="pb-6 border-b border-white/10">
				<h4 class="text-sm font-medium text-white mb-4">Intentions</h4>
				<ul class="space-y-3">
					{#each extraction.intentions as intention}
						<li class="text-sm text-slate-300">{intention}</li>
					{/each}
				</ul>
			</div>
		{/if}

		<!-- Habits -->
		{#if extraction.habits && Object.keys(extraction.habits).length > 0}
			<div class="pb-6">
				<h4 class="text-sm font-medium text-white mb-4">Habits Planned</h4>
				<div class="space-y-3">
					{#each Object.entries(extraction.habits) as [habit, completed]}
						<div class="flex items-center gap-3 text-sm">
							<div
								class="w-4 h-4 rounded border border-white/20 flex items-center justify-center {completed
									? 'bg-electric-500 border-electric-500'
									: ''}"
							>
								{#if completed}
									<span class="text-white text-xs">✓</span>
								{/if}
							</div>
							<span class="text-slate-300 capitalize">{habit.replace(/_/g, ' ')}</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		{#if !extraction.sleep && !extraction.energy && !extraction.intentions && !extraction.habits}
			<div class="text-center py-16">
				<p class="text-slate-400 text-sm">No data yet</p>
				<p class="text-slate-500 text-xs mt-2">Start talking to extract data</p>
			</div>
		{/if}
	</div>

	<!-- Save Button -->
	<div class="mt-8 pt-6 border-t border-white/10">
		<button
			onclick={onSave}
			class="w-full px-4 py-3 bg-electric-500 text-white rounded-lg hover:bg-electric-600 transition-colors font-medium"
		>
			Save Entry
		</button>
	</div>
</div>
