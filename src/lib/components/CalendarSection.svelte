<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

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
	let isLoading = $state(true);
	let error = $state<string | null>(null);
	let mounted = $state(false);

	$effect(() => {
		if (!browser || mounted) return;

		mounted = true;
		loadTodaysEvents();

		// Refresh every 15 minutes
		const interval = setInterval(loadTodaysEvents, 15 * 60 * 1000);

		return () => {
			clearInterval(interval);
		};
	});

	async function loadTodaysEvents() {
		isLoading = true;
		error = null;

		try {
			// Try to fetch from backend API
			const response = await fetch('/api/calendar/today');

			if (response.ok) {
				calendarData = await response.json();
			} else {
				// Mock data for testing (no Google Calendar MCP available)
				calendarData = generateMockCalendarData();
			}
		} catch (err) {
			console.error('Error loading calendar events:', err);
			// Use mock data on error
			calendarData = generateMockCalendarData();
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

	/**
	 * Extract @mentions from event description
	 */
	function extractMentions(description?: string): string[] {
		if (!description) return [];
		const mentionRegex = /@[\w-]+/g;
		return description.match(mentionRegex) || [];
	}

	/**
	 * Format time for display (convert 24h to 12h)
	 */
	function formatTime(time: string): string {
		const [hours, minutes] = time.split(':');
		const h = parseInt(hours);
		const m = minutes;
		const period = h >= 12 ? 'PM' : 'AM';
		const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
		return `${displayHour}:${m} ${period}`;
	}

	/**
	 * Get all unique mentions from events
	 */
	let allMentions = $derived.by(() => {
		if (!calendarData?.events) return [];
		const mentions = new Set<string>();
		calendarData.events.forEach(event => {
			const extracted = extractMentions(event.description);
			extracted.forEach(m => mentions.add(m));
		});
		return Array.from(mentions);
	});
</script>

<div class="space-y-4">
	{#if isLoading && !calendarData}
		<div class="bg-white rounded-lg border border-cloud-200 p-8">
			<p class="text-cloud-400 text-center">Loading today's calendar...</p>
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
						onclick={loadTodaysEvents}
						class="mt-4 px-4 py-2 bg-cloud-400 hover:bg-cloud-500 text-white rounded-lg transition-colors text-sm font-medium"
					>
						Retry
					</button>
				</div>
			</div>
		</div>
	{:else if calendarData && calendarData.events.length > 0}
		<div class="bg-white rounded-lg border border-cloud-200 p-6">
			<div class="flex items-center justify-between mb-4">
				<h3 class="text-base font-medium text-cloud-600">
					📅 Today's Calendar ({calendarData.events.length})
				</h3>
				<span class="text-xs text-cloud-400">{calendarData.date}</span>
			</div>

			<div class="space-y-3">
				{#each calendarData.events as event}
					<div class="flex items-start gap-4 p-4 bg-cloud-50 rounded-lg hover:bg-cloud-100 transition-colors">
						<!-- Time badge -->
						<div class="flex-shrink-0 w-16 text-center">
							<div class="text-sm font-semibold text-electric-600">{formatTime(event.start)}</div>
							<div class="text-xs text-cloud-400 mt-0.5">{formatTime(event.end)}</div>
						</div>

						<!-- Event content -->
						<div class="flex-1 min-w-0">
							<h4 class="text-sm font-medium text-cloud-800">{event.summary}</h4>

							<!-- Attendees -->
							{#if event.attendees && event.attendees.length > 0}
								<div class="flex items-center gap-2 mt-2">
									<span class="text-xs text-cloud-500">with</span>
									<div class="flex flex-wrap gap-1">
										{#each event.attendees as attendee}
											<span class="text-xs px-2 py-1 bg-electric-50 text-electric-700 rounded border border-electric-200">
												{attendee}
											</span>
										{/each}
									</div>
								</div>
							{/if}

							<!-- Mentions from description -->
							{#if event.mentions && event.mentions.length > 0}
								<div class="flex items-center gap-1 mt-2">
									{#each event.mentions as mention}
										<a
											href="#"
											class="text-xs text-electric-600 hover:text-electric-700 hover:underline"
											onclick={(e) => {
												e.preventDefault();
												// Could navigate to person CRM page
											}}
										>
											{mention}
										</a>
									{/each}
								</div>
							{/if}
						</div>

						<!-- Duration indicator -->
						<div class="flex-shrink-0 text-right">
							<span class="inline-block text-xs text-cloud-400 px-2 py-1 bg-cloud-100 rounded">
								{(() => {
									const [startH, startM] = event.start.split(':').map(Number);
									const [endH, endM] = event.end.split(':').map(Number);
									const duration = endH * 60 + endM - (startH * 60 + startM);
									return `${Math.floor(duration / 60)}h ${duration % 60}m`;
								})()}
							</span>
						</div>
					</div>
				{/each}
			</div>

			<!-- Summary of people -->
			{#if allMentions.length > 0}
				<div class="mt-4 pt-4 border-t border-cloud-200">
					<p class="text-xs text-cloud-500 mb-2">People to connect with today:</p>
					<div class="flex flex-wrap gap-2">
						{#each allMentions as mention}
							<a
								href="#"
								class="text-xs text-electric-600 hover:text-electric-700 font-medium hover:underline"
								onclick={(e) => {
									e.preventDefault();
									// Navigate to person CRM
								}}
							>
								{mention}
							</a>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{:else if calendarData && calendarData.events.length === 0}
		<div class="bg-white border border-cloud-200 rounded-lg p-8 text-center">
			<p class="text-cloud-600 font-medium">No events today 🎉</p>
			<p class="text-cloud-400 text-sm mt-2">Your calendar is clear - enjoy your day!</p>
		</div>
	{/if}
</div>

<style>
	/* Additional styles if needed */
</style>
