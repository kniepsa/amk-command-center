<script lang="ts">
	import CollapsibleSection from './shared/CollapsibleSection.svelte';
	import { onMount } from 'svelte';
	import type { ProjectWithHealth } from '$lib/types/thread';
	import type { WeeklyPriority } from '$lib/types';
	import type { ContentIdea } from '$lib/api/journal-client';
	import { fetchContentIdeas } from '$lib/api/journal-client';
	import {
		enrichThreadWithHealth,
		calculatePipelineStats,
		getEnergyAwareTasks
	} from '$lib/utils/project-health';
	import { parseThread } from '$lib/utils/thread-parser';
	import type { Decision, RiskLevel } from '$lib/utils/decision-tracker';
	import {
		saveDecision,
		getAllDecisions,
		getDecisionsDueForReview,
		updateDecisionOutcome,
		deleteDecision,
		exportToMarkdown
	} from '$lib/utils/decision-tracker';
	import { getStreakColor, getEnergyColor, getSleepColor } from '$lib/utils/metrics';
	import { dataStore, getDaysSinceLastContact } from '$lib/stores/data.svelte';
	import { FOLLOW_UP_THRESHOLD_DAYS, MAX_WEEKLY_PRIORITIES } from '$lib/utils/constants';
	import { getWeekNumber } from '$lib/utils/metrics';

	// Section states
	let weeklyOpen = $state(true);
	let projectsOpen = $state(false);
	let decisionsOpen = $state(false);
	let metricsOpen = $state(false);
	let learningOpen = $state(false);
	let ideasOpen = $state(false);

	// === WEEKLY PLANNING (Warren Buffett 25/5) ===
	interface Task {
		id: string;
		text: string;
		category: 'braindump' | 'priority' | 'parking' | 'drop';
	}

	let tasks = $state<Task[]>([]);
	let newTaskText = $state('');

	const braindumpTasks = $derived(tasks.filter((t) => t.category === 'braindump'));
	const priorityTasks = $derived(tasks.filter((t) => t.category === 'priority'));
	const parkingTasks = $derived(tasks.filter((t) => t.category === 'parking'));
	const dropTasks = $derived(tasks.filter((t) => t.category === 'drop'));
	const priorityCount = $derived(priorityTasks.length);
	const isPriorityFull = $derived(priorityCount >= MAX_WEEKLY_PRIORITIES);

	function addTask(): void {
		if (newTaskText.trim() === '') return;
		tasks.push({
			id: crypto.randomUUID(),
			text: newTaskText,
			category: 'braindump'
		});
		newTaskText = '';
	}

	function moveTask(taskId: string, newCategory: Task['category']): void {
		const task = tasks.find((t) => t.id === taskId);
		if (!task) return;
		if (newCategory === 'priority' && isPriorityFull && task.category !== 'priority') {
			alert(`Maximum ${MAX_WEEKLY_PRIORITIES} priorities! Move to parking lot or drop list.`);
			return;
		}
		task.category = newCategory;
	}

	function deleteTask(taskId: string): void {
		const index = tasks.findIndex((t) => t.id === taskId);
		if (index !== -1) {
			tasks.splice(index, 1);
		}
	}

	function savePlan(): void {
		const plan = {
			week: `${new Date().getFullYear()}-W${getWeekNumber(new Date())}`,
			priorities: priorityTasks.map((t) => t.text),
			parking: parkingTasks.map((t) => t.text),
			dropped: dropTasks.map((t) => t.text),
			created: new Date().toISOString()
		};
		console.log('Weekly Plan:', plan);
		alert('Weekly plan saved!');
	}

	// === PROJECTS ===
	let projects = $state<ProjectWithHealth[]>([]);
	let projectsLoading = $state(true);
	let projectsError = $state<string | null>(null);
	let selectedCategory = $state<'all' | 'M&A' | 'Partnerships' | 'Property' | 'Personal'>('all');
	let sortBy = $state<'priority' | 'daysActive' | 'health'>('health');

	onMount(async () => {
		try {
			const response = await fetch('/api/threads');
			const data = await response.json();
			if (data.error) {
				projectsError = data.error;
			} else {
				projects = data.threads.map(
					(t: { filename: string; content: string; lastModified: string }) => {
						const thread = parseThread(t.filename, t.content, new Date(t.lastModified));
						return enrichThreadWithHealth(thread);
					}
				);
			}
		} catch (err) {
			projectsError = 'Failed to load projects';
		} finally {
			projectsLoading = false;
		}
	});

	const filteredProjects = $derived(
		selectedCategory === 'all'
			? projects
			: projects.filter((p) => p.category === selectedCategory)
	);

	const sortedProjects = $derived(
		[...filteredProjects].sort((a, b) => {
			switch (sortBy) {
				case 'priority':
					return b.health.score - a.health.score;
				case 'daysActive':
					return b.health.daysActive - a.health.daysActive;
				case 'health':
					return b.health.score - a.health.score;
				default:
					return 0;
			}
		})
	);

	const stats = $derived(calculatePipelineStats(projects));

	// === DECISIONS ===
	let decisions = $state<Decision[]>([]);
	let showDecisionModal = $state(false);
	let decisionFilter = $state<'all' | 'pending' | 'reviewed'>('all');
	let formDate = $state(new Date().toISOString().split('T')[0]);
	let formDecision = $state('');
	let formReasoning = $state('');
	let formRiskLevel = $state<RiskLevel>('medium');
	let formConfidence = $state(7);

	function refreshDecisions() {
		decisions = getAllDecisions();
	}

	$effect(() => {
		refreshDecisions();
	});

	function openDecisionModal() {
		formDate = new Date().toISOString().split('T')[0];
		formDecision = '';
		formReasoning = '';
		formRiskLevel = 'medium';
		formConfidence = 7;
		showDecisionModal = true;
	}

	function handleSaveDecision() {
		if (!formDecision.trim()) {
			alert('Decision text is required');
			return;
		}
		saveDecision({
			date: formDate,
			decision: formDecision.trim(),
			optionsConsidered: [],
			reasoning: formReasoning.trim(),
			assumptions: [],
			riskLevel: formRiskLevel,
			confidence: formConfidence,
			tags: []
		});
		refreshDecisions();
		showDecisionModal = false;
	}

	const filteredDecisions = $derived(() => {
		if (decisionFilter === 'pending') {
			return decisions.filter((d) => !d.outcome);
		} else if (decisionFilter === 'reviewed') {
			return decisions.filter((d) => d.outcome);
		}
		return decisions;
	});

	const riskColors: Record<RiskLevel, string> = {
		low: 'bg-green-50 border-green-200 text-green-800',
		medium: 'bg-yellow-50 border-yellow-200 text-yellow-800',
		high: 'bg-orange-50 border-orange-200 text-orange-800',
		critical: 'bg-red-50 border-red-200 text-red-800'
	};

	// === METRICS ===
	const habitStreaks = [
		{ habit: 'Running', streak: 12, best: 45, lastCompleted: '2026-02-10' },
		{ habit: 'Sauna', streak: 8, best: 30, lastCompleted: '2026-02-10' },
		{ habit: 'Journaling', streak: 156, best: 156, lastCompleted: '2026-02-10' }
	];

	const crmStats = $derived({
		totalContacts: dataStore.contacts.length,
		totalInteractions: dataStore.interactions.length,
		needsFollowUp: dataStore.contacts.filter((c) => {
			const days = getDaysSinceLastContact(c.handle);
			return days === null || days > FOLLOW_UP_THRESHOLD_DAYS;
		}).length
	});

	// === LEARNING ===
	const curriculum = {
		name: 'Sales',
		current_day: 8,
		total_days: 30,
		progress_percent: 26.7
	};

	// === IDEAS ===
	let ideas = $state<ContentIdea[]>([]);
	let ideasLoading = $state(true);
	let ideasError = $state<string | null>(null);

	onMount(async () => {
		try {
			ideas = await fetchContentIdeas();
		} catch (err) {
			ideasError = err instanceof Error ? err.message : 'Failed to load content ideas';
		} finally {
			ideasLoading = false;
		}
	});

	function getIcpColor(icp: string): string {
		switch (icp) {
			case 'B2B Founders':
				return 'bg-blue-100 text-blue-800 border-blue-300';
			case 'Expat RE Investors':
				return 'bg-green-100 text-green-800 border-green-300';
			case 'Print Shop Owners':
				return 'bg-purple-100 text-purple-800 border-purple-300';
			default:
				return 'bg-slate-100 text-slate-800 border-slate-300';
		}
	}
