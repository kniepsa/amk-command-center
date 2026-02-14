<script lang="ts">
	import { BRAND } from '$lib/brand';

	type Props = {
		date?: Date;
		onPrevious?: () => void;
		onNext?: () => void;
	};

	let { date = new Date(), onPrevious, onNext }: Props = $props();

	// Format date
	const formattedDate = $derived(
		date.toLocaleDateString('en-US', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		})
	);
</script>

<div class="flex items-center justify-between mb-8">
	<!-- Previous Day -->
	<button
		onclick={onPrevious}
		class="p-2 text-cloud-400 hover:text-cloud-600 transition-colors"
		title="Previous day"
	>
		<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
		</svg>
	</button>

	<!-- Date -->
	<h2 class="text-2xl font-semibold text-cloud-600">{formattedDate}</h2>

	<!-- Next Day -->
	<button
		onclick={onNext}
		class="p-2 text-cloud-400 hover:text-cloud-600 transition-colors"
		title="Next day"
	>
		<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
		</svg>
	</button>
</div>
