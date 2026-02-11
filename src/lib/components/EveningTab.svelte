<script lang="ts">
	import type { FoodEntry } from '$lib/types';

	let gratitudeItems = $state<Array<{ thing: string; why: string }>>([
		{ thing: '', why: '' },
		{ thing: '', why: '' }
	]);

	let foodEntries = $state<FoodEntry[]>([]);
	let newMeal = $state('');
	let newMealTime = $state('12:00');

	let tomorrowIntention1 = $state('');
	let tomorrowIntention2 = $state('');
	let tomorrowIntention3 = $state('');
	let planTomorrowChecked = $state(false);

	function addGratitudeItem() {
		gratitudeItems.push({ thing: '', why: '' });
	}

	function removeGratitudeItem(index: number) {
		gratitudeItems.splice(index, 1);
	}

	function addFoodEntry() {
		if (newMeal.trim() === '') return;
		foodEntries.push({
			time: newMealTime,
			meal: newMeal,
			usda_ids: [],
			portion_grams: []
		});
		newMeal = '';
		newMealTime = new Date().toTimeString().slice(0, 5);
	}

	function removeFoodEntry(index: number) {
		foodEntries.splice(index, 1);
	}

	function saveReview() {
		const review = {
			date: new Date().toISOString().split('T')[0],
			gratitude: gratitudeItems.filter((item) => item.thing.trim() !== ''),
			food: foodEntries,
			tomorrow_intentions: [tomorrowIntention1, tomorrowIntention2, tomorrowIntention3].filter(
				(i) => i.trim() !== ''
			),
			plan_tomorrow_completed: planTomorrowChecked
		};
		console.log('Evening Review:', review);
		alert('Evening review saved! (Console logged for now)');
	}

	// Common meals for autocomplete
	const commonMeals = [
		'Greek yogurt with berries',
		'Oatmeal with banana',
		'Eggs and toast',
		'Chicken salad',
		'Grilled salmon',
		'Protein shake',
		'Steak with vegetables',
		'Pasta with tomato sauce',
		'Buddha bowl',
		'Smoothie bowl'
	];
</script>

<div class="bg-white rounded-xl shadow-lg p-8">
	<h2 class="text-2xl font-bold text-slate-900 mb-6">🌙 Evening Review</h2>
	<p class="text-slate-600 mb-6">Daily reflection and tomorrow planning</p>

	<div class="space-y-8">
		<!-- Gratitude Section -->
		<div class="border-b border-slate-200 pb-6">
			<h3 class="font-semibold text-slate-800 mb-4 flex items-center gap-2">
				<span>🙏</span>
				<span>Gratitude Journal</span>
			</h3>

			<div class="space-y-4">
				{#each gratitudeItems as item, index}
					<div class="border border-slate-200 rounded-lg p-4">
						<div class="flex items-start justify-between mb-3">
							<label class="text-sm font-medium text-slate-700">Grateful for #{index + 1}</label>
							{#if gratitudeItems.length > 2}
								<button
									type="button"
									onclick={() => removeGratitudeItem(index)}
									class="text-red-500 hover:text-red-700 text-sm"
								>
									Remove
								</button>
							{/if}
						</div>
						<input
							type="text"
							bind:value={item.thing}
							placeholder="What are you grateful for?"
							class="w-full px-3 py-2 mb-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
						<textarea
							bind:value={item.why}
							placeholder="Why does this matter to you?"
							rows="2"
							class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						></textarea>
					</div>
				{/each}

				<button
					type="button"
					onclick={addGratitudeItem}
					class="w-full px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
				>
					+ Add Another Gratitude
				</button>
			</div>
		</div>

		<!-- Food Logger Section -->
		<div class="border-b border-slate-200 pb-6">
			<h3 class="font-semibold text-slate-800 mb-4 flex items-center gap-2">
				<span>🍽️</span>
				<span>Food Log</span>
			</h3>

			<div class="space-y-3 mb-4">
				{#if foodEntries.length === 0}
					<p class="text-slate-500 text-sm italic">No meals logged yet today</p>
				{/if}

				{#each foodEntries as entry, index}
					<div class="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
						<span class="text-sm font-medium text-slate-600 min-w-[60px]">{entry.time}</span>
						<span class="text-sm text-slate-800 flex-1">{entry.meal}</span>
						<button
							type="button"
							onclick={() => removeFoodEntry(index)}
							class="text-red-500 hover:text-red-700 text-sm"
						>
							Remove
						</button>
					</div>
				{/each}
			</div>

			<div class="border border-slate-200 rounded-lg p-4">
				<label class="block text-sm font-medium text-slate-700 mb-2">Add Meal</label>
				<div class="flex gap-3 mb-2">
					<input
						type="time"
						bind:value={newMealTime}
						class="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					/>
					<input
						type="text"
						bind:value={newMeal}
						list="common-meals"
						placeholder="What did you eat?"
						class="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					/>
					<datalist id="common-meals">
						{#each commonMeals as meal}
							<option value={meal}></option>
						{/each}
					</datalist>
				</div>
				<button
					type="button"
					onclick={addFoodEntry}
					class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
				>
					Add Meal
				</button>
			</div>
		</div>

		<!-- Tomorrow's Intentions Section -->
		<div class="border-b border-slate-200 pb-6">
			<h3 class="font-semibold text-slate-800 mb-4 flex items-center gap-2">
				<span>🎯</span>
				<span>Tomorrow's Intentions</span>
			</h3>

			<div class="space-y-3">
				<div>
					<label for="tomorrow1" class="block text-sm font-medium text-slate-700 mb-1"
						>Intention 1</label
					>
					<input
						id="tomorrow1"
						type="text"
						bind:value={tomorrowIntention1}
						placeholder="Main priority for tomorrow"
						class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					/>
				</div>
				<div>
					<label for="tomorrow2" class="block text-sm font-medium text-slate-700 mb-1"
						>Intention 2</label
					>
					<input
						id="tomorrow2"
						type="text"
						bind:value={tomorrowIntention2}
						placeholder="Secondary priority"
						class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					/>
				</div>
				<div>
					<label for="tomorrow3" class="block text-sm font-medium text-slate-700 mb-1"
						>Intention 3 (optional)</label
					>
					<input
						id="tomorrow3"
						type="text"
						bind:value={tomorrowIntention3}
						placeholder="Third priority if needed"
						class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					/>
				</div>
			</div>
		</div>

		<!-- Plan Tomorrow Checkbox -->
		<div class="pb-2">
			<label class="flex items-center gap-3 cursor-pointer">
				<input
					type="checkbox"
					bind:checked={planTomorrowChecked}
					class="w-6 h-6 text-blue-600 rounded"
				/>
				<div>
					<div class="font-semibold text-slate-800">Plan tomorrow completed</div>
					<div class="text-sm text-slate-600">
						I've reviewed my calendar and set clear priorities
					</div>
				</div>
			</label>
		</div>

		<!-- Save Button -->
		<div class="pt-4">
			<button
				type="button"
				onclick={saveReview}
				class="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
			>
				Save Evening Review
			</button>
		</div>
	</div>
</div>
