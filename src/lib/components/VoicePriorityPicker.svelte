<script lang="ts">
	/**
	 * Voice Priority Picker
	 * Replaces drag-and-drop with voice-based selection
	 * Implements Warren Buffett 25/5 rule via voice commands
	 */

	import { speak, listenForResponse } from '$lib/utils/voice-commands';
	import Button from './shared/Button.svelte';

	interface Task {
		id: string;
		title: string;
		priority?: number;
		selected?: boolean;
	}

	interface Props {
		tasks: Task[];
		maxPicks?: number;
		onComplete?: (selected: Task[]) => void;
		onCancel?: () => void;
	}

	let { tasks = [], maxPicks = 5, onComplete, onCancel }: Props = $props();

	let currentIndex = $state(0);
	let selectedTasks = $state<Task[]>([]);
	let isListening = $state(false);
	let isActive = $state(false);
	let statusMessage = $state('');
	let error = $state<string | null>(null);

	/**
	 * Start voice-based priority selection
	 */
	async function startVoiceSelection() {
		if (tasks.length === 0) {
			error = 'No tasks available to prioritize';
			return;
		}

		isActive = true;
		currentIndex = 0;
		selectedTasks = [];
		error = null;

		// Initial instructions
		const instruction = `You have ${tasks.length} tasks. I'll read them one by one. Say "yes" for top priority, "no" to skip, or "done" when you have ${maxPicks}.`;
		speak(instruction, 'high');
		statusMessage = instruction;

		// Wait a moment for TTS to finish
		await new Promise((resolve) => setTimeout(resolve, 3000));

		// Start reading tasks
		await readNextTask();
	}

	/**
	 * Read the next task and listen for response
	 */
	async function readNextTask() {
		if (currentIndex >= tasks.length || selectedTasks.length >= maxPicks) {
			await completeSelection();
			return;
		}

		const task = tasks[currentIndex];
		isListening = true;
		statusMessage = `Task ${currentIndex + 1} of ${tasks.length}`;

		// Read task title
		speak(task.title, 'high');

		try {
			// Listen for response
			const response = await listenForResponse(['yes', 'no', 'skip', 'done'], 10000);

			isListening = false;

			if (!response) {
				// Timeout - ask again
				speak('I didn\'t hear you. Say "yes", "no", or "done"', 'medium');
				await new Promise((resolve) => setTimeout(resolve, 2000));
				await readNextTask();
				return;
			}

			const normalized = response.toLowerCase();

			if (normalized.includes('yes')) {
				// Add to selected
				selectedTasks.push({ ...task, priority: selectedTasks.length + 1 });
				speak(`Priority ${selectedTasks.length}`, 'medium');

				if (selectedTasks.length >= maxPicks) {
					await completeSelection();
					return;
				}
			} else if (normalized.includes('done')) {
				await completeSelection();
				return;
			}
			// "no" or "skip" - just move to next

			// Move to next task
			currentIndex++;
			await new Promise((resolve) => setTimeout(resolve, 500));
			await readNextTask();
		} catch (err) {
			isListening = false;
			error = err instanceof Error ? err.message : 'Voice recognition error';
			speak('Voice recognition error. Try again.', 'high');
		}
	}

	/**
	 * Complete the selection process
	 */
	async function completeSelection() {
		isActive = false;
		isListening = false;

		if (selectedTasks.length === 0) {
			speak('No priorities selected', 'medium');
			statusMessage = 'No priorities selected';
			return;
		}

		if (selectedTasks.length < maxPicks) {
			const message = `Only ${selectedTasks.length} priorities selected. Warren Buffett recommends ${maxPicks}. Continue with ${selectedTasks.length}?`;
			speak(message, 'high');
			statusMessage = message;

			// Listen for confirmation
			try {
				const response = await listenForResponse(['yes', 'no'], 5000);

				if (response && response.toLowerCase().includes('no')) {
					// Restart
					await startVoiceSelection();
					return;
				}
			} catch (err) {
				console.error('Confirmation error:', err);
			}
		}

		const message = `Top ${selectedTasks.length} selected. Moving ${tasks.length - selectedTasks.length} tasks to backlog.`;
		speak(message, 'high');
		statusMessage = message;

		// Call completion handler
		if (onComplete) {
			onComplete(selectedTasks);
		}
	}

	/**
	 * Manual selection (click-based fallback)
	 */
	function toggleTaskSelection(task: Task) {
		const index = selectedTasks.findIndex((t) => t.id === task.id);

		if (index >= 0) {
			// Remove from selection
			selectedTasks.splice(index, 1);
			// Renumber remaining
			selectedTasks = selectedTasks.map((t, i) => ({ ...t, priority: i + 1 }));
		} else if (selectedTasks.length < maxPicks) {
			// Add to selection
			selectedTasks.push({ ...task, priority: selectedTasks.length + 1 });
		}

		selectedTasks = selectedTasks; // Trigger reactivity
	}

	/**
	 * Complete selection manually
	 */
	function completeManual() {
		if (onComplete) {
			onComplete(selectedTasks);
		}
	}

	/**
	 * Cancel selection
	 */
	function cancel() {
		isActive = false;
		isListening = false;
		selectedTasks = [];

		if (onCancel) {
			onCancel();
		}
	}
</script>

