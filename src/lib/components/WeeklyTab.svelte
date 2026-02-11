<script lang="ts">
	import { getWeekNumber } from '$lib/utils/metrics';
	import { MAX_WEEKLY_PRIORITIES } from '$lib/utils/constants';

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

		// Prevent exceeding max priorities (Warren Buffett 25/5 method)
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
		alert('Weekly plan saved! (Console logged for now)');
	}
</script>

<div class="bg-white rounded-xl shadow-lg p-8">
	<h2 class="text-2xl font-bold text-slate-900 mb-6">📅 Weekly Planning</h2>
	<p class="text-slate-600 mb-6">Warren Buffett 25/5 Method: Choose your top 5-7 priorities</p>

	<div class="space-y-6">
		<!-- Brain Dump Section -->
		<div class="border-b border-slate-200 pb-6">
			<h3 class="font-semibold text-slate-800 mb-3 flex items-center gap-2">
				<span>🧠</span>
				<span>Brain Dump</span>
				<span class="text-sm font-normal text-slate-500">({braindumpTasks.length} items)</span>
			</h3>
			<p class="text-sm text-slate-600 mb-4">
				List everything on your mind. Then categorize into priorities, parking, or drop.
			</p>

			<div class="flex gap-2 mb-4">
				<input
					type="text"
					bind:value={newTaskText}
					onkeydown={(e) => e.key === 'Enter' && addTask()}
					placeholder="Type a task and press Enter"
					class="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
				/>
				<button
					type="button"
					onclick={addTask}
					class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
				>
					Add
				</button>
			</div>

			<div class="space-y-2">
				{#if braindumpTasks.length === 0}
					<p class="text-slate-400 text-sm italic text-center py-4">No items yet. Start typing!</p>
				{/if}

				{#each braindumpTasks as task}
					<div class="flex items-center gap-2 p-3 bg-slate-50 rounded-lg group">
						<span class="flex-1 text-slate-800">{task.text}</span>
						<div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
							<button
								type="button"
								onclick={() => moveTask(task.id, 'priority')}
								class="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
								disabled={isPriorityFull}
							>
								Priority
							</button>
							<button
								type="button"
								onclick={() => moveTask(task.id, 'parking')}
								class="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
							>
								Parking
							</button>
							<button
								type="button"
								onclick={() => moveTask(task.id, 'drop')}
								class="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
							>
								Drop
							</button>
							<button
								type="button"
								onclick={() => deleteTask(task.id)}
								class="px-3 py-1 text-xs bg-slate-100 text-slate-700 rounded hover:bg-slate-200"
							>
								Delete
							</button>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Priority Section (5-7 items max) -->
		<div class="border-b border-slate-200 pb-6">
			<h3 class="font-semibold text-slate-800 mb-3 flex items-center gap-2">
				<span>🎯</span>
				<span>Do This Week (Max 5-7)</span>
				<span
					class="text-sm font-normal {priorityCount > 7
						? 'text-red-600'
						: priorityCount >= 5
							? 'text-green-600'
							: 'text-slate-500'}"
				>
					({priorityCount}/7)
				</span>
			</h3>

			<div class="space-y-2">
				{#if priorityTasks.length === 0}
					<p class="text-slate-400 text-sm italic text-center py-4 bg-slate-50 rounded-lg">
						Move your top priorities here (5-7 items max)
					</p>
				{/if}

				{#each priorityTasks as task, index}
					<div class="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg group">
						<span class="text-green-700 font-semibold text-sm w-6">#{index + 1}</span>
						<span class="flex-1 text-slate-800 font-medium">{task.text}</span>
						<div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
							<button
								type="button"
								onclick={() => moveTask(task.id, 'braindump')}
								class="px-3 py-1 text-xs bg-slate-100 text-slate-700 rounded hover:bg-slate-200"
							>
								Back
							</button>
							<button
								type="button"
								onclick={() => moveTask(task.id, 'parking')}
								class="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
							>
								Parking
							</button>
							<button
								type="button"
								onclick={() => moveTask(task.id, 'drop')}
								class="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
							>
								Drop
							</button>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Parking Lot Section -->
		<div class="border-b border-slate-200 pb-6">
			<h3 class="font-semibold text-slate-800 mb-3 flex items-center gap-2">
				<span>🅿️</span>
				<span>Parking Lot</span>
				<span class="text-sm font-normal text-slate-500">({parkingTasks.length} items)</span>
			</h3>
			<p class="text-sm text-slate-600 mb-4">Important but not this week. Review next week.</p>

			<div class="space-y-2">
				{#if parkingTasks.length === 0}
					<p class="text-slate-400 text-sm italic text-center py-4 bg-slate-50 rounded-lg">
						No items parked yet
					</p>
				{/if}

				{#each parkingTasks as task}
					<div class="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg group">
						<span class="flex-1 text-slate-800">{task.text}</span>
						<div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
							<button
								type="button"
								onclick={() => moveTask(task.id, 'braindump')}
								class="px-3 py-1 text-xs bg-slate-100 text-slate-700 rounded hover:bg-slate-200"
							>
								Back
							</button>
							<button
								type="button"
								onclick={() => moveTask(task.id, 'priority')}
								class="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
								disabled={isPriorityFull}
							>
								Priority
							</button>
							<button
								type="button"
								onclick={() => moveTask(task.id, 'drop')}
								class="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
							>
								Drop
							</button>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Drop List Section -->
		<div class="pb-2">
			<h3 class="font-semibold text-slate-800 mb-3 flex items-center gap-2">
				<span>🗑️</span>
				<span>Drop List (Explicit NO)</span>
				<span class="text-sm font-normal text-slate-500">({dropTasks.length} items)</span>
			</h3>
			<p class="text-sm text-slate-600 mb-4">
				Explicitly NOT doing these. Say no to protect your priorities.
			</p>

			<div class="space-y-2">
				{#if dropTasks.length === 0}
					<p class="text-slate-400 text-sm italic text-center py-4 bg-slate-50 rounded-lg">
						Nothing dropped yet
					</p>
				{/if}

				{#each dropTasks as task}
					<div class="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg group">
						<span class="flex-1 text-slate-800 line-through opacity-60">{task.text}</span>
						<div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
							<button
								type="button"
								onclick={() => moveTask(task.id, 'braindump')}
								class="px-3 py-1 text-xs bg-slate-100 text-slate-700 rounded hover:bg-slate-200"
							>
								Restore
							</button>
							<button
								type="button"
								onclick={() => deleteTask(task.id)}
								class="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
							>
								Delete
							</button>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Save Button -->
		<div class="pt-4">
			<button
				type="button"
				onclick={savePlan}
				class="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
			>
				Save Weekly Plan
			</button>
		</div>
	</div>
</div>
