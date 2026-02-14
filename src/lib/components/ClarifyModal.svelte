<script lang="ts">
	import type { ExtractedData } from '$lib/types';
	import { BRAND } from '$lib/brand';

	interface UncertainField {
		field: string;
		value: any;
		question: string;
		confidence: number;
		type?: 'choice' | 'text';
		options?: string[];
	}

	interface Props {
		extracted: ExtractedData & { _uncertain?: UncertainField[]; _needsClarification?: boolean };
		onSave: (data: ExtractedData) => void;
		onCancel: () => void;
	}

	let { extracted = $bindable(), onSave, onCancel }: Props = $props();

	let editMode = $state<string | null>(null);
	let editValue = $state<any>(null);

	// Separate confirmed and uncertain fields
	const confirmedFields = $derived(
		Object.entries(extracted)
			.filter(([key, value]) => !key.startsWith('_') && value !== null && value !== undefined)
			.map(([key, value]) => ({
				key,
				label: formatFieldLabel(key),
				value: formatFieldValue(key, value),
				rawValue: value
			}))
	);

	const uncertainFields = $derived(extracted._uncertain || []);

	function formatFieldLabel(key: string): string {
		const labels: Record<string, string> = {
			energy: 'Energy',
			sleep: 'Sleep',
			habits: 'Habits',
			intentions: 'Intentions',
			gratitude: 'Gratitude',
			food: 'Food',
			people: 'People',
			tags: 'Tags',
			frameworks: 'Frameworks'
		};
		return labels[key] || key;
	}

	function formatFieldValue(key: string, value: any): string {
		if (key === 'sleep' && typeof value === 'object') {
			return `${value.bedtime || '?'} - ${value.wake_time || '?'} (${value.duration || '?'}h, ${value.quality || '?'})`;
		}
		if (key === 'habits' && typeof value === 'object') {
			const count = Object.values(value).filter((v) => v === true).length;
			return `${count} habits tracked`;
		}
		if (Array.isArray(value)) {
			return `${value.length} items`;
		}
		if (typeof value === 'object') {
			return JSON.stringify(value);
		}
		return String(value);
	}

	function resolveUncertainty(field: UncertainField, clarifiedValue: any) {
		// Update the extracted data with clarified value
		const keys = field.field.split('.');
		let target: any = extracted;

		// Navigate to the nested field
		for (let i = 0; i < keys.length - 1; i++) {
			if (!target[keys[i]]) {
				target[keys[i]] = {};
			}
			target = target[keys[i]];
		}

		// Set the clarified value
		target[keys[keys.length - 1]] = clarifiedValue;

		// Remove from uncertain list
		if (extracted._uncertain) {
			extracted._uncertain = extracted._uncertain.filter((f) => f.field !== field.field);
		}

		// Update needsClarification flag
		if (extracted._uncertain && extracted._uncertain.length === 0) {
			extracted._needsClarification = false;
		}
	}

	function openEditField(key: string, value: any) {
		editMode = key;
		editValue = value;
	}

	function saveEditField() {
		if (editMode && editValue !== null) {
			// Update extracted data
			(extracted as any)[editMode] = editValue;

			// Close edit mode
			editMode = null;
			editValue = null;
		}
	}

	function handleSave() {
		// Remove internal fields before saving
		const cleanData = { ...extracted };
		delete cleanData._uncertain;
		delete cleanData._needsClarification;

		onSave(cleanData);
	}

	// Voice command support (Phase 0.4)
	function handleVoiceCommand(command: string) {
		const lower = command.toLowerCase().trim();

		// "looks good" / "save it" / "confirm"
		if (/looks good|save it|confirm/i.test(lower)) {
			if (uncertainFields.length === 0) {
				handleSave();
			}
			return;
		}

		// "edit [field]"
		const editMatch = lower.match(/edit (.+)/);
		if (editMatch) {
			const fieldName = editMatch[1];
			const field = confirmedFields.find((f) => f.label.toLowerCase() === fieldName);
			if (field) {
				openEditField(field.key, field.rawValue);
			}
			return;
		}

		// "first option" / "second option"
		const optionMatch = lower.match(/(first|second|third|1st|2nd|3rd) option/i);
		if (optionMatch && uncertainFields.length > 0) {
			const index = ['first', '1st'].includes(optionMatch[1].toLowerCase())
				? 0
				: ['second', '2nd'].includes(optionMatch[1].toLowerCase())
					? 1
					: 2;

			const field = uncertainFields[0];
			if (field.options && field.options[index]) {
				resolveUncertainty(field, field.options[index]);
			}
		}
	}
</script>

<div
	class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
	onclick={onCancel}