<div
	class="bg-white backdrop-blur-glass border border-cloud-200 rounded-2xl p-6 shadow-glass"
>
	<div class="mb-6">
		<h2 class="text-2xl font-bold text-cloud-900 mb-2">Warren Buffett 25/5 Rule</h2>
		<p class="text-cloud-600">
			Pick your top {maxPicks} priorities. Everything else is a distraction.
		</p>
	</div>

	<!-- Voice Mode Instructions -->
	{#if !isActive}
		<div class="space-y-4 mb-6">
			<div class="bg-electric-500/10 border-l-4 border-electric-500 rounded p-4">
				<h3 class="font-semibold text-electric-600 mb-2">🎤 Voice Mode (Recommended)</h3>
				<p class="text-sm text-cloud-600 mb-3">
					I'll read each task. Say "yes" for priority, "no" to skip, or "done" when finished.
				</p>
				<Button onclick={startVoiceSelection} variant="primary">
					Start Voice Selection
				</Button>
			</div>

			<div class="bg-cloud-100 border-l-4 border-cloud-400 rounded p-4">
				<h3 class="font-semibold text-cloud-700 mb-2">👆 Manual Mode</h3>
				<p class="text-sm text-cloud-600">Or click tasks below to select manually</p>
			</div>
		</div>
	{/if}

	<!-- Active Voice Selection -->
	{#if isActive}
		<div class="mb-6">
			<div class="bg-electric-500/10 border-l-4 border-electric-500 rounded p-4">
				<div class="flex items-center gap-3 mb-2">
					{#if isListening}
						<div class="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
						<span class="text-sm font-medium text-electric-600">Listening...</span>
					{:else}
						<div class="w-3 h-3 bg-electric-500 rounded-full"></div>
						<span class="text-sm font-medium text-electric-600">Speaking...</span>
					{/if}
				</div>
				<p class="text-sm text-cloud-600">{statusMessage}</p>

				{#if currentIndex < tasks.length}
					<div class="mt-3 p-3 bg-white rounded border border-electric-200">
						<p class="font-medium text-cloud-900">{tasks[currentIndex].title}</p>
					</div>
				{/if}
			</div>

			<div class="flex gap-2 mt-4">
				<Button onclick={cancel} variant="secondary" size="sm">
					Cancel
				</Button>
				<Button
					onclick={async () => await completeSelection()}
					variant="primary"
					size="sm"
					disabled={selectedTasks.length === 0}
				>
					Done ({selectedTasks.length}/{maxPicks})
				</Button>
			</div>
		</div>
	{/if}

	<!-- Error Message -->
	{#if error}
		<div class="bg-red-50 border-l-4 border-red-400 rounded p-3 mb-4">
			<div class="flex items-start justify-between gap-3">
				<p class="text-sm text-red-800">{error}</p>
				<button
					onclick={() => (error = null)}
					class="text-red-400 hover:text-red-600 text-lg leading-none"
					aria-label="Dismiss"
				>
					×
				</button>
			</div>
		</div>
	{/if}

	<!-- Selected Priorities Summary -->
	{#if selectedTasks.length > 0}
		<div class="mb-6">
			<h3 class="font-semibold text-cloud-900 mb-3">
				Your Top {selectedTasks.length} Priorities:
			</h3>
			<ol class="space-y-2">
				{#each selectedTasks as task}
					<li class="flex items-center gap-3 p-3 bg-green-50 border-l-4 border-green-500 rounded">
						<span class="font-bold text-green-600 text-lg">{task.priority}</span>
						<span class="flex-1 text-cloud-900">{task.title}</span>
						<button
							onclick={() => toggleTaskSelection(task)}
							class="text-red-400 hover:text-red-600 text-sm"
							aria-label="Remove"
						>
							Remove
						</button>
					</li>
				{/each}
			</ol>
		</div>
	{/if}

	<!-- Task List (Manual Selection) -->
	{#if !isActive}
		<div class="space-y-2">
			<h3 class="font-semibold text-cloud-700 mb-3">All Tasks ({tasks.length})</h3>
			{#each tasks as task}
				{@const isSelected = selectedTasks.some((t) => t.id === task.id)}
				{@const priority = selectedTasks.find((t) => t.id === task.id)?.priority}

				<button
					onclick={() => toggleTaskSelection(task)}
					class="w-full text-left p-3 rounded border transition-all {isSelected
						? 'bg-green-50 border-green-500 border-l-4'
						: 'bg-white border-cloud-200 hover:border-electric-300'}"
				>
					<div class="flex items-center gap-3">
						{#if isSelected && priority}
							<span class="font-bold text-green-600 text-lg">{priority}</span>
						{:else}
							<span class="w-6 h-6 rounded border-2 border-cloud-300"></span>
						{/if}
						<span class="flex-1 {isSelected ? 'font-medium text-cloud-900' : 'text-cloud-700'}">
							{task.title}
						</span>
					</div>
				</button>
			{/each}
		</div>

		<!-- Manual Complete Button -->
		{#if selectedTasks.length > 0 && !isActive}
			<div class="mt-6 flex gap-3">
				<Button onclick={cancel} variant="secondary">
					Cancel
				</Button>
				<Button onclick={completeManual} variant="primary">
					Complete ({selectedTasks.length}/{maxPicks})
				</Button>
			</div>
		{/if}
	{/if}
</div>
