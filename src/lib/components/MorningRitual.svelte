<script lang="ts">
	type Props = {
		onComplete: (data: { grateful: string; excited: string; priorities: string[] }) => void;
	};

	let { onComplete }: Props = $props();

	// 2-Minute Rule: Default to Quick Start (30 seconds)
	let quickMode = $state(true);

	let grateful = $state('');
	let excited = $state('');
	let priority1 = $state('');
	let priority2 = $state('');
	let priority3 = $state('');

	// Quick Start: Just 1 gratitude + 1 priority (James Clear 2-Minute Rule)
	let canStartQuick = $derived(grateful.trim() && priority1.trim());

	// Full Ritual: All 5 fields (for when you have time)
	let canStartFull = $derived(
		grateful.trim() && excited.trim() && priority1.trim() && priority2.trim() && priority3.trim()
	);

	let canStart = $derived(quickMode ? canStartQuick : canStartFull);

	function handleStart() {
		if (!canStart) return;

		onComplete({
			grateful: grateful.trim(),
			excited: excited.trim() || 'Starting my day with intention',
			priorities: quickMode
				? [priority1.trim()]
				: [priority1.trim(), priority2.trim(), priority3.trim()]
		});
	}

	function toggleMode() {
		quickMode = !quickMode;
	}
</script>

<div class="bg-gradient-to-br from-electric-50 to-green-50 rounded-xl md:rounded-2xl p-4 md:p-8 mb-4 md:mb-6 border border-electric-200">
	<div class="flex justify-between items-center mb-4 md:mb-6">
		<h3 class="text-lg md:text-xl font-semibold text-cloud-600">
			{quickMode ? 'Quick Start ⚡' : 'Morning Ritual ✨'}
		</h3>
		<button
			onclick={toggleMode}
			class="text-sm text-electric-600 hover:text-electric-700 font-medium underline"
		>
			{quickMode ? 'Full Ritual' : 'Quick Start'}
		</button>
	</div>

	<div class="space-y-4 md:space-y-6">
		{#if quickMode}
			<!-- QUICK START MODE (30 seconds - 2-Minute Rule) -->
			<p class="text-sm text-cloud-500 -mt-2 mb-4">
				30-second version • Just enough to build the habit
			</p>

			<!-- Grateful (required) -->
			<div>
				<label class="block text-sm font-medium text-cloud-600 mb-2">
					One thing you're grateful for? 🙏
				</label>
				<input
					bind:value={grateful}
					type="text"
					placeholder="I'm grateful for..."
					class="w-full px-3 md:px-4 py-3 text-base bg-white border border-cloud-200 rounded-lg text-cloud-600 placeholder-cloud-400 focus:outline-none focus:border-electric-500 min-h-touch-min"
				/>
			</div>

			<!-- Top Priority (required) -->
			<div>
				<label class="block text-sm font-medium text-cloud-600 mb-2">
					Your ONE big priority today? 🎯
				</label>
				<input
					bind:value={priority1}
					type="text"
					placeholder="The most important thing..."
					class="w-full px-3 md:px-4 py-3 text-base bg-white border border-cloud-200 rounded-lg text-cloud-600 placeholder-cloud-400 focus:outline-none focus:border-electric-500 min-h-touch-min"
				/>
			</div>
		{:else}
			<!-- FULL RITUAL MODE (5-8 minutes) -->
			<p class="text-sm text-cloud-500 -mt-2 mb-4">
				Full version • For when you have time to go deep
			</p>

			<!-- Grateful -->
			<div>
				<label class="block text-sm font-medium text-cloud-600 mb-2">
					What are you grateful for today? 🙏
				</label>
				<input
					bind:value={grateful}
					type="text"
					placeholder="I'm grateful for..."
					class="w-full px-3 md:px-4 py-3 text-base bg-white border border-cloud-200 rounded-lg text-cloud-600 placeholder-cloud-400 focus:outline-none focus:border-electric-500 min-h-touch-min"
				/>
			</div>

			<!-- Excited -->
			<div>
				<label class="block text-sm font-medium text-cloud-600 mb-2">
					What are you excited about? 🚀
				</label>
				<input
					bind:value={excited}
					type="text"
					placeholder="I'm excited about..."
					class="w-full px-3 md:px-4 py-3 text-base bg-white border border-cloud-200 rounded-lg text-cloud-600 placeholder-cloud-400 focus:outline-none focus:border-electric-500 min-h-touch-min"
				/>
			</div>

			<!-- 3 Priorities -->
			<div>
				<label class="block text-sm font-medium text-cloud-600 mb-2">
					Today's 3 Priorities 🎯
				</label>
				<div class="space-y-3">
					<input
						bind:value={priority1}
						type="text"
						placeholder="1. Most important thing..."
						class="w-full px-3 md:px-4 py-3 text-base bg-white border border-cloud-200 rounded-lg text-cloud-600 placeholder-cloud-400 focus:outline-none focus:border-electric-500 min-h-touch-min"
					/>
					<input
						bind:value={priority2}
						type="text"
						placeholder="2. Second priority..."
						class="w-full px-3 md:px-4 py-3 text-base bg-white border border-cloud-200 rounded-lg text-cloud-600 placeholder-cloud-400 focus:outline-none focus:border-electric-500 min-h-touch-min"
					/>
					<input
						bind:value={priority3}
						type="text"
						placeholder="3. Third priority..."
						class="w-full px-3 md:px-4 py-3 text-base bg-white border border-cloud-200 rounded-lg text-cloud-600 placeholder-cloud-400 focus:outline-none focus:border-electric-500 min-h-touch-min"
					/>
				</div>
			</div>
		{/if}

		<!-- Start Button -->
		<button
			onclick={handleStart}
			disabled={!canStart}
			class="w-full px-6 py-4 bg-electric-500 active:bg-electric-600 md:hover:bg-electric-600 disabled:bg-cloud-200 text-white font-semibold rounded-xl transition-all disabled:cursor-not-allowed text-base md:text-lg min-h-touch-comfortable"
		>
			{quickMode ? 'Start Day ⚡' : 'Start Day →'}
		</button>
	</div>
</div>
