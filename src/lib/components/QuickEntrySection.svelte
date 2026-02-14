<script lang="ts">
	import { BRAND } from '$lib/brand';
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
	// Use untrack to prevent reading extractedData from creating a dependency
	$effect(() => {
		// Build updated object from form fields only (not from extractedData)
		const updated: ExtractEntryResponse['extracted'] = {};

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
			<div class="space-y-8 mt-6">
				<!-- Sleep Quality -->
				<div>
					<h4 class="text-sm font-medium text-cloud-600 mb-4">Sleep Quality</h4>
					<div class="grid grid-cols-2 gap-4 mb-6">
						<Input type="time" bind:value={bedtime} label="Bedtime" fullWidth />
						<Input type="time" bind:value={wakeTime} label="Wake Time" fullWidth />
					</div>
					<div class="p-4 bg-cloud-50 rounded-lg mb-6 border border-cloud-200">
						<span class="text-sm text-cloud-500">Duration: {sleepDuration}h</span>
					</div>

					<!-- Sleep Quality Selector -->
					<div class="space-y-3">
						<span class="block text-sm text-cloud-400">Quality</span>
						<div class="flex gap-3">
							{#each ['excellent', 'good', 'fair', 'poor'] as quality}
								<button
									type="button"
									onclick={() => (sleepQuality = quality as SleepQuality)}
									class="flex-1 px-4 py-3 min-h-[44px] rounded-lg border transition-all {sleepQuality === quality
										? 'bg-electric-500 border-electric-500 text-white'
										: 'border-cloud-200 text-cloud-400 hover:border-cloud-300'}"
								>
									<span class="text-sm font-medium capitalize">{quality}</span>
								</button>
							{/each}
						</div>
					</div>

					<!-- Sleep Checkboxes -->
					<div class="mt-6 space-y-3">
						<label class="flex items-center gap-3 min-h-[44px] py-2 cursor-pointer">
							<input type="checkbox" bind:checked={blueBlockers} class="rounded w-5 h-5 border-cloud-200 bg-white" />
							<span class="text-sm text-cloud-500">Blue blockers used</span>
						</label>
						<label class="flex items-center gap-3 min-h-[44px] py-2 cursor-pointer">
							<input type="checkbox" bind:checked={screenCurfew} class="rounded w-5 h-5 border-cloud-200 bg-white" />
							<span class="text-sm text-cloud-500">Screen curfew followed</span>
						</label>
					</div>
				</div>

				<!-- Energy Level -->
				<div>
					<h4 class="text-sm font-medium text-cloud-600 mb-4">Energy Level</h4>
					<div class="grid grid-cols-4 gap-3">
						{#each ['high', 'medium', 'low', 'drained'] as level}
							<button
								type="button"
								onclick={() => (energy = level as EnergyLevel)}
								class="px-4 py-3 rounded-lg border transition-all {energy === level
									? 'bg-electric-500 border-electric-500 text-white'
									: 'border-cloud-200 text-cloud-400 hover:border-cloud-300'}"
							>
								<span class="text-sm font-medium capitalize">{level}</span>
							</button>
						{/each}
					</div>
				</div>

				<!-- Intentions -->
				<div>
					<h4 class="text-sm font-medium text-cloud-600 mb-4">Today's Intentions</h4>
					<div class="space-y-4">
						<Input bind:value={intention1} placeholder="First intention" fullWidth />
						<Input bind:value={intention2} placeholder="Second intention" fullWidth />
						<Input bind:value={intention3} placeholder="Third intention" fullWidth />
					</div>
				</div>
			</div>
		{/snippet}
	</CollapsibleSection>
{:else}
	<CollapsibleSection title="Evening Reflection" icon="🌙" isOpen={false}>
		{#snippet children()}
			<div class="space-y-8 mt-6">
				<!-- Gratitude -->
				<div>
					<h4 class="text-sm font-medium text-cloud-600 mb-4">Gratitude Journal</h4>
					<div class="space-y-4">
						{#each gratitudeItems as item, index}
							<div class="border border-cloud-200 rounded-lg p-5 bg-cloud-50">
								<div class="flex items-start justify-between mb-4">
									<span class="text-sm text-cloud-400">#{index + 1}</span>
									{#if gratitudeItems.length > 2}
										<button
											type="button"
											onclick={() => {
												if (confirm('Remove this gratitude entry?')) {
													removeGratitudeItem(index);
												}
											}}
											class="text-cloud-400 hover:text-cloud-600 text-sm px-3 py-2 min-h-[44px] rounded-lg hover:bg-cloud-100 transition-colors"
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
								<div class="mt-3">
									<Input bind:value={item.why} placeholder="Why? (optional)" fullWidth />
								</div>
							</div>
						{/each}
					</div>
					<Button variant="secondary" size="sm" onclick={addGratitudeItem} fullWidth>
						Add Another
					</Button>
				</div>

				<!-- Food Log -->
				<div>
					<h4 class="text-sm font-medium text-cloud-600 mb-4">Food Log</h4>
					<div class="space-y-4">
						{#if foodEntries.length > 0}
							{#each foodEntries as entry, index}
								<div
									class="flex items-center justify-between p-4 bg-cloud-50 rounded-lg border border-cloud-200"
								>
									<div class="flex items-center gap-4">
										<span class="text-sm text-cloud-400">{entry.time}</span>
										<span class="text-sm text-cloud-600">{entry.meal}</span>
									</div>
									<button
										type="button"
										onclick={() => {
											if (confirm('Remove this food entry?')) {
												removeFoodEntry(index);
											}
										}}
										class="text-cloud-400 hover:text-cloud-600 text-sm px-3 py-2 min-h-[44px] rounded-lg hover:bg-cloud-100 transition-colors"
									>
										Remove
									</button>
								</div>
							{/each}
						{:else}
							<p class="text-sm text-cloud-400 text-center py-6">No food entries yet</p>
						{/if}

						<!-- Add new entry -->
						<div class="flex gap-3">
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
