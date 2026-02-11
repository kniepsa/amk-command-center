<script lang="ts">
	import CoachChallenge from './CoachChallenge.svelte';
	import type { CoachChallenge as CoachChallengeType } from '$lib/types/coach';

	type Message = {
		role: 'user' | 'assistant';
		content: string;
		coaches?: CoachChallengeType[];
	};

	type Props = {
		messages: Message[];
		onSubmit: (content: string) => void;
		isLoading?: boolean;
	};

	let { messages, onSubmit, isLoading = false }: Props = $props();

	let currentInput = $state('');
	let chatContainer: HTMLDivElement;

	// Auto-scroll to bottom when new messages arrive
	$effect(() => {
		if (messages.length > 0 && chatContainer) {
			chatContainer.scrollTop = chatContainer.scrollHeight;
		}
	});

	function handleSubmit() {
		if (currentInput.trim()) {
			onSubmit(currentInput.trim());
			currentInput = '';
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSubmit();
		}
	}

	// Format date header
	const today = new Date().toLocaleDateString('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
</script>

<div class="bg-white rounded-xl shadow-lg flex flex-col h-full">
	<!-- Header -->
	<div class="p-6 border-b border-slate-200">
		<div class="flex items-center justify-between">
			<div>
				<h2 class="text-2xl font-bold text-slate-900">📅 {today}</h2>
				<p class="text-slate-600 text-sm mt-1">Chat-first daily entry</p>
			</div>
			<button
				class="px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
			>
				Recent ▾
			</button>
		</div>
	</div>

	<!-- Messages Area -->
	<div bind:this={chatContainer} class="flex-1 overflow-y-auto p-6 space-y-4">
		{#if messages.length === 0}
			<div class="text-center py-12">
				<p class="text-slate-500 text-lg mb-2">No entries yet today</p>
				<p class="text-slate-400 text-sm">
					Paste your voice transcript or type naturally to start
				</p>
			</div>
		{:else}
			{#each messages as message}
				{#if message.role === 'user'}
					<div class="flex justify-end">
						<div class="bg-blue-500 text-white rounded-lg px-4 py-3 max-w-[80%]">
							<p class="whitespace-pre-wrap">{message.content}</p>
						</div>
					</div>
				{:else}
					<div class="flex justify-start">
						<div class="bg-slate-100 text-slate-900 rounded-lg px-4 py-3 max-w-[80%]">
							<div class="flex items-center gap-2 mb-2">
								<span class="text-sm font-semibold text-blue-600">Claude</span>
							</div>
							<p class="whitespace-pre-wrap">{message.content}</p>
						</div>
					</div>

					<!-- Coach Challenges (if any) -->
					{#if message.coaches && message.coaches.length > 0}
						<div class="pl-4">
							{#each message.coaches as challenge}
								<CoachChallenge
									{challenge}
									onTellMeMore={() => {
										console.log('Tell me more about', challenge.coach_id);
										// TODO: Expand coach context
									}}
									onIgnore={() => {
										console.log('Ignoring coach', challenge.coach_id);
										// TODO: Implement coach dismissal
									}}
								/>
							{/each}
						</div>
					{/if}
				{/if}
			{/each}

			<!-- Loading Indicator -->
			{#if isLoading}
				<div class="flex justify-start">
					<div class="bg-slate-100 text-slate-900 rounded-lg px-4 py-3">
						<div class="flex items-center gap-2">
							<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
							<span class="text-sm text-slate-600">Extracting data...</span>
						</div>
					</div>
				</div>
			{/if}
		{/if}
	</div>

	<!-- Input Area -->
	<div class="p-6 border-t border-slate-200">
		<div class="flex gap-3">
			<textarea
				bind:value={currentInput}
				onkeydown={handleKeydown}
				placeholder="Type here or paste voice transcript... (Shift+Enter for new line, Enter to send)"
				class="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
				rows="3"
			></textarea>
			<button
				onclick={handleSubmit}
				disabled={!currentInput.trim() || isLoading}
				class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed font-medium"
			>
				{isLoading ? 'Processing...' : 'Send'}
			</button>
		</div>
	</div>
</div>
