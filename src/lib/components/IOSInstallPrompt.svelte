<script lang="ts">
	import { onMount } from 'svelte';
	import {
		shouldShowIOSInstallPrompt,
		dismissIOSInstallPrompt
	} from '$lib/utils/detect-platform';

	let showPrompt = $state(false);
	let showInstructions = $state(false);

	onMount(() => {
		// Check if we should show the prompt
		showPrompt = shouldShowIOSInstallPrompt();
	});

	function handleDismiss() {
		dismissIOSInstallPrompt();
		showPrompt = false;
	}

	function handleShowInstructions() {
		showInstructions = true;
	}

	function handleCloseInstructions() {
		showInstructions = false;
	}
</script>

{#if showPrompt}
	<!-- Banner notification -->
	<div class="ios-install-banner">
		<div class="banner-content">
			<span class="icon">📱</span>
			<div class="text">
				<strong>Add to Home Screen for notifications</strong>
				<p class="subtitle">Get real-time updates and offline access</p>
			</div>
		</div>
		<div class="actions">
			<button class="btn-primary" onclick={handleShowInstructions}> Show me how </button>
			<button class="btn-dismiss" onclick={handleDismiss} aria-label="Dismiss">×</button>
		</div>
	</div>
{/if}

{#if showInstructions}
	<!-- Instructions modal -->
	<div class="modal-overlay" onclick={handleCloseInstructions}>
		<div class="modal-content" onclick={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h2>Install AMK Command Center</h2>
				<button class="btn-close" onclick={handleCloseInstructions} aria-label="Close">×</button>
			</div>

			<div class="modal-body">
				<div class="step">
					<div class="step-number">1</div>
					<div class="step-content">
						<h3>Tap the Share button</h3>
						<p>Look for the share icon at the bottom of Safari</p>
						<div class="icon-demo">
							<svg width="24" height="32" viewBox="0 0 24 32" fill="currentColor">
								<path
									d="M12 2L12 20M12 2L8 6M12 2L16 6M4 12L4 28C4 29.1046 4.89543 30 6 30L18 30C19.1046 30 20 29.1046 20 28L20 12"
									stroke="currentColor"
									stroke-width="2"
									fill="none"
								/>
							</svg>
						</div>
					</div>
				</div>

				<div class="step">
					<div class="step-number">2</div>
					<div class="step-content">
						<h3>Select "Add to Home Screen"</h3>
						<p>Scroll down in the share menu and tap this option</p>
					</div>
				</div>

				<div class="step">
					<div class="step-number">3</div>
					<div class="step-content">
						<h3>Tap "Add"</h3>
						<p>Confirm to add the app icon to your home screen</p>
					</div>
				</div>

				<div class="alternative">
					<h3>Alternative: Use Telegram Bot</h3>
					<p>
						Can't install the app? Get notifications via Telegram instead. Connect your Telegram
						account in Settings.
					</p>
					<button class="btn-secondary" onclick={() => (window.location.href = '/settings')}>
						Go to Settings
					</button>
				</div>
			</div>

			<div class="modal-footer">
				<button class="btn-primary" onclick={handleCloseInstructions}> Got it! </button>
			</div>
		</div>
	</div>
{/if}

<style>
	.ios-install-banner {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		padding: 1rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		z-index: 9999;
		animation: slideDown 0.3s ease-out;
	}

	@keyframes slideDown {
		from {
			transform: translateY(-100%);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	.banner-content {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex: 1;
	}

	.icon {
		font-size: 2rem;
		line-height: 1;
	}

	.text {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.text strong {
		font-size: 0.875rem;
		font-weight: 600;
	}

	.subtitle {
		font-size: 0.75rem;
		opacity: 0.9;
		margin: 0;
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.btn-primary {
		background: white;
		color: #667eea;
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		border: none;
		font-weight: 600;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s;
		white-space: nowrap;
	}

	.btn-primary:hover {
		transform: translateY(-1px);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	}

	.btn-dismiss {
		background: transparent;
		color: white;
		border: none;
		font-size: 1.5rem;
		line-height: 1;
		cursor: pointer;
		padding: 0.25rem 0.5rem;
		opacity: 0.8;
		transition: opacity 0.2s;
	}

	.btn-dismiss:hover {
		opacity: 1;
	}

	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		z-index: 10000;
		animation: fadeIn 0.2s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.modal-content {
		background: white;
		border-radius: 1rem;
		max-width: 500px;
		width: 100%;
		max-height: 90vh;
		overflow-y: auto;
		box-shadow: 0 20px 25px rgba(0, 0, 0, 0.1);
		animation: slideUp 0.3s ease-out;
	}

	@keyframes slideUp {
		from {
			transform: translateY(20px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.5rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.modal-header h2 {
		font-size: 1.25rem;
		font-weight: 700;
		margin: 0;
		color: #1f2937;
	}

	.btn-close {
		background: transparent;
		border: none;
		font-size: 2rem;
		line-height: 1;
		cursor: pointer;
		color: #6b7280;
		padding: 0;
		transition: color 0.2s;
	}

	.btn-close:hover {
		color: #1f2937;
	}

	.modal-body {
		padding: 1.5rem;
	}

	.step {
		display: flex;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.step:last-of-type {
		margin-bottom: 1rem;
	}

	.step-number {
		flex-shrink: 0;
		width: 2rem;
		height: 2rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 0.875rem;
	}

	.step-content h3 {
		font-size: 1rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
		color: #1f2937;
	}

	.step-content p {
		font-size: 0.875rem;
		color: #6b7280;
		margin: 0;
		line-height: 1.5;
	}

	.icon-demo {
		margin-top: 0.75rem;
		padding: 1rem;
		background: #f3f4f6;
		border-radius: 0.5rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: #667eea;
	}

	.alternative {
		margin-top: 2rem;
		padding: 1.5rem;
		background: #f9fafb;
		border-radius: 0.75rem;
		border: 2px dashed #e5e7eb;
	}

	.alternative h3 {
		font-size: 1rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
		color: #1f2937;
	}

	.alternative p {
		font-size: 0.875rem;
		color: #6b7280;
		margin: 0 0 1rem 0;
		line-height: 1.5;
	}

	.btn-secondary {
		background: white;
		color: #667eea;
		border: 2px solid #667eea;
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		font-weight: 600;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-secondary:hover {
		background: #667eea;
		color: white;
	}

	.modal-footer {
		padding: 1.5rem;
		border-top: 1px solid #e5e7eb;
		display: flex;
		justify-content: flex-end;
	}

	.modal-footer .btn-primary {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		padding: 0.75rem 2rem;
	}

	/* Responsive adjustments */
	@media (max-width: 640px) {
		.ios-install-banner {
			flex-direction: column;
			align-items: stretch;
		}

		.banner-content {
			flex-direction: column;
			align-items: center;
			text-align: center;
		}

		.actions {
			justify-content: center;
		}

		.btn-primary {
			flex: 1;
		}

		.subtitle {
			font-size: 0.7rem;
		}
	}
</style>
