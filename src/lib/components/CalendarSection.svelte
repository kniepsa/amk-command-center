<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { api } from '$lib/api/client';
	import CalendarDayColumn from './CalendarDayColumn.svelte';
	import type { Task } from '@amk/command-center-sdk';

	interface CalendarEvent {
		id: string;
		summary: string;
		start: string;
		end: string;
		attendees?: string[];
		description?: string;
		mentions?: string[];
	}

	interface CalendarResponse {
		events: CalendarEvent[];
		date: string;
	}

	let calendarData = $state<CalendarResponse | null>(null);
	let weekTasks = $state<Task[]>([]);
	let isLoading = $state(true);
	let error = $state<string | null>(null);
	let mounted = $state(false);

	// Week state management
	let currentWeekStart = $state(getMonday(new Date()));

	// Derived week days array
	let weekDays = $derived.by(() => {
		const days = [];
		for (let i = 0; i < 7; i++) {
			const date = new Date(currentWeekStart);
			date.setDate(date.getDate() + i);
			days.push(date);
		}
		return days;
	});

	/**
	 * Get Monday of the week for a given date
	 */
	function getMonday(date: Date): Date {
		const d = new Date(date);
		const day = d.getDay();
		const diff = d.getDate() - day + (day === 0 ? -6 : 1);
		d.setDate(diff);
		d.setHours(0, 0, 0, 0);
		return d;
	}

	/**
	 * Navigate to next week
	 */
	function nextWeek() {
		const next = new Date(currentWeekStart);
		next.setDate(next.getDate() + 7);
		currentWeekStart = next;
	}

	/**
	 * Navigate to previous week
	 */
	function prevWeek() {
		const prev = new Date(currentWeekStart);
		prev.setDate(prev.getDate() - 7);
		currentWeekStart = prev;
	}

	/**
	 * Jump to today's week
	 */
	function goToToday() {
		currentWeekStart = getMonday(new Date());
	}

	/**
	 * Check if a date is today
	 */
	function isToday(date: Date): boolean {
		const today = new Date();
		return (
			date.getDate() === today.getDate() &&
			date.getMonth() === today.getMonth() &&
			date.getFullYear() === today.getFullYear()
		);
	}

	/**
	 * Format week range for header
	 */
	function formatWeekRange(days: Date[]): string {
		if (days.length === 0) return '';
		const start = days[0];
		const end = days[days.length - 1];
		const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
		const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
		return `${startStr} - ${endStr}`;
	}

	/**
	 * Get events for a specific day
	 */
	function getEventsForDay(day: Date): CalendarEvent[] {
		if (!calendarData) return [];
		// For mock data, show all events on today
		// TODO: Filter by actual event date when real calendar data available
		const today = new Date();
		if (
			day.getDate() === today.getDate() &&
			day.getMonth() === today.getMonth() &&
			day.getFullYear() === today.getFullYear()
		) {
			return calendarData.events;
		}
		return [];
	}

	/**
	 * Get tasks for a specific day
	 */
	function getTasksForDay(day: Date): Task[] {
		return weekTasks.filter((task) => {
			if (!task.reminderDate) return false;
			const reminderDate = new Date(task.reminderDate);
			return (
				reminderDate.getDate() === day.getDate() &&
				reminderDate.getMonth() === day.getMonth() &&
				reminderDate.getFullYear() === day.getFullYear()
			);
		});
	}

	/**
	 * Handle add task for a specific date
	 */
	function handleAddTask(date: Date) {
		// TODO: Open task modal with pre-filled reminder date
		console.log('Add task for date:', date.toISOString().split('T')[0]);
	}

	$effect(() => {
		if (!browser || mounted) return;

		mounted = true;
		loadWeekData();

		// Refresh every 15 minutes
		const interval = setInterval(loadWeekData, 15 * 60 * 1000);

		return () => {
			clearInterval(interval);
		};
	});

	// Reload when week changes
	$effect(() => {
		if (!browser || !mounted) return;
		// This effect runs when currentWeekStart changes
		void currentWeekStart; // Reference to trigger effect
		loadWeekData();
	});

	/**
	 * Load week data (events and tasks)
	 */
	async function loadWeekData() {
		isLoading = true;
		error = null;

		try {
			// Load events for the week
			// TODO: Implement calendar.getWeek() in backend
			// For now, using mock data
			calendarData = generateMockCalendarData();

			// Load tasks with due dates/reminders in this week
			try {
				const tasksResponse = await api.tasks.list({
					workspace: 'amk',
					status: 'open'
				});
				weekTasks = tasksResponse.tasks.filter((task) => {
					// Filter tasks with reminder dates in current week
					if (!task.reminderDate) return false;
					const reminderDate = new Date(task.reminderDate);
					const weekEnd = new Date(currentWeekStart);
					weekEnd.setDate(weekEnd.getDate() + 7);
					return reminderDate >= currentWeekStart && reminderDate < weekEnd;
				});
			} catch (err) {
				console.error('Error loading tasks:', err);
				weekTasks = [];
			}
		} catch (err) {
			console.error('Error loading week data:', err);
			error = err instanceof Error ? err.message : 'Failed to load week data';
			calendarData = generateMockCalendarData();
			weekTasks = [];
		} finally {
			isLoading = false;
		}
	}

	/**
	 * Generate mock calendar data for today
	 * MCP Status: Google Calendar MCP not available - using realistic mock data
	 */
	function generateMockCalendarData(): CalendarResponse {
		const today = new Date().toISOString().split('T')[0];

		return {
			date: today,
			events: [
				{
					id: 'evt1',
					summary: 'Morning Team Standup',
					start: '09:00',
					end: '09:30',
					attendees: ['Merishe', 'Steffen'],
					description: 'Daily sync with @merishe and CTO @steffen-seifert on Printulu status',
					mentions: ['@merishe', '@steffen-seifert']
				},
				{
					id: 'evt2',
					summary: 'Call with Leon - Peters Paper Partnership',
					start: '11:00',
					end: '11:45',
					attendees: ['Leon'],
					description: 'Discuss platform integration strategy with @leon and TechTulu partnership structure',
					mentions: ['@leon']
				},
				{
					id: 'evt3',
					summary: 'Customer Success: Canvas and More',
					start: '14:00',
					end: '14:30',
					attendees: ['Jonathan'],
					description: 'Platform walkthrough and licensing discussion with @jonathan-hackner',
					mentions: ['@jonathan-hackner']
				},
				{
					id: 'evt4',
					summary: 'Weekly Planning Review',
					start: '16:30',
					end: '17:00',
					attendees: ['Personal'],
					description: 'Review weekly priorities and adjust for next week',
					mentions: []
				}
			]
		};
	}

