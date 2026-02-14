<script lang="ts">
	import { browser } from '$app/environment';
	import { recordAction } from '$lib/stores/action-history.svelte';

	interface HabitStreak {
		id: string;
		name: string;
		icon: string;
		current_streak: number;
		best_streak: number;
		completed_today: boolean;
		description?: string;
		frequency?: string; // "Daily" | "3-5x/week" | "Weekly"
	}

	let streaks = $state<HabitStreak[]>([]);
	let isLoading = $state(true);
	let mounted = $state(false);
	let hoveredHabit = $state<string | null>(null);

	$effect(() => {
		if (!browser || mounted) return;

		mounted = true;
		loadStreaks();
	});

	async function loadStreaks() {
		isLoading = true;
		try {
			const response = await fetch('/api/habits/streaks');

			if (response.ok) {
				const data = await response.json();
				streaks = data.streaks || [];
			} else {
				// Mock data - All AMK habits from HABITS.md
				streaks = [
					// Daily Non-Negotiable
					{
						id: 'journaling',
						name: 'Journaling',
						icon: '📝',
						description: 'Daily entry - system requires data',
						frequency: 'Daily',
						current_streak: 44, // Every day of 2026 so far (Feb 13 = day 44)
						best_streak: 44,
						completed_today: true
					},
					{
						id: 'three_daily_happiness',
						name: '3 Good Things',
						icon: '🙏',
						description: 'Gratitude - 3 things that went well + why',
						frequency: 'Daily',
						current_streak: 44,
						best_streak: 44,
						completed_today: true
					},
					{
						id: 'vampire_shot',
						name: 'Vampire Shot',
						icon: '🧄',
						description: 'Garlic-Lemon-Turmeric shot (-22% cancer risk)',
						frequency: 'Daily',
						current_streak: 15,
						best_streak: 30,
						completed_today: true
					},
					{
						id: 'morning_electrolytes',
						name: 'Electrolytes',
						icon: '💧',
						description: 'Morning hydration BEFORE coffee',
						frequency: 'Daily',
						current_streak: 20,
						best_streak: 25,
						completed_today: true
					},
					{
						id: 'supplements',
						name: 'Supplements',
						icon: '💊',
						description: 'Longevity stack (D3, Omega-3, B-Complex, Creatine, etc.)',
						frequency: 'Daily',
						current_streak: 25,
						best_streak: 35,
						completed_today: true
					},
					{
						id: 'sleep_tracking',
						name: '8h Sleep',
						icon: '😴',
						description: 'Target: 22:00-06:00 (8h)',
						frequency: 'Daily',
						current_streak: 12,
						best_streak: 20,
						completed_today: false
					},
					{
						id: 'plan_tomorrow',
						name: 'Plan Tomorrow',
						icon: '📋',
						description: 'Evening planning (21:00-21:30) - reduce morning fatigue',
						frequency: 'Daily',
						current_streak: 8,
						best_streak: 15,
						completed_today: false
					},
					// Flexible
					{
						id: 'running',
						name: 'Running',
						icon: '🏃',
						description: 'Cardio, mental clarity, longevity',
						frequency: '3-5x/week',
						current_streak: 3,
						best_streak: 15,
						completed_today: false
					},
					{
						id: 'sales_learning',
						name: 'Sales Learning',
						icon: '📚',
						description: 'Micro-learning curriculum (3-5 min/day)',
						frequency: 'Mon-Fri',
						current_streak: 7,
						best_streak: 30,
						completed_today: true
					},
					{
						id: 'sauna',
						name: 'Sauna',
						icon: '🧖',
						description: 'Detox, cardiovascular health, stress relief',
						frequency: 'Weekly',
						current_streak: 2,
						best_streak: 10,
						completed_today: false
					}
				];
			}
		} catch (error) {
			console.error('Error loading habit streaks:', error);
			// Mock data on error - Top 3 habits
			streaks = [
				{
					id: 'journaling',
					name: 'Journaling',
					icon: '📝',
					current_streak: 44,
					best_streak: 44,
					completed_today: true
				},
				{
					id: 'three_daily_happiness',
					name: '3 Good Things',
					icon: '🙏',
					current_streak: 44,
					best_streak: 44,
					completed_today: true
				},
				{
					id: 'running',
					name: 'Running',
					icon: '🏃',
					current_streak: 3,
					best_streak: 15,
					completed_today: false
				}
			];
		} finally {
			isLoading = false;
		}
	}

	async function toggleHabit(habitId: string) {
		const habit = streaks.find(h => h.id === habitId);
		if (!habit) return;

		// Capture state for undo
		const wasCompleted = habit.completed_today;
		const previousStreak = habit.current_streak;
		const previousBestStreak = habit.best_streak;

		// Optimistic update
		habit.completed_today = !wasCompleted;

		// Update streak
		if (habit.completed_today) {
			habit.current_streak += 1;
			if (habit.current_streak > habit.best_streak) {
				habit.best_streak = habit.current_streak;
			}
		} else {
			habit.current_streak = Math.max(0, habit.current_streak - 1);
		}

		// Force reactivity
		streaks = [...streaks];

		// Record action for undo
		recordAction({
			type: 'habit-toggle',
			description: `${habit.icon} ${habit.name} ${habit.completed_today ? 'marked' : 'cleared'}`,
			reverseAction: async () => {
				// Restore previous state
				habit.completed_today = wasCompleted;
				habit.current_streak = previousStreak;
				habit.best_streak = previousBestStreak;
				streaks = [...streaks];

				// Call API to revert
				await fetch(`/api/habits/${habitId}/toggle`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ completed: wasCompleted })
				});
			},
			data: {
				habitId,
				previousState: wasCompleted,
				previousStreak,
				previousBestStreak
			}
		});

		// Send to API
		try {
			const response = await fetch(`/api/habits/${habitId}/toggle`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ completed: habit.completed_today })
			});

			if (!response.ok) {
				// Revert on error
				habit.completed_today = wasCompleted;
				habit.current_streak = previousStreak;
				habit.best_streak = previousBestStreak;
				streaks = [...streaks];
			}
		} catch (error) {
			console.error('Error toggling habit:', error);
			// Keep optimistic update even on error (offline-first)
		}
	}
