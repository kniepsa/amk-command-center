<script lang="ts">
  import type { Decision, RiskLevel } from "$lib/utils/decision-tracker";
  import {
    saveDecision,
    getAllDecisions,
    getDecisionsDueForReview,
    updateDecisionOutcome,
    deleteDecision,
    exportToMarkdown,
    markReviewCompleted,
  } from "$lib/utils/decision-tracker";

  let showModal = $state(false);
  let showReviewModal = $state(false);
  let selectedDecision = $state<Decision | null>(null);
  let filter = $state<"all" | "pending" | "reviewed">("all");

  // Form state
  let formDate = $state(new Date().toISOString().split("T")[0]);
  let formDecision = $state("");
  let formOptions = $state("");
  let formReasoning = $state("");
  let formAssumptions = $state("");
  let formRiskLevel = $state<RiskLevel>("medium");
  let formConfidence = $state(7);
  let formTags = $state("");

  // Review form state
  let reviewDate = $state(new Date().toISOString().split("T")[0]);
  let reviewResult = $state("");
  let reviewLearnings = $state("");
  let reviewAccuracy = $state(70);

  // Load decisions
  let decisions = $state<Decision[]>([]);
  let decisionsForReview = $state<Decision[]>([]);

  function refreshDecisions() {
    decisions = getAllDecisions();
    decisionsForReview = getDecisionsDueForReview();
  }

  // Initialize on mount
  $effect(() => {
    refreshDecisions();
  });

  function openModal() {
    resetForm();
    showModal = true;
  }

  function closeModal() {
    showModal = false;
    resetForm();
  }

  function resetForm() {
    formDate = new Date().toISOString().split("T")[0];
    formDecision = "";
    formOptions = "";
    formReasoning = "";
    formAssumptions = "";
    formRiskLevel = "medium";
    formConfidence = 7;
    formTags = "";
  }

  function handleSave() {
    if (!formDecision.trim()) {
      alert("Decision text is required");
      return;
    }

    const newDecision = {
      date: formDate,
      decision: formDecision.trim(),
      optionsConsidered: formOptions
        .split("\n")
        .map((o) => o.trim())
        .filter((o) => o),
      reasoning: formReasoning.trim(),
      assumptions: formAssumptions
        .split("\n")
        .map((a) => a.trim())
        .filter((a) => a),
      riskLevel: formRiskLevel,
      confidence: formConfidence,
      tags: formTags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t),
    };

    saveDecision(newDecision);
    refreshDecisions();
    closeModal();
  }

  function openReviewModal(decision: Decision) {
    selectedDecision = decision;
    reviewDate = new Date().toISOString().split("T")[0];
    reviewResult = "";
    reviewLearnings = "";

    // Auto-calculate accuracy based on confidence
    reviewAccuracy = decision.confidence * 10;

    showReviewModal = true;
  }

  function closeReviewModal() {
    showReviewModal = false;
    selectedDecision = null;
  }

  function handleReviewSave() {
    if (!selectedDecision) return;

    if (!reviewResult.trim()) {
      alert("Result is required");
      return;
    }

    const outcome = {
      date: reviewDate,
      actualResult: reviewResult.trim(),
      assumptionsCorrect: selectedDecision.assumptions.map(() => true), // Could enhance this
      learnings: reviewLearnings
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l),
      accuracyScore: reviewAccuracy,
    };

    updateDecisionOutcome(selectedDecision.id, outcome);
    refreshDecisions();
    closeReviewModal();
  }

  function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this decision?")) {
      deleteDecision(id);
      refreshDecisions();
    }
  }

  function handleExport() {
    const markdown = exportToMarkdown();
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `decision-journal-${new Date().toISOString().split("T")[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function markAsReviewed(decisionId: string, reviewDateStr: string) {
    markReviewCompleted(decisionId, reviewDateStr);
    refreshDecisions();
  }

  const filteredDecisions = $derived(() => {
    if (filter === "pending") {
      return decisions.filter((d) => !d.outcome);
    } else if (filter === "reviewed") {
      return decisions.filter((d) => d.outcome);
    }
    return decisions;
  });

  const riskColors: Record<RiskLevel, string> = {
    low: "bg-green-50 border-green-200 text-green-800",
    medium: "bg-yellow-50 border-yellow-200 text-yellow-800",
    high: "bg-orange-50 border-orange-200 text-orange-800",
    critical: "bg-red-50 border-red-200 text-red-800",
  };
</script>

<div class="p-4">
  <div class="mb-6 flex items-center justify-between">
    <div>
      <h2 class="text-2xl font-bold">Decision Journal</h2>
      <p class="text-sm text-slate-600">
        Track high-stakes decisions and learn from outcomes
      </p>
    </div>
    <div class="flex gap-2">
      <button
        onclick={handleExport}
        class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
      >
        Export to Markdown
      </button>
      <button
        onclick={openModal}
        class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Log Decision
      </button>
    </div>
  </div>

  {#if decisionsForReview.length > 0}
    <div class="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4">
      <h3 class="mb-2 font-semibold text-amber-900">
        {decisionsForReview.length} decision{decisionsForReview.length > 1
          ? "s"
          : ""} due for review
      </h3>
      <div class="space-y-2">
        {#each decisionsForReview as decision}
          <div class="flex items-center justify-between text-sm">
            <span>{decision.decision}</span>
            <button
              onclick={() => openReviewModal(decision)}
              class="text-amber-700 hover:underline"
            >
              Review now
            </button>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <div class="mb-4 flex gap-2">
    <button
      onclick={() => (filter = "all")}
      class={`rounded-lg px-3 py-1 text-sm font-medium ${
        filter === "all"
          ? "bg-blue-100 text-blue-700"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      All ({decisions.length})
    </button>
    <button
      onclick={() => (filter = "pending")}
      class={`rounded-lg px-3 py-1 text-sm font-medium ${
        filter === "pending"
          ? "bg-blue-100 text-blue-700"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      Pending Review ({decisions.filter((d) => !d.outcome).length})
    </button>
    <button
      onclick={() => (filter = "reviewed")}
      class={`rounded-lg px-3 py-1 text-sm font-medium ${
        filter === "reviewed"
          ? "bg-blue-100 text-blue-700"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      Reviewed ({decisions.filter((d) => d.outcome).length})
    </button>
  </div>

  <div class="space-y-4">
    {#each filteredDecisions() as decision}
      <div class="rounded-lg border bg-white p-4 shadow-sm">
        <div class="mb-3 flex items-start justify-between">
          <div class="flex-1">
            <div class="mb-1 flex items-center gap-2">
              <h3 class="text-lg font-semibold">{decision.decision}</h3>
              <span
                class={`rounded px-2 py-0.5 text-xs font-medium ${riskColors[decision.riskLevel]}`}
              >
                {decision.riskLevel}
              </span>
            </div>
            <p class="text-sm text-slate-600">
              {decision.date} · Confidence: {decision.confidence}/10
            </p>
          </div>
          <button
            onclick={() => handleDelete(decision.id)}
            class="text-sm text-red-600 hover:underline"
          >
            Delete
          </button>
        </div>

        {#if decision.optionsConsidered.length > 0}
          <div class="mb-2">
            <h4 class="mb-1 text-sm font-medium text-slate-700">
              Options Considered:
            </h4>
            <ul class="list-inside list-disc space-y-0.5 text-sm text-slate-600">
              {#each decision.optionsConsidered as option}
                <li>{option}</li>
              {/each}
            </ul>
          </div>
        {/if}

        <div class="mb-2">
          <h4 class="mb-1 text-sm font-medium text-slate-700">Reasoning:</h4>
          <p class="text-sm text-slate-600">{decision.reasoning}</p>
        </div>

        {#if decision.assumptions.length > 0}
          <div class="mb-2">
            <h4 class="mb-1 text-sm font-medium text-slate-700">Assumptions:</h4>
            <ul class="list-inside list-disc space-y-0.5 text-sm text-slate-600">
              {#each decision.assumptions as assumption}
                <li>{assumption}</li>
              {/each}
            </ul>
          </div>
        {/if}

        {#if decision.outcome}
          <div class="mt-3 border-t pt-3">
            <div class="mb-2 flex items-center justify-between">
              <h4 class="text-sm font-semibold text-green-700">
                Outcome ({decision.outcome.date})
              </h4>
              <span class="text-sm font-medium text-green-700">
                Accuracy: {decision.outcome.accuracyScore}%
              </span>
            </div>
            <p class="mb-2 text-sm text-slate-600">
              {decision.outcome.actualResult}
            </p>
            {#if decision.outcome.learnings.length > 0}
              <div>
                <h5 class="mb-1 text-xs font-medium text-slate-700">
                  Learnings:
                </h5>
                <ul
                  class="list-inside list-disc space-y-0.5 text-xs text-slate-600"
                >
                  {#each decision.outcome.learnings as learning}
                    <li>{learning}</li>
                  {/each}
                </ul>
              </div>
            {/if}
          </div>
        {:else}
          <div class="mt-3 flex gap-2">
            <button
              onclick={() => openReviewModal(decision)}
              class="text-sm text-blue-600 hover:underline"
            >
              Add Outcome
            </button>
            {#each decision.reviewDates as review}
              {#if !review.reviewed}
                <button
                  onclick={() => markAsReviewed(decision.id, review.date)}
                  class="text-sm text-slate-500 hover:underline"
                >
                  Mark {review.date} reviewed
                </button>
              {/if}
            {/each}
          </div>
        {/if}
      </div>
    {/each}

    {#if filteredDecisions().length === 0}
      <div class="rounded-lg border border-dashed border-slate-300 p-8 text-center">
        <p class="text-slate-600">No decisions logged yet</p>
        <button
          onclick={openModal}
          class="mt-2 text-sm text-blue-600 hover:underline"
        >
          Log your first decision
        </button>
      </div>
    {/if}
  </div>
</div>

<!-- Log Decision Modal -->
{#if showModal}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    onclick={closeModal}
  >
    <div
      class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
      onclick={(e) => e.stopPropagation()}
    >
      <h3 class="mb-4 text-xl font-bold">Log Decision</h3>

      <div class="space-y-4">
        <div>
          <label class="mb-1 block text-sm font-medium">Date</label>
          <input
            type="date"
            bind:value={formDate}
            class="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium">
            Decision <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            bind:value={formDecision}
            placeholder="Accept Leon R25M hybrid structure"
            class="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium">
            Options Considered (one per line)
          </label>
          <textarea
            bind:value={formOptions}
            placeholder="Colin R16M cash&#10;Leon R25M hybrid&#10;Wait for other buyers"
            rows="3"
            class="w-full rounded-lg border border-slate-300 px-3 py-2"
          ></textarea>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium">Reasoning</label>
          <textarea
            bind:value={formReasoning}
            placeholder="Leon's partnership potential + vertical integration..."
            rows="3"
            class="w-full rounded-lg border border-slate-300 px-3 py-2"
          ></textarea>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium">
            Assumptions (one per line)
          </label>
          <textarea
            bind:value={formAssumptions}
            placeholder="TechTulu minorities will exit&#10;Leon committed 3-5 years"
            rows="3"
            class="w-full rounded-lg border border-slate-300 px-3 py-2"
          ></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="mb-1 block text-sm font-medium">Risk Level</label>
            <select
              bind:value={formRiskLevel}
              class="w-full rounded-lg border border-slate-300 px-3 py-2"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium">
              Confidence (0-10): {formConfidence}
            </label>
            <input
              type="range"
              min="0"
              max="10"
              bind:value={formConfidence}
              class="w-full"
            />
          </div>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            bind:value={formTags}
            placeholder="m&a, printulu, partnership"
            class="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>
      </div>

      <div class="mt-6 flex justify-end gap-2">
        <button
          onclick={closeModal}
          class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          onclick={handleSave}
          class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Save Decision
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Review Outcome Modal -->
{#if showReviewModal && selectedDecision}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    onclick={closeReviewModal}
  >
    <div
      class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
      onclick={(e) => e.stopPropagation()}
    >
      <h3 class="mb-4 text-xl font-bold">Review Decision</h3>
      <p class="mb-4 text-sm text-slate-600">{selectedDecision.decision}</p>

      <div class="space-y-4">
        <div>
          <label class="mb-1 block text-sm font-medium">Review Date</label>
          <input
            type="date"
            bind:value={reviewDate}
            class="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium">
            What Actually Happened? <span class="text-red-500">*</span>
          </label>
          <textarea
            bind:value={reviewResult}
            placeholder="Describe the actual outcome..."
            rows="4"
            class="w-full rounded-lg border border-slate-300 px-3 py-2"
          ></textarea>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium">
            Learnings (one per line)
          </label>
          <textarea
            bind:value={reviewLearnings}
            placeholder="What would you do differently?&#10;What assumptions were wrong?"
            rows="3"
            class="w-full rounded-lg border border-slate-300 px-3 py-2"
          ></textarea>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium">
            Accuracy Score (0-100): {reviewAccuracy}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            bind:value={reviewAccuracy}
            class="w-full"
          />
          <p class="mt-1 text-xs text-slate-500">
            How close was your decision to the optimal outcome?
          </p>
        </div>
      </div>

      <div class="mt-6 flex justify-end gap-2">
        <button
          onclick={closeReviewModal}
          class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          onclick={handleReviewSave}
          class="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          Save Review
        </button>
      </div>
    </div>
  </div>
{/if}
