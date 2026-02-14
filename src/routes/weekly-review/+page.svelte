<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { BRAND } from '$lib/brand';
	import type { ExtractedData } from '$lib/types';

	interface CompletedTask {
		title: string;
		date: string;
		area?: string;
	}

	interface EnergyDay {
		date: string;
		energy: 'high' | 'medium' | 'low' | 'drained';
	}

	interface HabitStreak {
		name: string;
		streak: number;
		completed_this_week: number;
	}

	interface InboxItem {
		id: string;
		title: string;
		date: string;
		category?: string;
	}

	interface Task {
		id: string;
		title: string;
		area: string;
		priority?: number;
	}

	let step = $state(1);
	const totalSteps = 4;

	// Step 1 data
	let completedTasks = $state<CompletedTask[]>([]);
	let energyChart = $state<EnergyDay[]>([]);
	let habitStreaks = $state<HabitStreak[]>([]);
	let maxEnergyDay = $state<string>('');

	// Step 2 data
	let inboxItems = $state<InboxItem[]>([]);

	// Step 3 data
	let allTasks = $state<Task[]>([]);
	let top5 = $state<Task[]>([]);

	// Step 4 data
	let intentions = $state('');

	// Loading state
	let isLoading = $state(true);
	let isSaving = $state(false);

	onMount(async () => {
		await loadWeeklyReviewData();
	});

	async function loadWeeklyReviewData() {
		isLoading = true;
		try {
			const response = await fetch('/api/weekly-review/data');
			if (!response.ok) {
				throw new Error('Failed to load weekly review data');
			}

			const data = await response.json();

			// Step 1 data
			completedTasks = data.completedTasks || [];
			energyChart = data.energyByDay || [];
			habitStreaks = data.habits || [];

			// Find day with max energy
			const maxEnergyEntry = energyChart.reduce(
				(max, day) => {
					const energyValue = { high: 4, medium: 3, low: 2, drained: 1 }[day.energy] || 0;
					const maxValue = { high: 4, medium: 3, low: 2, drained: 1 }[max.energy] || 0;
					return energyValue > maxValue ? day : max;
				},
				energyChart[0] || { date: '', energy: 'medium' as const }
			);
			maxEnergyDay = maxEnergyEntry.date;

			// Step 2 data
			inboxItems = data.inboxItems || [];

			// Step 3 data
			allTasks = data.allTasks || [];
		} catch (error) {
			console.error('Error loading weekly review data:', error);
			// Continue with empty data
		} finally {
			isLoading = false;
		}
	}

	function categorizeInboxItem(item: InboxItem, category: string) {
		// Update item category
		item.category = category;

		// Remove from inbox
		inboxItems = inboxItems.filter((i) => i.id !== item.id);

		// If "this-week", add to allTasks for step 3
		if (category === 'this-week') {
			allTasks = [
				...allTasks,
				{
					id: item.id,
					title: item.title,
					area: 'inbox'
				}
			];
		}
	}

	function toggleTaskForTop5(task: Task) {
		if (top5.find((t) => t.id === task.id)) {
			// Remove from top 5
			top5 = top5.filter((t) => t.id !== task.id);
		} else {
			// Add to top 5 (if not already 5 items)
			if (top5.length < 5) {
				top5 = [...top5, { ...task, priority: top5.length + 1 }];
			}
		}
	}

	async function completeReview() {
		isSaving = true;
		try {
			const response = await fetch('/api/weekly-review/complete', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					top5: top5.map((t) => ({ id: t.id, title: t.title, priority: t.priority })),
					intentions,
					completedAt: new Date().toISOString()
				})
			});

			if (!response.ok) {
				throw new Error('Failed to save weekly review');
			}

			// Success - speak confirmation
			if ('speechSynthesis' in window) {
				const utterance = new SpeechSynthesisUtterance(
					'Weekly review complete! Strategic Dashboard unlocked.'
				);
				utterance.pitch = 1.2; // High pitch for celebration
				speechSynthesis.speak(utterance);
			}

			// Navigate to dashboard
			setTimeout(() => {
				goto('/');
			}, 2000);
		} catch (error) {
			console.error('Error completing review:', error);
			alert('Failed to save review. Please try again.');
		} finally {
			isSaving = false;
		}
	}

	function formatDate(dateStr: string): string {
		const date = new Date(dateStr);
		return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
	}

	function getEnergyColor(energy: string): string {
		const colors: Record<string, string> = {
			high: 'bg-green-500',
			medium: 'bg-yellow-500',
			low: 'bg-orange-500',
			drained: 'bg-red-500'
		};
		return colors[energy] || 'bg-cloud-300';
	}
</script>

