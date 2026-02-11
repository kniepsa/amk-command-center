<script lang="ts">
	import type { ExtractEntryResponse } from '$lib/types';

	type Props = {
		extraction: ExtractEntryResponse['extracted'];
		onSave: () => void;
	};

	let { extraction, onSave }: Props = $props();

	// Get energy emoji and color
	function getEnergyDisplay(energy: string) {
		switch (energy) {
			case 'high':
				return { emoji: '⚡', color: 'text-green-600', label: 'High' };
			case 'medium':
				return { emoji: '🔋', color: 'text-blue-600', label: 'Medium' };
			case 'low':
				return { emoji: '🪫', color: 'text-yellow-600', label: 'Low' };
			case 'drained':
				return { emoji: '😴', color: 'text-red-600', label: 'Drained' };
			default:
				return { emoji: '❓', color: 'text-slate-600', label: 'Unknown' };
		}
	}

	// Get sleep quality emoji
	function getSleepQualityEmoji(quality: string) {
		switch (quality) {
			case 'excellent':
				return '🌟';
			case 'good':
				return '😊';
			case 'fair':
				return '😐';
			case 'poor':
				return '😔';
			default:
				return '❓';
		}
	}
</script>

<div class="bg-white rounded-xl shadow-lg p-6 h-full flex flex-col">
	<!-- Header -->
	<div class="mb-6">
		<h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
			<span>📊</span>
			<span>Extracted Data</span>
		</h3>
		<p class="text-xs text-slate-600 mt-1">Preview before saving</p>
	</div>

	<!-- Extracted Data -->
	<div class="flex-1 space-y-6 overflow-y-auto">
		<!-- Sleep -->
		{#if extraction.sleep}
			<div class="pb-4 border-b border-slate-200">
				<h4 class="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
					<span>😴</span>
					<span>Sleep</span>
				</h4>
				<div class="space-y-2 text-sm">
					<div class="flex items-center justify-between">
						<span class="text-slate-600">Bedtime:</span>
						<span class="font-medium text-slate-900">{extraction.sleep.bedtime}</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-slate-600">Wake:</span>
						<span class="font-medium text-slate-900">{extraction.sleep.wake_time}</span>
					</div>
					{#if extraction.sleep.duration}
						<div class="flex items-center justify-between">
							<span class="text-slate-600">Duration:</span>
							<span class="font-medium text-slate-900">{extraction.sleep.duration}h</span>
						</div>
					{/if}
					{#if extraction.sleep.quality}
						<div class="flex items-center justify-between">
							<span class="text-slate-600">Quality:</span>
							<span class="font-medium text-slate-900 flex items-center gap-1">
								<span>{getSleepQualityEmoji(extraction.sleep.quality)}</span>
								<span class="capitalize">{extraction.sleep.quality}</span>
							</span>
						</div>
					{/if}
				</div>
			</div>
		{/if}

		<!-- Energy -->
		{#if extraction.energy}
			{@const energyDisplay = getEnergyDisplay(extraction.energy)}
			<div class="pb-4 border-b border-slate-200">
				<h4 class="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
					<span>{energyDisplay.emoji}</span>
					<span>Energy</span>
				</h4>
				<div class="px-4 py-2 bg-slate-50 rounded-lg">
					<span class="font-medium {energyDisplay.color} text-lg">{energyDisplay.label}</span>
				</div>
			</div>
		{/if}

		<!-- Intentions -->
		{#if extraction.intentions && extraction.intentions.length > 0}
			<div class="pb-4 border-b border-slate-200">
				<h4 class="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
					<span>🎯</span>
					<span>Intentions</span>
				</h4>
				<ul class="space-y-2">
					{#each extraction.intentions as intention}
						<li class="flex items-start gap-2 text-sm">
							<span class="text-blue-500 mt-0.5">•</span>
							<span class="text-slate-800">{intention}</span>
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		<!-- Habits -->
		{#if extraction.habits && Object.keys(extraction.habits).length > 0}
			<div class="pb-4">
				<h4 class="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
					<span>✅</span>
					<span>Habits Planned</span>
				</h4>
				<div class="space-y-2">
					{#each Object.entries(extraction.habits) as [habit, completed]}
						<div class="flex items-center gap-2 text-sm">
							<div
								class="w-5 h-5 rounded border-2 flex items-center justify-center {completed
									? 'bg-green-500 border-green-500'
									: 'border-slate-300'}"
							>
								{#if completed}
									<span class="text-white text-xs">✓</span>
								{/if}
							</div>
							<span class="text-slate-800 capitalize">{habit.replace(/_/g, ' ')}</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		{#if !extraction.sleep && !extraction.energy && !extraction.intentions && !extraction.habits}
			<div class="text-center py-12">
				<p class="text-slate-500 text-sm">No data extracted yet</p>
				<p class="text-slate-400 text-xs mt-1">Start chatting to see extracted data here</p>
			</div>
		{/if}
	</div>

	<!-- Save Button -->
	<div class="mt-6 pt-4 border-t border-slate-200">
		<button
			onclick={onSave}
			class="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center justify-center gap-2"
		>
			<span>💾</span>
			<span>Save to Journal</span>
		</button>
	</div>
</div>
