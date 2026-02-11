<script lang="ts">
	import { getStreakColor, getEnergyColor, getSleepColor } from '$lib/utils/metrics';

	// Sample data for demonstration
	// TODO: Derive from actual morning/evening review data
	const habitStreaks = [
		{ habit: 'Running', streak: 12, best: 45, lastCompleted: '2026-02-10' },
		{ habit: 'Sauna', streak: 8, best: 30, lastCompleted: '2026-02-10' },
		{ habit: 'Journaling', streak: 156, best: 156, lastCompleted: '2026-02-10' },
		{ habit: 'Sales Learning', streak: 7, best: 14, lastCompleted: '2026-02-09' },
		{ habit: 'Morning Electrolytes', streak: 22, best: 60, lastCompleted: '2026-02-10' }
	];

	const energyTrends = [
		{ date: '2026-02-04', energy: 'medium', score: 2 },
		{ date: '2026-02-05', energy: 'high', score: 3 },
		{ date: '2026-02-06', energy: 'low', score: 1 },
		{ date: '2026-02-07', energy: 'medium', score: 2 },
		{ date: '2026-02-08', energy: 'high', score: 3 },
		{ date: '2026-02-09', energy: 'medium', score: 2 },
		{ date: '2026-02-10', energy: 'high', score: 3 }
	];

	const sleepTrends = [
		{ date: '2026-02-04', hours: 7.2, quality: 'good' },
		{ date: '2026-02-05', hours: 8.1, quality: 'excellent' },
		{ date: '2026-02-06', hours: 6.5, quality: 'fair' },
		{ date: '2026-02-07', hours: 7.8, quality: 'good' },
		{ date: '2026-02-08', hours: 8.3, quality: 'excellent' },
		{ date: '2026-02-09', hours: 7.5, quality: 'good' },
		{ date: '2026-02-10', hours: 7.9, quality: 'good' }
	];

	import { contacts, interactions, getDaysSinceLastContact } from '$lib/stores/data.svelte';
	import { FOLLOW_UP_THRESHOLD_DAYS } from '$lib/utils/constants';

	// Compute real CRM stats from actual data
	const crmStats = $derived({
		totalContacts: contacts.length,
		totalInteractions: interactions.length,
		thisWeekInteractions: interactions.filter((i) => {
			const iDate = new Date(i.date);
			const weekAgo = new Date();
			weekAgo.setDate(weekAgo.getDate() - 7);
			return iDate >= weekAgo;
		}).length,
		needsFollowUp: contacts.filter((c) => {
			const days = getDaysSinceLastContact(c.handle);
			return days === null || days > FOLLOW_UP_THRESHOLD_DAYS;
		}).length
	});

	const avgSleepHours = $derived(
		(sleepTrends.reduce((sum, day) => sum + day.hours, 0) / sleepTrends.length).toFixed(1)
	);

	const avgEnergy = $derived(
		(energyTrends.reduce((sum, day) => sum + day.score, 0) / energyTrends.length).toFixed(1)
	);
</script>

