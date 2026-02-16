<script lang="ts">
	import { BRAND } from '$lib/brand';

	interface Props {
		activeTab: 'today' | 'crm' | 'weekly' | 'strategic';
		onTabChange: (tab: 'today' | 'crm' | 'weekly' | 'strategic') => void;
	}

	let { activeTab, onTabChange }: Props = $props();

	const tabs = [
		{
			id: 'today' as const,
			label: BRAND.copy.tabs.today.label.split(' ')[0], // "Daily"
			icon: '🤖',
			description: BRAND.copy.tabs.today.description
		},
		{
			id: 'crm' as const,
			label: 'People',
			icon: '🧠',
			description: BRAND.copy.tabs.crm.description
		},
		{
			id: 'weekly' as const,
			label: 'Weekly',
			icon: '📊',
			description: BRAND.copy.tabs.weekly.description
		},
		{
			id: 'strategic' as const,
			label: 'Strategy',
			icon: '🎯',
			description: BRAND.copy.tabs.strategic.description
		}
	];
</script>

<!-- Mobile Bottom Tab Bar -->
<nav
	class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-cloud-200 pb-safe-bottom z-50"
	style="padding-bottom: max(env(safe-area-inset-bottom), 0.5rem);"
>
	<div class="flex items-center justify-around px-2">
		{#each tabs as tab}
			<button
				class="flex flex-col items-center justify-center py-2 px-3 min-w-touch-min min-h-touch-min transition-all duration-200 active:animate-touch-feedback {activeTab ===
				tab.id
					? 'text-accent-500'
					: 'text-cloud-500'}"
				onclick={() => onTabChange(tab.id)}
				aria-label={tab.description}
				aria-current={activeTab === tab.id ? 'page' : undefined}
			>
				<span class="text-2xl mb-1">{tab.icon}</span>
				<span class="text-xs font-medium">{tab.label}</span>
				{#if activeTab === tab.id}
					<div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent-500 rounded-full">
					</div>
				{/if}
			</button>
		{/each}
	</div>
</nav>
