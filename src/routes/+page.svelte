<script lang="ts">
	import TodayTab from '$lib/components/TodayTab.svelte';
	import CRMTab from '$lib/components/CRMTab.svelte';
	import WeeklyTab from '$lib/components/WeeklyTab.svelte';
	import StrategicTab from '$lib/components/StrategicTab.svelte';
	import { BRAND } from '$lib/brand';
	import { onMount } from 'svelte';

	type Tab = 'today' | 'crm' | 'weekly' | 'strategic';

	let activeTab = $state<Tab>('today');

	const tabs: Array<{ id: Tab; label: string; icon: string; shortcut: string; description: string }> = [
		{
			id: 'today',
			label: BRAND.copy.tabs.today.label,
			icon: '🤖',
			shortcut: '⌘1',
			description: BRAND.copy.tabs.today.description
		},
		{
			id: 'crm',
			label: BRAND.copy.tabs.crm.label,
			icon: '🧠',
			shortcut: '⌘2',
			description: BRAND.copy.tabs.crm.description
		},
		{
			id: 'weekly',
			label: BRAND.copy.tabs.weekly.label,
			icon: '📊',
			shortcut: '⌘3',
			description: BRAND.copy.tabs.weekly.description
		},
		{
			id: 'strategic',
			label: BRAND.copy.tabs.strategic.label,
			icon: '🎯',
			shortcut: '⌘4',
			description: BRAND.copy.tabs.strategic.description
		}
	];

	// Keyboard shortcuts
	onMount(() => {
		function handleKeydown(e: KeyboardEvent) {
			if (e.metaKey || e.ctrlKey) {
				switch (e.key) {
					case '1':
						e.preventDefault();
						activeTab = 'today';
						break;
					case '2':
						e.preventDefault();
						activeTab = 'crm';
						break;
					case '3':
						e.preventDefault();
						activeTab = 'weekly';
						break;
					case '4':
						e.preventDefault();
						activeTab = 'strategic';
						break;
				}
			}
		}

		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});

	async function handleLogout() {
		await fetch('/logout', { method: 'POST' });
		window.location.href = '/login';
	}
</script>

<div class="min-h-screen bg-cloud-50">
	<!-- Minimalist Header (Resend-style) -->
	<header class="bg-white border-b border-cloud-200">
		<div class="max-w-7xl mx-auto px-6 py-4">
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-xl font-semibold text-cloud-600">Nexus AI</h1>
					<p class="text-sm text-cloud-500 mt-0.5">Your AI productivity partner</p>
				</div>
				<button
					onclick={handleLogout}
					class="px-4 py-2 text-cloud-500 hover:text-cloud-600 text-sm font-medium transition-colors"
				>
					Logout
				</button>
			</div>
		</div>
	</header>

	<!-- Minimal Tab Navigation (Resend-style) -->
	<nav class="bg-white border-b border-cloud-200">
		<div class="max-w-7xl mx-auto px-6">
			<div class="flex gap-6">
				{#each tabs as tab}
					<button
						class="py-3 text-sm font-medium transition-colors relative {activeTab === tab.id
							? 'text-accent-500'
							: 'text-cloud-500 hover:text-cloud-600'}"
						onclick={() => (activeTab = tab.id)}
					>
						{tab.label}
						{#if activeTab === tab.id}
							<div class="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-500"></div>
						{/if}
					</button>
				{/each}
			</div>
		</div>
	</nav>

	<!-- Tab Content -->
	<main class="max-w-7xl mx-auto px-6 py-8">
		<div class:hidden={activeTab !== 'today'}>
			<TodayTab />
		</div>
		<div class:hidden={activeTab !== 'crm'}>
			<CRMTab />
		</div>
		<div class:hidden={activeTab !== 'weekly'}>
			<WeeklyTab />
		</div>
		<div class:hidden={activeTab !== 'strategic'}>
			<StrategicTab />
		</div>
	</main>
</div>
