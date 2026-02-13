<script lang="ts">
  import { detectBiases, getBiasSummary, type BiasDetection } from '$lib/utils/bias-detector';
  import { generateContrarianView, type ContrarianView } from '$lib/utils/contrarian-agent';
  import { challengeAssumptions, type FirstPrinciplesChallenge } from '$lib/utils/first-principles-challenger';
  import { estimateTaskROI, type ROIEstimate } from '$lib/utils/roi-estimator';

  interface Props {
    text: string;
    decision?: string;
    reasoning?: string;
    tasks?: string[];
  }

  let { text = '', decision = '', reasoning = '', tasks = [] }: Props = $props();

  // Reactive computations
  let biases = $derived(detectBiases(text));
  let biasSummary = $derived(getBiasSummary(biases));

  let contrarian = $derived(
    decision && reasoning
      ? generateContrarianView(decision, reasoning)
      : null
  );

  let challenges = $derived(challengeAssumptions(text));

  let roiEstimates = $derived(
    tasks.length > 0
      ? tasks.map(task => estimateTaskROI(task, text))
      : []
  );

  let activeTab = $state<'biases' | 'contrarian' | 'first-principles' | 'roi'>('biases');

  function getSeverityColor(severity: 'low' | 'medium' | 'high'): string {
    switch (severity) {
      case 'high': return 'bg-red-100 border-red-300 text-red-900';
      case 'medium': return 'bg-yellow-100 border-yellow-300 text-yellow-900';
      case 'low': return 'bg-blue-100 border-blue-300 text-blue-900';
    }
  }

  function getROIColor(recommendation: string): string {
    switch (recommendation) {
      case 'do-now': return 'bg-green-100 border-green-300 text-green-900';
      case 'do-later': return 'bg-blue-100 border-blue-300 text-blue-900';
      case 'delegate': return 'bg-yellow-100 border-yellow-300 text-yellow-900';
      case 'drop': return 'bg-red-100 border-red-300 text-red-900';
      default: return 'bg-gray-100 border-gray-300 text-gray-900';
    }
  }

  function formatCurrency(value: number): string {
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M`;
    } else if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(0)}K`;
    } else {
      return `$${value.toFixed(0)}`;
    }
  }
</script>