<div class="min-h-screen bg-cloud-50 py-8">
	<div class="max-w-4xl mx-auto px-6">
		<!-- Header -->
		<header class="mb-8">
			<h1 class="text-3xl font-bold text-cloud-600">Weekly Review</h1>
			<p class="text-cloud-500 mt-2">15 minutes to reset and refocus</p>

			<!-- Progress Bar -->
			<div class="mt-4 h-2 bg-cloud-200 rounded-full overflow-hidden">
				<div
					class="h-full bg-gradient-to-r from-electric-500 to-purple-500 transition-all duration-300"
					style="width: {(step / totalSteps) * 100}%"
				></div>
			</div>

			<div class="flex justify-between mt-2 text-xs text-cloud-400">
				<span>Step {step} of {totalSteps}</span>
				<span>{Math.round((step / totalSteps) * 100)}% complete</span>
			</div>
		</header>

		<!-- Loading State -->
		{#if isLoading}
			<div class="bg-white rounded-2xl p-8 text-center">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-500 mx-auto mb-4"></div>
				<p class="text-cloud-500">Loading your week...</p>
			</div>
		{:else}
			<!-- Step 1: Review Last Week -->
			{#if step === 1}
				<section class="bg-white rounded-2xl p-8 shadow-sm">
					<h2 class="text-2xl font-semibold text-cloud-600 mb-6">Review Last Week</h2>
					<p class="text-cloud-500 mb-6">Take 3 minutes to reflect</p>

					<!-- Completed Tasks -->
					<div class="mb-8">
						<h3 class="text-lg font-semibold text-cloud-600 mb-3">
							✅ You completed {completedTasks.length} tasks
						</h3>
						<ul class="space-y-2">
							{#each completedTasks.slice(0, 10) as task}
								<li class="flex items-start gap-2 text-sm text-cloud-600">
									<span class="text-green-500 mt-0.5">✓</span>
									<span>{task.title}</span>
									{#if task.area}
										<span class="text-xs text-cloud-400">#{task.area}</span>
									{/if}
								</li>
							{/each}
							{#if completedTasks.length > 10}
								<li class="text-sm text-cloud-400 italic">
									+ {completedTasks.length - 10} more
								</li>
							{/if}
						</ul>
					</div>

					<!-- Energy Patterns -->
					<div class="mb-8">
						<h3 class="text-lg font-semibold text-cloud-600 mb-3">⚡ Energy Patterns</h3>
						<div class="flex gap-2 mb-4">
							{#each energyChart as day}
								<div class="flex-1">
									<div
										class="h-20 rounded {getEnergyColor(day.energy)} opacity-80 hover:opacity-100 transition-opacity"
										title="{formatDate(day.date)}: {day.energy}"
									></div>
									<p class="text-xs text-center text-cloud-400 mt-1">
										{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
									</p>
								</div>
							{/each}
						</div>
						{#if maxEnergyDay}
							<p class="text-sm text-cloud-600">
								💡 Your energy was highest on <strong>{formatDate(maxEnergyDay)}</strong>
							</p>
						{/if}
					</div>

					<!-- Habit Streaks -->
					<div class="mb-8">
						<h3 class="text-lg font-semibold text-cloud-600 mb-3">🔥 Habit Streaks</h3>
						<div class="grid grid-cols-2 md:grid-cols-3 gap-4">
							{#each habitStreaks as habit}
								<div class="bg-cloud-50 rounded-lg p-4">
									<p class="text-sm font-medium text-cloud-600">{habit.name}</p>
									<p class="text-2xl font-bold text-electric-500 mt-2">{habit.streak} days</p>
									<p class="text-xs text-cloud-400">
										{habit.completed_this_week}/{7} this week
									</p>
								</div>
							{/each}
						</div>
					</div>

					<button
						onclick={() => (step = 2)}
						class="w-full px-6 py-3 bg-electric-500 text-white font-medium rounded-lg hover:bg-electric-600 transition-colors"
					>
						Next: Clear Inbox →
					</button>
				</section>

			<!-- Step 2: Clear Inbox -->
			{:else if step === 2}
				<section class="bg-white rounded-2xl p-8 shadow-sm">
					<h2 class="text-2xl font-semibold text-cloud-600 mb-6">Clear Inbox</h2>
					<p class="text-cloud-500 mb-6">
						{inboxItems.length} items need clarification (5 min)
					</p>

					{#if inboxItems.length > 0}
						<div class="space-y-4 mb-6">
							{#each inboxItems as item}
								<div class="border-l-4 border-yellow-500 bg-yellow-50 rounded p-4">
									<p class="text-sm font-medium text-cloud-600 mb-3">{item.title}</p>
									<div class="flex flex-wrap gap-2">
										<button
											onclick={() => categorizeInboxItem(item, 'this-week')}
											class="px-3 py-1.5 text-xs font-medium bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
										>
											Do This Week
										</button>
										<button
											onclick={() => categorizeInboxItem(item, 'delegate')}
											class="px-3 py-1.5 text-xs font-medium bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
										>
											Delegate
										</button>
										<button
											onclick={() => categorizeInboxItem(item, 'someday')}
											class="px-3 py-1.5 text-xs font-medium bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
										>
											Someday/Maybe
										</button>
										<button
											onclick={() => categorizeInboxItem(item, 'drop')}
											class="px-3 py-1.5 text-xs font-medium bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
										>
											Drop
										</button>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<div class="text-center py-12">
							<p class="text-4xl mb-4">✅</p>
							<p class="text-lg font-medium text-green-600">Inbox is clear!</p>
						</div>
					{/if}

					<div class="flex gap-3">
						<button
							onclick={() => (step = 1)}
							class="flex-1 px-6 py-3 border border-cloud-300 text-cloud-600 font-medium rounded-lg hover:bg-cloud-50 transition-colors"
						>
							← Back
						</button>
						<button
							onclick={() => (step = 3)}
							class="flex-1 px-6 py-3 bg-electric-500 text-white font-medium rounded-lg hover:bg-electric-600 transition-colors"
						>
							Next: Pick Top 5 →
						</button>
					</div>
				</section>

			<!-- Step 3: Pick Top 5 (Warren Buffett 25/5) -->
			{:else if step === 3}
				<section class="bg-white rounded-2xl p-8 shadow-sm">
					<h2 class="text-2xl font-semibold text-cloud-600 mb-6">Pick Top 5 for Next Week</h2>
					<p class="text-cloud-500 mb-6">
						Warren Buffett's 25/5 Rule: Pick your top 5 priorities. Everything else is a
						distraction.
					</p>

					<!-- Task List -->
					<div class="mb-6 max-h-96 overflow-y-auto">
						<div class="space-y-2">
							{#each allTasks as task}
								{@const isSelected = top5.find((t) => t.id === task.id)}
								<button
									onclick={() => toggleTaskForTop5(task)}
									class="w-full text-left px-4 py-3 rounded-lg border transition-colors {isSelected
										? 'border-electric-500 bg-electric-50'
										: 'border-cloud-200 bg-white hover:bg-cloud-50'}"
								>
									<div class="flex items-center justify-between">
										<div class="flex items-center gap-3">
											<div
												class="w-6 h-6 rounded-full border-2 flex items-center justify-center {isSelected
													? 'border-electric-500 bg-electric-500'
													: 'border-cloud-300'}"
											>
												{#if isSelected}
													<span class="text-white text-sm font-bold"
														>{isSelected.priority}</span
													>
												{/if}
											</div>
											<span class="text-sm font-medium text-cloud-600">{task.title}</span>
										</div>
										<span class="text-xs text-cloud-400">#{task.area}</span>
									</div>
								</button>
							{/each}
						</div>
					</div>

					<!-- Summary -->
					<div class="bg-cloud-50 rounded-lg p-4 mb-6">
						<h3 class="text-sm font-semibold text-cloud-600 mb-2">Your Top 5:</h3>
						{#if top5.length > 0}
							<ol class="list-decimal list-inside space-y-1">
								{#each top5.sort((a, b) => (a.priority || 0) - (b.priority || 0)) as task}
									<li class="text-sm text-cloud-600">{task.title}</li>
								{/each}
							</ol>
						{:else}
							<p class="text-sm text-cloud-400 italic">No priorities selected yet</p>
						{/if}
					</div>

					<div class="flex gap-3">
						<button
							onclick={() => (step = 2)}
							class="flex-1 px-6 py-3 border border-cloud-300 text-cloud-600 font-medium rounded-lg hover:bg-cloud-50 transition-colors"
						>
							← Back
						</button>
						<button
							onclick={() => (step = 4)}
							disabled={top5.length !== 5}
							class="flex-1 px-6 py-3 bg-electric-500 text-white font-medium rounded-lg hover:bg-electric-600 transition-colors disabled:bg-cloud-300 disabled:cursor-not-allowed"
						>
							Next: Set Intentions →
						</button>
					</div>
				</section>

			<!-- Step 4: Set Intentions -->
			{:else if step === 4}
				<section class="bg-white rounded-2xl p-8 shadow-sm">
					<h2 class="text-2xl font-semibold text-cloud-600 mb-6">Set Intentions</h2>
					<p class="text-cloud-500 mb-6">
						What do you want to accomplish next week? Any big meetings or events? (2 min)
					</p>

					<textarea
						bind:value={intentions}
						placeholder="I want to..."
						rows="8"
						class="w-full px-4 py-3 border border-cloud-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric-500 text-cloud-600"
					></textarea>

					<div class="flex gap-3 mt-6">
						<button
							onclick={() => (step = 3)}
							class="flex-1 px-6 py-3 border border-cloud-300 text-cloud-600 font-medium rounded-lg hover:bg-cloud-50 transition-colors"
						>
							← Back
						</button>
						<button
							onclick={completeReview}
							disabled={!intentions.trim() || isSaving}
							class="flex-1 px-6 py-3 bg-gradient-to-r from-electric-500 to-purple-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{#if isSaving}
								Saving...
							{:else}
								Complete Review ✨
							{/if}
						</button>
					</div>
				</section>
			{/if}
		{/if}

		<!-- Exit Button -->
		<div class="mt-6 text-center">
			<button
				onclick={() => goto('/')}
				class="px-6 py-2 text-sm text-cloud-500 hover:text-cloud-600 transition-colors"
			>
				Exit (Progress Saved)
			</button>
		</div>
	</div>
</div>
