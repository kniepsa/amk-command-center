<script lang="ts">
	import Button from './shared/Button.svelte';
	import MissingDataFeedback from './MissingDataFeedback.svelte';
	import { extractEntryData, type ExtractedData, type ExtractionResult } from '$lib/api/journal-client';

	interface Props {
		onSave?: (extracted: ExtractedData) => void;
		onCancel?: () => void;
	}

	let { onSave, onCancel }: Props = $props();

	// Recording state
	let isRecording = $state(false);
	let isTranscribing = $state(false);
	let isExtracting = $state(false);
	let mediaRecorder = $state<MediaRecorder | null>(null);
	let audioChunks = $state<Blob[]>([]);
	let recordingTime = $state(0);
	let recordingInterval: ReturnType<typeof setInterval> | null = null;

	// Results
	let transcription = $state<string | null>(null);
	let extractionResult = $state<ExtractionResult | null>(null);
	let error = $state<string | null>(null);

	// Preview modal
	let showPreview = $state(false);

	async function startRecording() {
		try {
			error = null;
			transcription = null;
			extractionResult = null;

			// Check if offline
			if (!navigator.onLine) {
				error = 'You are offline. Voice recording requires internet connection.';
				return;
			}

			// Request microphone access
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

			// Create MediaRecorder
			mediaRecorder = new MediaRecorder(stream, {
				mimeType: 'audio/webm;codecs=opus'
			});

			audioChunks = [];

			mediaRecorder.ondataavailable = (event) => {
				if (event.data.size > 0) {
					audioChunks.push(event.data);
				}
			};

			mediaRecorder.onstop = async () => {
				// Stop all tracks
				stream.getTracks().forEach((track) => track.stop());

				// Create audio blob
				const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

				// Upload for transcription
				await transcribeAudio(audioBlob);
			};

			mediaRecorder.start();
			isRecording = true;

			// Start recording timer
			recordingTime = 0;
			recordingInterval = setInterval(() => {
				recordingTime += 1;
			}, 1000);
		} catch (err) {
			console.error('Error starting recording:', err);

			// Specific error messages
			if (err instanceof DOMException) {
				if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
					error = '🎤 Microphone access denied. Please allow microphone permissions in your browser.';
				} else if (err.name === 'NotFoundError') {
					error = '🎤 No microphone found. Please connect a microphone and try again.';
				} else {
					error = `Microphone error: ${err.message}`;
				}
			} else {
				error =
					err instanceof Error ? err.message : 'Failed to access microphone. Please allow access.';
			}
		}
	}

	function stopRecording() {
		if (mediaRecorder && isRecording) {
			mediaRecorder.stop();
			isRecording = false;

			// Stop recording timer
			if (recordingInterval) {
				clearInterval(recordingInterval);
				recordingInterval = null;
			}
		}
	}

	async function transcribeAudio(audioBlob: Blob) {
		isTranscribing = true;
		error = null;

		try {
			// Check if offline
			if (!navigator.onLine) {
				throw new Error('You are offline. Transcription requires internet connection.');
			}

			// Create form data
			const formData = new FormData();
			formData.append('audio', audioBlob, 'recording.webm');

			// Upload to transcription endpoint (still using Replicate for now)
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

			const response = await fetch('/api/transcribe', {
				method: 'POST',
				body: formData,
				signal: controller.signal
			});

			clearTimeout(timeoutId);

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));

				// Handle specific errors
				if (response.status === 504) {
					throw new Error('Transcription timeout. Your audio may be too long (max 60 seconds).');
				} else if (response.status === 429) {
					throw new Error('Rate limit exceeded. Please wait a moment and try again.');
				} else if (response.status === 401) {
					throw new Error('API key invalid. Please contact support.');
				}

				throw new Error(errorData.message || `Transcription failed: ${response.status}`);
			}

			const result = await response.json();

			if (result.error) {
				throw new Error(result.error);
			}

			transcription = result.transcription;

			// Auto-extract after transcription
			if (transcription) {
				await extractData(transcription);
			}
		} catch (err) {
			console.error('Transcription error:', err);

			if (err instanceof DOMException && err.name === 'AbortError') {
				error = '⏱️ Transcription timeout. Your recording may be too long (max 60 seconds).';
			} else {
				error = err instanceof Error ? err.message : 'Failed to transcribe audio';
			}
		} finally {
			isTranscribing = false;
		}
	}

	async function extractData(text: string) {
		isExtracting = true;
		error = null;

		try {
			const date = new Date().toISOString().split('T')[0];
			const result = await extractEntryData(text, date);

			extractionResult = result;

			// Show preview modal
			showPreview = true;
		} catch (err) {
			console.error('Extraction error:', err);
			error = err instanceof Error ? err.message : 'Failed to extract data';
		} finally {
			isExtracting = false;
		}
	}

	function handleSavePreview() {
		if (extractionResult && onSave) {
			onSave(extractionResult.extracted);
		}
		showPreview = false;
		resetState();
	}

	function handleCancelPreview() {
		showPreview = false;
		if (onCancel) {
			onCancel();
		}
	}

	function handleEditAndResubmit() {
		// User wants to modify transcription
		showPreview = false;
		// Keep transcription visible for editing
	}

	function resetState() {
		transcription = null;
		extractionResult = null;
		error = null;
	}

	function formatTime(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}

	function getConfidenceColor(confidence: number): string {
		if (confidence >= 0.8) return 'text-green-600';
		if (confidence >= 0.5) return 'text-yellow-600';
		return 'text-red-600';
	}

	function getConfidenceLabel(confidence: number): string {
		if (confidence >= 0.8) return 'High';
		if (confidence >= 0.5) return 'Medium';
		return 'Low';
	}