</script>

<div class="mb-4">
	{#if isLoading}
		<div class="flex gap-2">
			<div class="h-12 w-12 bg-cloud-100 rounded-full animate-pulse"></div>
			<div class="h-12 w-12 bg-cloud-100 rounded-full animate-pulse"></div>
			<div class="h-12 w-12 bg-cloud-100 rounded-full animate-pulse"></div>
		</div>
	{:else if streaks.length > 0}
		<div class="flex gap-2 overflow-x-auto pb-1">
			{#each streaks as habit}
				<div class="relative flex-shrink-0 group">
					<button
						onclick={() => toggleHabit(habit.id)}
						onmouseenter={() => hoveredHabit = habit.id}
						onmouseleave={() => hoveredHabit = null}
						class="relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all cursor-pointer {habit.completed_today
							? 'bg-green-500 shadow-lg shadow-green-500/30 hover:bg-green-600'
							: 'bg-cloud-100 hover:bg-cloud-200'}"
					>
						{habit.icon}
					</button>
					{#if habit.current_streak > 0}
						<span class="absolute -bottom-1 -right-1 w-5 h-5 bg-electric-500 text-white rounded-full flex items-center justify-center text-xs font-bold z-20 pointer-events-none">
							{habit.current_streak}
						</span>
					{/if}

					<!-- Tooltip on hover -->
					{#if hoveredHabit === habit.id}
						<div class="absolute bottom-14 left-1/2 -translate-x-1/2 bg-cloud-800 text-white px-3 py-2 rounded-lg shadow-xl z-50 w-64 text-left pointer-events-none">
							<div class="text-sm font-semibold mb-1">{habit.icon} {habit.name}</div>
							<div class="text-xs text-cloud-300 mb-2">{habit.description}</div>
							<div class="text-xs text-cloud-400">
								<div>Frequency: {habit.frequency}</div>
								<div class="mt-1">Current: {habit.current_streak} days | Best: {habit.best_streak} days</div>
							</div>
							<div class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-cloud-800 rotate-45"></div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
