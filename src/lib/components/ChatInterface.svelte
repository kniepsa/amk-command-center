<script lang="ts">
	import { BRAND } from '$lib/brand';
	import CoachChallenge from './CoachChallenge.svelte';
	import LearningSession from './LearningSession.svelte';
	import type { CoachChallenge as CoachChallengeType } from '$lib/types/coach';

	type Message = {
		role: 'user' | 'assistant';
		content: string;
		coaches?: CoachChallengeType[];
		showLearning?: boolean;
	};

	type Props = {
		messages: Message[];
		onSubmit: (content: string) => void;
		isLoading?: boolean;
		onVoiceClick?: () => void;
	};

	let { messages, onSubmit, isLoading = false, onVoiceClick }: Props = $props();

	let currentInput = $state('');
	let chatContainer: HTMLDivElement;
	let showLearningInEmpty = $state(true);

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

<div class="bg-white rounded-xl border border-cloud-200 flex flex-col h-full">
	<!-- Messages Area -->
	<div bind:this={chatContainer} class="flex-1 overflow-y-auto p-6 space-y-6">
		{#if messages.length === 0}
			<!-- Empty State: Learning Session OR Voice -->
			{#if showLearningInEmpty}
				<div class="space-y-4">
					<!-- Voice Button (compact, top-right) -->
					{#if onVoiceClick}
						<div class="flex justify-end">
							<button
								onclick={onVoiceClick}
								class="w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
								title="Start voice recording"
							>
							</button>
						</div>
					{/if}

					<!-- Learning Session -->
					<LearningSession />
				</div>
			{:else}
				<!-- Fallback: Just Green Circle -->
				<div class="flex items-center justify-center h-full min-h-[400px]">
					{#if onVoiceClick}
						<button
							onclick={onVoiceClick}
							class="w-20 h-20 bg-green-500 hover:bg-green-600 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
							title="Start recording"
						>
						</button>
					{/if}
				</div>
			{/if}
		{:else}
			{#each messages as message}
				{#if message.role === 'user'}
					<div class="flex justify-end">
						<div class="text-cloud-600 max-w-[80%]">
							<p class="whitespace-pre-wrap leading-relaxed">{message.content}</p>
						</div>
					</div>
				{:else}
					<div class="flex justify-start">
						<div class="border-l-2 border-electric-500 pl-4 max-w-[80%]">
							<p class="text-cloud-500 whitespace-pre-wrap leading-relaxed">{message.content}</p>
						</div>
					</div>

					<!-- Coach Challenges (if any) -->
					{#if message.coaches && message.coaches.length > 0}
						<div class="pl-6 space-y-3">
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

					<!-- Learning Session (if triggered) -->
					{#if message.showLearning}
						<div class="pl-6 mt-4">
							<LearningSession />
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
							<span class="text-sm text-cloud-400">Extracting...</span>
						</div>
					</div>
				</div>
			{/if}
		{/if}
	</div>

	<!-- Input Area -->
	<div class="p-6 border-t border-cloud-200">
		<div class="flex gap-3 items-end">
			<textarea
				bind:value={currentInput}
				onkeydown={handleKeydown}
				placeholder="Type your message or use voice"
				class="flex-1 px-4 py-3 bg-white border border-cloud-200 rounded-lg text-cloud-600 placeholder-cloud-400 focus:outline-none focus:border-electric-500 resize-none"
				rows="3"
			></textarea>
			<button
				onclick={handleSubmit}
				disabled={!currentInput.trim() || isLoading}
				class="px-6 py-3 bg-electric-500 text-white rounded-lg hover:bg-electric-600 transition-colors disabled:bg-cloud-100 disabled:text-cloud-400 disabled:cursor-not-allowed font-medium"
			>
				Send
			</button>
		</div>
	</div>
</div>