</script>

<div class="space-y-6">
	<!-- Warren Buffett 25/5 Weekly Planning -->
	<CollapsibleSection
		title="Weekly Planning (Warren Buffett 25/5)"
		icon="📅"
		isOpen={weeklyOpen}
		onToggle={(open) => (weeklyOpen = open)}
	>
		{#snippet children()}
			<div class="space-y-4 mt-4">
				<p class="text-slate-600 text-sm">Choose your top 5-7 priorities for this week</p>

				<!-- Brain Dump -->
				<div>
					<h4 class="font-semibold text-slate-700 mb-2">🧠 Brain Dump ({braindumpTasks.length})</h4>
					<div class="flex gap-2 mb-3">
						<input
							type="text"
							bind:value={newTaskText}
							onkeydown={(e) => e.key === 'Enter' && addTask()}
							placeholder="Type a task and press Enter"
							class="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
						/>
						<button
							onclick={addTask}
							class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
						>
							Add
						</button>
					</div>
					<div class="space-y-2">
						{#each braindumpTasks as task}
							<div class="flex items-center gap-2 p-2 bg-slate-50 rounded group">
								<span class="flex-1 text-sm">{task.text}</span>
								<div class="flex gap-1 opacity-0 group-hover:opacity-100">
									<button
										onclick={() => moveTask(task.id, 'priority')}
										class="px-2 py-1 text-xs bg-green-100 text-green-700 rounded"
										disabled={isPriorityFull}
									>
										Priority
									</button>
									<button
										onclick={() => moveTask(task.id, 'parking')}
										class="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded"
									>
										Parking
									</button>
								</div>
							</div>
						{/each}
					</div>
				</div>

				<!-- Priorities -->
				<div>
					<h4 class="font-semibold text-slate-700 mb-2">
						🎯 Do This Week ({priorityCount}/7)
					</h4>
					<div class="space-y-2">
						{#each priorityTasks as task, i}
							<div class="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
								<span class="text-green-700 font-semibold text-xs w-4">#{i + 1}</span>
								<span class="flex-1 text-sm font-medium">{task.text}</span>
							</div>
						{/each}
					</div>
				</div>

				<button
					onclick={savePlan}
					class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
				>
					Save Weekly Plan
				</button>
			</div>
		{/snippet}
	</CollapsibleSection>

	<!-- Projects Pipeline -->
	<CollapsibleSection
		title="Projects Pipeline"
		icon="🎯"
		isOpen={projectsOpen}
		onToggle={(open) => (projectsOpen = open)}
	>
		{#snippet children()}
			<div class="mt-4 space-y-4">
				{#if projectsLoading}
					<p class="text-slate-600 text-sm">Loading projects...</p>
				{:else if projectsError}
					<p class="text-red-600 text-sm">{projectsError}</p>
				{:else}
					<!-- Quick Stats -->
					<div class="grid grid-cols-4 gap-3">
						<div class="p-3 bg-green-50 rounded-lg">
							<div class="text-2xl font-bold text-green-900">{stats.green}</div>
							<div class="text-xs text-green-700">🟢 Healthy</div>
						</div>
						<div class="p-3 bg-yellow-50 rounded-lg">
							<div class="text-2xl font-bold text-yellow-900">{stats.yellow}</div>
							<div class="text-xs text-yellow-700">🟡 Attention</div>
						</div>
						<div class="p-3 bg-red-50 rounded-lg">
							<div class="text-2xl font-bold text-red-900">{stats.red}</div>
							<div class="text-xs text-red-700">🔴 Stalled</div>
						</div>
						<div class="p-3 bg-blue-50 rounded-lg">
							<div class="text-2xl font-bold text-blue-900">{stats.active}</div>
							<div class="text-xs text-blue-700">Active</div>
						</div>
					</div>

					<!-- Projects List (simplified) -->
					<div class="space-y-2">
						{#each sortedProjects.slice(0, 5) as project}
							<div class="p-3 bg-slate-50 rounded-lg border-l-4 border-green-500">
								<div class="font-medium text-sm">{project.title}</div>
								{#if project.health.nextAction}
									<div class="text-xs text-slate-600 mt-1">→ {project.health.nextAction}</div>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/snippet}
	</CollapsibleSection>

	<!-- Decision Journal -->
	<CollapsibleSection
		title="Decision Journal"
		icon="⚖️"
		isOpen={decisionsOpen}
		onToggle={(open) => (decisionsOpen = open)}
	>
		{#snippet children()}
			<div class="mt-4 space-y-4">
				<div class="flex justify-between items-center">
					<div class="text-sm text-slate-600">
						{decisions.filter((d) => !d.outcome).length} pending
					</div>
					<button
						onclick={openDecisionModal}
						class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
					>
						Log Decision
					</button>
				</div>

				<div class="space-y-2">
					{#each filteredDecisions().slice(0, 3) as decision}
						<div class="p-3 bg-slate-50 rounded-lg">
							<div class="font-medium text-sm">{decision.decision}</div>
							<div class="flex items-center gap-2 mt-1">
								<span class="text-xs text-slate-500">{decision.date}</span>
								<span
									class="px-2 py-0.5 rounded text-xs font-medium {riskColors[decision.riskLevel]}"
								>
									{decision.riskLevel}
								</span>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/snippet}
	</CollapsibleSection>

	<!-- Metrics & Streaks -->
	<CollapsibleSection
		title="Metrics & Streaks"
		icon="📊"
		isOpen={metricsOpen}
		onToggle={(open) => (metricsOpen = open)}
	>
		{#snippet children()}
			<div class="mt-4 space-y-4">
				<!-- Habit Streaks -->
				<div>
					<h4 class="font-semibold text-slate-700 mb-2">🔥 Habit Streaks</h4>
					<div class="space-y-2">
						{#each habitStreaks as habit}
							<div class="p-3 bg-slate-50 rounded-lg">
								<div class="flex justify-between items-center mb-1">
									<span class="font-medium text-sm">{habit.habit}</span>
									<span class="text-lg font-bold">{habit.streak}</span>
								</div>
								<div class="h-2 bg-slate-200 rounded-full overflow-hidden">
									<div
										class="{getStreakColor(habit.streak, habit.best)} h-full rounded-full"
										style="width: {(habit.streak / habit.best) * 100}%"
									></div>
								</div>
							</div>
						{/each}
					</div>
				</div>

				<!-- CRM Stats -->
				<div class="grid grid-cols-3 gap-2">
					<div class="p-3 bg-blue-50 rounded-lg">
						<div class="text-2xl font-bold text-blue-900">{crmStats.totalContacts}</div>
						<div class="text-xs text-blue-700">Contacts</div>
					</div>
					<div class="p-3 bg-green-50 rounded-lg">
						<div class="text-2xl font-bold text-green-900">{crmStats.totalInteractions}</div>
						<div class="text-xs text-green-700">Interactions</div>
					</div>
					<div class="p-3 bg-yellow-50 rounded-lg">
						<div class="text-2xl font-bold text-yellow-900">{crmStats.needsFollowUp}</div>
						<div class="text-xs text-yellow-700">Follow-up</div>
					</div>
				</div>
			</div>
		{/snippet}
	</CollapsibleSection>

	<!-- Learning Dashboard -->
	<CollapsibleSection
		title="Learning Dashboard"
		icon="📚"
		isOpen={learningOpen}
		onToggle={(open) => (learningOpen = open)}
	>
		{#snippet children()}
			<div class="mt-4">
				<div class="p-4 bg-blue-50 rounded-lg">
					<div class="flex justify-between items-center mb-2">
						<div>
							<div class="font-semibold text-slate-900">
								{curriculum.name} Curriculum
							</div>
							<div class="text-sm text-slate-600">
								Day {curriculum.current_day}/{curriculum.total_days}
							</div>
						</div>
						<div class="text-3xl font-bold text-blue-600">{curriculum.progress_percent}%</div>
					</div>
					<div class="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
						<div
							class="bg-blue-600 h-2 rounded-full"
							style="width: {curriculum.progress_percent}%"
						></div>
					</div>
				</div>
			</div>
		{/snippet}
	</CollapsibleSection>

	<!-- Content Ideas -->
	<CollapsibleSection
		title="Content Ideas"
		icon="💡"
		isOpen={ideasOpen}
		onToggle={(open) => (ideasOpen = open)}
	>
		{#snippet children()}
			<div class="mt-4">
				{#if ideasLoading}
					<p class="text-slate-600 text-sm">Loading ideas...</p>
				{:else if ideasError}
					<p class="text-red-600 text-sm">{ideasError}</p>
				{:else if ideas.length === 0}
					<p class="text-slate-500 text-sm">No content ideas yet</p>
				{:else}
					<div class="space-y-2">
						{#each ideas.slice(0, 5) as idea}
							<div class="p-3 bg-slate-50 rounded-lg">
								<div class="font-medium text-sm mb-1">{idea.idea}</div>
								<div class="flex gap-2">
									{#if idea.icp}
										<span class="px-2 py-0.5 rounded text-xs {getIcpColor(idea.icp)}">
											{idea.icp}
										</span>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/snippet}
	</CollapsibleSection>
</div>

<!-- Decision Modal -->
{#if showDecisionModal}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
		onclick={() => (showDecisionModal = false)}
	>
		<div
			class="bg-white rounded-lg p-6 max-w-md w-full"
			onclick={(e) => e.stopPropagation()}
		>
			<h3 class="text-xl font-bold mb-4">Log Decision</h3>
			<div class="space-y-3">
				<div>
					<label class="block text-sm font-medium mb-1">Date</label>
					<input type="date" bind:value={formDate} class="w-full px-3 py-2 border rounded-lg" />
				</div>
				<div>
					<label class="block text-sm font-medium mb-1">Decision</label>
					<input
						type="text"
						bind:value={formDecision}
						class="w-full px-3 py-2 border rounded-lg"
						placeholder="What did you decide?"
					/>
				</div>
				<div>
					<label class="block text-sm font-medium mb-1">Reasoning</label>
					<textarea
						bind:value={formReasoning}
						rows="3"
						class="w-full px-3 py-2 border rounded-lg"
					></textarea>
				</div>
				<div class="grid grid-cols-2 gap-3">
					<div>
						<label class="block text-sm font-medium mb-1">Risk Level</label>
						<select bind:value={formRiskLevel} class="w-full px-3 py-2 border rounded-lg">
							<option value="low">Low</option>
							<option value="medium">Medium</option>
							<option value="high">High</option>
							<option value="critical">Critical</option>
						</select>
					</div>
					<div>
						<label class="block text-sm font-medium mb-1">Confidence (0-10)</label>
						<input
							type="number"
							min="0"
							max="10"
							bind:value={formConfidence}
							class="w-full px-3 py-2 border rounded-lg"
						/>
					</div>
				</div>
			</div>
			<div class="flex justify-end gap-2 mt-6">
				<button
					onclick={() => (showDecisionModal = false)}
					class="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
				>
					Cancel
				</button>
				<button
					onclick={handleSaveDecision}
					class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
				>
					Save
				</button>
			</div>
		</div>
	</div>
{/if}