<div class="bg-white rounded-xl shadow-lg p-8">
	<h2 class="text-2xl font-bold text-slate-900 mb-6">📊 Metrics & Streaks</h2>
	<p class="text-slate-600 mb-8">Your patterns and progress at a glance</p>

	<div class="space-y-8">
		<!-- Habit Streaks Section -->
		<div class="border-b border-slate-200 pb-6">
			<h3 class="font-semibold text-slate-800 mb-4 flex items-center gap-2">
				<span>🔥</span>
				<span>Habit Streaks</span>
			</h3>

			<div class="space-y-3">
				{#each habitStreaks as habit}
					<div class="p-4 bg-slate-50 rounded-lg">
						<div class="flex items-center justify-between mb-2">
							<span class="font-medium text-slate-800">{habit.habit}</span>
							<span class="text-sm text-slate-600">Last: {habit.lastCompleted}</span>
						</div>
						<div class="flex items-center gap-4">
							<div class="flex-1">
								<div class="h-2 bg-slate-200 rounded-full overflow-hidden">
									<div
										class="{getStreakColor(habit.streak, habit.best)} h-full rounded-full transition-all"
										style="width: {(habit.streak / habit.best) * 100}%"
									></div>
								</div>
							</div>
							<div class="text-right">
								<div class="text-lg font-bold text-slate-900">{habit.streak}</div>
								<div class="text-xs text-slate-500">Best: {habit.best}</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Energy Patterns Section -->
		<div class="border-b border-slate-200 pb-6">
			<h3 class="font-semibold text-slate-800 mb-4 flex items-center gap-2">
				<span>⚡</span>
				<span>Energy Patterns (7 Days)</span>
				<span class="ml-auto text-sm font-normal text-slate-600">Avg: {avgEnergy}/3</span>
			</h3>

			<div class="flex gap-2 items-end h-32">
				{#each energyTrends as day}
					<div class="flex-1 flex flex-col items-center gap-2">
						<div class="flex-1 flex items-end w-full">
							<div
								class="{getEnergyColor(day.score)} w-full rounded-t transition-all"
								style="height: {(day.score / 3) * 100}%"
							></div>
						</div>
						<div class="text-xs text-slate-600 text-center">
							{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
						</div>
					</div>
				{/each}
			</div>

			<div class="flex gap-2 mt-4 text-xs">
				<div class="flex items-center gap-1">
					<div class="w-3 h-3 bg-green-500 rounded"></div>
					<span class="text-slate-600">High</span>
				</div>
				<div class="flex items-center gap-1">
					<div class="w-3 h-3 bg-blue-500 rounded"></div>
					<span class="text-slate-600">Medium</span>
				</div>
				<div class="flex items-center gap-1">
					<div class="w-3 h-3 bg-yellow-500 rounded"></div>
					<span class="text-slate-600">Low</span>
				</div>
			</div>
		</div>

		<!-- Sleep Quality Section -->
		<div class="border-b border-slate-200 pb-6">
			<h3 class="font-semibold text-slate-800 mb-4 flex items-center gap-2">
				<span>😴</span>
				<span>Sleep Quality (7 Days)</span>
				<span class="ml-auto text-sm font-normal text-slate-600">Avg: {avgSleepHours}h</span>
			</h3>

			<div class="flex gap-2 items-end h-32">
				{#each sleepTrends as day}
					<div class="flex-1 flex flex-col items-center gap-2">
						<div class="flex-1 flex items-end w-full">
							<div
								class="{getSleepColor(day.hours)} w-full rounded-t transition-all"
								style="height: {(day.hours / 10) * 100}%"
								title="{day.hours}h - {day.quality}"
							></div>
						</div>
						<div class="text-xs text-slate-600 text-center">
							{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
						</div>
						<div class="text-xs font-medium text-slate-800">{day.hours}h</div>
					</div>
				{/each}
			</div>

			<div class="flex gap-2 mt-4 text-xs">
				<div class="flex items-center gap-1">
					<div class="w-3 h-3 bg-green-500 rounded"></div>
					<span class="text-slate-600">8+ hours</span>
				</div>
				<div class="flex items-center gap-1">
					<div class="w-3 h-3 bg-blue-500 rounded"></div>
					<span class="text-slate-600">7-8 hours</span>
				</div>
				<div class="flex items-center gap-1">
					<div class="w-3 h-3 bg-yellow-500 rounded"></div>
					<span class="text-slate-600">6-7 hours</span>
				</div>
				<div class="flex items-center gap-1">
					<div class="w-3 h-3 bg-red-500 rounded"></div>
					<span class="text-slate-600">&lt;6 hours</span>
				</div>
			</div>
		</div>

		<!-- CRM Activity Section -->
		<div class="pb-2">
			<h3 class="font-semibold text-slate-800 mb-4 flex items-center gap-2">
				<span>👥</span>
				<span>CRM Activity</span>
			</h3>

			<div class="grid grid-cols-2 gap-4">
				<div class="p-4 bg-blue-50 rounded-lg">
					<div class="text-3xl font-bold text-blue-900">{crmStats.totalContacts}</div>
					<div class="text-sm text-blue-700">Total Contacts</div>
				</div>
				<div class="p-4 bg-green-50 rounded-lg">
					<div class="text-3xl font-bold text-green-900">{crmStats.totalInteractions}</div>
					<div class="text-sm text-green-700">Total Interactions</div>
				</div>
				<div class="p-4 bg-purple-50 rounded-lg">
					<div class="text-3xl font-bold text-purple-900">{crmStats.thisWeekInteractions}</div>
					<div class="text-sm text-purple-700">This Week</div>
				</div>
				<div class="p-4 bg-yellow-50 rounded-lg">
					<div class="text-3xl font-bold text-yellow-900">{crmStats.needsFollowUp}</div>
					<div class="text-sm text-yellow-700">Needs Follow-up</div>
				</div>
			</div>
		</div>
	</div>
</div>
