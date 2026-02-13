<script lang="ts">
	import { BRAND } from '$lib/brand';
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

<div class="bg-midnight-900 rounded-xl border border-glass-border flex flex-col h-full">
	<!-- Header -->
	<div class="p-6 border-b border-glass-border">
		<div class="flex items-center justify-between">
			<div>
				<h2 class="text-xl font-semibold text-white">{today}</h2>
				<p class="text-white/40 text-sm mt-1">Voice or type to start</p>
			</div>
		</div>
	</div>

	<!-- Messages Area -->
	<div bind:this={chatContainer} class="flex-1 overflow-y-auto p-6 space-y-6">
		{#if messages.length === 0}
			<div class="text-center py-20">
				<p class="text-white/40 text-base">Start by recording or typing</p>
			</div>
		{:else}
			{#each messages as message}
				{#if message.role === 'user'}
					<div class="flex justify-end">
						<div class="text-white/90 max-w-[80%]">
							<p class="whitespace-pre-wrap leading-relaxed">{message.content}</p>
						</div>
					</div>
				{:else}
					<div class="flex justify-start">
						<div class="border-l-2 border-electric-500 pl-4 max-w-[80%]">
							<p class="text-white/80 whitespace-pre-wrap leading-relaxed">{message.content}</p>
						</div>
					</div>

					<!-- Coach Challenges (if any) -->
					{#if message.coaches && message.coaches.length > 0}
						<div class="pl-6">
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
					<div class="border-l-2 border-electric-500 pl-4">
						<div class="flex items-center gap-2">
							<div class="animate-spin rounded-full h-3 w-3 border-b-2 border-electric-500"></div>
							<span class="text-sm text-white/40">Extracting...</span>
						</div>
					</div>
				</div>
			{/if}
		{/if}
	</div>

	<!-- Input Area -->
	<div class="p-6 border-t border-glass-border">
		<div class="flex gap-3">
			<textarea
				bind:value={currentInput}
				onkeydown={handleKeydown}
				placeholder="Type your message or use voice"
				class="flex-1 px-4 py-3 bg-midnight-800 border border-glass-border rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-electric-500 resize-none"
				rows="3"
			></textarea>
			<button
				onclick={handleSubmit}
				disabled={!currentInput.trim() || isLoading}
				class="px-6 py-3 bg-electric-500 text-midnight-950 rounded-lg hover:bg-electric-600 transition-colors disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed font-medium"
			>
				Send
			</button>
		</div>
	</div>
</div>
