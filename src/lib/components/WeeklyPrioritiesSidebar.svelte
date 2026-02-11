<script lang="ts">
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
		if (progress >= 70) return 'bg-green-500';
		if (progress >= 40) return 'bg-blue-500';
		return 'bg-yellow-500';
	}
</script>

<div class="bg-white rounded-xl shadow-lg p-6 h-full flex flex-col">
	<!-- Header -->
	<div class="mb-6">
		<h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
			<span>🎯</span>
			<span>Weekly Priorities</span>
		</h3>
		<p class="text-xs text-slate-600 mt-1">Week 06 of 2026</p>
	</div>

	<!-- Priorities List -->
	<div class="flex-1 space-y-4 overflow-y-auto">
		{#if isLoading}
			<div class="text-center py-8">
				<div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
				<p class="text-slate-500 text-sm mt-2">Loading priorities...</p>
			</div>
		{:else if priorities.length === 0}
			<div class="text-center py-8">
				<p class="text-slate-500 text-sm">No priorities set for this week</p>
			</div>
		{:else}
			{#each priorities as priority}
				{@const progress = getProgress(priority)}
				<div class="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
					<div class="flex items-start justify-between mb-2">
						<p class="text-sm font-medium text-slate-800 flex-1">{priority.text}</p>
					</div>

					<!-- Progress Bar -->
					<div class="mb-2">
						<div class="h-1.5 bg-slate-200 rounded-full overflow-hidden">
							<div
								class="{getProgressColor(progress)} h-full rounded-full transition-all"
								style="width: {progress}%"
							></div>
						</div>
					</div>

					<!-- Stats -->
					<div class="flex items-center justify-between text-xs text-slate-600">
						<span>Day {priority.days_active}/{priority.total_days}</span>
						<span class="font-medium">{progress}%</span>
					</div>
				</div>
			{/each}
		{/if}
	</div>

	<!-- Add Priority Button -->
	<div class="mt-4 pt-4 border-t border-slate-200">
		<button
			class="w-full px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
		>
			+ Add Priority
		</button>
	</div>
</div>
