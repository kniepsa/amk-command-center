<script lang="ts">
	import HabitStreaks from './HabitStreaks.svelte';
	import { api } from '$lib/api/client';
	import { toast } from '$lib/stores/toast.svelte';
	import { recordAction } from '$lib/stores/action-history.svelte';
	import { browser } from '$app/environment';

	interface Habit {
		id: string;
		name: string;
		currentStreak: number;
		longestStreak: number;
		completedToday: boolean;
		lastCompleted: string | null;
		history: boolean[]; // Last 7 days
	}

	let habits = $state<Habit[]>([]);
	let isLoading = $state(true);
	let mounted = $state(false);
	let showMilestones = $state(false);

	$effect(() => {
		if (!browser || mounted) return;

		mounted = true;
		loadHabits();
	});

	async function loadHabits() {
		isLoading = true;

		try {
			const result = await api.habits.getStreaks();
			habits = result.habits.map((h: any) => ({
				id: h.id,
				name: h.name,
				currentStreak: h.currentStreak,
				longestStreak: h.longestStreak,
				completedToday: h.completedToday,
				lastCompleted: h.lastCompleted,
				history: h.history || Array(7).fill(false)
			}));
		} catch (error) {
			console.error('Error loading habits:', error);
			toast.error('Failed to load habits');
		} finally {
			isLoading = false;
		}
	}

	async function toggleHabit(habit: Habit) {
		const newState = !habit.completedToday;

		// Optimistic update
		const oldState = habit.completedToday;
		const oldStreak = habit.currentStreak;
		habit.completedToday = newState;
		if (newState) {
			habit.currentStreak += 1;
		}

		try {
			await api.habits.toggle(habit.id, newState);

			// Record action for undo
			recordAction({
				type: 'habit-toggle',
				description: `${newState ? 'Completed' : 'Uncompleted'} ${habit.name}`,
				reverseAction: async () => {
					await api.habits.toggle(habit.id, !newState);
					await loadHabits();
				},
				data: { habitId: habit.id, completed: newState }
			});

			// Success feedback
			if (newState) {
				toast.success(`✓ ${habit.name} completed!`);

				// Check for milestones
				if ([7, 30, 100, 365].includes(habit.currentStreak)) {
					setTimeout(() => {
						toast.success(`🎉 ${habit.currentStreak}-day streak milestone!`);
					}, 500);
				}
			}
		} catch (error) {
			// Revert optimistic update
			habit.completedToday = oldState;
			habit.currentStreak = oldStreak;
			toast.error('Failed to update habit');
		}
	}

	function getStreakColor(streak: number): string {
		if (streak >= 3) return 'text-green-600';
		if (streak >= 1) return 'text-yellow-600';
		return 'text-red-600';
	}
</script>

<div class="habits-tab max-w-4xl mx-auto p-4 md:p-6">
	<div class="mb-6">
		<h2 class="text-2xl font-semibold text-cloud-600 mb-2">Habits</h2>
		<p class="text-sm text-cloud-400">Build consistency, one day at a time</p>
	</div>

	{#if isLoading}
		<div class="text-center py-12">
			<p class="text-cloud-400">Loading habits...</p>
		</div>
	{:else}
		<!-- Today's Habits (Hero) -->
		<div class="bg-white rounded-lg border border-cloud-200 p-6 mb-6">
			<h3 class="text-lg font-semibold text-cloud-600 mb-4">Today's Habits</h3>

			<div class="space-y-3">
				{#each habits as habit}
					<button
						onclick={() => toggleHabit(habit)}
						class="w-full flex items-center justify-between p-4 hover:bg-cloud-50 rounded-lg transition-colors min-h-touch-comfortable"
					>
						<div class="flex items-center gap-4">
							<!-- Checkbox (48px touch target) -->
							<div
								class="w-12 h-12 rounded-full border-2 flex items-center justify-center {habit.completedToday ? 'bg-green-500 border-green-500' : 'border-cloud-300'}"
							>
								{#if habit.completedToday}
									<span class="text-white text-2xl">✓</span>
								{/if}
							</div>

							<div class="text-left">
								<p class="font-medium text-cloud-600">{habit.name}</p>
								<p class="text-sm text-cloud-400">
									<span class={getStreakColor(habit.currentStreak)}
										>{habit.currentStreak} day streak</span
									>
									{#if habit.longestStreak > habit.currentStreak}
										<span class="text-cloud-300 ml-2">(best: {habit.longestStreak})</span>
									{/if}
								</p>
							</div>
						</div>

						<!-- 7-day mini graph -->
						<div class="flex gap-1">
							{#each habit.history as completed}
								<div
									class="w-2 h-8 rounded-sm {completed ? 'bg-green-500' : 'bg-cloud-200'}"
								></div>
							{/each}
						</div>
					</button>
				{/each}
			</div>
		</div>

		<!-- Detailed Streaks -->
		<HabitStreaks />

		<!-- Milestones (collapsible) -->
		<div class="border-t border-cloud-200 pt-6 mt-6">
			<button
				onclick={() => (showMilestones = !showMilestones)}
				class="w-full text-left flex items-center justify-between mb-4"
			>
				<h3 class="text-sm font-semibold text-cloud-400 uppercase">Milestones</h3>
				<span class="text-cloud-400">{showMilestones ? '▼' : '▶'}</span>
			</button>

			{#if showMilestones}
				<div class="space-y-4">
					{#each habits as habit}
						{#if habit.currentStreak >= 7}
							<div class="bg-green-50 border border-green-200 rounded-lg p-4">
								<p class="font-medium text-green-700">
									🎉 {habit.name}: {habit.currentStreak}-day streak!
								</p>
								{#if habit.currentStreak < 30}
									<p class="text-sm text-green-600 mt-1">
										{30 - habit.currentStreak} days until 30-day milestone
									</p>
								{/if}
							</div>
						{/if}
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>