</script>

<!-- Main Voice Input UI -->
<div
	class="bg-white backdrop-blur-glass border border-cloud-200 rounded-2xl p-6 shadow-glass transition-all duration-300 hover:border-electric-500/20"
>
	<!-- Wispr.ai Style: Green/Red Circle -->
	<div class="flex flex-col items-center gap-4">
		{#if !isRecording}
			<button
				onclick={startRecording}
				disabled={isTranscribing || isExtracting}
				class="w-20 h-20 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:scale-105 {isTranscribing || isExtracting ? 'bg-cloud-300 cursor-wait' : 'bg-green-500 hover:bg-green-600'}"
				aria-label="Start recording"
			>
			</button>
			{#if isTranscribing}
				<p class="text-sm text-cloud-500">Transcribing...</p>
			{:else if isExtracting}
				<p class="text-sm text-cloud-500">Extracting...</p>
			{/if}
		{:else}
			<button
				onclick={stopRecording}
				class="w-20 h-20 bg-red-500 hover:bg-red-600 rounded-full transition-all shadow-lg animate-pulse"
				aria-label="Stop recording"
			>
			</button>
			<p class="text-sm text-cloud-500 font-mono">{formatTime(recordingTime)}</p>
		{/if}
	</div>

	<!-- Processing States -->
	{#if isTranscribing}
		<div class="bg-electric-500/10 border-l-4 border-electric-500 rounded p-3 mb-4 mt-4">
			<div class="flex items-center gap-3">
				<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-electric-500"></div>
				<div class="flex-1">
					<p class="text-sm text-electric-500">Transcribing...</p>
					<p class="text-xs text-cloud-400 mt-0.5">Whisper Large V3</p>
				</div>
			</div>
		</div>
	{/if}

	{#if isExtracting}
		<div class="bg-purple-500/10 border-l-4 border-purple-500 rounded p-3 mb-4 mt-4">
			<div class="flex items-center gap-3">
				<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
				<div class="flex-1">
					<p class="text-sm text-purple-400">Extracting data...</p>
					<p class="text-xs text-cloud-400 mt-0.5">Claude Sonnet 4.5 via Backend API</p>
				</div>
			</div>
		</div>
	{/if}

	<!-- Error State -->
	{#if error}
		<div class="bg-red-50 border-l-4 border-red-400 rounded p-3 mb-4 mt-4">
			<div class="flex items-start justify-between gap-3">
				<p class="text-sm text-red-800">{error}</p>
				<button
					onclick={() => (error = null)}
					class="text-red-400 hover:text-red-600 text-lg leading-none"
					aria-label="Dismiss"
				>
					×
				</button>
			</div>
		</div>
	{/if}

	<!-- Success - Transcription Complete (brief message before preview) -->
	{#if transcription && !showPreview}
		<div class="bg-green-50 border-l-4 border-green-400 rounded p-3 mt-4">
			<p class="text-sm font-medium text-green-800">Transcription complete! Opening preview...</p>
		</div>
	{/if}
</div>

<!-- Preview Modal -->
{#if showPreview && extractionResult}
	<div
		role="dialog"
		aria-modal="true"
		aria-labelledby="preview-title"
		class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
		onclick={(e) => {
			if (e.target === e.currentTarget) handleCancelPreview();
		}}
		onkeydown={(e) => {
			if (e.key === 'Escape') handleCancelPreview();
		}}
	>
		<div
			class="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
		>
			<!-- Header -->
			<div class="bg-gradient-to-r from-electric-500 to-purple-500 text-white p-6">
				<div class="flex items-start justify-between">
					<div class="flex-1">
						<h2 id="preview-title" class="text-2xl font-bold mb-2">Review Extracted Data</h2>
						<div class="flex items-center gap-4">
							<div class="flex items-center gap-2">
								<span class="text-sm opacity-90">Confidence:</span>
								<span class="text-lg font-bold {getConfidenceColor(extractionResult.confidence)}"
									>{Math.round(extractionResult.confidence * 100)}%</span
								>
								<span class="text-xs opacity-75"
									>({getConfidenceLabel(extractionResult.confidence)})</span
								>
							</div>
							{#if extractionResult.cached}
								<span class="text-xs bg-white/20 px-2 py-1 rounded">Cached</span>
							{/if}
						</div>
					</div>
					<button
						onclick={handleCancelPreview}
						class="text-white/80 hover:text-white text-2xl leading-none"
						aria-label="Close"
					>
						×
					</button>
				</div>
			</div>

			<!-- Content -->
			<div class="flex-1 overflow-y-auto p-6 space-y-6">
				<!-- Transcription -->
				<div>
					<h3 class="font-semibold text-slate-800 mb-2">Original Transcription</h3>
					<div class="bg-slate-50 rounded-lg p-4 border border-slate-200">
						<p class="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
							{transcription}
						</p>
					</div>
				</div>

				<!-- Suggestions (if any) -->
				{#if extractionResult.suggestions && extractionResult.suggestions.length > 0}
					<div>
						<h3 class="font-semibold text-slate-800 mb-2">Suggestions</h3>
						<div class="space-y-2">
							{#each extractionResult.suggestions as suggestion}
								<div class="bg-yellow-50 border-l-4 border-yellow-400 rounded p-3">
									<p class="text-sm text-yellow-800">{suggestion}</p>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Extracted Data Preview -->
				<div>
					<h3 class="font-semibold text-slate-800 mb-3">Extracted Fields</h3>
					<MissingDataFeedback extracted={extractionResult.extracted} compact={false} />
				</div>

				<!-- Uncertain Fields (GTD Clarify) -->
				{#if extractionResult.extracted._needsClarification && extractionResult.extracted._uncertain && extractionResult.extracted._uncertain.length > 0}
					<div>
						<h3 class="font-semibold text-orange-800 mb-2 flex items-center gap-2">
							<span>⚠️</span>
							<span>Needs Clarification</span>
						</h3>
						<div class="space-y-3">
							{#each extractionResult.extracted._uncertain as uncertain}
								<div class="bg-orange-50 border border-orange-200 rounded-lg p-4">
									<p class="text-sm font-medium text-orange-900 mb-2">{uncertain.question}</p>
									<div class="flex items-center gap-2 text-xs text-orange-700">
										<span>Confidence: {Math.round(uncertain.confidence * 100)}%</span>
										<span>•</span>
										<span>Current: {String(uncertain.value)}</span>
									</div>
									{#if uncertain.options}
										<div class="mt-2 flex flex-wrap gap-2">
											{#each uncertain.options as option}
												<button
													class="px-3 py-1 bg-white border border-orange-300 rounded text-sm text-orange-800 hover:bg-orange-100"
												>
													{option}
												</button>
											{/each}
										</div>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>

			<!-- Footer Actions -->
			<div class="border-t border-slate-200 p-6 bg-slate-50">
				<div class="flex items-center justify-between gap-4">
					<Button variant="secondary" onclick={handleEditAndResubmit}>
						Edit Transcription
					</Button>
					<div class="flex items-center gap-3">
						<Button variant="secondary" onclick={handleCancelPreview}>Cancel</Button>
						<Button variant="primary" onclick={handleSavePreview}>
							Save to Journal
						</Button>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
