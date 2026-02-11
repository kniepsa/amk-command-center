<script lang="ts">
	// Today's Lesson Widget
	// Small component for sidebar showing today's learning progress

	interface Props {
		onStartLesson?: () => void;
	}

	let { onStartLesson = () => {} }: Props = $props();

	// Mock data - will be replaced with API calls
	const lesson = {
		day: 8,
		title: 'Discovery Framework',
		estimated_time: 15,
		status: 'not_started' as 'not_started' | 'in_progress' | 'completed'
	};

	function getStatusColor(): string {
		if (lesson.status === 'completed') return 'bg-green-50 border-green-200';
		if (lesson.status === 'in_progress') return 'bg-blue-50 border-blue-200';
		return 'bg-amber-50 border-amber-200';
	}

	function getStatusText(): string {
		if (lesson.status === 'completed') return '✅ Completed';
		if (lesson.status === 'in_progress') return '🔄 In Progress';
		return '⏸️ Not Started';
	}
</script>

<div class="rounded-lg border p-4 transition-all hover:shadow-md {getStatusColor()}">
	<!-- Header -->
	<div class="flex items-center gap-2 mb-3">
		<span class="text-2xl">📚</span>
		<div class="flex-1">
			<div class="text-xs font-medium text-slate-600 uppercase">Today's Lesson</div>
		</div>
	</div>

	<!-- Lesson Info -->
	<div class="mb-3">
		<div class="font-semibold text-slate-900 mb-1">
			Day {lesson.day}: {lesson.title}
		</div>
		<div class="flex items-center gap-2 text-sm text-slate-600">
			<span>⏱️ {lesson.estimated_time} min</span>
			<span>•</span>
			<span>{getStatusText()}</span>
		</div>
	</div>

	<!-- CTA Button -->
	<button
		onclick={onStartLesson}
		class="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
	>
		{lesson.status === 'completed' ? 'Review Lesson' : 'Start Lesson'}
	</button>

	<!-- Progress Indicator -->
	{#if lesson.status === 'in_progress'}
		<div class="mt-3 pt-3 border-t border-blue-200">
			<div class="flex items-center justify-between text-xs text-slate-600 mb-1">
				<span>Progress</span>
				<span>40%</span>
			</div>
			<div class="w-full bg-blue-200 rounded-full h-1.5 overflow-hidden">
				<div class="bg-blue-600 h-1.5 rounded-full" style="width: 40%"></div>
			</div>
		</div>
	{/if}
</div>
