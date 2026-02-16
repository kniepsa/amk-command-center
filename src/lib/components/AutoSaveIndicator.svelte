<script lang="ts">
	type SaveState = 'idle' | 'saving' | 'saved' | 'error';

	interface Props {
		state: SaveState;
		lastSaved?: Date;
		onRetry?: () => void;
	}

	let { state, lastSaved, onRetry }: Props = $props();

	function formatRelativeTime(date: Date): string {
		const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

		if (seconds < 5) return 'just now';
		if (seconds < 60) return `${seconds}s ago`;

		const minutes = Math.floor(seconds / 60);
		if (minutes < 60) return `${minutes}m ago`;

		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours}h ago`;

		return date.toLocaleDateString();
	}

	// Auto-update relative time every 10 seconds
	let relativeTime = $state('');
	$effect(() => {
		if (state === 'saved' && lastSaved) {
			relativeTime = formatRelativeTime(lastSaved);

			const interval = setInterval(() => {
				relativeTime = formatRelativeTime(lastSaved);
			}, 10000);

			return () => clearInterval(interval);
		}
	});
</script>

<div class="autosave-indicator">
	{#if state === 'saving'}
		<div class="autosave-content">
			<svg class="autosave-spinner" viewBox="0 0 24 24" fill="none">
				<circle
					class="autosave-spinner-track"
					cx="12"
					cy="12"
					r="10"
					stroke="currentColor"
					stroke-width="4"
				></circle>
				<circle
					class="autosave-spinner-head"
					cx="12"
					cy="12"
					r="10"
					stroke="currentColor"
					stroke-width="4"
					stroke-linecap="round"
				></circle>
			</svg>
			<span class="autosave-text">Saving...</span>
		</div>
	{:else if state === 'saved' && lastSaved}
		<div class="autosave-content">
			<span class="autosave-icon autosave-icon-success">✓</span>
			<span class="autosave-text">Saved {relativeTime}</span>
		</div>
	{:else if state === 'error'}
		<div class="autosave-content">
			<span class="autosave-icon autosave-icon-error">✗</span>
			<span class="autosave-text">Error saving</span>
			{#if onRetry}
				<button onclick={onRetry} class="autosave-retry">Retry</button>
			{/if}
		</div>
	{/if}
</div>

<style>
	.autosave-indicator {
		display: inline-flex;
		align-items: center;
		padding: 0.5rem 0.75rem;
		border-radius: 0.5rem;
		background: rgba(255, 255, 255, 0.8);
		border: 1px solid rgba(0, 0, 0, 0.1);
		font-size: 0.75rem;
		color: #6b7280;
	}

	.autosave-content {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.autosave-spinner {
		width: 1rem;
		height: 1rem;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	.autosave-spinner-track {
		opacity: 0.25;
	}

	.autosave-spinner-head {
		stroke-dasharray: 80;
		stroke-dashoffset: 60;
	}

	.autosave-icon {
		font-size: 1rem;
		font-weight: bold;
		line-height: 1;
	}

	.autosave-icon-success {
		color: #10b981;
	}

	.autosave-icon-error {
		color: #ef4444;
	}

	.autosave-text {
		white-space: nowrap;
	}

	.autosave-retry {
		margin-left: 0.25rem;
		padding: 0.25rem 0.5rem;
		border: none;
		background: #ef4444;
		color: white;
		border-radius: 0.25rem;
		font-size: 0.75rem;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s;
	}

	.autosave-retry:hover {
		background: #dc2626;
	}
</style>
