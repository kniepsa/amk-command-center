<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import PersistenceManager from '$lib/components/PersistenceManager.svelte';
	import UndoToast from '$lib/components/UndoToast.svelte';
	import IOSInstallPrompt from '$lib/components/IOSInstallPrompt.svelte';
	import ResumeSessionPrompt from '$lib/components/ResumeSessionPrompt.svelte';
	import { undoLast, getLastAction } from '$lib/stores/action-history.svelte';
	import { initAutoSave } from '$lib/utils/auto-save';
	import { browser } from '$app/environment';

	let { children } = $props();

	onMount(() => {
		// Initialize auto-save for session state
		initAutoSave();

		// Register service worker for PWA support
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker
				.register('/service-worker.js')
				.then((registration) => {
					console.log('[App] Service Worker registered:', registration);
				})
				.catch((error) => {
					console.error('[App] Service Worker registration failed:', error);
				});
		}
	});

	// Global keyboard shortcuts
	$effect(() => {
		if (!browser) return;

		async function handleKeydown(e: KeyboardEvent) {
			// Cmd+Shift+Z (Mac) or Ctrl+Shift+Z (Windows/Linux) for Undo
			if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'z') {
				e.preventDefault();
				await undoLast();
			}

			// Cmd+Shift+X for Cancel/Clear (future use)
			if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'x') {
				e.preventDefault();
				// Future: Cancel current operation
				console.log('Cancel operation (future feature)');
			}

			// Cmd+Shift+R for Repeat last action (future use)
			if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'r') {
				e.preventDefault();
				const lastAction = getLastAction();
				if (lastAction) {
					// Future: Repeat the last action
					console.log('Repeat last action (future feature):', lastAction.description);
				}
			}
		}

		window.addEventListener('keydown', handleKeydown);

		return () => {
			window.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="manifest" href="/manifest.json" />
	<meta name="theme-color" content="#667eea" />
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-status-bar-style" content="default" />
	<meta name="apple-mobile-web-app-title" content="AMK CC" />
	<title>AMK Command Center</title>
</svelte:head>

<!-- Persistence manager handles localStorage sync -->
<PersistenceManager />

<!-- Undo toast (global) -->
<UndoToast />

<!-- iOS install prompt (only shows on iOS Safari) -->
<IOSInstallPrompt />

<!-- Resume session prompt (only shows if saved session exists) -->
<ResumeSessionPrompt />

{@render children()}
