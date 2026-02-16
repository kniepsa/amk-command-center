<script lang="ts">
	import ActivityLog from './ActivityLog.svelte';
	import DailyCoachChallenges from './DailyCoachChallenges.svelte';
	import { api } from '$lib/api/client';
	import { toast } from '$lib/stores/toast.svelte';
	import { browser } from '$app/environment';

	let mounted = $state(false);
	let energyPattern = $state<any[]>([]);
	let habitConsistency = $state<any[]>([]);
	let isLoadingEnergy = $state(true);
	let isLoadingHabits = $state(true);
	let showHabitConsistency = $state(false);

	$effect(() => {
		if (!browser || mounted) return;

		mounted = true;
		loadEnergyPattern();
		loadHabitConsistency();
	});

	async function loadEnergyPattern() {
		isLoadingEnergy = true;

		try {
			const result = await api.energy.getPattern();
			energyPattern = result.pattern || [];
		} catch (error) {
			console.error('Error loading energy pattern:', error);
			// Silent failure - use empty array
			energyPattern = [];
		} finally {
			isLoadingEnergy = false;
		}
	}

	async function loadHabitConsistency() {
		isLoadingHabits = true;

		try {
			const result = await api.habits.getStreaks();
			habitConsistency = result.habits || [];
		} catch (error) {
			console.error('Error loading habit consistency:', error);
			// Silent failure - use empty array
			habitConsistency = [];
		} finally {
			isLoadingHabits = false;
		}
	}

	function getEnergyColor(level: string): string {
		switch (level) {
			case 'high':
				return 'bg-green-500';
			case 'medium':
				return 'bg-yellow-500';
			case 'low':
				return 'bg-orange-500';
			case 'drained':
				return 'bg-red-500';
			default:
				return 'bg-cloud-300';
		}
	}

	function getEnergyHeight(level: string): string {
		switch (level) {
			case 'high':
				return 'h-32';
			case 'medium':
				return 'h-24';
			case 'low':
				return 'h-16';
			case 'drained':
				return 'h-8';
			default:
				return 'h-4';
		}
	}

	function startWeeklyReview() {
		toast.info('Weekly review flow coming soon!');
	}
</script>

<div class="insights-tab max-w-4xl mx-auto p-4 md:p-6">
	<div class="mb-6">
		<h2 class="text-2xl font-semibold text-cloud-600 mb-2">Insights</h2>
		<p class="text-sm text-cloud-400">Patterns, metrics & reflection</p>
	</div>

	<!-- Activity Log (Trust Through Transparency) - Hero Section -->
	<div class="mb-8">
		<h3 class="text-lg font-semibold text-cloud-600 mb-4">Recent Activity</h3>
		<ActivityLog />
	</div>

	<!-- 7-Day Energy Pattern -->
	<div class="bg-white rounded-lg border border-cloud-200 p-6 mb-8">
		<h3 class="text-lg font-semibold text-cloud-600 mb-4">Energy Pattern (7 Days)</h3>

		{#if isLoadingEnergy}
			<div class="text-center py-8">
				<p class="text-cloud-400">Loading energy data...</p>
			</div>
		{:else if energyPattern.length > 0}
			<div class="flex items-end justify-between gap-2 h-40">
				{#each energyPattern as day}
					<div class="flex-1 flex flex-col items-center gap-2">
						<div
							class="w-full {getEnergyHeight(day.level)} {getEnergyColor(
								day.level
							)} rounded-t transition-all"
							title={`${day.date}: ${day.level}`}
						></div>
						<p class="text-xs text-cloud-400">{day.dayOfWeek}</p>
					</div>
				{/each}
			</div>

			<!-- Legend -->
			<div class="flex flex-wrap gap-4 mt-6 justify-center">
				<div class="flex items-center gap-2">
					<div class="w-4 h-4 bg-green-500 rounded"></div>
					<span class="text-xs text-cloud-600">High</span>
				</div>
				<div class="flex items-center gap-2">
					<div class="w-4 h-4 bg-yellow-500 rounded"></div>
					<span class="text-xs text-cloud-600">Medium</span>
				</div>
				<div class="flex items-center gap-2">
					<div class="w-4 h-4 bg-orange-500 rounded"></div>
					<span class="text-xs text-cloud-600">Low</span>
				</div>
				<div class="flex items-center gap-2">
					<div class="w-4 h-4 bg-red-500 rounded"></div>
					<span class="text-xs text-cloud-600">Drained</span>
				</div>
			</div>
		{:else}
			<div class="text-center py-8 text-cloud-400">
				<p>No energy data yet. Track your energy in daily entries! 📊</p>
			</div>
		{/if}
	</div>

	<!-- Habit Consistency (Collapsible) -->
	<div class="border-t border-cloud-200 pt-6 mb-8">
		<button
			onclick={() => (showHabitConsistency = !showHabitConsistency)}
			class="w-full text-left flex items-center justify-between mb-4"
		>
			<h3 class="text-sm font-semibold text-cloud-400 uppercase">Habit Consistency (30 Days)</h3>
			<span class="text-cloud-400">{showHabitConsistency ? '▼' : '▶'}</span>
		</button>

		{#if showHabitConsistency}
			{#if isLoadingHabits}
				<div class="text-center py-8">
					<p class="text-cloud-400">Loading habit data...</p>
				</div>
			{:else if habitConsistency.length > 0}
				<div class="space-y-4">
					{#each habitConsistency as habit}
						<div class="bg-white rounded-lg border border-cloud-200 p-4">
							<div class="flex items-center justify-between mb-3">
								<p class="font-medium text-cloud-600">{habit.name}</p>
								<div class="text-sm text-cloud-400">
									<span class="font-semibold text-green-600">{habit.currentStreak}</span> day
									streak
								</div>
							</div>

							<!-- 30-day grid (4 weeks × 7 days) -->
							<div class="grid grid-cols-7 gap-1">
								{#each Array(30) as _, i}
									<div
										class="w-full aspect-square rounded-sm {habit.history && habit.history[i]
											? 'bg-green-500'
											: 'bg-cloud-200'}"
										title="Day {i + 1}"
									></div>
								{/each}
							</div>

							<!-- Stats -->
							<div class="mt-3 flex items-center gap-4 text-xs text-cloud-400">
								<span>
									Best: <span class="font-semibold text-cloud-600"
										>{habit.longestStreak} days</span
									>
								</span>
								{#if habit.completedToday}
									<span class="text-green-600 font-medium">✓ Completed today</span>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<div class="text-center py-8 bg-white rounded-lg border border-cloud-200">
					<p class="text-cloud-400">No habits tracked yet. Start in the Habits tab! 🎯</p>
				</div>
			{/if}
		{/if}
	</div>

	<!-- Coach Challenges -->
	<div class="mb-8">
		<h3 class="text-lg font-semibold text-cloud-600 mb-4">Today's Challenges</h3>
		<DailyCoachChallenges />
	</div>

	<!-- Weekly Review Call-to-Action -->
	<div class="border-t border-cloud-200 pt-6">
		<div class="bg-electric-50 border border-electric-200 rounded-lg p-6 text-center">
			<h3 class="text-lg font-semibold text-electric-700 mb-2">Weekly Review Time?</h3>
			<p class="text-sm text-electric-600 mb-4">
				Reflect on your week, adjust priorities, and plan ahead.
			</p>
			<button
				onclick={startWeeklyReview}
				class="px-6 py-3 bg-electric-600 text-white rounded-lg hover:bg-electric-700 transition-colors shadow-md"
			>
				Start Weekly Review →
			</button>
		</div>
	</div>
</div>
