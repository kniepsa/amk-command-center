<script lang="ts">
	import VoiceInput from '$lib/components/VoiceInput.svelte';
	import Button from '$lib/components/shared/Button.svelte';
	import type { ExtractedData } from '$lib/api/journal-client';

	let savedData = $state<ExtractedData | null>(null);
	let showVoiceInput = $state(true);

	function handleSave(extracted: ExtractedData) {
		console.log('Saved extracted data:', extracted);
		savedData = extracted;
		showVoiceInput = false;

		// In production, would save to database here
		// For demo, just store in state
	}

	function handleCancel() {
		console.log('Cancelled voice input');
		showVoiceInput = false;
	}

	function resetDemo() {
		savedData = null;
		showVoiceInput = true;
	}
</script>

<div class="container mx-auto max-w-5xl p-6">
	<!-- Header -->
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-slate-800 mb-2">
			Voice Input with Backend API Integration
		</h1>
		<p class="text-slate-600">
			Complete workflow: Record → Transcribe (Replicate) → Extract (Backend API) → Preview → Save
		</p>
	</div>

	<!-- Quick Actions -->
	<div class="bg-white rounded-lg border border-slate-200 p-4 mb-6">
		<div class="flex items-center gap-3 flex-wrap">
			<Button variant="secondary" onclick={resetDemo}>Reset Demo</Button>
			{#if !showVoiceInput}
				<Button variant="primary" onclick={() => (showVoiceInput = true)}>
					Record New Entry
				</Button>
			{/if}
		</div>
	</div>

	<!-- Voice Input Component -->
	{#if showVoiceInput}
		<div class="mb-6">
			<h2 class="text-lg font-semibold text-slate-800 mb-3">Record Voice Input</h2>
			<VoiceInput onSave={handleSave} onCancel={handleCancel} />
		</div>
	{/if}

	<!-- Saved Data Display -->
	{#if savedData}
		<div class="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
			<div class="flex items-center gap-2 mb-4">
				<span class="text-2xl">✓</span>
				<h2 class="text-lg font-semibold text-green-800">Data Saved Successfully</h2>
			</div>

			<details class="bg-white rounded-lg border border-green-200 p-4">
				<summary class="cursor-pointer text-sm font-medium text-slate-700 hover:text-slate-900"
					>View Saved Data (Debug)</summary
				>
				<pre
					class="mt-4 bg-slate-50 p-4 rounded-lg text-xs font-mono overflow-x-auto border border-slate-200">{JSON.stringify(
						savedData,
						null,
						2
					)}</pre>
			</details>
		</div>
	{/if}

	<!-- How It Works -->
	<div class="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
		<div class="flex items-start gap-3">
			<span class="text-blue-600 text-2xl">💡</span>
			<div class="flex-1">
				<h3 class="font-semibold text-blue-800 mb-3">How The New Workflow Works</h3>
				<div class="text-sm text-blue-700 space-y-3">
					<div>
						<p class="font-medium mb-1">1. Voice Recording</p>
						<p class="text-blue-600">
							User speaks naturally. Audio is captured and sent for transcription via local
							/api/transcribe endpoint (Replicate Whisper Large V3).
						</p>
					</div>

					<div>
						<p class="font-medium mb-1">2. Backend Extraction</p>
						<p class="text-blue-600">
							Transcription is sent to <code
								class="bg-white/50 px-1 py-0.5 rounded font-mono"
								>http://localhost:3002/api/v1/entries/extract</code
							>
							which extracts structured data using Claude Sonnet 4.5 (with caching for 90% cost reduction).
						</p>
					</div>

					<div>
						<p class="font-medium mb-1">3. Preview Modal</p>
						<p class="text-blue-600">
							User sees: original transcription, confidence score, extracted fields with color-coding,
							suggestions for improvement, and uncertain fields that need clarification (GTD Clarify
							step).
						</p>
					</div>

					<div>
						<p class="font-medium mb-1">4. User Decision</p>
						<p class="text-blue-600">
							User can: (a) Edit transcription and re-extract, (b) Save to journal, or (c) Cancel.
							Confidence scores help user decide if extraction is accurate enough.
						</p>
					</div>

					<div>
						<p class="font-medium mb-1">5. Backend Save (Future)</p>
						<p class="text-blue-600">
							Currently saves to state. Will be updated to call backend API endpoint to persist to
							SQLite database.
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Technical Notes -->
	<div class="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-6">
		<div class="flex items-start gap-3">
			<span class="text-purple-600 text-2xl">⚙️</span>
			<div class="flex-1">
				<h3 class="font-semibold text-purple-800 mb-3">Technical Details</h3>
				<div class="text-sm text-purple-700 space-y-2">
					<div>
						<p class="font-medium">Transcription:</p>
						<p class="text-purple-600">
							Still uses local /api/transcribe endpoint (Replicate Whisper) because backend doesn't
							have audio transcription yet. Backend only has text entity extraction.
						</p>
					</div>

					<div>
						<p class="font-medium">Extraction:</p>
						<p class="text-purple-600">
							Migrated to backend /api/v1/entries/extract endpoint. Uses Claude Sonnet 4.5 with
							prompt caching (90% cost reduction on repeated extractions).
						</p>
					</div>

					<div>
						<p class="font-medium">Preview Modal:</p>
						<p class="text-purple-600">
							New UX improvement. Shows confidence scores, extracted fields with color-coding
							(green=captured, red/yellow=missing), and uncertain fields that need clarification.
						</p>
					</div>

					<div>
						<p class="font-medium">No localStorage:</p>
						<p class="text-purple-600">
							Component doesn't write to localStorage. Parent component receives extracted data via
							onSave callback and handles persistence.
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
