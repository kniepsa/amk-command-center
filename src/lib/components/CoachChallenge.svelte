<script lang="ts">
	import type { CoachChallenge } from '$lib/utils/coach-detector';

	/**
	 * Multi-Coach Challenge Component
	 *
	 * Displays contextual coaching challenges from 6 different coaches:
	 * - Bill Campbell (Leadership) - Blue
	 * - Machiavelli (M&A Strategy, Power) - Purple
	 * - Sales Coach (SPIN Selling) - Green
	 * - M&A Advisor (Valuation, Deal Structure) - Yellow
	 * - Stoic Advisor (Calm, Perspective) - Slate
	 * - Parenting Guru (Montessori) - Pink
	 */

	interface Props {
		challenge: CoachChallenge;
		onDismiss?: () => void;
	}

	let { challenge, onDismiss }: Props = $props();

	// Animation state
	let isVisible = $state(true);

	function handleDismiss() {
		isVisible = false;
		if (onDismiss) {
			// Delay callback to allow fade-out animation
			setTimeout(onDismiss, 300);
		}
	}

	// Use coach color from detection system
	let colorClass = $derived(challenge.color);
	let confidencePercent = $derived(Math.round(challenge.confidence * 100));
</script>

{#if isVisible}
	<div
		class="rounded-lg border-2 p-4 mb-4 transition-all duration-300 hover:shadow-lg bg-{colorClass}-50 border-{colorClass}-200"
		role="complementary"
		aria-label="{challenge.name} coaching insight"
	>
		<!-- Header -->
		<div class="flex justify-between items-start mb-3">
			<div class="flex items-center gap-2">
				<span class="text-2xl" role="img" aria-label={challenge.name}>{challenge.icon}</span>
				<span class="font-semibold text-{colorClass}-900">{challenge.name} Says...</span>
			</div>

			{#if onDismiss}
				<button
					class="text-{colorClass}-400 hover:text-{colorClass}-600 text-2xl leading-none w-7 h-7 flex items-center justify-center"
					onclick={handleDismiss}
					aria-label="Dismiss challenge"
				>
					×
				</button>
			{/if}
		</div>

		<!-- Principle -->
		<div class="mb-3 text-sm text-{colorClass}-900">
			<strong>Principle:</strong>
			{challenge.principle}
		</div>

		<!-- Question -->
		<div class="mb-3 text-sm bg-white/60 p-3 rounded text-{colorClass}-900">
			<strong>Ask yourself:</strong>
			{challenge.question}
		</div>

		<!-- Quote (optional) -->
		{#if challenge.quote}
			<div class="mb-3 text-sm italic opacity-80 text-{colorClass}-800">
				"{challenge.quote}"
			</div>
		{/if}

		<!-- Metadata -->
		<div
			class="flex justify-between items-center text-xs opacity-70 pt-3 border-t border-{colorClass}-200/50 text-{colorClass}-800"
		>
			<span class="uppercase font-semibold tracking-wide">{challenge.category}</span>
			<span class="font-mono" title="Detection confidence">
				{confidencePercent}% match
			</span>
		</div>
	</div>
{/if}
