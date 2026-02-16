<script lang="ts">
	/**
	 * Voice Journal - Multi-Entry Support with Audio Playback
	 *
	 * Real-time voice capture with:
	 * - Replicate Whisper transcription
	 * - Audio playback before saving
	 * - Multiple entries per day (appends, not overwrites)
	 * - Entry history view
	 * - Missing data feedback
	 * - Bill Campbell coaching challenges
	 * - Save to journal
	 */

	import Button from '$lib/components/shared/Button.svelte';
	import MissingDataFeedback from '$lib/components/MissingDataFeedback.svelte';
	import CoachChallenge from '$lib/components/CoachChallenge.svelte';
	import AudioPlayer from '$lib/components/voice/AudioPlayer.svelte';
	import EntryHistory from '$lib/components/voice/EntryHistory.svelte';
	import { detectCoachChallenges, type CoachChallenge as CoachChallengeType } from '$lib/utils/coach-detector';
	import { api } from '$lib/api/client';
	import type { EntryFrontmatter, ExtractRequest } from '$lib/api/client';

	interface SavedEntry {
		id: string;
		timestamp: string;
		transcription: string;
		extractedData: EntryFrontmatter;
		completeness: number;
	}

	// State
	let isRecording = $state(false);
	let isTranscribing = $state(false);
	let isSaving = $state(false);
	let transcription = $state<string | null>(null);
	let extractedData = $state<EntryFrontmatter | null>(null);
	let coachChallenges = $state<CoachChallengeType[]>([]);
	let error = $state<string | null>(null);
	let success = $state<string | null>(null);
	let mediaRecorder = $state<MediaRecorder | null>(null);
	let audioChunks = $state<Blob[]>([]);
	let audioBlob = $state<Blob | null>(null);
	let recordingTime = $state(0);
	let recordingInterval: ReturnType<typeof setInterval> | null = null;
	let savedEntries = $state<SavedEntry[]>([]);

	// Voice Recording
	async function startRecording() {
		try {
			error = null;
			transcription = null;
			extractedData = null;
			coachChallenges = [];
			success = null;
			audioBlob = null;

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

				// Create audio blob and save to state
				audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

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
			error =
				err instanceof Error ? err.message : 'Failed to access microphone. Please allow access.';
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

	async function transcribeAudio(blob: Blob) {
		isTranscribing = true;
		error = null;

		try {
			// Create form data
			const formData = new FormData();
			formData.append('audio', blob, 'recording.webm');

			// Upload to secure server-side proxy endpoint
			const response = await fetch('/api/transcribe', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.message || `Transcription failed: ${response.status}`);
			}

			const result = await response.json();

			if (result.error) {
				throw new Error(result.error);
			}

			transcription = result.transcription;

			// Extract data from transcription
			if (transcription) {
				await extractFromTranscription(transcription);
			}
		} catch (err) {
			console.error('Transcription error:', err);
			error = err instanceof Error ? err.message : 'Failed to transcribe audio';
		} finally {
			isTranscribing = false;
		}
	}

	async function extractFromTranscription(text: string) {
		try {
			const today = new Date().toISOString().split('T')[0];

			// Use SDK to extract from transcription
			const request: ExtractRequest = {
				transcription: text,
				date: today,
				existing: extractedData || undefined
			};

			const result = await api.entries.extract(request);
			extractedData = result.extracted;

			// Detect coach challenges (up to 2 coaches)
			coachChallenges = detectCoachChallenges(text, 2);
		} catch (err) {
			console.error('Extraction error:', err);
			// Don't show extraction errors to user, just log them
		}
	}

	function calculateCompleteness(data: EntryFrontmatter): number {
		const fields = [
			'energy',
			'sleep',
			'habits',
			'intentions',
			'gratitude',
			'food',
			'people',
			'tags'
		];

		let filled = 0;
		const total = fields.length;

		if (data.energy) filled++;
		if (data.sleep && Object.keys(data.sleep).length > 0) filled++;
		if (data.habits && Object.keys(data.habits).length > 0) filled++;
		if (data.intentions && data.intentions.length > 0) filled++;
		if (data.gratitude && data.gratitude.length > 0) filled++;
		if (data.food && data.food.length > 0) filled++;
		if (data.people && data.people.length > 0) filled++;
		if (data.tags && data.tags.length > 0) filled++;

		return Math.round((filled / total) * 100);
	}

	async function handleSave() {
		if (!extractedData) return;

		isSaving = true;
		error = null;
		success = null;

		try {
			const today = new Date().toISOString().split('T')[0];

			// Build body
			let body = `## 📝 Voice Entry\n\n${transcription}\n`;

			// Add coach challenges if detected
			if (coachChallenges.length > 0) {
				for (const challenge of coachChallenges) {
					body += `\n## ${challenge.icon} ${challenge.name} Challenge\n\n`;
					body += `**Category**: ${challenge.category}\n`;
					body += `**Principle**: ${challenge.principle}\n`;
					body += `**Question**: ${challenge.question}\n`;
					if (challenge.quote) {
						body += `**Quote**: "${challenge.quote}"\n`;
					}
				}
			}

			// Determine if we should append (if there are already saved entries today)
			const append = savedEntries.length > 0;

			// Use SDK to save entry
			const result = await api.entries.save(today, {
				frontmatter: extractedData,
				body,
				append
			});

			success = `✅ Entry ${result.appended ? 'appended' : 'saved'}: ${result.filePath}`;

			// Add to saved entries history
			const savedEntry: SavedEntry = {
				id: crypto.randomUUID(),
				timestamp: new Date().toISOString(),
				transcription: transcription || '',
				extractedData: extractedData,
				completeness: calculateCompleteness(extractedData)
			};
			savedEntries = [...savedEntries, savedEntry];

			// Clear current entry for next recording
			setTimeout(() => {
				transcription = null;
				extractedData = null;
				coachChallenges = [];
				audioBlob = null;
				success = null;
			}, 2000);
		} catch (err) {
			console.error('Save error:', err);
			error = err instanceof Error ? err.message : 'Failed to save entry';
		} finally {
			isSaving = false;
		}
	}

	function formatTime(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}

	function handleNewRecording() {
		transcription = null;
		extractedData = null;
		coachChallenges = [];
		audioBlob = null;
		error = null;
		success = null;
	}

	function handleDeleteEntry(entryId: string) {
		savedEntries = savedEntries.filter((e) => e.id !== entryId);
	}

	function handleClearAudio() {
		audioBlob = null;
	}
</script>

<svelte:head>
	<title>Voice Journal - Multi-Entry</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
	<!-- Header -->
	<header class="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
		<div class="max-w-4xl mx-auto flex items-center justify-between">
			<div class="flex items-center gap-3">
				<span class="text-3xl">🎤</span>
				<div>
					<h1 class="text-xl font-bold text-slate-800">Voice Journal</h1>
					<p class="text-sm text-slate-500">Record multiple entries per day</p>
				</div>
			</div>
			<a
				href="/"
				class="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-2 transition-colors"
			>
				← Back to Dashboard
			</a>
		</div>
	</header>

	<!-- Main Content -->
	<main class="max-w-4xl mx-auto p-6 space-y-6">
		<!-- Entry History (shows saved entries for today) -->
		<EntryHistory entries={savedEntries} onDelete={handleDeleteEntry} />

		<!-- Recording Card -->
		<div class="bg-white rounded-xl border border-slate-200 p-8 shadow-lg">
			<!-- Recording Status -->
			{#if isRecording}
				<div class="text-center mb-6">
					<div class="flex items-center justify-center gap-3 mb-2">
						<div class="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
						<span class="text-2xl font-mono font-bold text-slate-800"
							>{formatTime(recordingTime)}</span
						>
					</div>
					<p class="text-sm text-slate-600">Recording in progress...</p>
				</div>
			{/if}

			{#if isTranscribing}
				<div class="text-center mb-6">
					<div class="flex items-center justify-center gap-3">
						<div
							class="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"
						></div>
						<span class="text-lg font-medium text-blue-600">Transcribing...</span>
					</div>
				</div>
			{/if}

			<!-- Recording Controls -->
			<div class="flex justify-center gap-4 mb-6">
				{#if !transcription}
					{#if !isRecording}
						<Button
							variant="primary"
							onclick={startRecording}
							disabled={isTranscribing}
							size="large"
							fullWidth={true}
						>
							<span class="text-xl">🎤</span>
							{isTranscribing ? 'Transcribing...' : savedEntries.length > 0 ? 'Record Another Entry' : 'Start Recording'}
						</Button>
					{:else}
						<Button variant="secondary" onclick={stopRecording} size="large" fullWidth={true}>
							<span class="text-xl">⏹️</span>
							Stop & Transcribe
						</Button>
					{/if}
				{:else}
					<div class="flex gap-3 w-full">
						<Button variant="secondary" onclick={handleNewRecording} fullWidth={true}>
							🎤 New Recording
						</Button>
						<Button
							variant="primary"
							onclick={handleSave}
							disabled={isSaving}
							fullWidth={true}
						>
							{isSaving ? '💾 Saving...' : savedEntries.length > 0 ? '💾 Add Entry' : '💾 Save Entry'}
						</Button>
					</div>
				{/if}
			</div>

			<!-- Instructions (when idle) -->
			{#if !isRecording && !transcription && !error && !isTranscribing}
				<div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
					<div class="flex items-start gap-4">
						<span class="text-3xl">💡</span>
						<div class="flex-1">
							<h3 class="font-semibold text-blue-900 mb-2">How it works</h3>
							<ul class="text-sm text-blue-800 space-y-2">
								<li class="flex items-start gap-2">
									<span class="text-blue-500 mt-0.5">•</span>
									<span>Click "Start Recording" and speak naturally in German or English</span>
								</li>
								<li class="flex items-start gap-2">
									<span class="text-blue-500 mt-0.5">•</span>
									<span>Click "Stop & Transcribe" when done (AI processes your voice)</span>
								</li>
								<li class="flex items-start gap-2">
									<span class="text-blue-500 mt-0.5">•</span>
									<span>Listen to your recording before saving</span>
								</li>
								<li class="flex items-start gap-2">
									<span class="text-blue-500 mt-0.5">•</span>
									<span
										>See what's captured (✅) and what's missing (❌) for complete journal entry</span
									>
								</li>
								<li class="flex items-start gap-2">
									<span class="text-blue-500 mt-0.5">•</span>
									<span>Get coaching from 6 different coaches (Campbell, Machiavelli, Sales, M&A, Stoic, Parenting)</span>
								</li>
								<li class="flex items-start gap-2">
									<span class="text-blue-500 mt-0.5">•</span>
									<span>Multiple entries per day are appended, not overwritten</span>
								</li>
							</ul>
							<p class="text-xs text-blue-600 mt-3">
								Cost: ~€0.001/min (6x cheaper than OpenAI) • German optimized
							</p>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Error Display -->
		{#if error}
			<div class="bg-red-50 border-2 border-red-200 rounded-lg p-4 shadow">
				<div class="flex items-start gap-3">
					<span class="text-red-500 text-2xl">⚠️</span>
					<div class="flex-1">
						<p class="text-sm font-semibold text-red-800">Error</p>
						<p class="text-sm text-red-700 mt-1">{error}</p>
					</div>
					<button onclick={() => (error = null)} class="text-red-400 hover:text-red-600 text-xl">
						✕
					</button>
				</div>
			</div>
		{/if}

		<!-- Success Display -->
		{#if success}
			<div class="bg-green-50 border-2 border-green-200 rounded-lg p-4 shadow">
				<div class="flex items-center gap-3">
					<span class="text-green-600 text-2xl">✓</span>
					<p class="text-sm font-semibold text-green-800">{success}</p>
				</div>
			</div>
		{/if}

		<!-- Audio Playback -->
		{#if audioBlob && transcription}
			<div class="bg-white rounded-xl border border-slate-200 p-6 shadow-lg">
				<div class="flex items-start gap-3 mb-4">
					<span class="text-blue-600 text-2xl">🎧</span>
					<div class="flex-1">
						<h3 class="font-semibold text-slate-800 mb-1">Audio Recording</h3>
						<p class="text-sm text-slate-500">Listen to your recording</p>
					</div>
				</div>

				<AudioPlayer audioBlob={audioBlob} onClear={handleClearAudio} />
			</div>
		{/if}

		<!-- Transcription Result -->
		{#if transcription}
			<div class="bg-white rounded-xl border border-slate-200 p-6 shadow-lg">
				<div class="flex items-start gap-3 mb-4">
					<span class="text-green-600 text-2xl">✓</span>
					<div class="flex-1">
						<h3 class="font-semibold text-slate-800 mb-1">Transcription Complete</h3>
						<p class="text-sm text-slate-500">Review below and save when ready</p>
					</div>
				</div>

				<div class="bg-slate-50 rounded-lg p-4 border border-slate-200">
					<p class="text-slate-800 whitespace-pre-wrap leading-relaxed">{transcription}</p>
				</div>
			</div>
		{/if}

		<!-- Missing Data Feedback -->
		{#if extractedData}
			<MissingDataFeedback extracted={extractedData} />
		{/if}

		<!-- Coach Challenges -->
		{#each coachChallenges as challenge, index (index)}
			<CoachChallenge
				{challenge}
				onDismiss={() => {
					coachChallenges = coachChallenges.filter((_, i) => i !== index);
				}}
			/>
		{/each}
	</main>
</div>

<style>
	/* Custom animations */
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.animate-spin {
		animation: spin 1s linear infinite;
	}
</style>
