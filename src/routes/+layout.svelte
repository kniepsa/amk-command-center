<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import PersistenceManager from '$lib/components/PersistenceManager.svelte';
	import UndoToast from '$lib/components/UndoToast.svelte';
	import IOSInstallPrompt from '$lib/components/IOSInstallPrompt.svelte';
	import ResumeSessionPrompt from '$lib/components/ResumeSessionPrompt.svelte';
	import OfflineSyncIndicator from '$lib/components/OfflineSyncIndicator.svelte';
	import GlobalSearch from '$lib/components/GlobalSearch.svelte';
	import ToastContainer from '$lib/components/ToastContainer.svelte';
	import KeyboardShortcutsModal from '$lib/components/KeyboardShortcutsModal.svelte';
	import { undoLast, getLastAction } from '$lib/stores/action-history.svelte';
	import { shortcuts } from '$lib/stores/shortcuts.svelte';
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
	<title>AMK Command Center</title>
</svelte:head>

<!-- Global Header with Search -->
<header class="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
	<div class="max-w-7xl mx-auto flex items-center justify-between gap-4">
		<!-- Logo/Title -->
		<div class="flex-shrink-0">
			<h1 class="text-lg font-semibold text-gray-900">AMK Command Center</h1>
		</div>

		<!-- Global Search -->
		<div class="flex-1 max-w-2xl">
			<GlobalSearch />
		</div>

		<!-- Help button for keyboard shortcuts -->
		<button
			onclick={() => shortcuts.open()}
			class="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
			title="Keyboard shortcuts (⌘K)"
			aria-label="Show keyboard shortcuts"
		>
			<svg
				class="w-5 h-5"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				></path>
			</svg>
		</button>
	</div>
</header>

<!-- Persistence manager handles localStorage sync -->
<PersistenceManager />

<!-- Undo toast (global) -->
<UndoToast />

<!-- Toast notifications (global) -->
<ToastContainer />

<!-- Keyboard shortcuts modal (global) -->
<KeyboardShortcutsModal />

<!-- iOS install prompt (only shows on iOS Safari) -->
<IOSInstallPrompt />

<!-- Resume session prompt (only shows if saved session exists) -->
<ResumeSessionPrompt />

<!-- Offline sync indicator (shows when offline or has pending items) -->
<OfflineSyncIndicator />

{@render children()}
