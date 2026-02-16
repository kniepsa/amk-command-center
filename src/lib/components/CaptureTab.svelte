<script lang="ts">
	import VoiceRecorder from './VoiceRecorder.svelte';
	import ExtractionPreview from './ExtractionPreview.svelte';
	import ActivityLog from './ActivityLog.svelte';
	import { api, type EntryFrontmatter } from '$lib/api/client';
	import { extractionHistory } from '$lib/stores/extraction-history.svelte';
	import { toast } from '$lib/stores/toast.svelte';

	let textInput = $state('');
	let isProcessing = $state(false);
	let extractedData = $state<EntryFrontmatter>({});
	let showRecentCaptures = $state(false);

	// Handle voice transcription
	async function handleVoiceTranscription(text: string) {
		await processCapture(text, 'voice');
	}

	// Handle text submission
	async function handleTextSubmit() {
		if (!textInput.trim()) return;

		const text = textInput.trim();
		textInput = ''; // Clear immediately

		await processCapture(text, 'text');
	}

	// Process capture (voice or text)
	async function processCapture(content: string, type: 'voice' | 'text') {
		isProcessing = true;

		try {
			const today = new Date().toISOString().split('T')[0];

			// Extract structured data
			const result = await api.entries.extract({
				transcription: content,
				date: today,
				existing: extractedData
			});

			extractedData = result.extracted;

			// Record in activity log
			extractionHistory.record({
				type,
				fields: Object.keys(result.extracted),
				confidence: Math.round((result.confidence || 1.0) * 100),
				summary: `Captured: "${content.substring(0, 50)}..."`,
				extractedData: result.extracted
			});

			toast.success('Captured! ✨');
		} catch (error) {
			console.error('Capture failed:', error);
			toast.error('Failed to capture. Try again.');
		} finally {
			isProcessing = false;
		}
	}

	// Handle keyboard shortcuts
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleTextSubmit();
		}
	}

	// Handle save
	function handleSave() {
		toast.success('Entry saved! ✨');
	}

	// Handle data change
	function handleDataChange(data: any) {
		extractedData = data;
	}
</script>

<div class="capture-tab max-w-2xl mx-auto p-4 md:p-6">
	<!-- Hero: Voice Recorder -->
	<div class="text-center mb-8">
		<h2 class="text-2xl font-semibold text-cloud-600 mb-2">Capture</h2>
		<p class="text-sm text-cloud-400 mb-6">Speak or type any thought</p>

		<VoiceRecorder onTranscription={handleVoiceTranscription} />
	</div>

	<!-- Fallback: Text Input -->
	<div class="mb-8">
		<textarea
			bind:value={textInput}
			onkeydown={handleKeydown}
			placeholder="Or type your thought..."
			class="w-full px-4 py-3 bg-white border border-cloud-200 rounded-lg text-cloud-600 placeholder-cloud-400 focus:outline-none focus:border-electric-500 resize-none"
			rows="3"
			disabled={isProcessing}
		></textarea>

		{#if textInput.trim()}
			<button
				onclick={handleTextSubmit}
				disabled={isProcessing}
				class="mt-2 px-6 py-2 bg-electric-600 text-white rounded-lg hover:bg-electric-700 transition-colors disabled:bg-cloud-200 disabled:cursor-not-allowed"
			>
				{isProcessing ? 'Capturing...' : 'Capture →'}
			</button>
		{/if}
	</div>

	<!-- Extraction Preview (after capture) -->
	{#if Object.keys(extractedData).length > 0}
		<div class="mb-8">
			<ExtractionPreview
				extraction={extractedData}
				onSave={handleSave}
				onDataChange={handleDataChange}
			/>
		</div>
	{/if}

	<!-- Recent Captures (collapsible) -->
	<div class="border-t border-cloud-200 pt-6">
		<button
			onclick={() => (showRecentCaptures = !showRecentCaptures)}
			class="w-full text-left flex items-center justify-between mb-4"
		>
			<h3 class="text-sm font-semibold text-cloud-400 uppercase">Recent Captures Today</h3>
			<span class="text-cloud-400">{showRecentCaptures ? '▼' : '▶'}</span>
		</button>

		{#if showRecentCaptures}
			<ActivityLog />
		{/if}
	</div>
</div>
