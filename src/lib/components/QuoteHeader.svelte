<script lang="ts">
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

<div class="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-6 shadow-lg mb-6">
	<div class="flex items-center justify-between mb-4">
		<h2 class="text-2xl font-bold">📅 {today}</h2>
	</div>

	{#if isLoading}
		<div class="animate-pulse">
			<div class="h-4 bg-white/30 rounded w-3/4 mb-2"></div>
			<div class="h-4 bg-white/30 rounded w-1/2"></div>
		</div>
	{:else if error}
		<div class="flex items-center justify-between">
			<p class="text-white/80 italic text-sm">{error}</p>
			<button
				onclick={fetchQuote}
				class="px-3 py-2 min-h-[44px] bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
			>
				Retry
			</button>
		</div>
	{:else if quote}
		<div class="space-y-2">
			<p class="text-lg italic leading-relaxed">"{quote.q}"</p>
			<p class="text-white/80 text-sm">— {quote.a}</p>
		</div>
	{/if}
</div>
