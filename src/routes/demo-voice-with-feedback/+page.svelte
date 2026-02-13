<script lang="ts">
	import VoiceRecorder from '$lib/components/VoiceRecorder.svelte';
	import MissingDataFeedback from '$lib/components/MissingDataFeedback.svelte';
	import Button from '$lib/components/shared/Button.svelte';
	import type { ExtractedData } from '$lib/types';

	// State
	let transcription = $state<string | null>(null);
	let extractedData = $state<ExtractedData | null>(null);
	let isExtracting = $state(false);
	let extractError = $state<string | null>(null);

	async function handleTranscription(text: string) {
		transcription = text;
		extractedData = null;
		extractError = null;

		// Auto-extract data after transcription
		await extractData(text);
	}

	async function extractData(text: string) {
		isExtracting = true;
		extractError = null;

		try {
			const response = await fetch('/api/extract-entry', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					date: new Date().toISOString().split('T')[0],
					text: text
				})
			});

			if (!response.ok) {
				throw new Error(`Extraction failed: ${response.status}`);
			}

			const result = await response.json();

			if (result.error) {
				throw new Error(result.error);
			}

			extractedData = result.extracted;
		} catch (err) {
			console.error('Extraction error:', err);
			extractError = err instanceof Error ? err.message : 'Failed to extract data';
		} finally {
			isExtracting = false;
		}
	}

	function resetDemo() {
		transcription = null;
		extractedData = null;
		extractError = null;
	}

	// Example transcription for demo
	const exampleTranscription = `Ins Bett um 22:00, aufgewacht um 06:30, 8h geschlafen, gute Qualität. High energy heute. Laufen gemacht, Sauna, Elektrolyte. Dankbar für Jani - sie unterstützt mich bei der exit decision. Dankbar für die Kinder - ihr Lachen beim Frühstück. Gegessen um 08:00 300g Joghurt mit Blaubeeren.`;

	function loadExample() {
		handleTranscription(exampleTranscription);
	}
</script>

<div class="container mx-auto max-w-5xl p-6">
	<!-- Header -->
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-slate-800 mb-2">
			Voice Input with Missing Data Feedback
		</h1>
		<p class="text-slate-600">
			Complete workflow: Record → Transcribe → Extract → Real-time Feedback
		</p>
	</div>

	<!-- Quick Actions -->
	<div class="bg-white rounded-lg border border-slate-200 p-4 mb-6">
		<div class="flex items-center gap-3 flex-wrap">
			<Button variant="secondary" onclick={loadExample}>Load Example Transcription</Button>
			<Button variant="secondary" onclick={resetDemo}>Reset Demo</Button>
		</div>
	</div>

	<!-- Workflow Steps -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
		<!-- Step 1: Voice Input -->
		<div>
			<div class="flex items-center gap-2 mb-3">
				<span class="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold"
					>1</span
				>
				<h2 class="text-lg font-semibold text-slate-800">Voice Input</h2>
			</div>
			<VoiceRecorder onTranscription={handleTranscription} />
		</div>

		<!-- Step 2: Extraction Status -->
		<div>
			<div class="flex items-center gap-2 mb-3">
				<span class="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold"
					>2</span
				>
				<h2 class="text-lg font-semibold text-slate-800">Data Extraction</h2>
			</div>

			<div class="bg-white rounded-lg border border-slate-200 p-6">
				{#if !transcription}
					<div class="text-center py-8 text-slate-400">
						<p class="text-sm">Waiting for transcription...</p>
					</div>
				{:else if isExtracting}
					<div class="flex items-center justify-center gap-3 py-8">
						<div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
						<p class="text-sm text-slate-600">Extracting data from transcription...</p>
					</div>
				{:else if extractError}
					<div class="bg-red-50 border border-red-200 rounded-lg p-4">
						<div class="flex items-start gap-3">
							<span class="text-red-500 text-xl">⚠️</span>
							<div class="flex-1">
								<p class="text-sm font-medium text-red-800">Extraction Error</p>
								<p class="text-sm text-red-600 mt-1">{extractError}</p>
							</div>
						</div>
					</div>
				{:else if extractedData}
					<div class="space-y-4">
						<div class="bg-green-50 border border-green-200 rounded-lg p-4">
							<div class="flex items-center gap-2 text-green-700">
								<span class="text-xl">✓</span>
								<p class="text-sm font-medium">Data extracted successfully</p>
							</div>
						</div>

						<!-- Compact Feedback -->
						<MissingDataFeedback extracted={extractedData} compact={true} />
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Step 3: Detailed Feedback -->
	{#if extractedData}
		<div class="mb-6">
			<div class="flex items-center gap-2 mb-3">
				<span class="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold"
					>3</span
				>
				<h2 class="text-lg font-semibold text-slate-800">Missing Data Analysis</h2>
			</div>
			<MissingDataFeedback extracted={extractedData} />
		</div>
	{/if}

	<!-- Raw Data (for debugging) -->
	{#if extractedData}
		<details class="bg-white rounded-lg border border-slate-200 p-6">
			<summary class="cursor-pointer text-sm font-medium text-slate-700 hover:text-slate-900"
				>View Raw Extracted Data (Debug)</summary
			>
			<pre
				class="mt-4 bg-slate-50 p-4 rounded-lg text-xs font-mono overflow-x-auto border border-slate-200">{JSON.stringify(
					extractedData,
					null,
					2
				)}</pre>
		</details>
	{/if}

	<!-- How It Works -->
	<div class="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
		<div class="flex items-start gap-3">
			<span class="text-blue-600 text-2xl">💡</span>
			<div class="flex-1">
				<h3 class="font-semibold text-blue-800 mb-3">How The Workflow Works</h3>
				<div class="text-sm text-blue-700 space-y-3">
					<div>
						<p class="font-medium mb-1">1. Voice Recording</p>
						<p class="text-blue-600">
							User speaks naturally in German or English. Audio is captured and sent for transcription.
						</p>
					</div>

					<div>
						<p class="font-medium mb-1">2. Data Extraction</p>
						<p class="text-blue-600">
							Transcription is sent to <code
								class="bg-white/50 px-1 py-0.5 rounded font-mono">/api/extract-entry</code
							>
							which extracts structured data (sleep, energy, habits, gratitude, etc.)
						</p>
					</div>

					<div>
						<p class="font-medium mb-1">3. Real-time Feedback</p>
						<p class="text-blue-600">
							Missing Data Detector analyzes extracted data and shows: what was captured (green),
							what's missing (red/yellow), and contextual suggestions for completion.
						</p>
					</div>

					<div>
						<p class="font-medium mb-1">4. User Action</p>
						<p class="text-blue-600">
							User sees missing fields and can either: (a) record another voice note with missing
							info, or (b) manually add missing fields in the entry editor.
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	:global(body) {
		background-color: #f8fafc;
	}
</style>
