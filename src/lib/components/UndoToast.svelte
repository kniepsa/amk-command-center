<script lang="ts">
	import { actionHistory, undoLast, getLastAction } from '$lib/stores/action-history.svelte';
	import { browser } from '$app/environment';

	let visible = $state(false);
	let hideTimeout: ReturnType<typeof setTimeout> | null = null;

	// Show toast when new action is recorded
	$effect(() => {
		const lastAction = actionHistory.last;

		if (lastAction) {
			visible = true;

			// Clear existing timeout
			if (hideTimeout) {
				clearTimeout(hideTimeout);
			}

			// Auto-dismiss after 5 seconds
			hideTimeout = setTimeout(() => {
				visible = false;
			}, 5000);
		}

		// Cleanup
		return () => {
			if (hideTimeout) {
				clearTimeout(hideTimeout);
			}
		};
	});

	async function handleUndo() {
		const result = await undoLast();

		if (result.success) {
			// Hide toast immediately on successful undo
			visible = false;

			if (hideTimeout) {
				clearTimeout(hideTimeout);
			}
		}
	}

	function dismiss() {
		visible = false;

		if (hideTimeout) {
			clearTimeout(hideTimeout);
		}
	}

	// Get keyboard shortcut text based on platform
	const shortcut = browser
		? navigator.platform.toLowerCase().includes('mac')
			? 'Cmd+Shift+Z'
			: 'Ctrl+Shift+Z'
		: 'Cmd+Shift+Z';
</script>

{#if visible && actionHistory.last}
	<div class="undo-toast" role="alert" aria-live="polite">
		<div class="undo-toast-content">
			<!-- Action description -->
			<div class="undo-toast-message">
				<span class="undo-toast-icon">↩️</span>
				<span class="undo-toast-text">{actionHistory.last.description}</span>
			</div>

			<!-- Action buttons -->
			<div class="undo-toast-actions">
				<button
					onclick={handleUndo}
					class="undo-toast-button undo-toast-button-primary"
					title={`Undo (${shortcut})`}
				>
					Undo
				</button>

				<button
					onclick={dismiss}
					class="undo-toast-button undo-toast-button-dismiss"
					aria-label="Dismiss"
				>
					×
				</button>
			</div>
		</div>

		<!-- Keyboard shortcut hint -->
		<div class="undo-toast-hint">
			{shortcut}
		</div>
	</div>
{/if}

<style>
	.undo-toast {
		position: fixed;
		bottom: 1.5rem;
		right: 1.5rem;
		z-index: 50;
		max-width: 400px;
		background: #1f2937;
		color: white;
		border-radius: 0.75rem;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1);
		animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
		overflow: hidden;
	}

	@keyframes slideIn {
		from {
			transform: translateY(100%);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	.undo-toast-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 1rem 1.25rem;
	}

	.undo-toast-message {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex: 1;
		min-width: 0;
	}

	.undo-toast-icon {
		font-size: 1.25rem;
		flex-shrink: 0;
	}

	.undo-toast-text {
		font-size: 0.875rem;
		line-height: 1.4;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.undo-toast-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	.undo-toast-button {
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		border: none;
		cursor: pointer;
		transition: all 0.2s;
	}

	.undo-toast-button-primary {
		background: #3b82f6;
		color: white;
	}

	.undo-toast-button-primary:hover {
		background: #2563eb;
		transform: translateY(-1px);
	}

	.undo-toast-button-primary:active {
		transform: translateY(0);
	}

	.undo-toast-button-dismiss {
		background: transparent;
		color: #9ca3af;
		padding: 0.25rem 0.5rem;
		font-size: 1.5rem;
		line-height: 1;
	}

	.undo-toast-button-dismiss:hover {
		color: white;
		background: rgba(255, 255, 255, 0.1);
	}

	.undo-toast-hint {
		padding: 0.5rem 1.25rem;
		background: rgba(0, 0, 0, 0.2);
		font-size: 0.75rem;
		color: #9ca3af;
		text-align: right;
		border-top: 1px solid rgba(255, 255, 255, 0.05);
	}

	/* Mobile responsive */
	@media (max-width: 640px) {
		.undo-toast {
			bottom: 1rem;
			right: 1rem;
			left: 1rem;
			max-width: none;
		}

		.undo-toast-content {
			flex-direction: column;
			align-items: stretch;
			gap: 0.75rem;
		}

		.undo-toast-actions {
			justify-content: flex-end;
		}

		.undo-toast-button-primary {
			flex: 1;
		}
	}
</style>