>
	<div
		class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
		onclick={(e) => e.stopPropagation()}
	>
		<!-- Header -->
		<div class="sticky top-0 bg-white border-b border-cloud-200 px-6 py-4 rounded-t-2xl">
			<h2 class="text-xl font-semibold text-cloud-600">Review Before Saving</h2>
			<p class="text-sm text-cloud-500 mt-1">Quick review - takes 30 seconds</p>
		</div>

		<!-- Content -->
		<div class="px-6 py-4 space-y-6">
			<!-- Confirmed Fields (green) -->
			{#if confirmedFields.length > 0}
				<section class="border-l-4 border-green-500 bg-green-50 rounded p-4">
					<h3 class="text-sm font-semibold text-green-800 mb-3">✅ Looks Good</h3>
					<div class="space-y-2">
						{#each confirmedFields as field}
							<div class="flex items-center justify-between gap-3 py-1">
								<div class="flex-1">
									<span class="text-sm font-medium text-cloud-600">{field.label}:</span>
									<span class="text-sm text-cloud-500 ml-2">{field.value}</span>
								</div>
								<button
									onclick={() => openEditField(field.key, field.rawValue)}
									class="text-xs text-electric-500 hover:text-electric-600 px-2 py-1 rounded hover:bg-electric-50 transition-colors"
								>
									Edit ✏️
								</button>
							</div>
						{/each}
					</div>
				</section>
			{/if}

			<!-- Uncertain Fields (yellow) -->
			{#if uncertainFields.length > 0}
				<section class="border-l-4 border-yellow-500 bg-yellow-50 rounded p-4">
					<h3 class="text-sm font-semibold text-yellow-800 mb-3">⚠️ Please Clarify</h3>
					<div class="space-y-4">
						{#each uncertainFields as field}
							<div class="bg-white rounded p-3 border border-yellow-200">
								<p class="text-sm font-medium text-cloud-600 mb-2">{field.question}</p>
								<div class="flex flex-wrap gap-2">
									{#if field.type === 'choice' && field.options}
										{#each field.options as option}
											<button
												onclick={() => resolveUncertainty(field, option)}
												class="px-3 py-1.5 text-sm bg-white border border-cloud-300 rounded hover:bg-electric-50 hover:border-electric-500 transition-colors"
											>
												{option}
											</button>
										{/each}
									{:else}
										<input
											type="text"
											value={field.value}
											onchange={(e) => {
												field.value = e.currentTarget.value;
											}}
											placeholder="Type correct value"
											class="flex-1 px-3 py-1.5 text-sm border border-cloud-300 rounded focus:outline-none focus:ring-2 focus:ring-electric-500"
										/>
										<button
											onclick={() => resolveUncertainty(field, field.value)}
											class="px-4 py-1.5 text-sm bg-electric-500 text-white rounded hover:bg-electric-600 transition-colors"
										>
											Confirm
										</button>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</section>
			{/if}
		</div>

		<!-- Edit Mode Modal (modal within modal) -->
		{#if editMode}
			<div
				class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
				onclick={() => {
					editMode = null;
					editValue = null;
				}}
			>
				<div
					class="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6"
					onclick={(e) => e.stopPropagation()}
				>
					<h3 class="text-lg font-semibold text-cloud-600 mb-4">
						Edit {formatFieldLabel(editMode)}
					</h3>
					<textarea
						bind:value={editValue}
						rows="4"
						class="w-full px-3 py-2 border border-cloud-300 rounded focus:outline-none focus:ring-2 focus:ring-electric-500 text-sm"
						placeholder="Enter new value..."
					></textarea>
					<div class="flex gap-3 mt-4">
						<button
							onclick={() => {
								editMode = null;
								editValue = null;
							}}
							class="flex-1 px-4 py-2 text-sm text-cloud-600 hover:text-cloud-700 border border-cloud-300 rounded hover:bg-cloud-50 transition-colors"
						>
							Cancel
						</button>
						<button
							onclick={saveEditField}
							class="flex-1 px-4 py-2 text-sm bg-electric-500 text-white rounded hover:bg-electric-600 transition-colors"
						>
							Save
						</button>
					</div>
				</div>
			</div>
		{/if}

		<!-- Actions -->
		<div class="sticky bottom-0 bg-white border-t border-cloud-200 px-6 py-4 rounded-b-2xl">
			<div class="flex gap-3">
				<button
					onclick={onCancel}
					class="flex-1 px-4 py-2.5 text-sm font-medium text-cloud-600 hover:text-cloud-700 border border-cloud-300 rounded-lg hover:bg-cloud-50 transition-colors"
				>
					Discard
				</button>
				<button
					onclick={handleSave}
					disabled={uncertainFields.length > 0}
					class="flex-1 px-4 py-2.5 text-sm font-medium bg-electric-500 text-white rounded-lg hover:bg-electric-600 transition-colors disabled:bg-cloud-300 disabled:cursor-not-allowed"
				>
					{#if uncertainFields.length > 0}
						Clarify {uncertainFields.length} items first
					{:else}
						Looks Good - Save
					{/if}
				</button>
			</div>
		</div>
	</div>
</div>
