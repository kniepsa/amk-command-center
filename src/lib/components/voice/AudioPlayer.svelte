<script lang="ts">
	/**
	 * AudioPlayer - Playback controls for voice recordings
	 *
	 * Features:
	 * - Play/pause controls
	 * - Seek bar with time display
	 * - Download button
	 * - Clean, minimal UI
	 */

	interface Props {
		audioBlob: Blob;
		onClear?: () => void;
	}

	let { audioBlob, onClear }: Props = $props();

	// State
	let audio = $state<HTMLAudioElement | null>(null);
	let audioUrl = $state<string>('');
	let isPlaying = $state(false);
	let currentTime = $state(0);
	let duration = $state(0);

	// Create audio URL from blob
	$effect(() => {
		if (audioBlob) {
			// Clean up old URL if exists
			if (audioUrl) {
				URL.revokeObjectURL(audioUrl);
			}

			// Create new URL
			audioUrl = URL.createObjectURL(audioBlob);
		}

		// Cleanup on unmount
		return () => {
			if (audioUrl) {
				URL.revokeObjectURL(audioUrl);
			}
		};
	});

	// Audio event handlers
	function handleLoadedMetadata() {
		if (audio) {
			duration = audio.duration;
		}
	}

	function handleTimeUpdate() {
		if (audio) {
			currentTime = audio.currentTime;
		}
	}

	function handleEnded() {
		isPlaying = false;
		currentTime = 0;
	}

	// Playback controls
	function togglePlay() {
		if (!audio) return;

		if (isPlaying) {
			audio.pause();
		} else {
			audio.play();
		}
		isPlaying = !isPlaying;
	}

	function handleSeek(event: Event) {
		if (!audio) return;
		const target = event.target as HTMLInputElement;
		audio.currentTime = parseFloat(target.value);
	}

	function downloadAudio() {
		const link = document.createElement('a');
		link.href = audioUrl;
		link.download = `voice-recording-${new Date().toISOString().split('T')[0]}.webm`;
		link.click();
	}

	// Time formatting
	function formatTime(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}
</script>

<div class="audio-player bg-slate-50 border border-slate-200 rounded-lg p-4">
	<!-- Hidden audio element -->
	<audio
		bind:this={audio}
		src={audioUrl}
		onloadedmetadata={handleLoadedMetadata}
		ontimeupdate={handleTimeUpdate}
		onended={handleEnded}
	></audio>

	<div class="flex items-center gap-4">
		<!-- Play/Pause Button -->
		<button
			onclick={togglePlay}
			class="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-colors shadow-md"
			aria-label={isPlaying ? 'Pause' : 'Play'}
		>
			{#if isPlaying}
				<span class="text-xl">⏸</span>
			{:else}
				<span class="text-xl">▶️</span>
			{/if}
		</button>

		<!-- Seek Bar -->
		<div class="flex-1">
			<input
				type="range"
				min="0"
				max={duration || 0}
				value={currentTime}
				oninput={handleSeek}
				class="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer"
				style="
					background: linear-gradient(
						to right,
						#3b82f6 0%,
						#3b82f6 {(currentTime / duration) * 100}%,
						#cbd5e1 {(currentTime / duration) * 100}%,
						#cbd5e1 100%
					);
				"
			/>
			<div class="flex justify-between text-xs text-slate-600 mt-1">
				<span>{formatTime(currentTime)}</span>
				<span>{formatTime(duration)}</span>
			</div>
		</div>

		<!-- Download Button -->
		<button
			onclick={downloadAudio}
			class="px-3 py-2 text-sm bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors"
			title="Download recording"
		>
			⬇️ Download
		</button>

		<!-- Clear Button (optional) -->
		{#if onClear}
			<button
				onclick={onClear}
				class="px-3 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
				title="Clear recording"
			>
				✕
			</button>
		{/if}
	</div>
</div>

<style>
	/* Custom range slider styling */
	input[type='range']::-webkit-slider-thumb {
		appearance: none;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: #3b82f6;
		cursor: pointer;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	input[type='range']::-moz-range-thumb {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: #3b82f6;
		cursor: pointer;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
		border: none;
	}

	input[type='range']:focus {
		outline: none;
	}

	input[type='range']:focus::-webkit-slider-thumb {
		box-shadow:
			0 0 0 3px rgba(59, 130, 246, 0.3),
			0 2px 4px rgba(0, 0, 0, 0.2);
	}

	input[type='range']:focus::-moz-range-thumb {
		box-shadow:
			0 0 0 3px rgba(59, 130, 246, 0.3),
			0 2px 4px rgba(0, 0, 0, 0.2);
	}
</style>
