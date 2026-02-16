<script lang="ts">
	interface Props {
		onClick: () => void;
	}

	let { onClick }: Props = $props();
</script>

<button
	onclick={onClick}
	class="fixed bottom-6 right-6 w-14 h-14 bg-electric-500 hover:bg-electric-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-40 group"
	title="Add new task (Cmd+K)"
	aria-label="Add new task"
>
	<svg
		class="w-6 h-6 transition-transform group-hover:rotate-90"
		fill="none"
		stroke="currentColor"
		viewBox="0 0 24 24"
	>
		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
	</svg>
</button>

<style>
	button {
		/* Smooth hover effect */
		transform: translateY(0);
	}

	button:hover {
		transform: translateY(-2px);
	}

	button:active {
		transform: translateY(0);
	}

	/* Mobile positioning */
	@media (max-width: 640px) {
		button {
			bottom: 1rem;
			right: 1rem;
			width: 3.5rem;
			height: 3.5rem;
		}
	}
</style>
