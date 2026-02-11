<script lang="ts">
	import CollapsibleSection from './shared/CollapsibleSection.svelte';
	import Input from './shared/Input.svelte';
	import Button from './shared/Button.svelte';
	import type { ExtractEntryResponse } from '$lib/types';
	import {
		SLEEP_QUALITY_COLORS,
		ENERGY_COLORS,
		type SleepQuality,
		type EnergyLevel
	} from '$lib/utils/constants';

	type Props = {
		section: 'morning' | 'evening';
		extractedData: ExtractEntryResponse['extracted'];
		onDataChange: (data: ExtractEntryResponse['extracted']) => void;
	};

	let { section, extractedData = $bindable({}), onDataChange }: Props = $props();

	// Morning state
	let bedtime = $state(extractedData.sleep?.bedtime || '22:00');
	let wakeTime = $state(extractedData.sleep?.wake_time || '06:00');
	let sleepQuality = $state<SleepQuality>(
		(extractedData.sleep?.quality as SleepQuality) || 'good'
	);
	let blueBlockers = $state(extractedData.sleep?.blue_blockers || false);
	let screenCurfew = $state(extractedData.sleep?.screen_curfew || false);
	let energy = $state<EnergyLevel>((extractedData.energy as EnergyLevel) || 'medium');
	let intention1 = $state(extractedData.intentions?.[0] || '');
	let intention2 = $state(extractedData.intentions?.[1] || '');
	let intention3 = $state(extractedData.intentions?.[2] || '');

	// Evening state
	let gratitudeItems = $state<Array<{ thing: string; why: string }>>(
		extractedData.gratitude || [
			{ thing: '', why: '' },
			{ thing: '', why: '' }
		]
	);
	let foodEntries = $state<Array<{ time: string; meal: string }>>(extractedData.food || []);
	let newMeal = $state('');
	let newMealTime = $state('12:00');

	// Calculate sleep duration (as number)
	const sleepDuration = $derived.by(() => {
		const bed = new Date(`2000-01-01T${bedtime}`);
		let wake = new Date(`2000-01-01T${wakeTime}`);
		if (wake < bed) wake = new Date(`2000-01-02T${wakeTime}`);
		const diff = wake.getTime() - bed.getTime();
		const hours = diff / (1000 * 60 * 60);
		return Number(hours.toFixed(1));
	});

	// Sync changes to extracted data
	$effect(() => {
		const updated = { ...extractedData };

		if (section === 'morning') {
			updated.sleep = {
				bedtime,
				wake_time: wakeTime,
				duration: sleepDuration,
				quality: sleepQuality,
				blue_blockers: blueBlockers,
				screen_curfew: screenCurfew
			};
			updated.energy = energy;
			updated.intentions = [intention1, intention2, intention3].filter((i) => i.trim() !== '');
		} else {
			updated.gratitude = gratitudeItems.filter((item) => item.thing.trim() !== '');
			updated.food = foodEntries;
		}

		onDataChange(updated);
	});

	function addGratitudeItem() {
		gratitudeItems = [...gratitudeItems, { thing: '', why: '' }];
	}

	function removeGratitudeItem(index: number) {
		gratitudeItems = gratitudeItems.filter((_, i) => i !== index);
	}

	function addFoodEntry() {
		if (newMeal.trim() === '') return;
		foodEntries = [...foodEntries, { time: newMealTime, meal: newMeal }];
		newMeal = '';
		newMealTime = new Date().toTimeString().slice(0, 5);
	}

	function removeFoodEntry(index: number) {
		foodEntries = foodEntries.filter((_, i) => i !== index);
	}
</script>

