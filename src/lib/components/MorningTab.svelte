<script lang="ts">
	import type { HabitData } from '$lib/types';
	import {
		SLEEP_QUALITY_COLORS,
		ENERGY_COLORS,
		type SleepQuality,
		type EnergyLevel
	} from '$lib/utils/constants';

	let bedtime = $state('22:00');
	let wakeTime = $state('06:00');
	let sleepQuality = $state<SleepQuality>('good');
	let blueBlockers = $state(false);
	let screenCurfew = $state(false);

	let energy = $state<EnergyLevel>('medium');

	let habits = $state({
		running: false,
		sauna: false,
		sales_learning: false,
		journaling: false,
		three_daily_happiness: false,
		vampire_shot: false,
		morning_electrolytes: false,
		supplements: false,
		plan_tomorrow: false,
		plan_next_week: false
	});

	let intention1 = $state('');
	let intention2 = $state('');
	let intention3 = $state('');

	const sleepDuration = $derived.by(() => {
		const bed = new Date(`2000-01-01T${bedtime}`);
		let wake = new Date(`2000-01-01T${wakeTime}`);
		if (wake < bed) wake = new Date(`2000-01-02T${wakeTime}`);
		const diff = wake.getTime() - bed.getTime();
		return (diff / (1000 * 60 * 60)).toFixed(1);
	});

	function saveReview() {
		const review = {
			date: new Date().toISOString().split('T')[0],
			sleep: {
				bedtime,
				wake_time: wakeTime,
				duration: sleepDuration,
				quality: sleepQuality,
				blue_blockers: blueBlockers,
				screen_curfew: screenCurfew
			},
			energy,
			habits,
			intentions: [intention1, intention2, intention3].filter((i) => i.trim() !== '')
		};
		console.log('Morning Review:', review);
		alert('Morning review saved! (Console logged for now)');
	}
</script>

