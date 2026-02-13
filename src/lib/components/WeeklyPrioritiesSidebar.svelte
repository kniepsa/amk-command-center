<script lang="ts">
	import { BRAND } from '$lib/brand';

	type Priority = {
		id: string;
		text: string;
		days_active: number;
		total_days: number;
	};

	type Props = {
		priorities: Priority[];
		isLoading?: boolean;
	};

	let { priorities, isLoading = false }: Props = $props();

	// Calculate progress percentage
	function getProgress(priority: Priority): number {
		return Math.round((priority.days_active / priority.total_days) * 100);
	}

	// Get progress color
	function getProgressColor(progress: number): string {
		if (progress >= 70) return 'bg-electric-500';
		if (progress >= 40) return 'bg-electric-500/70';
		return 'bg-electric-500/40';
	}
</script>

<div class="bg-midnight-900 rounded-lg border border-white/10 p-6 h-full flex flex-col">
	<!-- Header -->
	<div class="mb-6">
		<h3 class="text-lg font-medium text-white">
			Weekly Priorities
		</h3>
		<p class="text-xs text-slate-400 mt-1">Week 06 of 2026</p>
	</div>

	<!-- Priorities List -->
	<div class="flex-1 space-y-4 overflow-y-auto">
		{#if isLoading}
			<div class="text-center py-8">
				<div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-electric-500"></div>
				<p class="text-slate-400 text-sm mt-2">Loading priorities...</p>
			</div>
		{:else if priorities.length === 0}
			<div class="text-center py-8">
				<p class="text-slate-400 text-sm">No priorities set for this week</p>
			</div>
		{:else}
			{#each priorities as priority}
				{@const progress = getProgress(priority)}
				<div class="p-4 bg-midnight-800/30 rounded-lg hover:bg-midnight-800/50 transition-colors cursor-pointer border border-white/5">
					<div class="flex items-start justify-between mb-3">
						<p class="text-sm text-slate-300 flex-1">{priority.text}</p>
					</div>

					<!-- Progress Bar -->
					<div class="mb-3">
						<div class="h-1.5 bg-midnight-700 rounded-full overflow-hidden">
							<div
								class="{getProgressColor(progress)} h-full rounded-full transition-all"
								style="width: {progress}%"
							></div>
						</div>
					</div>

					<!-- Stats -->
					<div class="flex items-center justify-between text-xs text-slate-400">
						<span>Day {priority.days_active}/{priority.total_days}</span>
						<span class="font-medium">{progress}%</span>
					</div>
				</div>
			{/each}
		{/if}
	</div>

	<!-- Add Priority Button -->
	<div class="mt-6 pt-6 border-t border-white/10">
		<button
			class="w-full px-4 py-3 text-sm bg-midnight-800 text-slate-300 rounded-lg hover:bg-midnight-700 transition-colors font-medium border border-white/5"
		>
			Add Priority
		</button>
	</div>
</div>
