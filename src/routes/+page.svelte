<script lang="ts">
	import TodayTab from '$lib/components/TodayTab.svelte';
	import CRMTab from '$lib/components/CRMTab.svelte';
	import MorningTab from '$lib/components/MorningTab.svelte';
	import EveningTab from '$lib/components/EveningTab.svelte';
	import WeeklyTab from '$lib/components/WeeklyTab.svelte';
	import MetricsTab from '$lib/components/MetricsTab.svelte';
	import LearningTab from '$lib/components/LearningTab.svelte';

	type Tab = 'today' | 'morning' | 'evening' | 'weekly' | 'crm' | 'metrics' | 'learning';

	let activeTab = $state<Tab>('today');

	const tabs: Array<{ id: Tab; label: string; icon: string }> = [
		{ id: 'today', label: 'Today', icon: '💬' },
		{ id: 'morning', label: 'Morning', icon: '🌅' },
		{ id: 'evening', label: 'Evening', icon: '🌙' },
		{ id: 'weekly', label: 'Weekly', icon: '📅' },
		{ id: 'crm', label: 'Personal CRM', icon: '👥' },
		{ id: 'metrics', label: 'Metrics', icon: '📊' },
		{ id: 'learning', label: 'Learning', icon: '📚' }
	];
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
	<!-- Header -->
	<header class="bg-white shadow-sm border-b border-slate-200">
		<div class="max-w-7xl mx-auto px-6 py-6">
			<h1 class="text-3xl font-bold text-slate-900">AMK Command Center</h1>
			<p class="text-slate-600 mt-1">Personal productivity + CRM powered by your journal</p>
		</div>
	</header>

	<!-- Tab Navigation -->
	<nav class="bg-white border-b border-slate-200">
		<div class="max-w-7xl mx-auto px-6">
			<div class="flex gap-1">
				{#each tabs as tab}
					<button
						class="px-6 py-4 font-medium transition-colors relative {activeTab === tab.id
							? 'text-blue-600 bg-blue-50'
							: 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}"
						onclick={() => (activeTab = tab.id)}
					>
						<span class="mr-2">{tab.icon}</span>
						{tab.label}
						{#if activeTab === tab.id}
							<div class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
						{/if}
					</button>
				{/each}
			</div>
		</div>
	</nav>

	<!-- Tab Content -->
	<main class="max-w-7xl mx-auto px-6 py-8">
		{#if activeTab === 'today'}
			<TodayTab />
		{:else if activeTab === 'morning'}
			<MorningTab />
		{:else if activeTab === 'evening'}
			<EveningTab />
		{:else if activeTab === 'weekly'}
			<WeeklyTab />
		{:else if activeTab === 'crm'}
			<CRMTab />
		{:else if activeTab === 'metrics'}
			<MetricsTab />
		{:else if activeTab === 'learning'}
			<LearningTab />
		{/if}
	</main>
</div>
