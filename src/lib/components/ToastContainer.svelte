<script lang="ts">
	import { toast } from '$lib/stores/toast.svelte';

	function getIcon(type: string): string {
		switch (type) {
			case 'success':
				return '✓';
			case 'error':
				return '✗';
			case 'info':
				return 'ℹ';
			case 'warning':
				return '⚠';
			default:
				return 'ℹ';
		}
	}

	function getColorClasses(type: string): string {
		switch (type) {
			case 'success':
				return 'bg-green-500 border-green-600';
			case 'error':
				return 'bg-red-500 border-red-600';
			case 'info':
				return 'bg-blue-500 border-blue-600';
			case 'warning':
				return 'bg-yellow-500 border-yellow-600';
			default:
				return 'bg-gray-500 border-gray-600';
		}
	}
</script>

<div class="toast-container">
	{#each toast.items as item (item.id)}
		<div
			class="toast {getColorClasses(item.type)}"
			role="alert"
			aria-live="polite"
		>
			<div class="toast-content">
				<span class="toast-icon">{getIcon(item.type)}</span>
				<span class="toast-message">{item.message}</span>
			</div>
			<button
				onclick={() => toast.dismiss(item.id)}
				class="toast-dismiss"
				aria-label="Dismiss"
			>
				×
			</button>
		</div>
	{/each}
</div>

<style>
	.toast-container {
		position: fixed;
		top: 5rem;
		right: 1.5rem;
		z-index: 60;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		max-width: 400px;
		pointer-events: none;
	}

	.toast {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 1rem 1.25rem;
		border-radius: 0.75rem;
		border: 1px solid;
		color: white;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
		animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
		pointer-events: auto;
	}

	@keyframes slideIn {
		from {
			transform: translateX(calc(100% + 1.5rem));
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	.toast-content {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex: 1;
		min-width: 0;
	}

	.toast-icon {
		font-size: 1.25rem;
		flex-shrink: 0;
		font-weight: bold;
	}

	.toast-message {
		font-size: 0.875rem;
		line-height: 1.4;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.toast-dismiss {
		background: transparent;
		border: none;
		color: white;
		font-size: 1.5rem;
		line-height: 1;
		padding: 0.25rem 0.5rem;
		cursor: pointer;
		opacity: 0.7;
		transition: opacity 0.2s;
		flex-shrink: 0;
	}

	.toast-dismiss:hover {
		opacity: 1;
	}

	/* Mobile responsive */
	@media (max-width: 640px) {
		.toast-container {
			top: 4rem;
			right: 1rem;
			left: 1rem;
			max-width: none;
		}
	}
</style>
