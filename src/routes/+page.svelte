<script lang="ts">
	import CaptureTab from '$lib/components/CaptureTab.svelte';
	import TodayTab from '$lib/components/TodayTab.svelte';
	import HabitsTab from '$lib/components/HabitsTab.svelte';
	import CRMTab from '$lib/components/CRMTab.svelte';
	import PlanTab from '$lib/components/PlanTab.svelte';
	import InsightsTab from '$lib/components/InsightsTab.svelte';
	import MobileTabBar from '$lib/components/MobileTabBar.svelte';
	import { onMount } from 'svelte';

	type Tab = 'capture' | 'today' | 'habits' | 'people' | 'plan' | 'insights';

	let activeTab = $state<Tab>('today');

	const tabs: Array<{ id: Tab; label: string; icon: string; shortcut: string }> = [
		{
			id: 'capture',
			label: 'Capture',
			icon: '📥',
			shortcut: '⌘1'
		},
		{
			id: 'today',
			label: 'Today',
			icon: '⚡',
			shortcut: '⌘2'
		},
		{
			id: 'habits',
			label: 'Habits',
			icon: '🎯',
			shortcut: '⌘3'
		},
		{
			id: 'people',
			label: 'People',
			icon: '👥',
			shortcut: '⌘4'
		},
		{
			id: 'plan',
			label: 'Plan',
			icon: '📋',
			shortcut: '⌘5'
		},
		{
			id: 'insights',
			label: 'Insights',
			icon: '📊',
			shortcut: '⌘6'
		}
	];

	// Keyboard shortcuts
	onMount(() => {
		function handleKeydown(e: KeyboardEvent) {
			if (e.metaKey || e.ctrlKey) {
				switch (e.key) {
					case '1':
						e.preventDefault();
						activeTab = 'capture';
						break;
					case '2':
						e.preventDefault();
						activeTab = 'today';
						break;
					case '3':
						e.preventDefault();
						activeTab = 'habits';
						break;
					case '4':
						e.preventDefault();
						activeTab = 'people';
						break;
					case '5':
						e.preventDefault();
						activeTab = 'plan';
						break;
					case '6':
						e.preventDefault();
						activeTab = 'insights';
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

<div class="min-h-screen bg-cloud-50 pb-20 md:pb-0">
	<!-- Minimalist Header (Resend-style) -->
	<header class="bg-white border-b border-cloud-200">
		<div class="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-lg md:text-xl font-semibold text-cloud-600">Nexus AI</h1>
					<p class="text-xs md:text-sm text-cloud-500 mt-0.5 hidden sm:block">
						Your AI productivity partner
					</p>
				</div>
				<button
					onclick={handleLogout}
					class="px-3 md:px-4 py-2 text-cloud-500 hover:text-cloud-600 text-xs md:text-sm font-medium transition-colors min-h-touch-min"
				>
					Logout
				</button>
			</div>
		</div>
	</header>

	<!-- Desktop Tab Navigation (hidden on mobile) -->
	<nav class="hidden md:block bg-white border-b border-cloud-200">
		<div class="max-w-7xl mx-auto px-6">
			<div class="flex gap-6">
				{#each tabs as tab}
					<button
						class="py-3 text-sm font-medium transition-colors relative group {activeTab === tab.id
							? 'text-electric-600'
							: 'text-cloud-500 hover:text-cloud-600'}"
						onclick={() => (activeTab = tab.id)}
						title={`${tab.label} (${tab.shortcut})`}
					>
						<span class="mr-1">{tab.icon}</span>
						{tab.label}
						<span class="ml-1 text-xs text-cloud-400 opacity-0 group-hover:opacity-100 transition-opacity"
							>{tab.shortcut}</span
						>
						{#if activeTab === tab.id}
							<div class="absolute bottom-0 left-0 right-0 h-0.5 bg-electric-600"></div>
						{/if}
					</button>
				{/each}
			</div>
		</div>
	</nav>

	<!-- Tab Content -->
	<main class="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8">
		<div class:hidden={activeTab !== 'capture'}>
			<CaptureTab />
		</div>
		<div class:hidden={activeTab !== 'today'}>
			<TodayTab />
		</div>
		<div class:hidden={activeTab !== 'habits'}>
			<HabitsTab />
		</div>
		<div class:hidden={activeTab !== 'people'}>
			<CRMTab />
		</div>
		<div class:hidden={activeTab !== 'plan'}>
			<PlanTab />
		</div>
		<div class:hidden={activeTab !== 'insights'}>
			<InsightsTab />
		</div>
	</main>

	<!-- Mobile Bottom Tab Bar -->
	<MobileTabBar {activeTab} onTabChange={(tab) => (activeTab = tab)} />
</div>
