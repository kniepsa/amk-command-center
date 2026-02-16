<script lang="ts">
	import ChatInterface from './ChatInterface.svelte';
	import QuoteHeader from './QuoteHeader.svelte';
	import QuickEntrySection from './QuickEntrySection.svelte';
	import WeeklyPrioritiesSidebar from './WeeklyPrioritiesSidebar.svelte';
	import ExtractionPreview from './ExtractionPreview.svelte';
	import Button from './shared/Button.svelte';
	import UrgentItemsSection from './UrgentItemsSection.svelte';
	import VoiceRecorder from './VoiceRecorder.svelte';
	import MorningRitual from './MorningRitual.svelte';
	import HabitStreaks from './HabitStreaks.svelte';
	import CalendarSection from './CalendarSection.svelte';
import DailyCoachChallenges from './DailyCoachChallenges.svelte';
	import ClarifyModal from './ClarifyModal.svelte';
	import { api, type EntryFrontmatter } from '$lib/api/client';
	import type { WeeklyPriority } from '$lib/types';
	import type { CoachChallenge } from '$lib/types/coach';
	import { getCoachConfig } from '$lib/api/journal-client';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { BRAND } from '$lib/brand';
	import { getRewardMessage, getNextMilestone } from '$lib/utils/variable-rewards';

	// State for chat messages
	let messages = $state<
		Array<{ role: 'user' | 'assistant'; content: string; coaches?: CoachChallenge[] }>
	>([]);
	let extractedData = $state<EntryFrontmatter>({});
	let weeklyPriorities = $state<WeeklyPriority[]>([]);
	let isExtracting = $state(false);
	let isLoadingPriorities = $state(true);
	let extractionError = $state<string | null>(null);
	let showQuickEntry = $state(false); // Toggle for mobile form visibility
	let autoSaveTimeout: ReturnType<typeof setTimeout> | null = null;
	let lastSaved = $state<Date | null>(null);
	let isSaving = $state(false);
	let extractionConfidence = $state<number>(1.0);
	let prioritiesMounted = $state(false);
	let showVoiceModal = $state(false);
	let morningRitualComplete = $state(false);
	let currentDate = $state(new Date());
	let showClarifyModal = $state(false);
	let pendingExtractedData = $state<EntryFrontmatter | null>(null);
	let currentJournalingStreak = $state(1); // Default to 1, will be fetched from API

	// Collapsible section state
	let dailyAIExpanded = $state(true);
	let learningExpanded = $state(true);

	// Check if Daily AI section is complete
	let dailyAIComplete = $derived(
		extractedData.energy &&
		extractedData.intentions?.length > 0 &&
		extractedData.gratitude?.length >= 1
	);

	// Load collapsed state from localStorage
	$effect(() => {
		if (!browser) return;

		const savedDailyAI = localStorage.getItem('dailyAIExpanded');
		const savedLearning = localStorage.getItem('learningExpanded');

		if (savedDailyAI !== null) {
			dailyAIExpanded = JSON.parse(savedDailyAI);
		}
		if (savedLearning !== null) {
			learningExpanded = JSON.parse(savedLearning);
		}
	});

	// Auto-collapse when sections complete
	$effect(() => {
		if (dailyAIComplete && dailyAIExpanded) {
			// Auto-collapse when complete
			dailyAIExpanded = false;
			if (browser) {
				localStorage.setItem('dailyAIExpanded', 'false');
			}
		}
	});

	// Persist expansion state to localStorage
	$effect(() => {
		if (browser) {
			localStorage.setItem('dailyAIExpanded', JSON.stringify(dailyAIExpanded));
		}
	});

	$effect(() => {
		if (browser) {
			localStorage.setItem('learningExpanded', JSON.stringify(learningExpanded));
		}
	});

	// Day navigation functions
	function goToPreviousDay() {
		const newDate = new Date(currentDate);
		newDate.setDate(newDate.getDate() - 1);
		currentDate = newDate;
		loadEntryForDate(currentDate);
	}

	function goToNextDay() {
		const newDate = new Date(currentDate);
		newDate.setDate(newDate.getDate() + 1);
		currentDate = newDate;
		loadEntryForDate(currentDate);
	}

	// Load weekly priorities and journal entry on mount
	$effect(() => {
		if (!browser || prioritiesMounted) return;

		prioritiesMounted = true;
		loadWeeklyPriorities();
		loadTodayEntry();
		loadHabitStreaks();
	});

	// Load today's journal entry
	async function loadTodayEntry() {
		await loadEntryForDate(currentDate);
	}

	// Load habit streaks from API
	async function loadHabitStreaks() {
		try {
			const result = await api.habits.getStreaks();

			// Find journaling habit
			const journalingHabit = result.habits.find(
				h => h.name.toLowerCase() === 'journaling' || h.name.toLowerCase() === 'morning ritual'
			);

			if (journalingHabit) {
				currentJournalingStreak = journalingHabit.currentStreak;
			}
		} catch (error) {
			console.error('Error loading habit streaks:', error);
			// Keep default value of 1 on error
		}
	}

	// Load journal entry for specific date
	async function loadEntryForDate(date: Date) {
		try {
			const dateStr = date.toISOString().split('T')[0];

			// Use SDK to get entry
			const data = await api.entries.get(dateStr);

			// Load extracted data from frontmatter
			extractedData = data.frontmatter || {};

			// Parse body to reconstruct chat messages
			if (data.content) {
				const parsedMessages = parseJournalBody(data.content);
				messages = parsedMessages;
			} else {
				messages = [];
			}
		} catch (error) {
			console.error('Error loading entry:', error);
			// Clear on error
			extractedData = {};
			messages = [];
		}
	}

	// Parse journal markdown body back into chat messages
	function parseJournalBody(body: string): typeof messages {
		const msgs: typeof messages = [];
		const sections = body.split(/(?=^## )/gm);

		for (const section of sections) {
			const trimmed = section.trim();
			if (!trimmed) continue;

			// User entry
			if (trimmed.startsWith('## 📝 Entry')) {
				const content = trimmed.replace('## 📝 Entry', '').trim();
				if (content) {
					msgs.push({ role: 'user', content });
				}
			}
			// Coach insights
			else if (trimmed.startsWith('## 🎯 Coach Insights')) {
				// Extract coach challenges
				const coaches: CoachChallenge[] = [];
				const coachSections = trimmed.split(/(?=^### )/gm).slice(1);

				for (const coachSection of coachSections) {
					const match = coachSection.match(/### (.) (.+?)\n\n(.+)/s);
					if (match) {
						coaches.push({
							coach_id: match[2].toLowerCase().replace(/\s+/g, '-'),
							coach_name: match[2],
							icon: match[1],
							message: match[3].trim(),
							confidence: 0.8
						});
					}
				}

				if (coaches.length > 0) {
					msgs.push({
						role: 'assistant',
						content: 'Coach insights available',
						coaches
					});
				}
			}
		}

		return msgs;
	}

	// Auto-save with 3s debounce after extraction
	// Track a serialized version to avoid triggering on reference changes
	let extractedDataJson = $derived(JSON.stringify(extractedData));

	$effect(() => {
		// Only trigger when actual data changes (not just reference)
		const _ = extractedDataJson; // Track the derived value

		if (Object.keys(extractedData).length > 0) {
			// Clear existing timeout
			if (autoSaveTimeout) {
				clearTimeout(autoSaveTimeout);
			}

			// Set new timeout for auto-save
			autoSaveTimeout = setTimeout(async () => {
				await autoSaveEntry();
			}, 3000);
		}

		// Cleanup function
		return () => {
			if (autoSaveTimeout) {
				clearTimeout(autoSaveTimeout);
			}
		};
	});

	// Load weekly priorities from backend API via SDK
	async function loadWeeklyPriorities() {
		isLoadingPriorities = true;
		try {
			const { getWeeklyPlan } = await import('$lib/api/journal-client');
			const plan = await getWeeklyPlan();

			if (plan && plan.priorities) {
				// Convert backend priorities to frontend format
				weeklyPriorities = plan.priorities.map((p, index) => ({
					id: `${plan.week}-p${index + 1}`,
					text: p.title,
					days_active: 0, // Backend doesn't track this yet
					total_days: 7,
					progress_percent: 0,
					status: p.status
				}));
			} else {
				weeklyPriorities = [];
			}
		} catch (error) {
			console.error('Error loading priorities:', error);
			weeklyPriorities = [];
		} finally {
			isLoadingPriorities = false;
		}
	}

	// Handle user message submission
	async function handleMessageSubmit(content: string) {
		// Call extraction API
		isExtracting = true;
		extractionError = null;

		try {
			const today = new Date().toISOString().split('T')[0];

			// Use SDK to extract
			const result = await api.entries.extract({
				transcription: content,
				date: today,
				existing: extractedData
			});

			// Store extraction confidence
			extractionConfidence = result.confidence || 1.0;

			// NEW: Check if clarification is needed (GTD Clarify step)
			if ((result.extracted as any)._needsClarification) {
				// Show clarify modal BEFORE committing to state
				pendingExtractedData = result.extracted;
				showClarifyModal = true;
				return; // Don't add to messages yet
			}

			// No clarification needed - proceed with save
			extractedData = result.extracted;

			// Check for coach challenges
			const coaches = await checkCoachTriggers(content);

			// Add assistant response
			const assistantMessage = generateAssistantMessage(result);

			// Only add to messages on SUCCESS
			messages = [
				...messages,
				{ role: 'user', content },
				{
					role: 'assistant',
					content: assistantMessage,
					coaches
				}
			];
		} catch (error) {
			console.error('Extraction error:', error);

			// Clear, helpful error guidance
			let errorMessage = 'Couldn\'t process that. ';
			let recoveryGuidance = '';

			if (error instanceof TypeError || (error as Error).message?.includes('network')) {
				errorMessage = 'Connection failed. ';
				recoveryGuidance = 'Check your internet and retry.';
			} else if ((error as Error).message?.includes('timeout')) {
				errorMessage = 'Request timed out. ';
				recoveryGuidance = 'Try shorter messages.';
			} else {
				recoveryGuidance = 'Click "Try Again" above or rephrase.';
			}

			extractionError = errorMessage + recoveryGuidance;
			// DON'T add to messages on error - keep transcription visible for retry
		} finally {
			isExtracting = false;
		}
	}

	// Handle manual form data changes
	function handleDataChange(data: ExtractEntryResponse['extracted']) {
		// Deep merge to avoid unnecessary reference changes
		const newData = { ...extractedData };

		// Only update fields that actually changed
		for (const key in data) {
			const newValue = data[key as keyof typeof data];
			const oldValue = extractedData[key as keyof typeof extractedData];

			// Compare serialized values to detect real changes
			if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
				(newData as any)[key] = newValue;
			}
		}

		// Only trigger state update if something actually changed
		if (JSON.stringify(newData) !== JSON.stringify(extractedData)) {
			extractedData = newData;
		}
	}

	// Handle voice transcription
	function handleVoiceTranscription(text: string) {
		// Submit transcribed text as user message
		handleMessageSubmit(text);
	}

	// Handle morning ritual completion
	function handleMorningRitual(data: { grateful: string; excited: string; priorities: string[] }) {
		morningRitualComplete = true;

		// Add to extracted data
		extractedData.gratitude = [{ thing: data.grateful, why: '' }];
		extractedData.intentions = data.priorities;

		// Add to chat
		const message = `Morning Ritual:\n\nGrateful: ${data.grateful}\nExcited: ${data.excited}\n\nPriorities:\n1. ${data.priorities[0]}\n2. ${data.priorities[1]}\n3. ${data.priorities[2]}`;

		// VARIABLE REWARD (Nir Eyal Hook Model)
		// Use real streak from API
		const reward = getRewardMessage(currentJournalingStreak);

		// Add milestone progress if approaching next celebration (within 3 days)
		const nextMilestone = getNextMilestone(currentJournalingStreak);
		let rewardText = reward.content;
		if (nextMilestone.days <= 3 && nextMilestone.days > 0) {
			rewardText += `\n\n🎯 ${nextMilestone.days} days until ${nextMilestone.milestone}-day milestone!`;
		}

		messages = [
			...messages,
			{ role: 'user', content: message },
			{ role: 'assistant', content: rewardText }
		];

		// Reload streaks after completing morning ritual (for immediate feedback)
		loadHabitStreaks();
	}

	// Check for coach triggers
	async function checkCoachTriggers(text: string): Promise<CoachChallenge[]> {
		try {
			// Load coach config
			const config = await getCoachConfig('amk');
			const challenges: CoachChallenge[] = [];

			// Check each enabled coach for triggers
			for (const coach of config.active_coaches) {
				if (!coach.enabled || !coach.auto_activate) continue;

				// Check if any trigger words are in the text
				const textLower = text.toLowerCase();
				const triggered = coach.triggers.some((trigger: string) =>
					textLower.includes(trigger.toLowerCase())
				);

				if (triggered) {
					challenges.push({
						coach_id: coach.id,
						coach_name: coach.name,
						icon: getCoachIcon(coach.id),
						message: generateCoachMessage(coach.id, text),
						confidence: 0.8
					});

					// Only return max 2 coaches per response
					if (challenges.length >= config.settings.max_coaches_per_response) {
						break;
					}
				}
			}

			return challenges;
		} catch (error) {
			console.error('Error checking coach triggers:', error);
			return [];
		}
	}

	// Get coach icon
	function getCoachIcon(coachId: string): string {
		const icons: Record<string, string> = {
			'bill-campbell': '🏈',
			machiavelli: '👑',
			'peter-drucker': '📊',
			'stoic-advisor': '🏛️',
			'parenting-guru': '👨‍👩‍👧‍👦',
			'sales-coach': '💼',
			'ma-advisor': '💰'
		};
		return icons[coachId] || '🎯';
	}

	// Generate coach message based on context
	function generateCoachMessage(coachId: string, text: string): string {
		// Simplified message generation - Phase 2 will use Claude API
		const messages: Record<string, string> = {
			machiavelli:
				"I see you're discussing Leon. Remember: The lion and the fox. You need both strength and cunning in this negotiation.",
			'sales-coach':
				'Good discovery happening here. What pain points have you uncovered? Remember SPIN: Situation → Problem → Implication → Need-Payoff.',
			'ma-advisor':
				"Before discussing valuation, have you quantified the buyer's opportunity cost? Show them what NOT buying will cost them.",
			'bill-campbell':
				'Leadership insight: The best managers build trust by being vulnerable first. What would authenticity look like here?',
			'peter-drucker': 'Strategic question: What assumptions are you making? Challenge them systematically.',
			'stoic-advisor':
				'Remember: You can only control your actions, not outcomes. Where is your energy going?',
			'parenting-guru': 'Parenting with warmth + structure. What behavior are you reinforcing here?'
		};
		return messages[coachId] || 'I noticed something worth discussing in your entry.';
	}

	// Generate assistant message from extraction
	function generateAssistantMessage(result: ExtractEntryResponse): string {
		const parts: string[] = ['Got it! Extracted:'];

		if (result.extracted.sleep) {
			const s = result.extracted.sleep;
			parts.push(`- Sleep: ${s.bedtime || '?'}-${s.wake_time || '?'} (${s.duration || '?'}h)`);
		}

		if (result.extracted.energy) {
			parts.push(`- Energy: ${result.extracted.energy}`);
		}

		if (result.extracted.habits) {
			const habitCount = Object.keys(result.extracted.habits).length;
			parts.push(`- ${habitCount} habits tracked`);
		}

		if (result.extracted.intentions) {
			parts.push(`- ${result.extracted.intentions.length} intentions`);
		}

		if (result.suggestions && result.suggestions.length > 0) {
			parts.push('');
			parts.push('Suggestions:');
			result.suggestions.forEach((s) => parts.push(`- ${s}`));
		}

		return parts.join('\n');
	}

	// Auto-save entry (debounced)
	async function autoSaveEntry() {
		if (isSaving) return;
		isSaving = true;

		try {
			await saveEntryToJournal();
			lastSaved = new Date();
		} catch (error) {
			console.error('Auto-save failed:', error);
			// Silent failure for auto-save
		} finally {
			isSaving = false;
		}
	}

	// Handle manual save to journal
	async function handleSaveEntry() {
		isSaving = true;
		try {
			await saveEntryToJournal();
			alert('Saved');
			lastSaved = new Date();
		} catch (error) {
			console.error('Save failed:', error);
			alert(`Save failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
		} finally {
			isSaving = false;
		}
	}

	// Handle clarify modal save
	function handleClarifyModalSave(clarifiedData: ExtractedData) {
		// Update extracted data with clarified values
		extractedData = clarifiedData;

		// Close modal
		showClarifyModal = false;
		pendingExtractedData = null;

		// Add to messages
		const assistantMessage = `Got it! All fields clarified and saved.`;
		messages = [
			...messages,
			{
				role: 'assistant',
				content: assistantMessage
			}
		];
	}

	// Handle clarify modal cancel
	function handleClarifyModalCancel() {
		showClarifyModal = false;
		pendingExtractedData = null;
		// Don't save anything - user canceled
	}

	// Core save logic
	async function saveEntryToJournal() {
		try {
			const today = new Date().toISOString().split('T')[0];

			// Build body from chat messages
			const body = messages
				.map((msg) => {
					if (msg.role === 'user') {
						return `## 📝 Entry\n\n${msg.content}\n`;
					} else if (msg.coaches && msg.coaches.length > 0) {
						const coachSection = msg.coaches
							.map((c) => `### ${c.icon} ${c.coach_name}\n\n${c.message}`)
							.join('\n\n');
						return `## 🎯 Coach Insights\n\n${coachSection}\n`;
					}
					return '';
				})
				.filter((s) => s.trim() !== '')
				.join('\n');

			// Use SDK to save entry
			const result = await api.entries.save(today, {
				frontmatter: extractedData,
				body,
				append: false
			});

			console.log('Entry saved successfully:', result);
			return result;
		} catch (error) {
			console.error('Error saving entry:', error);
			throw error;
		}
	}
</script>

<!-- Quote Header (Full Width) -->
<QuoteHeader date={currentDate} onPrevious={goToPreviousDay} onNext={goToNextDay} />

<!-- Single Column Layout: Progressive Disclosure -->
<div class="max-w-3xl mx-auto space-y-4 md:space-y-6">
	<!-- Daily AI Section (Collapsible) -->
	{#if !dailyAIComplete || dailyAIExpanded}
		<section class="daily-ai-section">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-lg font-semibold text-cloud-800">Daily AI</h2>
				{#if dailyAIComplete}
					<button
						onclick={() => {
							dailyAIExpanded = false;
						}}
						class="text-sm text-electric-600 hover:text-electric-700 font-medium flex items-center gap-1"
					>
						<span>✓</span>
						<span>Collapse</span>
					</button>
				{/if}
			</div>

			<!-- Morning Ritual (only if not complete) -->
			{#if !morningRitualComplete && messages.length === 0}
				<MorningRitual onComplete={handleMorningRitual} />
			{/if}

			<!-- Today's Calendar -->
			<CalendarSection />

			<!-- Habit Streaks -->
			<HabitStreaks />
		</section>
	{:else}
		<div class="collapsed-section">
			<button
				onclick={() => {
					dailyAIExpanded = true;
				}}
				class="w-full text-left flex items-center justify-between p-4 hover:bg-cloud-50 transition-colors rounded-lg"
			>
				<div class="flex items-center gap-3">
					<span class="text-2xl">✓</span>
					<div>
						<h3 class="font-semibold text-cloud-800">Daily AI Complete</h3>
						<p class="text-sm text-cloud-500">Energy logged, intentions set, gratitude captured</p>
					</div>
				</div>
				<span class="text-cloud-400">Expand →</span>
			</button>
		</div>
	{/if}

	<!-- Error Toast -->
	{#if extractionError}
		<div class="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start justify-between gap-3">
			<p class="text-sm text-cloud-600">{extractionError}</p>
			<button
				onclick={() => (extractionError = null)}
				class="text-cloud-400 hover:text-cloud-600 text-lg leading-none"
				aria-label="Dismiss"
			>
				×
			</button>
		</div>
	{/if}

	<!-- Chat Interface -->
	<ChatInterface
		{messages}
		onSubmit={handleMessageSubmit}
		isLoading={isExtracting}
		onVoiceClick={() => showVoiceModal = true}
	/>

	<!-- Extracted Data (Editable - shows after extraction) -->
	{#if Object.keys(extractedData).length > 0}
		<ExtractionPreview extraction={extractedData} onSave={handleSaveEntry} onDataChange={handleDataChange} />
	{/if}

	<!-- Urgent Items (Top 3, Collapsible) -->
	<UrgentItemsSection />

	<!-- Coach Challenges -->
	<div class="mt-8">
		<h3 class="text-sm font-semibold text-cloud-400 uppercase mb-4">Today's Challenges</h3>
		<DailyCoachChallenges />
	</div>
</div>

<!-- Voice Modal -->
{#if showVoiceModal}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onclick={() => showVoiceModal = false}>
		<div class="bg-white rounded-2xl p-6 max-w-lg w-full mx-4" onclick={(e) => e.stopPropagation()}>
			<VoiceRecorder onTranscription={(text) => {
				handleVoiceTranscription(text);
				showVoiceModal = false;
			}} />
		</div>
	</div>
{/if}

<!-- Clarify Modal (GTD Clarify Step) -->
{#if showClarifyModal && pendingExtractedData}
	<ClarifyModal
		bind:extracted={pendingExtractedData}
		onSave={handleClarifyModalSave}
		onCancel={handleClarifyModalCancel}
	/>
{/if}

<style>
	.collapsed-section {
		background: #f0f9ff;
		border: 1px dashed #3b82f6;
		border-radius: 0.5rem;
		overflow: hidden;
		transition: all 0.2s ease;
	}

	.collapsed-section:hover {
		background: #e0f2fe;
		border-color: #2563eb;
	}

	.collapsed-section button {
		color: inherit;
	}

	.daily-ai-section {
		transition: all 0.3s ease;
	}
</style>
