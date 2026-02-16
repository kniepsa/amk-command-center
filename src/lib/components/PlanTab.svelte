<script lang="ts">
	import WeeklyPrioritiesSidebar from './WeeklyPrioritiesSidebar.svelte';
	import CalendarSection from './CalendarSection.svelte';
	import TaskManagementModal from './TaskManagementModal.svelte';
	import { api } from '$lib/api/client';
	import { toast } from '$lib/stores/toast.svelte';
	import { browser } from '$app/environment';

	let showTaskModal = $state(false);
	let mounted = $state(false);
	let selectedContext = $state<string>('all');
	let tasks = $state<any[]>([]);
	let isLoading = $state(true);

	$effect(() => {
		if (!browser || mounted) return;

		mounted = true;
		loadTasks();
	});

	async function loadTasks() {
		isLoading = true;

		try {
			const result = await api.tasks.list();
			tasks = result.tasks || [];
		} catch (error) {
			console.error('Error loading tasks:', error);
			toast.error('Failed to load tasks');
		} finally {
			isLoading = false;
		}
	}

	function handleAddTask() {
		showTaskModal = true;
	}

	function handleTaskSaved() {
		showTaskModal = false;
		loadTasks();
		toast.success('Task added! ✨');
	}

	function handleTaskModalClose() {
		showTaskModal = false;
	}

	// Filter tasks by context
	const filteredTasks = $derived(
		selectedContext === 'all' ? tasks : tasks.filter((task: any) => task.context === selectedContext)
	);

	// GTD Context filters
	const contexts = [
		{ id: 'all', label: 'All', icon: '📋' },
		{ id: 'calls', label: '@calls', icon: '📞' },
		{ id: 'office', label: '@office', icon: '💼' },
		{ id: 'home', label: '@home', icon: '🏠' },
		{ id: 'errands', label: '@errands', icon: '🚗' },
		{ id: 'waiting', label: '@waiting', icon: '⏳' },
		{ id: 'someday', label: '@someday', icon: '💭' }
	];
</script>

<div class="plan-tab max-w-6xl mx-auto p-4 md:p-6">
	<div class="mb-6">
		<h2 class="text-2xl font-semibold text-cloud-600 mb-2">Plan</h2>
		<p class="text-sm text-cloud-400">Weekly priorities & calendar view</p>
	</div>

	<!-- Weekly Priorities (Warren Buffett 25/5) - Hero Section -->
	<div class="mb-8">
		<WeeklyPrioritiesSidebar />
	</div>

	<!-- Context Filters (GTD) -->
	<div class="mb-6">
		<h3 class="text-lg font-semibold text-cloud-600 mb-4">Tasks by Context</h3>

		<div class="flex flex-wrap gap-2 mb-4">
			{#each contexts as context}
				<button
					onclick={() => (selectedContext = context.id)}
					class="px-4 py-3 rounded-lg text-sm font-medium transition-colors min-h-touch-min {selectedContext ===
					context.id
						? 'bg-electric-600 text-white'
						: 'bg-white text-cloud-600 border border-cloud-200 hover:bg-cloud-50'}"
				>
					<span class="mr-1">{context.icon}</span>
					{context.label}
				</button>
			{/each}
		</div>

		<!-- Task Count -->
		{#if !isLoading}
			<p class="text-sm text-cloud-400 mb-4">
				{filteredTasks.length}
				{filteredTasks.length === 1 ? 'task' : 'tasks'}
				{#if selectedContext !== 'all'}
					in {contexts.find((c) => c.id === selectedContext)?.label}
				{/if}
			</p>
		{/if}

		<!-- Add Task Button -->
		<button
			onclick={handleAddTask}
			class="w-full md:w-auto px-6 py-3 bg-electric-600 text-white rounded-lg hover:bg-electric-700 transition-colors flex items-center justify-center gap-2 shadow-md"
		>
			<span class="text-xl">+</span>
			<span>Add Task</span>
		</button>
	</div>

	<!-- Calendar Week View -->
	<div class="mb-8">
		<h3 class="text-lg font-semibold text-cloud-600 mb-4">Calendar</h3>
		<CalendarSection />
	</div>

	<!-- Task List (if any) -->
	{#if isLoading}
		<div class="text-center py-12">
			<p class="text-cloud-400">Loading tasks...</p>
		</div>
	{:else if filteredTasks.length > 0}
		<div class="bg-white rounded-lg border border-cloud-200 p-4">
			<div class="space-y-2">
				{#each filteredTasks as task}
					<div class="flex items-center justify-between p-3 hover:bg-cloud-50 rounded-lg">
						<div class="flex items-center gap-3">
							<input
								type="checkbox"
								checked={task.completed}
								class="w-5 h-5 rounded border-cloud-300"
							/>
							<div>
								<p class="text-cloud-600 {task.completed ? 'line-through opacity-50' : ''}">
									{task.title}
								</p>
								{#if task.context}
									<p class="text-xs text-cloud-400">
										{contexts.find((c) => c.id === task.context)?.label || task.context}
									</p>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{:else}
		<div class="text-center py-12 bg-white rounded-lg border border-cloud-200">
			<p class="text-cloud-400">No tasks yet. Add your first task above! 👆</p>
		</div>
	{/if}

	<!-- Link to Weekly Planning Flow -->
	<div class="mt-8 border-t border-cloud-200 pt-6">
		<button
			onclick={() => toast.info('Weekly planning flow coming soon!')}
			class="w-full md:w-auto px-6 py-3 bg-white border border-cloud-200 text-cloud-600 rounded-lg hover:bg-cloud-50 transition-colors"
		>
			Start Weekly Planning Session →
		</button>
	</div>
</div>

<!-- Task Management Modal -->
{#if showTaskModal}
	<TaskManagementModal onClose={handleTaskModalClose} onSave={handleTaskSaved} />
{/if}