<div class="strategic-intelligence bg-white rounded-lg shadow-lg p-6">
  <h2 class="text-2xl font-bold mb-4">Strategic Intelligence</h2>

  <!-- Tab Navigation -->
  <div class="flex gap-2 mb-6 border-b border-gray-200">
    <button
      class={`px-4 py-2 font-medium transition-colors ${
        activeTab === 'biases'
          ? 'border-b-2 border-indigo-600 text-indigo-600'
          : 'text-gray-500 hover:text-gray-700'
      }`}
      onclick={() => activeTab = 'biases'}
    >
      🚨 Bias Alerts
      {#if biases.length > 0}
        <span class="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
          {biases.length}
        </span>
      {/if}
    </button>

    <button
      class={`px-4 py-2 font-medium transition-colors ${
        activeTab === 'contrarian'
          ? 'border-b-2 border-indigo-600 text-indigo-600'
          : 'text-gray-500 hover:text-gray-700'
      }`}
      onclick={() => activeTab = 'contrarian'}
    >
      🔄 Contrarian View
    </button>

    <button
      class={`px-4 py-2 font-medium transition-colors ${
        activeTab === 'first-principles'
          ? 'border-b-2 border-indigo-600 text-indigo-600'
          : 'text-gray-500 hover:text-gray-700'
      }`}
      onclick={() => activeTab = 'first-principles'}
    >
      🧠 First Principles
      {#if challenges.length > 0}
        <span class="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
          {challenges.length}
        </span>
      {/if}
    </button>

    <button
      class={`px-4 py-2 font-medium transition-colors ${
        activeTab === 'roi'
          ? 'border-b-2 border-indigo-600 text-indigo-600'
          : 'text-gray-500 hover:text-gray-700'
      }`}
      onclick={() => activeTab = 'roi'}
    >
      💰 ROI Estimator
      {#if roiEstimates.length > 0}
        <span class="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
          {roiEstimates.length}
        </span>
      {/if}
    </button>
  </div>

  <!-- Tab Content -->
  <div class="tab-content">
    {#if activeTab === 'biases'}
      <div class="biases-tab">
        {#if biases.length === 0}
          <div class="text-center py-8 text-gray-500">
            <p class="text-lg">No cognitive biases detected</p>
            <p class="text-sm mt-2">Your thinking appears rational. Good job!</p>
          </div>
        {:else}
          <div class="mb-4 p-4 bg-gray-50 rounded-lg">
            <h3 class="font-semibold mb-2">Summary</h3>
            <p class="text-sm text-gray-700">
              Detected {biasSummary.total} potential biases:
              <span class="text-red-600 font-medium">{biasSummary.high} high</span>,
              <span class="text-yellow-600 font-medium">{biasSummary.medium} medium</span>,
              <span class="text-blue-600 font-medium">{biasSummary.low} low</span>
            </p>
            {#if biasSummary.mostCommon}
              <p class="text-sm text-gray-700 mt-1">
                Most common: <span class="font-medium">{biasSummary.mostCommon}</span>
              </p>
            {/if}
          </div>

          <div class="space-y-4">
            {#each biases as bias}
              <div class={`p-4 border-l-4 rounded-lg ${getSeverityColor(bias.severity)}`}>
                <div class="flex items-start gap-3">
                  <span class="text-2xl">{bias.icon}</span>
                  <div class="flex-1">
                    <h4 class="font-semibold mb-1">{bias.explanation}</h4>
                    <p class="text-sm mb-2 italic">"{bias.evidence}"</p>
                    <div class="bg-white bg-opacity-50 p-3 rounded mt-2">
                      <p class="text-sm font-medium">Challenge yourself:</p>
                      <p class="text-sm mt-1">{bias.challenge}</p>
                    </div>
                  </div>
                  <span class="text-xs font-medium uppercase px-2 py-1 rounded">
                    {bias.severity}
                  </span>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>

    {:else if activeTab === 'contrarian'}
      <div class="contrarian-tab">
        {#if !contrarian}
          <div class="text-center py-8 text-gray-500">
            <p class="text-lg">No decision detected</p>
            <p class="text-sm mt-2">Provide a decision + reasoning to see contrarian view</p>
          </div>
        {:else}
          <div class="space-y-6">
            <div class="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
              <h3 class="font-semibold text-green-900 mb-2">Your Position</h3>
              <p class="text-green-800">{contrarian.claim}</p>
            </div>

            <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <h3 class="font-semibold text-red-900 mb-2">Contrarian View</h3>
              <p class="text-red-800 mb-3">{contrarian.opposite}</p>

              <div class="mt-4">
                <p class="text-sm font-medium text-red-900 mb-2">
                  Probability contrarian view is correct:
                  <span class="text-lg font-bold">{contrarian.probability}%</span>
                </p>
              </div>
            </div>

            <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
              <h3 class="font-semibold text-yellow-900 mb-3">Why you might be wrong</h3>
              <ul class="space-y-2">
                {#each contrarian.evidence as evidence}
                  <li class="flex items-start gap-2 text-sm text-yellow-800">
                    <span class="text-yellow-600 mt-1">•</span>
                    <span>{evidence}</span>
                  </li>
                {/each}
              </ul>
            </div>

            <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
              <h3 class="font-semibold text-blue-900 mb-3">Questions to answer</h3>
              <ul class="space-y-2">
                {#each contrarian.questions as question}
                  <li class="flex items-start gap-2 text-sm text-blue-800">
                    <span class="text-blue-600 mt-1">?</span>
                    <span>{question}</span>
                  </li>
                {/each}
              </ul>
            </div>
          </div>
        {/if}
      </div>

    {:else if activeTab === 'first-principles'}
      <div class="first-principles-tab">
        {#if challenges.length === 0}
          <div class="text-center py-8 text-gray-500">
            <p class="text-lg">No assumptions detected</p>
            <p class="text-sm mt-2">Try using phrases like "need to", "must", "everyone does", etc.</p>
          </div>
        {:else}
          <div class="space-y-4">
            {#each challenges as challenge}
              <div class="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-lg">
                <h4 class="font-semibold text-purple-900 mb-2">Assumption</h4>
                <p class="text-sm text-purple-800 italic mb-3">"{challenge.assumption}"</p>

                {#if challenge.fundamentalTruth}
                  <div class="bg-white bg-opacity-70 p-3 rounded mb-3">
                    <p class="text-sm font-medium text-purple-900">Fundamental Truth:</p>
                    <p class="text-sm text-purple-800 mt-1">{challenge.fundamentalTruth}</p>
                  </div>
                {/if}

                <div class="bg-white bg-opacity-70 p-3 rounded mb-3">
                  <p class="text-sm font-medium text-purple-900">Why this might be false:</p>
                  <p class="text-sm text-purple-800 mt-1">{challenge.reasoning}</p>
                </div>

                <div class="bg-white bg-opacity-70 p-3 rounded">
                  <p class="text-sm font-medium text-purple-900 mb-2">Alternative perspectives:</p>
                  <ul class="space-y-1">
                    {#each challenge.alternatives as alternative}
                      <li class="flex items-start gap-2 text-sm text-purple-800">
                        <span class="text-purple-600 mt-1">→</span>
                        <span>{alternative}</span>
                      </li>
                    {/each}
                  </ul>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>

    {:else if activeTab === 'roi'}
      <div class="roi-tab">
        {#if roiEstimates.length === 0}
          <div class="text-center py-8 text-gray-500">
            <p class="text-lg">No tasks to analyze</p>
            <p class="text-sm mt-2">Provide tasks to estimate ROI</p>
          </div>
        {:else}
          <div class="space-y-4">
            {#each roiEstimates as estimate}
              <div class={`p-4 border-l-4 rounded-lg ${getROIColor(estimate.recommendation)}`}>
                <div class="flex items-start justify-between mb-2">
                  <h4 class="font-semibold flex-1">{estimate.task}</h4>
                  <span class="text-xs font-medium uppercase px-2 py-1 rounded bg-white bg-opacity-70">
                    {estimate.recommendation.replace('-', ' ')}
                  </span>
                </div>

                <div class="grid grid-cols-4 gap-4 mb-3 text-sm">
                  <div>
                    <p class="text-xs opacity-75">Value</p>
                    <p class="font-semibold">{formatCurrency(estimate.estimatedValue)}</p>
                  </div>
                  <div>
                    <p class="text-xs opacity-75">Cost</p>
                    <p class="font-semibold">{estimate.estimatedCost}h</p>
                  </div>
                  <div>
                    <p class="text-xs opacity-75">ROI</p>
                    <p class="font-semibold">{estimate.roi.toFixed(1)}x</p>
                  </div>
                  <div>
                    <p class="text-xs opacity-75">Payback</p>
                    <p class="font-semibold">{estimate.paybackPeriod}</p>
                  </div>
                </div>

                <div class="bg-white bg-opacity-50 p-3 rounded">
                  <p class="text-sm">{estimate.reasoning}</p>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .strategic-intelligence {
    max-width: 900px;
  }
</style>
