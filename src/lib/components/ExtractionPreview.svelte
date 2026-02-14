<script lang="ts">
	import { BRAND } from '$lib/brand';
	import type { ExtractEntryResponse } from '$lib/types';

	type Props = {
		extraction: ExtractEntryResponse['extracted'];
		onSave: () => void;
		onDataChange?: (data: any) => void;
	};

	let { extraction, onSave, onDataChange }: Props = $props();

	// Editable state
	let bedtime = $state(extraction.sleep?.bedtime || '22:00');
	let wakeTime = $state(extraction.sleep?.wake_time || '06:00');
	let sleepQuality = $state(extraction.sleep?.quality || 'good');
	let energy = $state(extraction.energy || 'medium');
	let intentions = $state<string[]>(extraction.intentions || []);

	// Calculate sleep duration
	const sleepDuration = $derived.by(() => {
		const bed = new Date(`2000-01-01T${bedtime}`);
		let wake = new Date(`2000-01-01T${wakeTime}`);
		if (wake < bed) wake = new Date(`2000-01-02T${wakeTime}`);
		const diff = wake.getTime() - bed.getTime();
		const hours = diff / (1000 * 60 * 60);
		return Number(hours.toFixed(1));
	});

	// Sync changes
	$effect(() => {
		if (onDataChange) {
			onDataChange({
				sleep: {
					bedtime,
					wake_time: wakeTime,
					duration: sleepDuration,
					quality: sleepQuality
				},
				energy,
				intentions
			});
		}
	});

	function addIntention() {
		intentions = [...intentions, ''];
	}

	function removeIntention(index: number) {
		intentions = intentions.filter((_, i) => i !== index);
	}
</script>

<div class="bg-white rounded-lg border border-cloud-200 p-6">
	<!-- Header -->
	<div class="mb-6">
		<h3 class="text-base font-medium text-cloud-600">Journal Entry</h3>
		<p class="text-xs text-cloud-400 mt-1">Filled automatically from chat • Click to edit</p>
	</div>

	<div class="space-y-6">
		<!-- Sleep -->
		{#if extraction.sleep}
			<div>
				<h4 class="text-xs font-medium text-cloud-400 mb-3">😴 Sleep</h4>
				<div class="space-y-3">
					<div class="grid grid-cols-2 gap-3">
						<div>
							<label class="text-xs text-cloud-400">Bedtime</label>
							<input
								type="time"
								bind:value={bedtime}
								class="mt-1 w-full px-3 py-2 bg-white border border-cloud-200 rounded-lg text-sm text-cloud-600 focus:outline-none focus:border-electric-500"
							/>
						</div>
						<div>
							<label class="text-xs text-cloud-400">Wake</label>
							<input
								type="time"
								bind:value={wakeTime}
								class="mt-1 w-full px-3 py-2 bg-white border border-cloud-200 rounded-lg text-sm text-cloud-600 focus:outline-none focus:border-electric-500"
							/>
						</div>
					</div>
					<div class="flex items-center justify-between text-xs text-cloud-500">
						<span>Duration: {sleepDuration}h</span>
						<select
							bind:value={sleepQuality}
							class="px-3 py-1.5 bg-white border border-cloud-200 rounded-lg text-sm text-cloud-600 focus:outline-none focus:border-electric-500"
						>
							<option value="excellent">Excellent</option>
							<option value="good">Good</option>
							<option value="fair">Fair</option>
							<option value="poor">Poor</option>
						</select>
					</div>
				</div>
			</div>
		{/if}

		<!-- Energy -->
		{#if extraction.energy}
			<div>
				<h4 class="text-xs font-medium text-cloud-400 mb-3">⚡ Energy</h4>
				<div class="grid grid-cols-4 gap-2">
					{#each ['high', 'medium', 'low', 'drained'] as level}
						<button
							onclick={() => (energy = level)}
							class="px-3 py-2 text-xs rounded-lg border transition-colors {energy === level
								? 'bg-electric-500 border-electric-500 text-white'
								: 'border-cloud-200 text-cloud-500 hover:border-cloud-300'}"
						>
							{level}
						</button>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Intentions -->
		{#if extraction.intentions && extraction.intentions.length > 0}
			<div>
				<div class="flex items-center justify-between mb-3">
					<h4 class="text-xs font-medium text-cloud-400">🎯 Intentions</h4>
					<button
						onclick={addIntention}
						class="text-xs text-electric-500 hover:text-electric-600"
					>
						+ Add
					</button>
				</div>
				<div class="space-y-2">
					{#each intentions as intention, index}
						<div class="flex items-center gap-2">
							<input
								type="text"
								bind:value={intentions[index]}
								placeholder="Intention..."
								class="flex-1 px-3 py-2 bg-white border border-cloud-200 rounded-lg text-sm text-cloud-600 focus:outline-none focus:border-electric-500"
							/>
							{#if intentions.length > 1}
								<button
									onclick={() => removeIntention(index)}
									class="text-cloud-400 hover:text-cloud-600 px-2"
								>
									×
								</button>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/if}

		{#if !extraction.sleep && !extraction.energy && !extraction.intentions}
			<div class="text-center py-12">
				<p class="text-cloud-400 text-sm">No data extracted yet</p>
				<p class="text-cloud-400 text-xs mt-2">Start recording to capture your entry</p>
			</div>
		{/if}
	</div>

	<!-- Save Button -->
	<div class="mt-8 pt-6 border-t border-cloud-200">
		<button
			onclick={onSave}
			class="w-full px-4 py-3 bg-electric-500 text-white rounded-lg hover:bg-electric-600 transition-colors font-medium"
		>
			Save Entry
		</button>
	</div>
</div>
