<script lang="ts">
	import type { Task } from '@amk/command-center-sdk';

	interface CalendarEvent {
		id: string;
		summary: string;
		start: string;
		end: string;
		attendees?: string[];
	}

	interface Props {
		date: Date;
		events: CalendarEvent[];
		tasks: Task[];
		isToday: boolean;
		onAddTask?: (date: Date) => void;
	}

	let { date, events = [], tasks = [], isToday, onAddTask }: Props = $props();

	/**
	 * Format day name (Mon, Tue, etc.)
	 */
	function formatDayName(d: Date): string {
		return d.toLocaleDateString('en-US', { weekday: 'short' });
	}

	/**
	 * Format time for display (convert 24h to 12h)
	 */
	function formatTime(time: string): string {
		const [hours, minutes] = time.split(':');
		const h = parseInt(hours);
		const m = minutes || '00';
		const period = h >= 12 ? 'PM' : 'AM';
		const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
		return `${displayHour}:${m} ${period}`;
	}
</script>

<div
	class="border rounded-lg p-3 min-h-[200px] {isToday
		? 'bg-electric-50 border-electric-300'
		: 'bg-white border-cloud-200'}"
>
	<!-- Date header -->
	<div class="text-center mb-3 pb-2 border-b border-cloud-100">
		<div class="text-xs text-cloud-500 uppercase">{formatDayName(date)}</div>
		<div
			class="text-lg font-semibold {isToday ? 'text-electric-600' : 'text-cloud-700'} mt-1"
		>
			{date.getDate()}
		</div>
	</div>

	<!-- Events -->
	{#if events.length > 0}
		<div class="space-y-1 mb-3">
			{#each events as event}
				<div
					class="p-2 bg-blue-50 rounded text-xs border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
					title={event.summary}
				>
					<div class="font-medium text-blue-900 truncate">{event.summary}</div>
					<div class="text-blue-600 text-xs mt-0.5">
						{formatTime(event.start)} - {formatTime(event.end)}
					</div>
					{#if event.attendees && event.attendees.length > 0}
						<div class="text-blue-500 text-xs mt-1 truncate">
							{event.attendees.join(', ')}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}

	<!-- Tasks -->
	{#if tasks.length > 0}
		<div class="space-y-1 mb-3">
			{#each tasks as task}
				<div
					class="p-2 bg-green-50 rounded text-xs border border-green-200 hover:bg-green-100 transition-colors cursor-pointer"
					title={task.content}
				>
					<div class="font-medium text-green-900 truncate">{task.content}</div>
					{#if task.area}
						<div class="text-green-600 text-xs mt-0.5">📁 {task.area}</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}

	<!-- Empty state -->
	{#if events.length === 0 && tasks.length === 0}
		<div class="text-center text-cloud-300 text-xs py-4">No events or tasks</div>
	{/if}

	<!-- Add button -->
	{#if onAddTask}
		<button
			onclick={() => onAddTask?.(date)}
			class="w-full text-xs text-cloud-400 hover:text-electric-600 py-2 hover:bg-cloud-50 rounded transition-colors"
		>
			+ Add Task
		</button>
	{/if}
</div>
