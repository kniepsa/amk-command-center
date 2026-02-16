<script lang="ts">
	import { browser } from '$app/environment';
	import { getDailyCoaches, type DailyCoach } from '$lib/api/journal-client';

	type Coach = DailyCoach;

	let coaches = $state<Coach[]>([]);
	let expandedCoach = $state<string | null>(null);
	let isLoading = $state(true);
	let mounted = $state(false);

	$effect(() => {
		if (!browser || mounted) return;

		mounted = true;
		loadCoachChallenges();
	});

	async function loadCoachChallenges() {
		isLoading = true;
		try {
			coaches = await getDailyCoaches();
		} catch (error) {
			console.error('Error loading coach challenges:', error);
			// Keep mock data on error
			coaches = [
				{
					id: 'campbell',
					name: 'Bill Campbell',
					icon: '🏈',
					recommendation: 'Stop delegating. Start teaching.',
					perspectives: {
						observation: "You're the bottleneck.",
						challenge: 'Teach someone one task today.',
						why: 'Great leaders multiply themselves.'
					}
				}
			];
		} finally {
			isLoading = false;
		}
	}

	function toggleCoach(coachId: string) {
		expandedCoach = expandedCoach === coachId ? null : coachId;
	}
</script>

<div class="space-y-3">
	{#if isLoading}
		<div class="bg-white rounded-lg border border-cloud-200 p-6">
			<p class="text-cloud-400 text-sm text-center">Loading coach insights...</p>
		</div>
	{:else if coaches.length > 0}
		<div class="space-y-3">
			{#each coaches as coach}
				<button
					onclick={() => toggleCoach(coach.id)}
					class="w-full bg-white rounded-lg border border-cloud-200 p-4 text-left hover:border-electric-500 transition-colors"
				>
					<!-- Collapsed: Hormozi-style punch -->
					<div class="flex items-start gap-3">
						<span class="text-2xl">{coach.icon}</span>
						<div class="flex-1 min-w-0">
							<div class="flex items-center justify-between mb-1">
								<h4 class="text-sm font-semibold text-cloud-600">{coach.name}</h4>
								<svg
									class="w-5 h-5 text-cloud-400 transition-transform {expandedCoach ===
									coach.id
										? 'rotate-180'
										: ''}"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M19 9l-7 7-7-7"
									></path>
								</svg>
							</div>
							<p class="text-base font-bold text-cloud-800">{coach.recommendation}</p>
						</div>
					</div>

					<!-- Expanded: Detailed perspectives -->
					{#if expandedCoach === coach.id}
						<div class="mt-4 pt-4 border-t border-cloud-200 space-y-4">
							<!-- Observation -->
							<div>
								<h5 class="text-xs font-semibold text-cloud-400 uppercase mb-2">
									What I See
								</h5>
								<p class="text-sm text-cloud-600">{coach.perspectives.observation}</p>
							</div>

							<!-- Challenge -->
							<div>
								<h5 class="text-xs font-semibold text-electric-500 uppercase mb-2">
									Your Challenge
								</h5>
								<p class="text-sm text-cloud-800 font-medium">
									{coach.perspectives.challenge}
								</p>
							</div>

							<!-- Why -->
							<div>
								<h5 class="text-xs font-semibold text-cloud-400 uppercase mb-2">Why This Matters</h5>
								<p class="text-sm text-cloud-600">{coach.perspectives.why}</p>
							</div>
						</div>
					{/if}
				</button>
			{/each}
		</div>
	{/if}
</div>
