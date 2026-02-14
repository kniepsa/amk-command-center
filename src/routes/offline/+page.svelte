<script lang="ts">
	import { onMount } from 'svelte';

	let isOnline = $state(true);

	onMount(() => {
		// Check online status
		isOnline = navigator.onLine;

		// Listen for online/offline events
		window.addEventListener('online', () => {
			isOnline = true;
		});

		window.addEventListener('offline', () => {
			isOnline = false;
		});
	});

	function handleRetry() {
		if (navigator.onLine) {
			window.location.href = '/';
		}
	}
</script>

<svelte:head>
	<title>Offline - AMK Command Center</title>
</svelte:head>

<div class="offline-page">
	<div class="content">
		<div class="icon">📴</div>
		<h1>You're offline</h1>
		<p class="subtitle">Your internet connection appears to be offline.</p>

		{#if !isOnline}
			<div class="status-indicator">
				<div class="dot offline"></div>
				<span>Disconnected</span>
			</div>
		{:else}
			<div class="status-indicator">
				<div class="dot online"></div>
				<span>Connected</span>
			</div>
		{/if}

		<div class="info">
			<h2>What you can still do:</h2>
			<ul>
				<li>📝 View cached entries</li>
				<li>✅ Mark habits complete (will sync when online)</li>
				<li>🎤 Record voice entries (saved locally)</li>
				<li>📊 View cached metrics</li>
			</ul>
		</div>

		<button class="btn-primary" onclick={handleRetry} disabled={!isOnline}>
			{#if isOnline}
				Return to App
			{:else}
				Waiting for connection...
			{/if}
		</button>

		<p class="help-text">Your data will sync automatically when you're back online.</p>
	</div>
</div>

<style>
	.offline-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	}

	.content {
		max-width: 500px;
		width: 100%;
		background: white;
		border-radius: 1.5rem;
		padding: 3rem 2rem;
		text-align: center;
		box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
	}

	.icon {
		font-size: 5rem;
		margin-bottom: 1rem;
		animation: pulse 2s ease-in-out infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.6;
		}
	}

	h1 {
		font-size: 2rem;
		font-weight: 700;
		margin: 0 0 0.5rem 0;
		color: #1f2937;
	}

	.subtitle {
		color: #6b7280;
		margin: 0 0 2rem 0;
		font-size: 1rem;
	}

	.status-indicator {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: #f3f4f6;
		border-radius: 2rem;
		font-size: 0.875rem;
		font-weight: 600;
		margin-bottom: 2rem;
	}

	.dot {
		width: 0.75rem;
		height: 0.75rem;
		border-radius: 50%;
	}

	.dot.online {
		background: #10b981;
		animation: ping 1s ease-in-out infinite;
	}

	.dot.offline {
		background: #ef4444;
	}

	@keyframes ping {
		0% {
			box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
		}
		70% {
			box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
		}
		100% {
			box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
		}
	}

	.info {
		text-align: left;
		background: #f9fafb;
		border-radius: 1rem;
		padding: 1.5rem;
		margin: 2rem 0;
	}

	.info h2 {
		font-size: 1rem;
		font-weight: 600;
		margin: 0 0 1rem 0;
		color: #1f2937;
	}

	.info ul {
		margin: 0;
		padding-left: 0;
		list-style: none;
	}

	.info li {
		padding: 0.5rem 0;
		color: #4b5563;
		font-size: 0.875rem;
	}

	.btn-primary {
		width: 100%;
		padding: 1rem 2rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		border-radius: 0.75rem;
		font-weight: 600;
		font-size: 1rem;
		cursor: pointer;
		transition: all 0.2s;
		margin-bottom: 1rem;
	}

	.btn-primary:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 8px 16px rgba(102, 126, 234, 0.4);
	}

	.btn-primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.help-text {
		color: #9ca3af;
		font-size: 0.875rem;
		margin: 0;
	}
</style>