{#if section === 'morning'}
	<CollapsibleSection title="Morning Entry" icon="🌅" isOpen={false}>
		{#snippet children()}
			<div class="space-y-6 mt-6">
				<!-- Sleep Quality -->
				<div>
					<h4 class="font-semibold text-slate-800 mb-3 flex items-center gap-2">
						<span>😴</span>
						<span>Sleep Quality</span>
					</h4>
					<div class="grid grid-cols-2 gap-4 mb-4">
						<Input type="time" bind:value={bedtime} label="Bedtime" fullWidth />
						<Input type="time" bind:value={wakeTime} label="Wake Time" fullWidth />
					</div>
					<div class="p-3 bg-blue-50 rounded-lg mb-4">
						<span class="text-sm font-medium text-blue-900">Sleep Duration: {sleepDuration}h</span>
					</div>

					<!-- Sleep Quality Selector -->
					<div class="space-y-2">
						<span class="block text-sm font-medium text-slate-700">Quality</span>
						<div class="flex gap-2">
							{#each ['excellent', 'good', 'fair', 'poor'] as quality}
								<button
									type="button"
									onclick={() => (sleepQuality = quality as SleepQuality)}
									class="flex-1 px-3 py-3 min-h-[44px] rounded-lg border-2 transition-all {sleepQuality === quality
										? SLEEP_QUALITY_COLORS[quality as SleepQuality]
										: 'border-slate-200 hover:border-slate-300'}"
								>
									<span class="text-sm font-medium capitalize">{quality}</span>
								</button>
							{/each}
						</div>
					</div>

					<!-- Sleep Checkboxes -->
					<div class="mt-4 space-y-2">
						<label class="flex items-center gap-2 min-h-[44px] py-2 cursor-pointer">
							<input type="checkbox" bind:checked={blueBlockers} class="rounded w-5 h-5" />
							<span class="text-sm text-slate-700">Blue blockers used</span>
						</label>
						<label class="flex items-center gap-2 min-h-[44px] py-2 cursor-pointer">
							<input type="checkbox" bind:checked={screenCurfew} class="rounded w-5 h-5" />
							<span class="text-sm text-slate-700">Screen curfew followed</span>
						</label>
					</div>
				</div>

				<!-- Energy Level -->
				<div>
					<h4 class="font-semibold text-slate-800 mb-3 flex items-center gap-2">
						<span>⚡</span>
						<span>Energy Level</span>
					</h4>
					<div class="grid grid-cols-4 gap-2">
						{#each ['high', 'medium', 'low', 'drained'] as level}
							<button
								type="button"
								onclick={() => (energy = level as EnergyLevel)}
								class="px-4 py-3 rounded-lg border-2 transition-all {energy === level
									? ENERGY_COLORS[level as EnergyLevel]
									: 'border-slate-200 hover:border-slate-300'}"
							>
								<span class="text-sm font-medium capitalize">{level}</span>
							</button>
						{/each}
					</div>
				</div>

				<!-- Intentions -->
				<div>
					<h4 class="font-semibold text-slate-800 mb-3 flex items-center gap-2">
						<span>🎯</span>
						<span>Today's Intentions</span>
					</h4>
					<div class="space-y-3">
						<Input bind:value={intention1} placeholder="Intention 1" fullWidth />
						<Input bind:value={intention2} placeholder="Intention 2" fullWidth />
						<Input bind:value={intention3} placeholder="Intention 3" fullWidth />
					</div>
				</div>
			</div>
		{/snippet}
	</CollapsibleSection>
{:else}
	<CollapsibleSection title="Evening Reflection" icon="🌙" isOpen={false}>
		{#snippet children()}
			<div class="space-y-6 mt-6">
				<!-- Gratitude -->
				<div>
					<h4 class="font-semibold text-slate-800 mb-3 flex items-center gap-2">
						<span>🙏</span>
						<span>Gratitude Journal</span>
					</h4>
					<div class="space-y-4">
						{#each gratitudeItems as item, index}
							<div class="border border-slate-200 rounded-lg p-4">
								<div class="flex items-start justify-between mb-3">
									<span class="text-sm font-medium text-slate-700">Grateful for #{index + 1}</span>
									{#if gratitudeItems.length > 2}
										<button
											type="button"
											onclick={() => {
												if (confirm('Remove this gratitude entry?')) {
													removeGratitudeItem(index);
												}
											}}
											class="text-red-500 hover:text-red-700 text-sm px-3 py-2 min-h-[44px] rounded hover:bg-red-50 transition-colors"
										>
											Remove
										</button>
									{/if}
								</div>
								<Input
									bind:value={item.thing}
									placeholder="What are you grateful for?"
									fullWidth
								/>
								<div class="mt-2">
									<Input bind:value={item.why} placeholder="Why? (optional)" fullWidth />
								</div>
							</div>
						{/each}
					</div>
					<Button variant="secondary" size="sm" onclick={addGratitudeItem} fullWidth>
						+ Add Another
					</Button>
				</div>

				<!-- Food Log -->
				<div>
					<h4 class="font-semibold text-slate-800 mb-3 flex items-center gap-2">
						<span>🍽️</span>
						<span>Food Log</span>
					</h4>
					<div class="space-y-3">
						{#if foodEntries.length > 0}
							{#each foodEntries as entry, index}
								<div
									class="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
								>
									<div class="flex items-center gap-3">
										<span class="text-sm font-medium text-slate-600">{entry.time}</span>
										<span class="text-sm text-slate-900">{entry.meal}</span>
									</div>
									<button
										type="button"
										onclick={() => {
											if (confirm('Remove this food entry?')) {
												removeFoodEntry(index);
											}
										}}
										class="text-red-500 hover:text-red-700 text-sm px-3 py-2 min-h-[44px] rounded hover:bg-red-50 transition-colors"
									>
										Remove
									</button>
								</div>
							{/each}
						{:else}
							<p class="text-sm text-slate-500 text-center py-4">No food entries yet</p>
						{/if}

						<!-- Add new entry -->
						<div class="flex gap-2">
							<Input type="time" bind:value={newMealTime} />
							<Input bind:value={newMeal} placeholder="What did you eat?" fullWidth />
							<Button variant="primary" size="md" onclick={addFoodEntry}>Add</Button>
						</div>
					</div>
				</div>
			</div>
		{/snippet}
	</CollapsibleSection>
{/if}
