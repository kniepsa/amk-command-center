<script lang="ts">
	import type { ExtractedData } from '$lib/types';
	import {
		analyzeMissingData,
		calculateCompleteness,
		type MissingDataAnalysis
	} from '$lib/utils/missing-data-analyzer';

	interface Props {
		extracted: ExtractedData;
		compact?: boolean; // Compact mode for inline display
	}

	let { extracted, compact = false }: Props = $props();

	// Reactive analysis
	let analysis = $derived(analyzeMissingData(extracted));
	let completeness = $derived(calculateCompleteness(analysis));
	let showSuggestions = $state(false);

	function toggleSuggestions() {
		showSuggestions = !showSuggestions;
	}
</script>

{#if compact}
	<!-- Compact Mode: Inline Progress Bar -->
	<div class="flex items-center gap-3">
		<div class="flex-1">
			<div class="flex items-center justify-between mb-1">
				<span class="text-xs font-medium text-slate-600">Data Completeness</span>
				<span class="text-xs font-mono text-slate-700">{completeness.percentage}%</span>
			</div>
			<div class="w-full bg-slate-200 rounded-full h-2">
				<div
					class="h-2 rounded-full transition-all duration-500"
					class:bg-green-500={completeness.requiredComplete}
					class:bg-yellow-500={!completeness.requiredComplete}
					style="width: {completeness.percentage}%"
				></div>
			</div>
		</div>
		{#if analysis.missing.length > 0}
			<button
				onclick={toggleSuggestions}
				class="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
			>
				{showSuggestions ? 'Hide' : 'Show'} Missing
			</button>
		{/if}
	</div>

	{#if showSuggestions && analysis.missing.length > 0}
		<div class="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
			<p class="text-xs font-medium text-yellow-800 mb-2">Missing Fields:</p>
			<div class="flex flex-wrap gap-2">
				{#each analysis.missing as field}
					<span
						class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs"
						class:bg-red-100={field.category === 'required'}
						class:text-red-700={field.category === 'required'}
						class:bg-yellow-100={field.category === 'optional'}
						class:text-yellow-700={field.category === 'optional'}
					>
						<span>{field.icon}</span>
						<span>{field.label}</span>
					</span>
				{/each}
			</div>
		</div>
	{/if}
{:else}
	<!-- Full Mode: Detailed Feedback Card -->
	<div class="bg-white rounded-lg border border-slate-200 p-6">
		<!-- Header -->
		<div class="flex items-center justify-between mb-4">
			<div class="flex items-center gap-3">
				<span class="text-2xl">📊</span>
				<div>
					<h3 class="font-semibold text-slate-800">Data Capture Status</h3>
					<p class="text-sm text-slate-500">
						{completeness.percentage}% complete
						{#if completeness.requiredComplete}
							<span class="text-green-600 font-medium">· All required fields captured</span>
						{:else}
							<span class="text-yellow-600 font-medium">· Missing required fields</span>
						{/if}
					</p>
				</div>
			</div>

			<!-- Circular Progress Indicator -->
			<div class="relative w-16 h-16">
				<svg class="transform -rotate-90" viewBox="0 0 36 36">
					<!-- Background circle -->
					<circle
						cx="18"
						cy="18"
						r="16"
						fill="none"
						stroke="currentColor"
						stroke-width="3"
						class="text-slate-200"
					/>
					<!-- Progress circle -->
					<circle
						cx="18"
						cy="18"
						r="16"
						fill="none"
						stroke="currentColor"
						stroke-width="3"
						stroke-dasharray="100"
						stroke-dashoffset={100 - completeness.percentage}
						class="transition-all duration-500"
						class:text-green-500={completeness.requiredComplete}
						class:text-yellow-500={!completeness.requiredComplete}
						stroke-linecap="round"
					/>
				</svg>
				<div class="absolute inset-0 flex items-center justify-center">
					<span class="text-sm font-mono font-bold text-slate-700"
						>{completeness.percentage}%</span
					>
				</div>
			</div>
		</div>

		<!-- Captured Fields -->
		{#if analysis.captured.length > 0}
			<div class="mb-4">
				<p class="text-sm font-medium text-green-700 mb-2 flex items-center gap-2">
					<span class="text-lg">✅</span>
					Captured ({analysis.captured.length})
				</p>
				<div class="flex flex-wrap gap-2">
					{#each analysis.captured as field}
						<span
							class="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 border border-green-200 rounded-md text-sm text-green-700"
						>
							<span>{field.icon}</span>
							<span>{field.label}</span>
						</span>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Missing Fields -->
		{#if analysis.missing.length > 0}
			<div class="mb-4">
				<p class="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
					<span class="text-lg">❌</span>
					Missing ({analysis.missing.length})
				</p>
				<div class="flex flex-wrap gap-2">
					{#each analysis.missing as field}
						<span
							class="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm"
							class:bg-red-50={field.category === 'required'}
							class:border-red-200={field.category === 'required'}
							class:text-red-700={field.category === 'required'}
							class:bg-yellow-50={field.category === 'optional'}
							class:border-yellow-200={field.category === 'optional'}
							class:text-yellow-700={field.category === 'optional'}
							class:border={true}
						>
							<span>{field.icon}</span>
							<span>{field.label}</span>
							{#if field.category === 'required'}
								<span class="text-xs opacity-75">(required)</span>
							{/if}
						</span>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Suggestions -->
		{#if analysis.suggestions.length > 0}
			<div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
				<div class="flex items-start gap-3">
					<span class="text-blue-600 text-xl">💡</span>
					<div class="flex-1">
						<p class="text-sm font-medium text-blue-800 mb-2">Quick Add Suggestions</p>
						<ul class="space-y-1.5">
							{#each analysis.suggestions as suggestion}
								<li class="text-sm text-blue-700 flex items-start gap-2">
									<span class="text-blue-400 mt-0.5">•</span>
									<span class="flex-1">{suggestion}</span>
								</li>
							{/each}
						</ul>
					</div>
				</div>
			</div>
		{/if}

		<!-- Success State -->
		{#if completeness.requiredComplete && analysis.missing.length === 0}
			<div class="bg-green-50 border border-green-200 rounded-lg p-4">
				<div class="flex items-center gap-3">
					<span class="text-green-600 text-2xl">🎉</span>
					<div class="flex-1">
						<p class="text-sm font-medium text-green-800">Complete Entry!</p>
						<p class="text-sm text-green-700 mt-0.5">
							All fields captured. Great job tracking your day!
						</p>
					</div>
				</div>
			</div>
		{/if}
	</div>
{/if}
