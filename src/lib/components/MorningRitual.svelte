<script lang="ts">
	type Props = {
		onComplete: (data: { grateful: string; excited: string; priorities: string[] }) => void;
	};

	let { onComplete }: Props = $props();

	let grateful = $state('');
	let excited = $state('');
	let priority1 = $state('');
	let priority2 = $state('');
	let priority3 = $state('');

	let canStart = $derived(
		grateful.trim() && excited.trim() && priority1.trim() && priority2.trim() && priority3.trim()
	);

	function handleStart() {
		if (!canStart) return;

		onComplete({
			grateful: grateful.trim(),
			excited: excited.trim(),
			priorities: [priority1.trim(), priority2.trim(), priority3.trim()]
		});
	}
</script>

<div class="bg-gradient-to-br from-electric-50 to-green-50 rounded-2xl p-8 mb-6 border border-electric-200">
	<h3 class="text-xl font-semibold text-cloud-600 mb-6">Morning Ritual ✨</h3>

	<div class="space-y-6">
		<!-- Grateful -->
		<div>
			<label class="block text-sm font-medium text-cloud-600 mb-2">
				What are you grateful for today? 🙏
			</label>
			<input
				bind:value={grateful}
				type="text"
				placeholder="I'm grateful for..."
				class="w-full px-4 py-3 bg-white border border-cloud-200 rounded-lg text-cloud-600 placeholder-cloud-400 focus:outline-none focus:border-electric-500"
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
				class="w-full px-4 py-3 bg-white border border-cloud-200 rounded-lg text-cloud-600 placeholder-cloud-400 focus:outline-none focus:border-electric-500"
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
					class="w-full px-4 py-3 bg-white border border-cloud-200 rounded-lg text-cloud-600 placeholder-cloud-400 focus:outline-none focus:border-electric-500"
				/>
				<input
					bind:value={priority2}
					type="text"
					placeholder="2. Second priority..."
					class="w-full px-4 py-3 bg-white border border-cloud-200 rounded-lg text-cloud-600 placeholder-cloud-400 focus:outline-none focus:border-electric-500"
				/>
				<input
					bind:value={priority3}
					type="text"
					placeholder="3. Third priority..."
					class="w-full px-4 py-3 bg-white border border-cloud-200 rounded-lg text-cloud-600 placeholder-cloud-400 focus:outline-none focus:border-electric-500"
				/>
			</div>
		</div>

		<!-- Start Button -->
		<button
			onclick={handleStart}
			disabled={!canStart}
			class="w-full px-6 py-4 bg-electric-500 hover:bg-electric-600 disabled:bg-cloud-200 text-white font-semibold rounded-xl transition-all disabled:cursor-not-allowed text-lg"
		>
			Start Day →
		</button>
	</div>
</div>
