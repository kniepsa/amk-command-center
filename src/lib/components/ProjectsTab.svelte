<script lang="ts">
	import type { ProjectWithHealth } from '$lib/types/thread';
	import type { PipelineStats } from '$lib/utils/project-health';
	import {
		enrichThreadWithHealth,
		calculatePipelineStats,
		getEnergyAwareTasks
	} from '$lib/utils/project-health';
	import { parseThread } from '$lib/utils/thread-parser';
	import { onMount } from 'svelte';

	// Load projects from API
	let projects = $state<ProjectWithHealth[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	onMount(async () => {
		try {
			const response = await fetch('/api/threads');
			const data = await response.json();

			if (data.error) {
				error = data.error;
				loading = false;
				return;
			}

			// Parse and enrich threads
			projects = data.threads.map(
				(t: { filename: string; content: string; lastModified: string }) => {
					const thread = parseThread(t.filename, t.content, new Date(t.lastModified));
					return enrichThreadWithHealth(thread);
				}
			);

			loading = false;
		} catch (err) {
			console.error('Failed to load projects:', err);
			error = 'Failed to load projects';
			loading = false;
		}
	});

	// State
	let selectedCategory = $state<'all' | 'M&A' | 'Partnerships' | 'Property' | 'Personal'>('all');
	let sortBy = $state<'priority' | 'daysActive' | 'health'>('health');
	let energyLevel = $state<'high' | 'medium' | 'low'>('high');

	// Derived state
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

	const activeProjects = $derived(sortedProjects.filter((p) => p.pipelineStage === 'active'));
	const stalledProjects = $derived(sortedProjects.filter((p) => p.pipelineStage === 'stalled'));
	const closingProjects = $derived(sortedProjects.filter((p) => p.pipelineStage === 'closing'));

	const stats: PipelineStats = $derived(calculatePipelineStats(projects));
	const energyAwareTasks = $derived(getEnergyAwareTasks(projects, energyLevel));

	// Helper functions
	function getHealthIcon(status: 'green' | 'yellow' | 'red'): string {
		return status === 'green' ? '🟢' : status === 'yellow' ? '🟡' : '🔴';
	}

	function getMomentumIcon(momentum: string): string {
		switch (momentum) {
			case 'accelerating':
				return '🚀';
			case 'steady':
				return '➡️';
			case 'stalling':
				return '⚠️';
			case 'stalled':
				return '🛑';
			default:
				return '❓';
		}
	}
</script>

<div class="bg-white rounded-xl shadow-lg p-8">
	<h2 class="text-2xl font-bold text-slate-900 mb-6">🎯 Projects Pipeline</h2>
	<p class="text-slate-600 mb-8">Visual deal flow and health tracking</p>

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="text-slate-600">Loading projects...</div>
		</div>
	{:else if error}
		<div class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
			{error}
		</div>
	{:else if projects.length === 0}
		<div class="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
			<p class="text-slate-600">No active projects found</p>
		</div>
	{:else}

	<!-- Quick Stats -->
	<div class="grid grid-cols-4 gap-4 mb-8">
		<div class="p-4 bg-green-50 rounded-lg">
			<div class="text-3xl font-bold text-green-900">{stats.green}</div>
			<div class="text-sm text-green-700">🟢 Healthy</div>
		</div>
		<div class="p-4 bg-yellow-50 rounded-lg">
			<div class="text-3xl font-bold text-yellow-900">{stats.yellow}</div>
			<div class="text-sm text-yellow-700">🟡 Needs Attention</div>
		</div>
		<div class="p-4 bg-red-50 rounded-lg">
			<div class="text-3xl font-bold text-red-900">{stats.red}</div>
			<div class="text-sm text-red-700">🔴 Stalled</div>
		</div>
		<div class="p-4 bg-blue-50 rounded-lg">
			<div class="text-3xl font-bold text-blue-900">{stats.active}</div>
			<div class="text-sm text-blue-700">Active Projects</div>
		</div>
	</div>

	<!-- Energy-Aware Recommendations -->
	<div class="mb-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
		<h3 class="font-semibold text-slate-800 mb-4 flex items-center gap-2">
			<span>⚡</span>
			<span>Recommended for Today</span>
		</h3>

		<div class="flex gap-2 mb-4">
			<button
				class="px-4 py-2 rounded-lg font-medium transition-colors {energyLevel === 'high'
					? 'bg-purple-600 text-white'
					: 'bg-white text-slate-700 hover:bg-purple-50'}"
				onclick={() => (energyLevel = 'high')}
			>
				High Energy
			</button>
			<button
				class="px-4 py-2 rounded-lg font-medium transition-colors {energyLevel === 'medium'
					? 'bg-purple-600 text-white'
					: 'bg-white text-slate-700 hover:bg-purple-50'}"
				onclick={() => (energyLevel = 'medium')}
			>
				Medium Energy
			</button>
			<button
				class="px-4 py-2 rounded-lg font-medium transition-colors {energyLevel === 'low'
					? 'bg-purple-600 text-white'
					: 'bg-white text-slate-700 hover:bg-purple-50'}"
				onclick={() => (energyLevel = 'low')}
			>
				Low Energy
			</button>
		</div>

		{#if energyAwareTasks.length === 0}
			<p class="text-slate-600 italic">No recommended tasks for this energy level</p>
		{:else}
			<div class="space-y-2">
				{#each energyAwareTasks as task}
					<div class="flex items-center gap-3 p-3 bg-white rounded-lg">
						<span>{getHealthIcon(task.health.status)}</span>
						<div class="flex-1">
							<div class="font-medium text-slate-900">{task.title}</div>
							{#if task.health.nextAction}
								<div class="text-sm text-slate-600">→ {task.health.nextAction}</div>
							{/if}
						</div>
						<span class="text-xs text-slate-500">{task.category}</span>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Filters and Sort -->
	<div class="flex items-center justify-between mb-6">
		<div class="flex gap-2">
			<button
				class="px-4 py-2 rounded-lg text-sm font-medium transition-colors {selectedCategory ===
				'all'
					? 'bg-blue-600 text-white'
					: 'bg-slate-100 text-slate-700 hover:bg-slate-200'}"
				onclick={() => (selectedCategory = 'all')}
			>
				All ({stats.total})
			</button>
			<button
				class="px-4 py-2 rounded-lg text-sm font-medium transition-colors {selectedCategory ===
				'M&A'
					? 'bg-blue-600 text-white'
					: 'bg-slate-100 text-slate-700 hover:bg-slate-200'}"
				onclick={() => (selectedCategory = 'M&A')}
			>
				M&A ({stats.byCategory['M&A'] || 0})
			</button>
			<button
				class="px-4 py-2 rounded-lg text-sm font-medium transition-colors {selectedCategory ===
				'Partnerships'
					? 'bg-blue-600 text-white'
					: 'bg-slate-100 text-slate-700 hover:bg-slate-200'}"
				onclick={() => (selectedCategory = 'Partnerships')}
			>
				Partnerships ({stats.byCategory['Partnerships'] || 0})
			</button>
			<button
				class="px-4 py-2 rounded-lg text-sm font-medium transition-colors {selectedCategory ===
				'Property'
					? 'bg-blue-600 text-white'
					: 'bg-slate-100 text-slate-700 hover:bg-slate-200'}"
				onclick={() => (selectedCategory = 'Property')}
			>
				Property ({stats.byCategory['Property'] || 0})
			</button>
		</div>

		<div class="flex gap-2 items-center">
			<span class="text-sm text-slate-600">Sort by:</span>
			<select
				class="px-3 py-2 rounded-lg border border-slate-200 text-sm"
				bind:value={sortBy}
			>
				<option value="health">Health Score</option>
				<option value="priority">Priority</option>
				<option value="daysActive">Days Active</option>
			</select>
		</div>
	</div>

	<!-- Pipeline Columns -->
	<div class="grid grid-cols-3 gap-6">
		<!-- Active Column -->
		<div>
			<h3 class="font-semibold text-slate-800 mb-4 flex items-center gap-2">
				<span>🚀</span>
				<span>Active ({activeProjects.length})</span>
			</h3>
			<div class="space-y-3">
				{#each activeProjects as project}
					<div class="p-4 bg-slate-50 rounded-lg border-l-4 border-green-500 hover:shadow-md transition-shadow">
						<div class="flex items-start justify-between mb-2">
							<div class="flex-1">
								<div class="font-medium text-slate-900 text-sm">{project.title}</div>
								{#if project.metadata.company}
									<div class="text-xs text-slate-600 mt-1">{project.metadata.company}</div>
								{/if}
							</div>
							<div class="flex gap-1">
								<span>{getHealthIcon(project.health.status)}</span>
								<span>{getMomentumIcon(project.health.momentum)}</span>
							</div>
						</div>

						{#if project.health.nextAction}
							<div class="text-xs text-slate-700 mb-2">
								<span class="font-medium">Next:</span>
								{project.health.nextAction}
							</div>
						{/if}

						<div class="flex items-center justify-between text-xs text-slate-500">
							<span>{project.health.daysSinceUpdate}d ago</span>
							<span class="px-2 py-1 bg-slate-200 rounded">{project.category}</span>
						</div>

						{#if project.health.blockers.length > 0}
							<div class="mt-2 text-xs text-red-600">
								⚠️ {project.health.blockers[0]}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>

		<!-- Stalled Column -->
		<div>
			<h3 class="font-semibold text-slate-800 mb-4 flex items-center gap-2">
				<span>⚠️</span>
				<span>Stalled ({stalledProjects.length})</span>
			</h3>
			<div class="space-y-3">
				{#each stalledProjects as project}
					<div class="p-4 bg-slate-50 rounded-lg border-l-4 border-yellow-500 hover:shadow-md transition-shadow">
						<div class="flex items-start justify-between mb-2">
							<div class="flex-1">
								<div class="font-medium text-slate-900 text-sm">{project.title}</div>
								{#if project.metadata.company}
									<div class="text-xs text-slate-600 mt-1">{project.metadata.company}</div>
								{/if}
							</div>
							<div class="flex gap-1">
								<span>{getHealthIcon(project.health.status)}</span>
								<span>{getMomentumIcon(project.health.momentum)}</span>
							</div>
						</div>

						{#if project.health.nextAction}
							<div class="text-xs text-slate-700 mb-2">
								<span class="font-medium">Next:</span>
								{project.health.nextAction}
							</div>
						{/if}

						<div class="flex items-center justify-between text-xs text-slate-500">
							<span class="text-red-600 font-medium">{project.health.daysSinceUpdate}d ago</span>
							<span class="px-2 py-1 bg-slate-200 rounded">{project.category}</span>
						</div>

						{#if project.health.blockers.length > 0}
							<div class="mt-2 text-xs text-red-600">
								⚠️ {project.health.blockers[0]}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>

		<!-- Closing Column -->
		<div>
			<h3 class="font-semibold text-slate-800 mb-4 flex items-center gap-2">
				<span>🎉</span>
				<span>Closing ({closingProjects.length})</span>
			</h3>
			<div class="space-y-3">
				{#each closingProjects as project}
					<div class="p-4 bg-slate-50 rounded-lg border-l-4 border-blue-500 hover:shadow-md transition-shadow">
						<div class="flex items-start justify-between mb-2">
							<div class="flex-1">
								<div class="font-medium text-slate-900 text-sm">{project.title}</div>
								{#if project.metadata.company}
									<div class="text-xs text-slate-600 mt-1">{project.metadata.company}</div>
								{/if}
							</div>
							<div class="flex gap-1">
								<span>{getHealthIcon(project.health.status)}</span>
								<span>{getMomentumIcon(project.health.momentum)}</span>
							</div>
						</div>

						{#if project.health.nextAction}
							<div class="text-xs text-slate-700 mb-2">
								<span class="font-medium">Next:</span>
								{project.health.nextAction}
							</div>
						{/if}

						<div class="flex items-center justify-between text-xs text-slate-500">
							<span>{project.health.daysSinceUpdate}d ago</span>
							<span class="px-2 py-1 bg-slate-200 rounded">{project.category}</span>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
	{/if}
</div>
