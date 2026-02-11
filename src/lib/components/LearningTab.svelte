<script lang="ts">
	// Learning Curriculum Dashboard
	// Displays current curriculum progress, today's lesson, and upcoming lessons

	// Mock data - will be replaced with API calls in Phase 2
	const curriculum = {
		name: 'Sales',
		current_day: 8,
		total_days: 30,
		progress_percent: 26.7,
		completed_days: [1, 2, 3, 4, 5, 6, 7],
		this_week: [
			{ day: 7, title: 'Value Proposition', status: 'completed', date: '2026-02-10' },
			{
				day: 8,
				title: 'Discovery Call Framework',
				status: 'in_progress',
				date: '2026-02-11'
			},
			{ day: 9, title: 'Budget & Authority (BANT)', status: 'locked', date: '2026-02-12' },
			{ day: 10, title: 'Handling Objections', status: 'locked', date: '2026-02-13' },
			{ day: 11, title: 'Closing Techniques', status: 'locked', date: '2026-02-14' }
		],
		achievements: ['7-Day Streak 🔥', 'Week 1 Complete ✅', 'Perfect Score Day 5 💯']
	};

	const todayLesson = {
		day: 8,
		title: 'Discovery Call Framework (SPIN Selling)',
		description:
			'Master the art of discovery through strategic questioning. Learn to guide conversations using Situation, Problem, Implication, and Need-Payoff questions.',
		topics: [
			'Situation questions (context gathering)',
			'Problem questions (pain identification)',
			'Implication questions (pain amplification)',
			'Need-payoff questions (solution visualization)'
		],
		estimated_time: 15
	};

	function startLesson() {
		alert('Lesson mode will be implemented in Phase 2 with Socratic dialogue via Claude API');
	}

	function getStatusIcon(status: string): string {
		if (status === 'completed') return '✅';
		if (status === 'in_progress') return '📍';
		return '🔒';
	}

	function getStatusColor(status: string): string {
		if (status === 'completed') return 'text-green-600 bg-green-50';
		if (status === 'in_progress') return 'text-blue-600 bg-blue-50';
		return 'text-slate-400 bg-slate-50';
	}
</script>

<div class="space-y-6">
	<!-- Header with Settings -->
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-2xl font-bold text-slate-900">📚 Learning Dashboard</h2>
			<p class="text-slate-600 mt-1">Track your micro-learning progress</p>
		</div>
		<button
			class="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
		>
			⚙️ Settings
		</button>
	</div>

	<!-- Curriculum Progress -->
	<div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
		<div class="flex items-center justify-between mb-4">
			<div>
				<h3 class="text-lg font-semibold text-slate-900">
					Active Curriculum: {curriculum.name} (30 Days)
				</h3>
				<p class="text-sm text-slate-600 mt-1">
					Day {curriculum.current_day}/{curriculum.total_days}
				</p>
			</div>
			<div class="text-right">
				<div class="text-3xl font-bold text-blue-600">{curriculum.progress_percent}%</div>
				<div class="text-xs text-slate-500 mt-1">Complete</div>
			</div>
		</div>

		<!-- Progress Bar -->
		<div class="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
			<div
				class="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
				style="width: {curriculum.progress_percent}%"
			></div>
		</div>
	</div>

	<!-- Today's Lesson -->
	<div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
		<div class="flex items-start justify-between mb-4">
			<div>
				<div class="text-sm font-medium text-blue-600 mb-2">🎯 TODAY'S LESSON: DAY {todayLesson.day}</div>
				<h3 class="text-xl font-bold text-slate-900 mb-2">{todayLesson.title}</h3>
				<p class="text-slate-700 mb-4">{todayLesson.description}</p>
			</div>
		</div>

		<!-- Topics -->
		<div class="mb-6">
			<div class="text-sm font-medium text-slate-700 mb-2">What you'll learn:</div>
			<ul class="space-y-2">
				{#each todayLesson.topics as topic}
					<li class="flex items-start text-sm text-slate-600">
						<span class="mr-2">•</span>
						<span>{topic}</span>
					</li>
				{/each}
			</ul>
		</div>

		<!-- CTA -->
		<div class="flex items-center justify-between pt-4 border-t border-blue-200">
			<div class="text-sm text-slate-600">
				⏱️ Estimated time: <span class="font-medium">{todayLesson.estimated_time} minutes</span>
			</div>
			<button
				onclick={startLesson}
				class="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
			>
				▶️ Start Lesson
			</button>
		</div>
	</div>

	<!-- This Week's Plan -->
	<div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
		<h3 class="text-lg font-semibold text-slate-900 mb-4">📅 This Week's Plan</h3>

		<div class="space-y-3">
			{#each curriculum.this_week as lesson}
				<div
					class="flex items-center justify-between p-4 rounded-lg border transition-colors {getStatusColor(
						lesson.status
					)}"
				>
					<div class="flex items-center gap-4">
						<span class="text-2xl">{getStatusIcon(lesson.status)}</span>
						<div>
							<div class="font-medium text-slate-900">
								Day {lesson.day}: {lesson.title}
							</div>
							<div class="text-sm text-slate-600">
								{lesson.date}
								{#if lesson.status === 'in_progress'}
									<span class="font-medium">(Today)</span>
								{/if}
							</div>
						</div>
					</div>

					{#if lesson.status === 'completed'}
						<button class="px-3 py-1 text-sm text-green-600 hover:bg-green-100 rounded transition-colors">
							Review
						</button>
					{/if}
				</div>
			{/each}
		</div>
	</div>

	<!-- Actions Row -->
	<div class="flex gap-4">
		<button
			class="flex-1 px-6 py-4 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all text-slate-700 font-medium"
		>
			📚 View All 30 Days
		</button>
		<button
			class="flex-1 px-6 py-4 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all text-slate-700 font-medium"
		>
			🔄 Switch Curriculum
		</button>
		<button
			class="flex-1 px-6 py-4 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all text-slate-700 font-medium"
		>
			📖 Review Completed
		</button>
	</div>

	<!-- Achievements -->
	<div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
		<h3 class="text-lg font-semibold text-slate-900 mb-4">🏆 Achievements</h3>

		<div class="grid grid-cols-3 gap-4">
			{#each curriculum.achievements as achievement}
				<div class="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-200 text-center">
					<div class="text-2xl mb-2">{achievement.split(' ')[achievement.split(' ').length - 1]}</div>
					<div class="text-sm font-medium text-slate-700">
						{achievement.substring(0, achievement.lastIndexOf(' '))}
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Phase 2 Preview Notice -->
	<div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
		<strong>Phase 2 Coming Soon:</strong> Socratic dialogue lessons, quiz mode, spaced repetition, and real-world
		application prompts will be implemented with Claude API integration.
	</div>
</div>
