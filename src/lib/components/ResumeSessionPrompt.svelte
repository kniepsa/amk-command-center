<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import {
		hasSavedSession,
		getResumeSummary,
		restoreSession,
		clearSession,
		sessionStore
	} from '$lib/stores/session.svelte';

	let showPrompt = $state(false);
	let summary = $state('');

	onMount(() => {
		// Check if there's a session to resume
		if (hasSavedSession()) {
			showPrompt = true;
			summary = getResumeSummary();
		}
	});

	async function handleResume() {
		restoreSession();
		showPrompt = false;

		// Navigate to last tab if available
		if (sessionStore.lastTabVisited) {
			await goto(sessionStore.lastTabVisited);
		}

		// Announce via voice if available
		if ('speechSynthesis' in window) {
			const utterance = new SpeechSynthesisUtterance('Resuming your session');
			window.speechSynthesis.speak(utterance);
		}
	}

	function handleStartFresh() {
		clearSession();
		showPrompt = false;

		// Announce via voice if available
		if ('speechSynthesis' in window) {
			const utterance = new SpeechSynthesisUtterance('Starting fresh');
			window.speechSynthesis.speak(utterance);
		}
	}
</script>

{#if showPrompt}
	<div class="resume-modal-overlay">
		<div class="resume-modal">
			<div class="icon">🔄</div>
			<h2>Resume where you left off?</h2>
			<p class="summary">We found: <strong>{summary}</strong></p>

			<div class="actions">
				<button class="btn-primary" onclick={handleResume}>
					<span class="btn-icon">▶️</span>
					Resume Session
				</button>
				<button class="btn-secondary" onclick={handleStartFresh}>
					<span class="btn-icon">✨</span>
					Start Fresh
				</button>
			</div>

			<div class="voice-hint">
				<span class="voice-icon">🎤</span>
				<p>Say "resume" or "start over"</p>
			</div>
		</div>
	</div>
{/if}

<style>
	.resume-modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		z-index: 10000;
		animation: fadeIn 0.3s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.resume-modal {
		background: white;
		border-radius: 1.5rem;
		padding: 2rem;
		max-width: 450px;
		width: 100%;
		box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
		text-align: center;
		animation: slideUp 0.4s ease-out;
	}

	@keyframes slideUp {
		from {
			transform: translateY(30px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	.icon {
		font-size: 4rem;
		margin-bottom: 1rem;
		animation: rotate 2s ease-in-out infinite;
	}

	@keyframes rotate {
		0%,
		100% {
			transform: rotate(0deg);
		}
		50% {
			transform: rotate(180deg);
		}
	}

	h2 {
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0 0 1rem 0;
		color: #1f2937;
	}

	.summary {
		color: #6b7280;
		margin: 0 0 2rem 0;
		font-size: 0.95rem;
		line-height: 1.6;
	}

	.summary strong {
		color: #667eea;
		font-weight: 600;
	}

	.actions {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
	}

	button {
		padding: 1rem 1.5rem;
		border: none;
		border-radius: 0.75rem;
		font-weight: 600;
		font-size: 1rem;
		cursor: pointer;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}

	.btn-primary {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.btn-primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 16px rgba(102, 126, 234, 0.4);
	}

	.btn-secondary {
		background: #f3f4f6;
		color: #4b5563;
	}

	.btn-secondary:hover {
		background: #e5e7eb;
		transform: translateY(-1px);
	}

	.btn-icon {
		font-size: 1.2rem;
	}

	.voice-hint {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: #f9fafb;
		border-radius: 0.5rem;
		border: 2px dashed #e5e7eb;
	}

	.voice-icon {
		font-size: 1.25rem;
	}

	.voice-hint p {
		margin: 0;
		font-size: 0.875rem;
		color: #6b7280;
		font-weight: 500;
	}

	/* Responsive adjustments */
	@media (max-width: 640px) {
		.resume-modal {
			padding: 1.5rem;
		}

		h2 {
			font-size: 1.25rem;
		}

		.icon {
			font-size: 3rem;
		}
	}
</style>
