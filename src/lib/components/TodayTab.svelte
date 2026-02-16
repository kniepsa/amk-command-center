<script lang="ts">
	import MorningRitual from './MorningRitual.svelte';
	import UrgentItemsSection from './UrgentItemsSection.svelte';
	import { api } from '$lib/api/client';
	import { toast } from '$lib/stores/toast.svelte';
	import { extractionHistory } from '$lib/stores/extraction-history.svelte';
	import { browser } from '$app/environment';

	let morningRitualComplete = $state(false);
	let currentEnergy = $state<'high' | 'medium' | 'low' | 'drained'>('medium');
	let energySuggestion = $state('');
	let mounted = $state(false);

	$effect(() => {
		if (!browser || mounted) return;

		mounted = true;

		// Restore morning ritual completion status
		const today = new Date().toISOString().split('T')[0];
		const completed = localStorage.getItem(`morning-ritual-complete-${today}`);
		morningRitualComplete = completed === 'true';

		loadCurrentEnergy();
	});

	// Persist morning ritual completion status
	$effect(() => {
		if (!browser) return;

		const today = new Date().toISOString().split('T')[0];
		localStorage.setItem(`morning-ritual-complete-${today}`, String(morningRitualComplete));
	});

	async function loadCurrentEnergy() {
		try {
			const energy = await api.energy.getCurrent();
			currentEnergy = energy.level;
			energySuggestion = energy.suggestion || '';
		} catch (error) {
			console.error('Error loading energy:', error);
			// Silent failure - use default
		}
	}

	function handleMorningRitual(data: {
		grateful: string;
		excited: string;
		priorities: string[];
	}) {
		morningRitualComplete = true;

		// Record in activity log
		extractionHistory.record({
			type: 'morning-ritual',
			fields: ['gratitude', 'intentions'],
			confidence: 100,
			summary: 'Morning ritual completed',
			extractedData: {
				gratitude: [{ thing: data.grateful, why: '' }],
				intentions: data.priorities
			}
		});

		toast.success('Day planned! ✨');
	}
</script>

<div class="today-tab max-w-3xl mx-auto p-4 md:p-6">
	<!-- Morning Ritual (only if not complete) -->
	{#if !morningRitualComplete}
		<div class="mb-6">
			<MorningRitual onComplete={handleMorningRitual} />
		</div>
	{/if}

	<!-- Top 3 Urgent Items (Hero) -->
	<UrgentItemsSection />

	<!-- Energy Level (Quick indicator) -->
	<div class="bg-white rounded-lg border border-cloud-200 p-4 mt-6">
		<div class="flex items-center justify-between">
			<div>
				<h3 class="text-sm font-semibold text-cloud-400 uppercase mb-1">Current Energy</h3>
				<p class="text-lg font-medium text-cloud-600 capitalize">{currentEnergy}</p>
				{#if energySuggestion}
					<p class="text-sm text-cloud-500 mt-2">{energySuggestion}</p>
				{/if}
			</div>
			<div class="text-4xl">
				{currentEnergy === 'high'
					? '⚡'
					: currentEnergy === 'medium'
						? '🔋'
						: currentEnergy === 'low'
							? '🪫'
							: '😴'}
			</div>
		</div>
	</div>
</div>
