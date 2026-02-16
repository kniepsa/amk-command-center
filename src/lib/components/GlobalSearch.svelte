<script lang="ts">
	import { browser } from '$app/environment';
	import { getApiClient } from '$lib/api-client';
	import { navigateToEntity, parseShowCommand } from '$lib/utils/deep-link';
	import { toast } from '$lib/stores/toast.svelte';
	import type { SearchResult } from '@amk/command-center-sdk';

	type Props = {
		placeholder?: string;
		showVoiceInput?: boolean;
	};

	let { placeholder = 'Search buyers, people, tasks...', showVoiceInput = false }: Props = $props();

	let query = $state('');
	let results = $state<SearchResult[]>([]);
	let isSearching = $state(false);
	let isOpen = $state(false);
	let searchTimeout: ReturnType<typeof setTimeout> | null = null;
	let inputElement: HTMLInputElement;

	// Debounced search (300ms)
	$effect(() => {
		if (query.length < 2) {
			results = [];
			isOpen = false;
			return;
		}

		isSearching = true;

		if (searchTimeout) {
			clearTimeout(searchTimeout);
		}

		searchTimeout = setTimeout(async () => {
			await performSearch(query);
		}, 300);

		return () => {
			if (searchTimeout) clearTimeout(searchTimeout);
		};
	});

	async function performSearch(searchQuery: string) {
		if (!browser) return;

		try {
			const api = getApiClient();

			// Check if it's a "Show me X" command
			const showCommand = parseShowCommand(searchQuery);
			if (showCommand) {
				const response = await api.search.search(showCommand.query, {
					types: [showCommand.type],
					limit: 10
				});
				results = response.results;
			} else {
				// Regular search
				const response = await api.search.search(searchQuery, { limit: 10 });
				results = response.results;
			}

			isOpen = results.length > 0;
		} catch (error) {
			console.error('[GlobalSearch] Search failed:', error);
			const message = error instanceof Error ? error.message : 'Search failed';
			toast.error(`Search failed: ${message}`);
			results = [];
		} finally {
			isSearching = false;
		}
	}

	async function handleResultClick(result: SearchResult) {
		// Navigate to the result
		await navigateToEntity(result.url, result.id, { highlight: true });

		// Clear search
		query = '';
		results = [];
		isOpen = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		// Escape to close
		if (e.key === 'Escape') {
			query = '';
			results = [];
			isOpen = false;
			inputElement?.blur();
		}

		// Arrow down to focus first result
		if (e.key === 'ArrowDown' && results.length > 0) {
			e.preventDefault();
			const firstResult = document.querySelector('.search-result') as HTMLElement;
			firstResult?.focus();
		}
	}

	function handleResultKeydown(e: KeyboardEvent, index: number) {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			const nextResult = document.querySelectorAll('.search-result')[index + 1] as HTMLElement;
			nextResult?.focus();
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			if (index === 0) {
				inputElement?.focus();
			} else {
				const prevResult = document.querySelectorAll('.search-result')[index - 1] as HTMLElement;
				prevResult?.focus();
			}
		} else if (e.key === 'Enter') {
			e.preventDefault();
			handleResultClick(results[index]);
		}
	}

	// Icon mapping
	function getIcon(type: string): string {
		switch (type) {
			case 'buyer':
				return '🏢';
			case 'person':
				return '👤';
			case 'task':
				return '✓';
			case 'entry':
				return '📝';
			default:
				return '📄';
		}
	}

	// Type label
	function getTypeLabel(type: string): string {
		return type.charAt(0).toUpperCase() + type.slice(1);
	}

	// Global keyboard shortcut: Cmd+K or Ctrl+K
	$effect(() => {
		if (!browser) return;

		function handleGlobalKeydown(e: KeyboardEvent) {
			if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
				e.preventDefault();
				inputElement?.focus();
			}
		}

		window.addEventListener('keydown', handleGlobalKeydown);

		return () => {
			window.removeEventListener('keydown', handleGlobalKeydown);
		};
	});
</script>

<div class="relative">
	<!-- Search Input -->
	<div class="relative">
		<input
			bind:this={inputElement}
			bind:value={query}
			onkeydown={handleKeydown}
			type="text"
			{placeholder}
			class="w-full px-4 py-2 pl-10 pr-10 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
			aria-label="Global search"
			aria-expanded={isOpen}
			aria-controls="search-results"
		/>

		<!-- Search Icon -->
		<div class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
				/>
			</svg>
		</div>

		<!-- Loading Spinner -->
		{#if isSearching}
			<div class="absolute right-3 top-1/2 -translate-y-1/2">
				<div
					class="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"
					role="status"
					aria-label="Searching"
				></div>
			</div>
		{/if}

		<!-- Keyboard Shortcut Hint -->
		{#if query.length === 0}
			<div
				class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hidden sm:block"
			>
				⌘K
			</div>
		{/if}
	</div>

	<!-- Results Overlay -->
	{#if isOpen && results.length > 0}
		<div
			id="search-results"
			class="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50"
			role="listbox"
		>
			{#each results as result, index}
				<button
					class="search-result w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0 transition-colors"
					onclick={() => handleResultClick(result)}
					onkeydown={(e) => handleResultKeydown(e, index)}
					role="option"
					aria-selected="false"
					tabindex="0"
				>
					<div class="flex items-start gap-3">
						<!-- Icon -->
						<div class="text-xl flex-shrink-0" aria-hidden="true">
							{getIcon(result.type)}
						</div>

						<!-- Content -->
						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2">
								<h4 class="text-sm font-medium text-gray-900 truncate">
									{result.title}
								</h4>
								<span class="text-xs text-gray-400 flex-shrink-0">
									{getTypeLabel(result.type)}
								</span>
							</div>
							{#if result.subtitle}
								<p class="text-xs text-gray-500 truncate mt-0.5">
									{result.subtitle}
								</p>
							{/if}
						</div>

						<!-- Score (debug mode) -->
						{#if import.meta.env.DEV && result.score}
							<div class="text-xs text-gray-400 flex-shrink-0">
								{Math.round(result.score * 100)}%
							</div>
						{/if}
					</div>
				</button>
			{/each}
		</div>
	{/if}

	<!-- No Results -->
	{#if isOpen && results.length === 0 && !isSearching && query.length >= 2}
		<div
			class="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-sm text-gray-500 z-50"
		>
			No results found for "{query}"
		</div>
	{/if}
</div>

<style>
	/* Smooth transitions */
	.search-result {
		transition: background-color 0.15s ease;
	}

	/* Keyboard navigation focus */
	.search-result:focus {
		outline: 2px solid #0ea5e9;
		outline-offset: -2px;
	}
</style>
