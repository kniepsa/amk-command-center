<script lang="ts">
	/**
	 * Voice Help Modal
	 * Shows all available voice commands organized by category
	 * Triggered by "what can i say" or "help" voice command
	 */

	import {
		getCommandsByCategory,
		getCategoryDisplayName,
		calculateVoiceCoverage,
		speak,
		type VoiceCommand,
	} from '$lib/utils/voice-commands';
	import Button from './shared/Button.svelte';

	interface Props {
		isOpen?: boolean;
		onClose?: () => void;
	}

	let { isOpen = false, onClose }: Props = $props();

	let selectedCategory = $state<string | null>(null);
	let searchQuery = $state('');
	let isPlayingExample = $state(false);

	const commandsByCategory = getCommandsByCategory();
	const categories = Object.keys(commandsByCategory);
	const voiceCoverage = calculateVoiceCoverage();

	/**
	 * Filter commands by search query
	 */
	const filteredCommands = $derived(() => {
		if (!searchQuery.trim()) {
			return commandsByCategory;
		}

		const query = searchQuery.toLowerCase();
		const filtered: Record<string, VoiceCommand[]> = {};

		for (const [category, commands] of Object.entries(commandsByCategory)) {
			const matchingCommands = commands.filter(
				(cmd) =>
					cmd.description.toLowerCase().includes(query) ||
					cmd.examples.some((ex) => ex.toLowerCase().includes(query))
			);

			if (matchingCommands.length > 0) {
				filtered[category] = matchingCommands;
			}
		}

		return filtered;
	});

	/**
	 * Play example command via TTS
	 */
	function playExample(example: string) {
		isPlayingExample = true;
		speak(example, 'high');
		setTimeout(() => {
			isPlayingExample = false;
		}, 2000);
	}

	/**
	 * Close modal
	 */
	function close() {
		if (onClose) {
			onClose();
		}
	}

	/**
	 * Handle keyboard shortcuts
	 */
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			close();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
	<div
		class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
		onclick={close}
	>
		<div
			class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
			onclick={(e) => e.stopPropagation()}
		>
			<!-- Header -->
			<div class="sticky top-0 bg-white border-b border-cloud-200 p-6 z-10">
				<div class="flex items-center justify-between mb-4">
					<div>
						<h2 class="text-2xl font-bold text-cloud-900">🎤 Voice Commands</h2>
						<p class="text-sm text-cloud-600 mt-1">
							{voiceCoverage.toFixed(0)}% of app features are voice-accessible
						</p>
					</div>
					<button
						onclick={close}
						class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-cloud-100 text-cloud-400 hover:text-cloud-600 transition-colors"
						aria-label="Close"
					>
						<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>

				<!-- Search -->
				<div class="relative">
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Search commands..."
						class="w-full px-4 py-2 pl-10 border border-cloud-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric-500 focus:border-transparent"
					/>
					<svg
						class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cloud-400"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
				</div>
			</div>

			<!-- Content -->
			<div class="overflow-y-auto p-6 max-h-[calc(90vh-180px)]">
				<!-- Quick Tips -->
				<div class="bg-electric-500/10 border-l-4 border-electric-500 rounded p-4 mb-6">
					<h3 class="font-semibold text-electric-600 mb-2">💡 Quick Tips</h3>
					<ul class="text-sm text-cloud-700 space-y-1">
						<li>• Speak naturally - commands are flexible</li>
						<li>• Say "undo" to reverse any action</li>
						<li>• Use "and" for follow-up commands (e.g., "mark running" → "and sauna")</li>
						<li>• Click examples below to hear pronunciation</li>
					</ul>
				</div>

				<!-- Category Tabs -->
				<div class="flex gap-2 mb-6 overflow-x-auto pb-2">
					<button
						onclick={() => (selectedCategory = null)}
						class="px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap {selectedCategory ===
						null
							? 'bg-electric-500 text-white'
							: 'bg-cloud-100 text-cloud-700 hover:bg-cloud-200'}"
					>
						All Commands
					</button>
					{#each categories as category}
						<button
							onclick={() => (selectedCategory = category)}
							class="px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap {selectedCategory ===
							category
								? 'bg-electric-500 text-white'
								: 'bg-cloud-100 text-cloud-700 hover:bg-cloud-200'}"
						>
							{getCategoryDisplayName(category)}
						</button>
					{/each}
				</div>

				<!-- Commands List -->
				<div class="space-y-6">
					{#each Object.entries(filteredCommands()) as [category, commands]}
						{#if !selectedCategory || selectedCategory === category}
							<div class="border border-cloud-200 rounded-xl overflow-hidden">
								<div class="bg-cloud-50 px-4 py-3 border-b border-cloud-200">
									<h3 class="font-semibold text-cloud-900">
										{getCategoryDisplayName(category)}
									</h3>
									<p class="text-xs text-cloud-600 mt-0.5">
										{commands.length} command{commands.length !== 1 ? 's' : ''}
									</p>
								</div>

								<div class="divide-y divide-cloud-100">
									{#each commands as command}
										<div class="p-4 hover:bg-cloud-50 transition-colors">
											<p class="font-medium text-cloud-900 mb-2">{command.description}</p>

											<div class="flex flex-wrap gap-2">
												{#each command.examples as example}
													<button
														onclick={() => playExample(example)}
														disabled={isPlayingExample}
														class="group flex items-center gap-2 px-3 py-1.5 bg-electric-500/10 hover:bg-electric-500/20 text-electric-600 rounded-lg text-sm transition-colors disabled:opacity-50"
													>
														<svg
															class="w-4 h-4"
															fill="currentColor"
															viewBox="0 0 20 20"
														>
															<path
																d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
															/>
														</svg>
														<span class="font-mono">"{example}"</span>
													</button>
												{/each}
											</div>
										</div>
									{/each}
								</div>
							</div>
						{/if}
					{/each}

					{#if Object.keys(filteredCommands()).length === 0}
						<div class="text-center py-12">
							<svg
								class="w-16 h-16 mx-auto text-cloud-300 mb-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								/>
							</svg>
							<p class="text-cloud-600">No commands found matching "{searchQuery}"</p>
						</div>
					{/if}
				</div>
			</div>

			<!-- Footer -->
			<div class="sticky bottom-0 bg-white border-t border-cloud-200 p-4">
				<div class="flex items-center justify-between">
					<div class="text-sm text-cloud-600">
						<span class="font-medium">Tip:</span> Press <kbd
							class="px-2 py-1 bg-cloud-100 rounded text-xs font-mono">Esc</kbd
						> to close
					</div>
					<Button onclick={close} variant="primary">
						Got it
					</Button>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	kbd {
		display: inline-block;
		padding: 0.25rem 0.5rem;
		background-color: #f3f4f6;
		border: 1px solid #d1d5db;
		border-radius: 0.25rem;
		font-size: 0.75rem;
		font-family: monospace;
	}
</style>