</script>

<div class="space-y-4">
	{#if isLoading && !calendarData}
		<div class="bg-white rounded-lg border border-cloud-200 p-8">
			<p class="text-cloud-400 text-center">Loading week calendar...</p>
		</div>
	{:else if error}
		<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
			<div class="flex items-start gap-4">
				<span class="text-xl">⚠️</span>
				<div>
					<p class="text-cloud-600 font-medium">Calendar unavailable</p>
					<p class="text-cloud-500 text-sm mt-2">{error}</p>
					<p class="text-cloud-500 text-xs mt-3">Note: Google Calendar MCP not configured. Using mock data.</p>
					<button
						onclick={loadWeekData}
						class="mt-4 px-4 py-2 bg-cloud-400 hover:bg-cloud-500 text-white rounded-lg transition-colors text-sm font-medium"
					>
						Retry
					</button>
				</div>
			</div>
		</div>
	{:else if calendarData}
		<div class="bg-white rounded-lg border border-cloud-200 p-6">
			<!-- Week Header with Navigation -->
			<div class="flex items-center justify-between mb-6">
				<h3 class="text-base font-medium text-cloud-600">
					📅 Week of {formatWeekRange(weekDays)}
				</h3>
				<div class="flex gap-2">
					<button
						onclick={prevWeek}
						class="px-3 py-1 border border-cloud-200 rounded hover:bg-cloud-50 transition-colors text-sm text-cloud-600"
						title="Previous week"
					>
						← Prev
					</button>
					<button
						onclick={goToToday}
						class="px-3 py-1 border border-electric-200 bg-electric-50 text-electric-600 rounded hover:bg-electric-100 transition-colors text-sm font-medium"
						title="Jump to current week"
					>
						Today
					</button>
					<button
						onclick={nextWeek}
						class="px-3 py-1 border border-cloud-200 rounded hover:bg-cloud-50 transition-colors text-sm text-cloud-600"
						title="Next week"
					>
						Next →
					</button>
				</div>
			</div>

			<!-- Week Grid (7 columns) -->
			<div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-3 week-grid">
				{#each weekDays as day}
					<CalendarDayColumn
						date={day}
						events={getEventsForDay(day)}
						tasks={getTasksForDay(day)}
						isToday={isToday(day)}
						onAddTask={handleAddTask}
					/>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	/* Mobile responsive: Show 3 columns at a time on small screens */
	@media (max-width: 768px) {
		.week-grid {
			grid-auto-flow: column;
			overflow-x: auto;
			scroll-snap-type: x mandatory;
			-webkit-overflow-scrolling: touch;
		}

		.week-grid > :global(*) {
			scroll-snap-align: start;
			min-width: calc(33.333% - 0.5rem);
		}
	}

	/* Hide scrollbar but keep functionality */
	.week-grid::-webkit-scrollbar {
		display: none;
	}
	.week-grid {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
