<script lang="ts">
	import { shortcuts } from '$lib/stores/shortcuts.svelte';

	function handleClose() {
		shortcuts.close();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			handleClose();
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if shortcuts.isOpen}
	<div
		class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
		onclick={(e) => {
			if (e.target === e.currentTarget) handleClose();
		}}
		role="dialog"
		aria-modal="true"
		aria-labelledby="shortcuts-title"
	>
		<div
			class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto animate-fade-in"
		>
			<!-- Header -->
			<div
				class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl"
			>
				<h2 id="shortcuts-title" class="text-xl font-semibold text-gray-800">
					⌨️ Keyboard Shortcuts
				</h2>
				<button
					onclick={handleClose}
					class="text-gray-400 hover:text-gray-600 text-2xl leading-none transition-colors"
					aria-label="Close shortcuts dialog"
				>
					×
				</button>
			</div>

			<!-- Shortcuts List -->
			<div class="p-6 space-y-6">
				{#each Object.entries(shortcuts.categorized) as [category, items]}
					<div>
						<h3 class="text-sm font-semibold text-gray-500 uppercase mb-3 tracking-wide">
							{category}
						</h3>
						<div class="space-y-2">
							{#each items as shortcut}
								<div class="flex items-center justify-between py-2 hover:bg-gray-50 px-3 rounded-lg transition-colors">
									<span class="text-gray-700">{shortcut.description}</span>
									<kbd
										class="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-md text-sm font-mono text-gray-700 shadow-sm"
									>
										{shortcut.key}
									</kbd>
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>

			<!-- Footer -->
			<div
				class="border-t border-gray-200 px-6 py-4 bg-gray-50 text-center text-sm text-gray-500 rounded-b-2xl"
			>
				Press <kbd
					class="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono mx-1"
					>Esc</kbd
				> to close
			</div>
		</div>
	</div>
{/if}

<style>
	kbd {
		font-family: ui-monospace, 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', 'Courier New',
			monospace;
		font-size: 0.875em;
	}

	@keyframes fade-in {
		from {
			opacity: 0;
			transform: scale(0.95);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	.animate-fade-in {
		animation: fade-in 0.2s ease-out;
	}
</style>