<div class="bg-white rounded-xl shadow-lg p-8">
	<h2 class="text-2xl font-bold text-slate-900 mb-6">🌅 Morning Review</h2>
	<p class="text-slate-600 mb-6">Quick morning check-in to set your day</p>

	<div class="space-y-8">
		<!-- Sleep Quality Section -->
		<div class="border-b border-slate-200 pb-6">
			<h3 class="font-semibold text-slate-800 mb-4 flex items-center gap-2">
				<span>😴</span>
				<span>Sleep Quality</span>
			</h3>

			<div class="grid grid-cols-2 gap-4 mb-4">
				<div>
					<label for="bedtime" class="block text-sm font-medium text-slate-700 mb-1"
						>Bedtime</label
					>
					<input
						id="bedtime"
						type="time"
						bind:value={bedtime}
						class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					/>
				</div>
				<div>
					<label for="waketime" class="block text-sm font-medium text-slate-700 mb-1"
						>Wake Time</label
					>
					<input
						id="waketime"
						type="time"
						bind:value={wakeTime}
						class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					/>
				</div>
			</div>

			<div class="mb-4 p-3 bg-blue-50 rounded-lg">
				<span class="text-sm font-medium text-blue-900">Duration: {sleepDuration} hours</span>
			</div>

			<div class="mb-4">
				<label class="block text-sm font-medium text-slate-700 mb-2">Quality</label>
				<div class="grid grid-cols-4 gap-2">
					{#each [
						{ value: 'excellent' as const, label: '🌟 Excellent' },
						{ value: 'good' as const, label: '😊 Good' },
						{ value: 'fair' as const, label: '😐 Fair' },
						{ value: 'poor' as const, label: '😴 Poor' }
					] as option}
						<button
							type="button"
							onclick={() => (sleepQuality = option.value)}
							aria-pressed={sleepQuality === option.value}
							aria-label="Set sleep quality to {option.label}"
							class="px-3 py-2 rounded-lg border-2 transition-all {sleepQuality === option.value
								? SLEEP_QUALITY_COLORS[option.value]
								: 'border-slate-200 hover:border-slate-300'}"
						>
							<span class="text-sm font-medium">{option.label}</span>
						</button>
					{/each}
				</div>
			</div>

			<div class="flex gap-4">
				<label class="flex items-center gap-2 cursor-pointer">
					<input type="checkbox" bind:checked={blueBlockers} class="w-4 h-4 text-blue-600" />
					<span class="text-sm text-slate-700">Blue blockers used</span>
				</label>
				<label class="flex items-center gap-2 cursor-pointer">
					<input type="checkbox" bind:checked={screenCurfew} class="w-4 h-4 text-blue-600" />
					<span class="text-sm text-slate-700">Screen curfew (21:00)</span>
				</label>
			</div>
		</div>

		<!-- Energy Rating Section -->
		<div class="border-b border-slate-200 pb-6">
			<h3 class="font-semibold text-slate-800 mb-4 flex items-center gap-2">
				<span>⚡</span>
				<span>Energy Level</span>
			</h3>

			<div class="grid grid-cols-4 gap-2">
				{#each [
					{ value: 'high' as const, label: '🚀 High' },
					{ value: 'medium' as const, label: '⚡ Medium' },
					{ value: 'low' as const, label: '🔋 Low' },
					{ value: 'drained' as const, label: '🪫 Drained' }
				] as option}
					<button
						type="button"
						onclick={() => (energy = option.value)}
						aria-pressed={energy === option.value}
						aria-label="Set energy level to {option.label}"
						class="px-4 py-3 rounded-lg border-2 transition-all {energy === option.value
							? ENERGY_COLORS[option.value]
							: 'border-slate-200 hover:border-slate-300'}"
					>
						<span class="text-sm font-medium">{option.label}</span>
					</button>
				{/each}
			</div>
		</div>

		<!-- Habits Section -->
		<div class="border-b border-slate-200 pb-6">
			<h3 class="font-semibold text-slate-800 mb-4 flex items-center gap-2">
				<span>✅</span>
				<span>Today's Habits</span>
			</h3>

			<div class="grid grid-cols-2 gap-3">
				{#each [
					{ key: 'running', label: '🏃 Running', emoji: '🏃' },
					{ key: 'sauna', label: '🧖 Sauna', emoji: '🧖' },
					{ key: 'sales_learning', label: '📚 Sales Learning', emoji: '📚' },
					{ key: 'journaling', label: '📝 Journaling', emoji: '📝' },
					{ key: 'three_daily_happiness', label: '😊 Three Daily Happiness', emoji: '😊' },
					{ key: 'vampire_shot', label: '🩸 Vampire Shot', emoji: '🩸' },
					{ key: 'morning_electrolytes', label: '⚡ Morning Electrolytes', emoji: '⚡' },
					{ key: 'supplements', label: '💊 Supplements', emoji: '💊' },
					{ key: 'plan_tomorrow', label: '📋 Plan Tomorrow', emoji: '📋' },
					{ key: 'plan_next_week', label: '📅 Plan Next Week', emoji: '📅' }
				] as habit}
					<label
						class="flex items-center gap-3 px-4 py-3 rounded-lg border-2 cursor-pointer transition-all {habits[
							habit.key
						]
							? 'border-green-500 bg-green-50'
							: 'border-slate-200 hover:border-slate-300'}"
					>
						<input
							type="checkbox"
							bind:checked={habits[habit.key]}
							class="w-5 h-5 text-green-600"
						/>
						<span class="text-sm font-medium text-slate-700">{habit.label}</span>
					</label>
				{/each}
			</div>
		</div>

		<!-- Intentions Section -->
		<div class="pb-2">
			<h3 class="font-semibold text-slate-800 mb-4 flex items-center gap-2">
				<span>🎯</span>
				<span>Today's Intentions (2-3)</span>
			</h3>

			<div class="space-y-3">
				<div>
					<label for="intention1" class="block text-sm font-medium text-slate-700 mb-1"
						>Intention 1</label
					>
					<input
						id="intention1"
						type="text"
						bind:value={intention1}
						placeholder="What's your main focus today?"
						class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					/>
				</div>
				<div>
					<label for="intention2" class="block text-sm font-medium text-slate-700 mb-1"
						>Intention 2</label
					>
					<input
						id="intention2"
						type="text"
						bind:value={intention2}
						placeholder="Secondary priority"
						class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					/>
				</div>
				<div>
					<label for="intention3" class="block text-sm font-medium text-slate-700 mb-1"
						>Intention 3 (optional)</label
					>
					<input
						id="intention3"
						type="text"
						bind:value={intention3}
						placeholder="Third priority if needed"
						class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					/>
				</div>
			</div>
		</div>

		<!-- Save Button -->
		<div class="pt-4">
			<button
				type="button"
				onclick={saveReview}
				class="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
			>
				Save Morning Review
			</button>
		</div>
	</div>
</div>
