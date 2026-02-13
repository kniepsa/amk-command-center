<script lang="ts">
  import StrategicIntelligence from '$lib/components/StrategicIntelligence.svelte';

  let exampleText = $state(`
I've already invested R10M in this deal and can't give up now. Everyone says this is the right move.
I need to accept Leon's R25M hybrid deal because the partnership potential is huge.
It's definitely going to work - everyone's talking about how great vertical integration is.
Compared to Colin's R16M offer, this is obviously better. Must take this opportunity before it's gone.
  `);

  let exampleDecision = $state('Accept Leon R25M hybrid deal');
  let exampleReasoning = $state(`
Partnership with Leon could unlock huge value. He owns Peters Paper (R2B revenue) and wants to build an empire.
The R25M deal is R9M premium over Colin's R16M cash offer. I feel excited about the strategic potential.
We need to move fast before the opportunity disappears. This definitely will succeed.
  `);

  let exampleTasks = $state([
    'Build M&A pitch deck for Leon R25M deal',
    'Automate daily email workflow (save 30 min/day)',
    'Redesign personal website',
    'Create sales script for Omar partnership (R8.6M over 2 years)',
    'Review and respond to investor emails'
  ]);
</script>

<div class="min-h-screen bg-gray-50 py-8 px-4">
  <div class="max-w-6xl mx-auto">
    <div class="mb-8">
      <h1 class="text-4xl font-bold text-gray-900 mb-2">Strategic Intelligence Demo</h1>
      <p class="text-gray-600">
        Test the bias detector, contrarian agent, first principles challenger, and ROI estimator
      </p>
    </div>

    <!-- Input Section -->
    <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h2 class="text-2xl font-bold mb-4">Input</h2>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Text to Analyze (for bias detection & first principles)
          </label>
          <textarea
            bind:value={exampleText}
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            rows="6"
          ></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Decision (for contrarian view)
            </label>
            <input
              type="text"
              bind:value={exampleDecision}
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Reasoning (for contrarian view)
            </label>
            <textarea
              bind:value={exampleReasoning}
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              rows="3"
            ></textarea>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Tasks (for ROI estimation, one per line)
          </label>
          <textarea
            value={exampleTasks.join('\n')}
            oninput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              exampleTasks = target.value.split('\n').filter(t => t.trim());
            }}
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            rows="5"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- Strategic Intelligence Component -->
    <StrategicIntelligence
      text={exampleText}
      decision={exampleDecision}
      reasoning={exampleReasoning}
      tasks={exampleTasks}
    />

    <!-- Usage Guide -->
    <div class="mt-8 bg-indigo-50 rounded-lg p-6">
      <h3 class="text-lg font-bold text-indigo-900 mb-3">How to Use</h3>
      <div class="space-y-2 text-sm text-indigo-800">
        <p><strong>🚨 Bias Alerts:</strong> Detects cognitive biases like sunk cost fallacy, confirmation bias, anchoring, etc.</p>
        <p><strong>🔄 Contrarian View:</strong> Shows the opposite perspective to your decision with probability and challenging questions.</p>
        <p><strong>🧠 First Principles:</strong> Challenges assumptions (need to, must, everyone does, etc.) to find fundamental truths.</p>
        <p><strong>💰 ROI Estimator:</strong> Estimates value vs cost for tasks and recommends Do Now, Do Later, Delegate, or Drop.</p>
      </div>
    </div>

    <!-- Examples -->
    <div class="mt-8 bg-white rounded-lg shadow p-6">
      <h3 class="text-lg font-bold text-gray-900 mb-3">Try These Examples</h3>
      <div class="space-y-3">
        <button
          onclick={() => {
            exampleText = "I've already spent R10M on this project, so I can't stop now. Everyone says we should keep going. It's obviously the right choice.";
            exampleDecision = "Continue investing in failing project";
            exampleReasoning = "We've already spent so much, and everyone agrees this is still the right path. It would be wasted if we stop now.";
          }}
          class="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <strong>Example 1:</strong> Sunk cost fallacy + confirmation bias
        </button>

        <button
          onclick={() => {
            exampleText = "I must accept this deal because everyone does it this way. There's no other option - it has to be R20M.";
            exampleDecision = "Accept R20M offer";
            exampleReasoning = "The buyer originally wanted R25M, so R20M seems like a good deal. I don't want to lose this opportunity.";
          }}
          class="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <strong>Example 2:</strong> Anchoring + necessity assumptions
        </button>

        <button
          onclick={() => {
            exampleText = "Build M&A pitch deck (R25M deal in 6 hours). Automate email workflow (save 1 hour daily). Redesign website (20 hours, unclear value).";
            exampleDecision = "";
            exampleReasoning = "";
            exampleTasks = [
              "Build M&A pitch deck for R25M deal",
              "Automate email workflow to save 1 hour daily",
              "Redesign website",
              "Create investor presentation for R8M raise",
              "Optimize inbox management"
            ];
          }}
          class="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <strong>Example 3:</strong> ROI comparison across tasks
        </button>
      </div>
    </div>
  </div>
</div>
