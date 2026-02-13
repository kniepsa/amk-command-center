<script lang="ts">
	import ChatInterface from './ChatInterface.svelte';
	import QuoteHeader from './QuoteHeader.svelte';
	import QuickEntrySection from './QuickEntrySection.svelte';
	import WeeklyPrioritiesSidebar from './WeeklyPrioritiesSidebar.svelte';
	import ExtractionPreview from './ExtractionPreview.svelte';
	import Button from './shared/Button.svelte';
	import UrgentItemsSection from './UrgentItemsSection.svelte';
	import VoiceRecorder from './VoiceRecorder.svelte';
	import type { WeeklyPriority, ExtractEntryResponse } from '$lib/types';
	import type { CoachChallenge } from '$lib/types/coach';
	import { onMount } from 'svelte';
	import { BRAND } from '$lib/brand';

	// State for chat messages
	let messages = $state<
		Array<{ role: 'user' | 'assistant'; content: string; coaches?: CoachChallenge[] }>
	>([]);
	let extractedData = $state<ExtractEntryResponse['extracted']>({});
	let weeklyPriorities = $state<WeeklyPriority[]>([]);
	let isExtracting = $state(false);
	let isLoadingPriorities = $state(true);
	let extractionError = $state<string | null>(null);
	let showQuickEntry = $state(false); // Toggle for mobile form visibility
	let autoSaveTimeout: ReturnType<typeof setTimeout> | null = null;
	let lastSaved = $state<Date | null>(null);
	let isSaving = $state(false);
	let extractionConfidence = $state<number>(1.0);

	// Load weekly priorities on mount
	onMount(async () => {
		await loadWeeklyPriorities();
	});

	// Auto-save with 3s debounce after extraction
	$effect(() => {
		// Watch extractedData changes
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
	});

	// Load weekly priorities from API
	async function loadWeeklyPriorities() {
		isLoadingPriorities = true;
		try {
			const response = await fetch('/api/weekly/current');
			if (!response.ok) {
				throw new Error('Failed to load priorities');
			}
			const data = await response.json();
			weeklyPriorities = data.priorities || [];
		} catch (error) {
			console.error('Error loading priorities:', error);
			weeklyPriorities = [];
		} finally {
			isLoadingPriorities = false;
		}
	}

	// Handle user message submission
	async function handleMessageSubmit(content: string) {
		// Add user message
		messages = [...messages, { role: 'user', content }];

		// Call extraction API
		isExtracting = true;
		extractionError = null;

		try {
			const response = await fetch('/api/extract-entry', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					date: new Date().toISOString().split('T')[0],
					text: content,
					existing: extractedData
				})
			});

			if (!response.ok) {
				throw new Error('Extraction failed');
			}

			const result: ExtractEntryResponse = await response.json();

			// Update extracted data
			extractedData = result.extracted;
			extractionConfidence = result.confidence || 1.0;

			// Check for coach challenges
			const coaches = await checkCoachTriggers(content);

			// Add assistant response
			const assistantMessage = generateAssistantMessage(result);
			messages = [
				...messages,
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
				recoveryGuidance = 'Try rephrasing or use manual forms below.';
			}

			extractionError = errorMessage + recoveryGuidance;
			messages = [
				...messages,
				{
					role: 'assistant',
					content: errorMessage + recoveryGuidance
				}
			];
		} finally {
			isExtracting = false;
		}
	}

	// Handle manual form data changes
	function handleDataChange(data: ExtractEntryResponse['extracted']) {
		extractedData = { ...extractedData, ...data };
	}

	// Handle voice transcription
	function handleVoiceTranscription(text: string) {
		// Submit transcribed text as user message
		handleMessageSubmit(text);
	}

	// Check for coach triggers
	async function checkCoachTriggers(text: string): Promise<CoachChallenge[]> {
		try {
			// Load coach config
			const configResponse = await fetch('/api/coaches/config');
			if (!configResponse.ok) {
				return [];
			}

			const config = await configResponse.json();
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

	// Core save logic
	async function saveEntryToJournal() {
		try {
			const today = new Date().toISOString().split('T')[0];

			// Build frontmatter from extracted data
			const frontmatter: Record<string, any> = {
				date: today,
				schema_version: 2
			};

			// Add extracted fields to frontmatter
			if (extractedData.energy) {
				frontmatter.energy = extractedData.energy;
			}

			if (extractedData.sleep) {
				frontmatter.sleep = extractedData.sleep;
			}

			if (extractedData.habits) {
				frontmatter.habits = extractedData.habits;
			}

			if (extractedData.intentions && extractedData.intentions.length > 0) {
				frontmatter.intentions = extractedData.intentions;
			}

			if (extractedData.gratitude && extractedData.gratitude.length > 0) {
				frontmatter.gratitude = extractedData.gratitude;
			}

			if (extractedData.food && extractedData.food.length > 0) {
				frontmatter.food = extractedData.food;
			}

			if (extractedData.tags && extractedData.tags.length > 0) {
				frontmatter.tags = extractedData.tags;
			}

			if (extractedData.people && extractedData.people.length > 0) {
				frontmatter.people = extractedData.people;
			}

			if (extractedData.frameworks && extractedData.frameworks.length > 0) {
				frontmatter.frameworks = extractedData.frameworks;
			}

			if (extractedData.contexts && extractedData.contexts.length > 0) {
				frontmatter.contexts = extractedData.contexts;
			}

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

			// Call API
			const response = await fetch(`/api/entries/${today}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ frontmatter, body })
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to save entry');
			}

			const result = await response.json();
			console.log('Entry saved successfully:', result);
			return result;
		} catch (error) {
			console.error('Error saving entry:', error);
			throw error;
		}
	}
</script>

<!-- Quote Header (Full Width) -->
<QuoteHeader />

<!-- Urgent Items Section -->
<div class="mb-6">
	<UrgentItemsSection />
</div>

<!-- Voice Recorder -->
<div class="mb-6">
	<VoiceRecorder onTranscription={handleVoiceTranscription} />
</div>

<!-- Desktop Layout: Chat-First (>1024px) -->
<div class="hidden lg:flex gap-6 h-[calc(100vh-320px)]">
	<!-- Left Sidebar: Weekly Priorities (20% width) -->
	<div class="w-1/5 flex-shrink-0 space-y-4">
		<WeeklyPrioritiesSidebar priorities={weeklyPriorities} isLoading={isLoadingPriorities} />

		<!-- Quick Entry Sections (Desktop: Collapsed by default) -->
		<QuickEntrySection section="morning" bind:extractedData onDataChange={handleDataChange} />
		<QuickEntrySection section="evening" bind:extractedData onDataChange={handleDataChange} />
	</div>

	<!-- Center: Chat Interface (60% width) -->
	<div class="flex-1 flex flex-col">
		<!-- Confidence Warning -->
		{#if extractionConfidence < 0.5}
			<div class="mb-4 bg-yellow-50 border-l-4 border-yellow-400 rounded p-3">
				<p class="text-sm text-yellow-800">
					<span class="font-medium">{Math.round(extractionConfidence * 100)}% confidence.</span> Review
					extracted data carefully.
				</p>
			</div>
		{/if}

		<!-- Error Toast -->
		{#if extractionError}
			<div class="mb-4 bg-red-50 border-l-4 border-red-400 rounded p-3 flex items-start justify-between gap-3">
				<p class="text-sm text-red-800">{extractionError}</p>
				<button
					onclick={() => (extractionError = null)}
					class="text-red-400 hover:text-red-600 text-lg leading-none"
					aria-label="Dismiss"
				>
					×
				</button>
			</div>
		{/if}

		<ChatInterface {messages} onSubmit={handleMessageSubmit} isLoading={isExtracting} />
	</div>

	<!-- Right Sidebar: Extraction Preview (20% width) -->
	<div class="w-1/5 flex-shrink-0">
		<ExtractionPreview extraction={extractedData} onSave={handleSaveEntry} />
	</div>
</div>

<!-- Mobile/Tablet Layout: Form-First (<1024px) -->
<div class="lg:hidden space-y-4">
	<!-- Toggle Button -->
	<div class="flex gap-2">
		<Button
			variant={showQuickEntry ? 'primary' : 'secondary'}
			fullWidth
			onclick={() => (showQuickEntry = !showQuickEntry)}
		>
			{showQuickEntry ? '💬 Show Chat' : '📝 Quick Entry Forms'}
		</Button>
	</div>

	{#if showQuickEntry}
		<!-- Forms View (Mobile Primary) -->
		<div class="space-y-4">
			<QuickEntrySection section="morning" bind:extractedData onDataChange={handleDataChange} />
			<QuickEntrySection section="evening" bind:extractedData onDataChange={handleDataChange} />
			<ExtractionPreview extraction={extractedData} onSave={handleSaveEntry} />
		</div>
	{:else}
		<!-- Chat View (Mobile Secondary) -->
		<div class="h-[calc(100vh-280px)]">
			{#if extractionError}
				<div class="mb-4 bg-red-50 border-l-4 border-red-400 rounded p-3 flex items-start justify-between gap-3">
					<p class="text-sm text-red-800">{extractionError}</p>
					<button
						onclick={() => (extractionError = null)}
						class="text-red-400 hover:text-red-600 text-lg leading-none"
						aria-label="Dismiss"
					>
						×
					</button>
				</div>
			{/if}

			<ChatInterface {messages} onSubmit={handleMessageSubmit} isLoading={isExtracting} />
		</div>

		<!-- Extraction Preview (Mobile Sticky Footer) -->
		<div class="mt-4">
			<ExtractionPreview extraction={extractedData} onSave={handleSaveEntry} />
		</div>
	{/if}

	<!-- Weekly Priorities (Mobile: Bottom) -->
	<WeeklyPrioritiesSidebar priorities={weeklyPriorities} isLoading={isLoadingPriorities} />
</div>
