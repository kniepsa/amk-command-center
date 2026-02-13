<script lang="ts">
	import MissingDataFeedback from '$lib/components/MissingDataFeedback.svelte';
	import type { ExtractedData } from '$lib/types';

	// Demo scenarios
	let selectedScenario = $state<string>('empty');

	const scenarios: Record<string, { label: string; data: ExtractedData }> = {
		empty: {
			label: 'Empty Entry (0% complete)',
			data: {}
		},
		partial: {
			label: 'Partial Entry (50% complete)',
			data: {
				sleep: {
					duration: '7.5',
					quality: 'good'
				},
				energy: 'high',
				habits: {
					running: true,
					morning_electrolytes: true
				}
			}
		},
		missing_required: {
			label: 'Missing Required Fields (33% complete)',
			data: {
				habits: {
					running: true,
					sauna: true,
					sales_learning: true
				},
				food: [
					{
						time: '08:00',
						meal: '300g Joghurt mit Blaubeeren',
						portion_grams: [300]
					}
				]
			}
		},
		complete: {
			label: 'Complete Entry (100%)',
			data: {
				sleep: {
					bedtime: '22:00',
					wake_time: '06:30',
					duration: '8.5',
					quality: 'excellent'
				},
				energy: 'high',
				intentions: ['Focus on Printulu exit pitch deck', 'Family time after 18:00'],
				gratitude: [
					{ thing: 'Jani', why: 'Unterstützung bei exit decision' },
					{ thing: 'Kinder', why: 'Lachen beim Frühstück' },
					{ thing: 'Colin call', why: 'Positive energy and interest' }
				],
				habits: {
					running: true,
					sauna: true,
					sales_learning: true,
					morning_electrolytes: true,
					vampire_shot: true,
					supplements: true
				},
				food: [
					{
						time: '08:00',
						meal: '300g Joghurt mit Blaubeeren',
						portion_grams: [300]
					},
					{
						time: '12:30',
						meal: 'Lachs mit Brokkoli und Süßkartoffel',
						portion_grams: [200, 150, 200]
					}
				]
			}
		}
	};

	let currentData = $derived(scenarios[selectedScenario].data);
</script>

<div class="container mx-auto max-w-4xl p-6">
	<!-- Header -->
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-slate-800 mb-2">Missing Data Detector Demo</h1>
		<p class="text-slate-600">
			Real-time feedback showing what journal fields are captured and what's missing
		</p>
	</div>

	<!-- Scenario Selector -->
	<div class="bg-white rounded-lg border border-slate-200 p-6 mb-6">
		<h2 class="text-lg font-semibold text-slate-800 mb-4">Select Demo Scenario</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
			{#each Object.entries(scenarios) as [key, scenario]}
				<button
					onclick={() => (selectedScenario = key)}
					class="p-4 rounded-lg border-2 transition-all text-left"
					class:border-blue-500={selectedScenario === key}
					class:bg-blue-50={selectedScenario === key}
					class:border-slate-200={selectedScenario !== key}
					class:hover:border-slate-300={selectedScenario !== key}
				>
					<p class="font-medium text-slate-800">{scenario.label}</p>
				</button>
			{/each}
		</div>
	</div>

	<!-- Full Mode Demo -->
	<div class="mb-6">
		<h2 class="text-lg font-semibold text-slate-800 mb-3">Full Mode (Detailed Feedback)</h2>
		<MissingDataFeedback extracted={currentData} />
	</div>

	<!-- Compact Mode Demo -->
	<div class="mb-6">
		<h2 class="text-lg font-semibold text-slate-800 mb-3">Compact Mode (Inline Display)</h2>
		<div class="bg-white rounded-lg border border-slate-200 p-6">
			<MissingDataFeedback extracted={currentData} compact={true} />
		</div>
	</div>

	<!-- Raw Data View -->
	<div class="bg-white rounded-lg border border-slate-200 p-6">
		<h2 class="text-lg font-semibold text-slate-800 mb-3">Raw Extracted Data (JSON)</h2>
		<pre
			class="bg-slate-50 p-4 rounded-lg text-xs font-mono overflow-x-auto border border-slate-200">{JSON.stringify(
				currentData,
				null,
				2
			)}</pre>
	</div>

	<!-- Usage Instructions -->
	<div class="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
		<div class="flex items-start gap-3">
			<span class="text-blue-600 text-2xl">📘</span>
			<div class="flex-1">
				<h3 class="font-semibold text-blue-800 mb-2">Integration Instructions</h3>
				<div class="text-sm text-blue-700 space-y-2">
					<p><strong>Full Mode:</strong> Use in entry creation/editing pages for detailed feedback</p>
					<pre
						class="bg-white/50 p-2 rounded text-xs font-mono overflow-x-auto border border-blue-200 mt-2"
						><code>&lt;MissingDataFeedback extracted={'{extractedData}'} /&gt;</code></pre>

					<p class="mt-4">
						<strong>Compact Mode:</strong> Use in voice recorder or quick-add components
					</p>
					<pre
						class="bg-white/50 p-2 rounded text-xs font-mono overflow-x-auto border border-blue-200 mt-2"
						><code>&lt;MissingDataFeedback extracted={'{extractedData}'} compact={'{true}'} /&gt;</code
						></pre>

					<p class="mt-4"><strong>VoiceRecorder Integration:</strong></p>
					<pre
						class="bg-white/50 p-2 rounded text-xs font-mono overflow-x-auto border border-blue-200 mt-2"
						><code
							>&lt;VoiceRecorder
  onTranscription={'{handleTranscription}'}
  extractedData={'{extractedData}'}
  showFeedback={'{true}'}
/&gt;</code
						></pre>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	:global(body) {
		background-color: #f8fafc;
	}
</style>
