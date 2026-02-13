<script lang="ts">
	import Button from './shared/Button.svelte';
	import MissingDataFeedback from './MissingDataFeedback.svelte';
	import type { ExtractedData } from '$lib/types';
	import { BRAND, getVoiceStateMessage } from '$lib/brand';

	interface Props {
		onTranscription?: (text: string) => void;
		extractedData?: ExtractedData | null; // Data from /api/extract-entry
		showFeedback?: boolean; // Whether to show missing data feedback
	}

	let { onTranscription, extractedData = null, showFeedback = false }: Props = $props();

	let isRecording = $state(false);
	let isTranscribing = $state(false);
	let isExtracting = $state(false);
	let transcription = $state<string | null>(null);
	let error = $state<string | null>(null);
	let confidence = $state<number>(1.0);
	let mediaRecorder = $state<MediaRecorder | null>(null);
	let audioChunks = $state<Blob[]>([]);
	let recordingTime = $state(0);
	let recordingInterval: ReturnType<typeof setInterval> | null = null;

	async function startRecording() {
		try {
			error = null;
			transcription = null;
			confidence = 1.0;

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

			// Upload to secure server-side proxy endpoint with timeout
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

			// Call parent callback with transcription
			if (onTranscription && transcription) {
				onTranscription(transcription);
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

	function formatTime(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}
</script>

<div
	class="bg-glass-surface backdrop-blur-glass border border-glass-border rounded-2xl p-6 shadow-glass transition-all duration-300 hover:border-electric-500/20"
>
	<!-- Simple Header -->
	<div class="flex items-center justify-between mb-6">
		<div>
			<h3 class="font-semibold text-white text-lg">Voice Input</h3>
			<p class="text-sm text-slate-400 mt-1">
				{#if isRecording}
					Recording...
				{:else if isTranscribing}
					Transcribing...
				{:else if isExtracting}
					Extracting...
				{:else}
					Speak in German or English
				{/if}
			</p>
		</div>

		{#if isRecording}
			<div class="flex items-center gap-2 text-red-400">
				<div class="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
				<span class="text-sm font-mono">{formatTime(recordingTime)}</span>
			</div>
		{/if}
	</div>

	<!-- Simple Recording Button -->
	<div class="mb-6">
		{#if !isRecording}
			<button
				onclick={startRecording}
				disabled={isTranscribing || isExtracting}
				class="w-full px-6 py-3 bg-electric-500 hover:bg-electric-600 disabled:bg-midnight-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{#if isTranscribing || isExtracting}
					Processing...
				{:else}
					Start Recording
				{/if}
			</button>
		{:else}
			<button
				onclick={stopRecording}
				class="w-full px-6 py-3 bg-midnight-700 hover:bg-midnight-600 text-white font-medium rounded-lg transition-colors border border-midnight-600"
			>
				Stop Recording
			</button>
		{/if}
	</div>

	<!-- Processing States -->
	{#if isTranscribing}
		<div class="bg-electric-500/10 border-l-4 border-electric-500 rounded p-3 mb-4">
			<div class="flex items-center gap-3">
				<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-electric-500"></div>
				<div class="flex-1">
					<p class="text-sm text-electric-500">Transcribing...</p>
					<p class="text-xs text-slate-400 mt-0.5">Whisper Large V3</p>
				</div>
			</div>
		</div>
	{/if}

	{#if isExtracting}
		<div class="bg-purple-500/10 border-l-4 border-purple-500 rounded p-3 mb-4">
			<div class="flex items-center gap-3">
				<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
				<div class="flex-1">
					<p class="text-sm text-purple-400">Extracting data...</p>
					<p class="text-xs text-slate-400 mt-0.5">Claude Sonnet 4.5</p>
				</div>
			</div>
		</div>
	{/if}

	<!-- Error State -->
	{#if error}
		<div class="bg-red-50 border-l-4 border-red-400 rounded p-3 mb-4">
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

	<!-- Success - Transcription Complete -->
	{#if transcription}
		<div class="bg-green-50 border-l-4 border-green-400 rounded p-3 mb-4">
			<div class="flex items-start gap-3">
				<div class="flex-1">
					<div class="flex items-center justify-between mb-2">
						<p class="text-sm font-medium text-green-800">Transcribed</p>
						{#if confidence < 0.5}
							<span class="text-xs text-yellow-700 font-medium">
								{Math.round(confidence * 100)}% confidence
							</span>
						{/if}
					</div>
					<div class="bg-white rounded p-3 border border-green-200">
						<p class="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
							{transcription}
						</p>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Missing Data Feedback -->
	{#if showFeedback && extractedData}
		<div class="mb-4">
			<MissingDataFeedback extracted={extractedData} />
		</div>
	{/if}

	<!-- Instructions -->
	{#if !isRecording && !transcription && !error}
		<div class="bg-slate-50 border border-slate-200 rounded p-4">
			<p class="text-sm text-slate-600 mb-3">How it works:</p>
			<ul class="text-sm text-slate-700 space-y-2">
				<li class="flex items-start gap-2">
					<span class="text-slate-400">•</span>
					<span>Speak naturally in German or English</span>
				</li>
				<li class="flex items-start gap-2">
					<span class="text-slate-400">•</span>
					<span>Automatically extracts habits, gratitude, tasks, and people</span>
				</li>
				<li class="flex items-start gap-2">
					<span class="text-slate-400">•</span>
					<span>Saves to your journal after review</span>
				</li>
			</ul>
		</div>
	{/if}
</div>
