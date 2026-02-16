<script lang="ts">
	import { api } from '$lib/api/client';
	import { recordAction } from '$lib/stores/action-history.svelte';
	import { speak } from '$lib/utils/voice-commands';
	import type { Task, TaskStatus } from '@amk/command-center-sdk';

	interface Props {
		mode: 'create' | 'edit';
		task?: Task;
		onClose: () => void;
		onSuccess: (task: Task) => void;
	}

	let { mode, task, onClose, onSuccess }: Props = $props();

	// Form state
	let content = $state(task?.content || '');
	let area = $state(task?.area || '');
	let context = $state(task?.context || '');
	let status = $state<TaskStatus>(task?.status || 'open');
	let waitingFor = $state(task?.waitingFor || '');
	let reminderDate = $state(task?.reminderDate || '');

	// UI state
	let isSubmitting = $state(false);
	let error = $state<string | null>(null);

	// Area options (from PARA + GTD + RPM system)
	const areaOptions = [
		{ value: '', label: 'No area' },
		{ value: 'business', label: 'Business' },
		{ value: 'family', label: 'Family' },
		{ value: 'health', label: 'Health' },
		{ value: 'learning', label: 'Learning' },
		{ value: 'relationships', label: 'Relationships' },
		{ value: 'finance', label: 'Finance' },
		{ value: 'personal', label: 'Personal' }
	];

	// Context options (from GTD)
	const contextOptions = [
		{ value: '', label: 'No context' },
		{ value: 'calls', label: '@calls' },
		{ value: 'office', label: '@office' },
		{ value: 'home', label: '@home' },
		{ value: 'computer', label: '@computer' },
		{ value: 'email', label: '@email' },
		{ value: 'errands', label: '@errands' },
		{ value: 'waiting', label: '@waiting' },
		{ value: 'someday', label: '@someday' }
	];

	// Status options
	const statusOptions = [
		{ value: 'open', label: 'Open' },
		{ value: 'waiting', label: 'Waiting' },
		{ value: 'resolved', label: 'Resolved' }
	];

	// Validation
	const isValid = $derived(content.trim().length > 0);
	const showWaitingFor = $derived(status === 'waiting');

	// Handle keyboard shortcuts
	function handleKeyDown(e: KeyboardEvent) {
		// Esc to close
		if (e.key === 'Escape') {
			e.preventDefault();
			onClose();
			return;
		}

		// Cmd/Ctrl + Enter to save
		if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && isValid && !isSubmitting) {
			e.preventDefault();
			handleSubmit();
		}
	}

	// Handle form submission
	async function handleSubmit() {
		if (!isValid || isSubmitting) return;

		isSubmitting = true;
		error = null;

		try {
			let resultTask: Task;

			if (mode === 'create') {
				// Create new task
				resultTask = await api.tasks.create({
					content: content.trim(),
					workspaceId: 'amk',
					userId: 'amk',
					area: area || null,
					context: context || null,
					status,
					waitingFor: showWaitingFor ? waitingFor.trim() || null : null,
					reminderDate: reminderDate || null
				});

				// Record action for undo
				recordAction({
					type: 'task-add',
					description: `Added task: ${content.substring(0, 40)}${content.length > 40 ? '...' : ''}`,
					reverseAction: async () => {
						await api.tasks.delete(resultTask.id);
					},
					data: { taskId: resultTask.id, content }
				});

				speak('Task created', 'low');
			} else {
				// Update existing task
				if (!task?.id) {
					throw new Error('Task ID missing for update');
				}

				const previousData = { ...task };

				resultTask = await api.tasks.update(task.id, {
					content: content.trim(),
					area: area || null,
					context: context || null,
					status,
					waitingFor: showWaitingFor ? waitingFor.trim() || null : null,
					reminderDate: reminderDate || null
				});

				// Record action for undo
				recordAction({
					type: 'task-add', // Reusing type for simplicity
					description: `Updated task: ${content.substring(0, 40)}${content.length > 40 ? '...' : ''}`,
					reverseAction: async () => {
						await api.tasks.update(task.id, {
							content: previousData.content,
							area: previousData.area,
							context: previousData.context,
							status: previousData.status,
							waitingFor: previousData.waitingFor,
							reminderDate: previousData.reminderDate
						});
					},
					data: { taskId: task.id, previousData, newData: resultTask }
				});

				speak('Task updated', 'low');
			}

			onSuccess(resultTask);
		} catch (err) {
			console.error('Failed to save task:', err);
			error = err instanceof Error ? err.message : 'Failed to save task';
			speak('Failed to save task', 'high');
		} finally {
			isSubmitting = false;
		}
	}

	// Handle delete
	async function handleDelete() {
		if (!task?.id || isSubmitting) return;

		const confirmed = confirm(`Delete task "${task.content}"?`);
		if (!confirmed) return;

		isSubmitting = true;
		error = null;

		try {
			const deletedTask = { ...task };

			await api.tasks.delete(task.id);

			// Record action for undo
			recordAction({
				type: 'task-delete',
				description: `Deleted task: ${task.content.substring(0, 40)}${task.content.length > 40 ? '...' : ''}`,
				reverseAction: async () => {
					await api.tasks.create({
						content: deletedTask.content,
						workspaceId: deletedTask.workspaceId,
						userId: deletedTask.userId,
						area: deletedTask.area,
						context: deletedTask.context,
						status: deletedTask.status,
						waitingFor: deletedTask.waitingFor,
						reminderDate: deletedTask.reminderDate
					});
				},
				data: deletedTask
			});

			speak('Task deleted', 'medium');
			onClose();
		} catch (err) {
			console.error('Failed to delete task:', err);
			error = err instanceof Error ? err.message : 'Failed to delete task';
			speak('Failed to delete task', 'high');
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:window on:keydown={handleKeyDown} />

<div
	class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
	onclick={onClose}
>
	<div
		class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
		onclick={(e) => e.stopPropagation()}
	>
		<!-- Header -->
		<div class="sticky top-0 bg-white border-b border-cloud-200 px-6 py-4 rounded-t-2xl">
			<h2 class="text-xl font-semibold text-cloud-600">
				{mode === 'create' ? 'Add New Task' : 'Edit Task'}
			</h2>
			<p class="text-sm text-cloud-500 mt-1">
				{mode === 'create' ? 'Quick capture - takes 30 seconds' : 'Update task details'}
			</p>
		</div>

		<!-- Content -->
		<div class="px-6 py-6 space-y-5">
			<!-- Error message -->
			{#if error}
				<div class="bg-red-50 border border-red-200 rounded-lg p-4">
					<p class="text-sm text-red-800">{error}</p>
				</div>
			{/if}

			<!-- Content (required) -->
			<div>
				<label for="content" class="block text-sm font-medium text-cloud-700 mb-2">
					Task <span class="text-red-500">*</span>
				</label>
				<textarea
					id="content"
					bind:value={content}
					rows="3"
					placeholder="e.g., Call @leon about Peters Paper partnership"
					class="w-full px-3 py-2 border border-cloud-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric-500 text-sm resize-none"
					autofocus
				></textarea>
			</div>

			<!-- Two column layout for area and context -->
			<div class="grid grid-cols-2 gap-4">
				<!-- Area -->
				<div>
					<label for="area" class="block text-sm font-medium text-cloud-700 mb-2">
						Area
					</label>
					<select
						id="area"
						bind:value={area}
						class="w-full px-3 py-2 border border-cloud-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric-500 text-sm bg-white"
					>
						{#each areaOptions as option}
							<option value={option.value}>{option.label}</option>
						{/each}
					</select>
				</div>

				<!-- Context -->
				<div>
					<label for="context" class="block text-sm font-medium text-cloud-700 mb-2">
						Context
					</label>
					<select
						id="context"
						bind:value={context}
						class="w-full px-3 py-2 border border-cloud-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric-500 text-sm bg-white"
					>
						{#each contextOptions as option}
							<option value={option.value}>{option.label}</option>
						{/each}
					</select>
				</div>
			</div>

			<!-- Two column layout for status and reminder -->
			<div class="grid grid-cols-2 gap-4">
				<!-- Status -->
				<div>
					<label for="status" class="block text-sm font-medium text-cloud-700 mb-2">
						Status
					</label>
					<select
						id="status"
						bind:value={status}
						class="w-full px-3 py-2 border border-cloud-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric-500 text-sm bg-white"
					>
						{#each statusOptions as option}
							<option value={option.value}>{option.label}</option>
						{/each}
					</select>
				</div>

				<!-- Reminder Date -->
				<div>
					<label for="reminderDate" class="block text-sm font-medium text-cloud-700 mb-2">
						Reminder
					</label>
					<input
						id="reminderDate"
						type="date"
						bind:value={reminderDate}
						class="w-full px-3 py-2 border border-cloud-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric-500 text-sm"
					/>
				</div>
			</div>

			<!-- Waiting For (conditional) -->
			{#if showWaitingFor}
				<div>
					<label for="waitingFor" class="block text-sm font-medium text-cloud-700 mb-2">
						Waiting For
					</label>
					<input
						id="waitingFor"
						type="text"
						bind:value={waitingFor}
						placeholder="e.g., @leon response on proposal"
						class="w-full px-3 py-2 border border-cloud-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric-500 text-sm"
					/>
				</div>
			{/if}

			<!-- Keyboard hint -->
			<div class="bg-cloud-50 rounded-lg p-3 text-xs text-cloud-500">
				<p>💡 <kbd class="px-1 py-0.5 bg-white border border-cloud-300 rounded">Esc</kbd> to cancel • <kbd class="px-1 py-0.5 bg-white border border-cloud-300 rounded">⌘</kbd> + <kbd class="px-1 py-0.5 bg-white border border-cloud-300 rounded">Enter</kbd> to save</p>
			</div>
		</div>

		<!-- Actions -->
		<div class="sticky bottom-0 bg-white border-t border-cloud-200 px-6 py-4 rounded-b-2xl">
			<div class="flex gap-3">
				{#if mode === 'edit'}
					<button
						onclick={handleDelete}
						disabled={isSubmitting}
						class="px-4 py-2.5 text-sm font-medium text-red-600 hover:text-red-700 border border-red-300 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Delete
					</button>
				{/if}

				<div class="flex-1"></div>

				<button
					onclick={onClose}
					disabled={isSubmitting}
					class="px-4 py-2.5 text-sm font-medium text-cloud-600 hover:text-cloud-700 border border-cloud-300 rounded-lg hover:bg-cloud-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Cancel
				</button>

				<button
					onclick={handleSubmit}
					disabled={!isValid || isSubmitting}
					class="px-6 py-2.5 text-sm font-medium bg-electric-500 text-white rounded-lg hover:bg-electric-600 transition-colors disabled:bg-cloud-300 disabled:cursor-not-allowed"
				>
					{#if isSubmitting}
						Saving...
					{:else}
						{mode === 'create' ? 'Add Task' : 'Save Changes'}
					{/if}
				</button>
			</div>
		</div>
	</div>
</div>
