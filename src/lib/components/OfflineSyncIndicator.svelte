<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { offlineSyncService } from '$lib/services/offline-sync';

	let isOnline = $state(true);
	let isSyncing = $state(false);
	let pendingCount = $state(0);
	let lastSyncTime = $state<number | null>(null);
	let errors = $state<string[]>([]);
	let showDetails = $state(false);

	let unsubscribe: (() => void) | null = null;

	onMount(() => {
		// Initial online status
		isOnline = navigator.onLine;

		// Listen for online/offline events
		const handleOnline = () => {
			isOnline = true;
		};

		const handleOffline = () => {
			isOnline = false;
		};

		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);

		// Subscribe to sync status updates
		unsubscribe = offlineSyncService.subscribe((status) => {
			isSyncing = status.isSyncing;
			pendingCount = status.pendingCount;
			lastSyncTime = status.lastSyncTime;
			errors = status.errors;
		});

		// Get initial pending count
		offlineSyncService.getPendingCount().then((count) => {
			pendingCount = count;
		});

		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
		};
	});

	onDestroy(() => {
		if (unsubscribe) {
			unsubscribe();
		}
	});

	function handleSyncNow() {
		offlineSyncService.syncNow();
	}

	function getTimeSinceSync(): string {
		if (!lastSyncTime) return 'Never';

		const seconds = Math.floor((Date.now() - lastSyncTime) / 1000);
		if (seconds < 60) return 'Just now';
		if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
		if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
		return `${Math.floor(seconds / 86400)}d ago`;
	}
</script>

<!-- Only show when offline or when there are pending items -->
{#if !isOnline || pendingCount > 0}
	<div class="fixed bottom-4 right-4 z-50">
		<!-- Compact indicator -->
		<button
			onclick={() => (showDetails = !showDetails)}
			class="flex items-center gap-2 px-4 py-2 rounded-full shadow-lg transition-all duration-200 {isOnline
				? 'bg-blue-500 hover:bg-blue-600'
				: 'bg-red-500 hover:bg-red-600'} text-white"
			aria-label="Sync status"
		>
			{#if isSyncing}
				<!-- Syncing animation -->
				<svg
					class="w-4 h-4 animate-spin"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
					/>
				</svg>
				<span class="text-sm font-medium">Syncing...</span>
			{:else if !isOnline}
				<!-- Offline icon -->
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
					/>
				</svg>
				<span class="text-sm font-medium">Offline</span>
			{:else if pendingCount > 0}
				<!-- Pending items -->
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<span class="text-sm font-medium">{pendingCount} pending</span>
			{/if}
		</button>

		<!-- Expanded details panel -->
		{#if showDetails}
			<div
				class="absolute bottom-14 right-0 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 space-y-3"
			>
				<!-- Header -->
				<div class="flex items-center justify-between">
					<h3 class="font-semibold text-gray-900 dark:text-white">Sync Status</h3>
					<button
						onclick={() => (showDetails = false)}
						class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
						aria-label="Close"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>

				<!-- Connection status -->
				<div class="flex items-center gap-2">
					<div
						class="w-2 h-2 rounded-full {isOnline
							? 'bg-green-500'
							: 'bg-red-500'} {isOnline ? 'animate-pulse' : ''}"
					></div>
					<span class="text-sm text-gray-600 dark:text-gray-400">
						{isOnline ? 'Connected' : 'Offline'}
					</span>
				</div>

				<!-- Pending count -->
				{#if pendingCount > 0}
					<div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
						<div class="flex items-center justify-between mb-2">
							<span class="text-sm font-medium text-blue-900 dark:text-blue-300">
								Pending Items
							</span>
							<span
								class="text-lg font-bold text-blue-600 dark:text-blue-400"
							>
								{pendingCount}
							</span>
						</div>
						<p class="text-xs text-blue-700 dark:text-blue-300">
							{#if isOnline}
								Will sync automatically
							{:else}
								Will sync when connection is restored
							{/if}
						</p>
					</div>
				{/if}

				<!-- Last sync time -->
				<div class="text-xs text-gray-500 dark:text-gray-400">
					Last synced: {getTimeSinceSync()}
				</div>

				<!-- Errors -->
				{#if errors.length > 0}
					<div class="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
						<p class="text-sm font-medium text-red-900 dark:text-red-300 mb-2">
							Sync Errors ({errors.length})
						</p>
						<div class="space-y-1 max-h-24 overflow-y-auto">
							{#each errors.slice(0, 3) as error}
								<p class="text-xs text-red-700 dark:text-red-300">{error}</p>
							{/each}
							{#if errors.length > 3}
								<p class="text-xs text-red-600 dark:text-red-400 font-medium">
									+{errors.length - 3} more
								</p>
							{/if}
						</div>
					</div>
				{/if}

				<!-- Manual sync button -->
				{#if isOnline && !isSyncing}
					<button
						onclick={handleSyncNow}
						class="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
					>
						Sync Now
					</button>
				{/if}
			</div>
		{/if}
	</div>
{/if}
