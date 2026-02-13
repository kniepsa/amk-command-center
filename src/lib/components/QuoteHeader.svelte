<script lang="ts">
	import { BRAND } from '$lib/brand';
	import { onMount } from 'svelte';

	type Quote = {
		q: string; // quote text
		a: string; // author
		h: string; // HTML formatted
	};

	let quote = $state<Quote | null>(null);
	let isLoading = $state(true);
	let error = $state<string | null>(null);

	// Fetch daily quote from ZenQuotes API
	async function fetchQuote() {
		isLoading = true;
		error = null;
		try {
			const response = await fetch('https://zenquotes.io/api/today');
			if (!response.ok) {
				throw new Error('Failed to fetch quote');
			}
			const data = await response.json();
			quote = data[0]; // ZenQuotes returns array with single quote
			isLoading = false;
		} catch (err) {
			console.error('Error fetching quote:', err);
			error = 'Could not load daily quote. Check your connection.';
			isLoading = false;
		}
	}

	onMount(fetchQuote);

	// Format date
	const today = new Date().toLocaleDateString('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
</script>

<div class="bg-midnight-900 border border-white/10 rounded-lg p-8 mb-6">
	<div class="flex items-center justify-between mb-6">
		<h2 class="text-lg font-medium text-white">{today}</h2>
	</div>

	{#if isLoading}
		<div class="animate-pulse space-y-3">
			<div class="h-4 bg-midnight-800 rounded w-3/4"></div>
			<div class="h-4 bg-midnight-800 rounded w-1/2"></div>
		</div>
	{:else if error}
		<div class="flex items-center justify-between">
			<p class="text-slate-400 italic text-sm">{error}</p>
			<button
				onclick={fetchQuote}
				class="px-4 py-3 min-h-[44px] bg-midnight-800 hover:bg-midnight-700 rounded-lg text-sm font-medium transition-colors text-slate-300 border border-white/5"
			>
				Retry
			</button>
		</div>
	{:else if quote}
		<div class="space-y-4">
			<p class="text-base italic leading-relaxed text-slate-300">"{quote.q}"</p>
			<p class="text-slate-400 text-sm">— {quote.a}</p>
		</div>
	{/if}
</div>
