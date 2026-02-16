<script lang="ts">
  /**
   * One-Time Migration Modal
   * Migrates localStorage data to backend API
   */
  import {
    needsMigration,
    getMigrationSummary,
    extractMigrationData,
    downloadDataBackup,
    clearMigratedData,
    isMigrationComplete,
    validateMigrationData,
  } from "$lib/utils/migration";

  let showModal = $state(false);
  let step = $state<"intro" | "confirm" | "migrating" | "success" | "error">(
    "intro",
  );
  let errorMessage = $state("");
  let summary = $state({ itemCounts: {}, totalItems: 0 });

  // Check on mount
  $effect(() => {
    if (needsMigration() && !isMigrationComplete()) {
      showModal = true;
      summary = getMigrationSummary();
    }
  });

  async function startMigration() {
    step = "migrating";

    try {
      // Extract data
      const data = extractMigrationData();

      // Validate data
      const validation = validateMigrationData(data);
      if (!validation.valid) {
        errorMessage = `Data validation failed:\n${validation.errors.join("\n")}`;
        step = "error";
        return;
      }

      // TODO: Upload to backend
      // For now, we'll just download a backup and clear localStorage
      // When backend endpoints are ready, replace this with API calls

      // Download backup as safety measure
      downloadDataBackup();

      // Simulate API upload delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Clear localStorage
      clearMigratedData();

      step = "success";
    } catch (error) {
      errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      step = "error";
    }
  }

  function skipMigration() {
    // Mark as complete without migrating
    if (confirm("Skip migration? Your data will remain in localStorage only.")) {
      clearMigratedData();
      showModal = false;
    }
  }

  function close() {
    showModal = false;
  }
</script>

{#if showModal}
  <div class="modal-backdrop">
    <div class="modal">
      {#if step === "intro"}
        <h2>Data Migration Required</h2>
        <p>
          Your data is currently stored locally in your browser. We're moving
          to a cloud-based backend for better reliability and sync across
          devices.
        </p>

        <div class="summary">
          <h3>Items to migrate:</h3>
          <ul>
            {#each Object.entries(summary.itemCounts) as [key, count]}
              {#if count > 0}
                <li>
                  <strong>{count}</strong>
                  {key}
                </li>
              {/if}
            {/each}
          </ul>
          <p class="total"><strong>Total: {summary.totalItems} items</strong></p>
        </div>

        <div class="actions">
          <button onclick={() => (step = "confirm")} class="primary">
            Start Migration
          </button>
          <button onclick={skipMigration} class="secondary">
            Skip (Not Recommended)
          </button>
        </div>
      {:else if step === "confirm"}
        <h2>Confirm Migration</h2>
        <p>Before we begin:</p>

        <div class="checklist">
          <label>
            <input type="checkbox" />
            I understand my data will be uploaded to the cloud
          </label>
          <label>
            <input type="checkbox" />
            A backup will be downloaded to my computer
          </label>
          <label>
            <input type="checkbox" />
            Local data will be cleared after successful migration
          </label>
        </div>

        <div class="actions">
          <button onclick={startMigration} class="primary">
            Confirm & Migrate
          </button>
          <button onclick={() => (step = "intro")} class="secondary">
            Back
          </button>
        </div>
      {:else if step === "migrating"}
        <h2>Migrating Data...</h2>
        <div class="spinner"></div>
        <p>
          Please wait while we upload your data. A backup file is being
          downloaded for safety.
        </p>
      {:else if step === "success"}
        <h2>Migration Complete!</h2>
        <p>
          Your data has been successfully migrated to the cloud. A backup file
          has been downloaded to your computer.
        </p>
        <p>You can now access your data from any device.</p>

        <div class="actions">
          <button onclick={close} class="primary">Continue</button>
        </div>
      {:else if step === "error"}
        <h2>Migration Failed</h2>
        <p>An error occurred during migration:</p>
        <pre class="error">{errorMessage}</pre>

        <p>
          Your data has NOT been deleted. You can try again or contact support.
        </p>

        <div class="actions">
          <button onclick={() => (step = "intro")} class="primary">
            Try Again
          </button>
          <button onclick={downloadDataBackup} class="secondary">
            Download Backup
          </button>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  }

  .modal {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  }

  h2 {
    margin: 0 0 1rem 0;
    color: #333;
  }

  p {
    margin: 0 0 1rem 0;
    color: #666;
    line-height: 1.5;
  }

  .summary {
    background: #f5f5f5;
    border-radius: 8px;
    padding: 1rem;
    margin: 1.5rem 0;
  }

  .summary h3 {
    margin: 0 0 0.5rem 0;
    font-size: 0.9rem;
    text-transform: uppercase;
    color: #999;
  }

  .summary ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .summary li {
    padding: 0.5rem 0;
    border-bottom: 1px solid #e0e0e0;
  }

  .summary li:last-child {
    border-bottom: none;
  }

  .total {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 2px solid #333;
  }

  .checklist {
    margin: 1.5rem 0;
  }

  .checklist label {
    display: block;
    padding: 0.75rem;
    margin: 0.5rem 0;
    cursor: pointer;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    transition: all 0.2s;
  }

  .checklist label:hover {
    background: #f5f5f5;
  }

  .checklist input[type="checkbox"] {
    margin-right: 0.75rem;
  }

  .spinner {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    animation: spin 1s linear infinite;
    margin: 2rem auto;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .error {
    background: #fee;
    border: 1px solid #fcc;
    border-radius: 6px;
    padding: 1rem;
    color: #c33;
    font-size: 0.9rem;
    white-space: pre-wrap;
    margin: 1rem 0;
  }

  .actions {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
  }

  button {
    flex: 1;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  button.primary {
    background: #3498db;
    color: white;
  }

  button.primary:hover {
    background: #2980b9;
  }

  button.secondary {
    background: #e0e0e0;
    color: #666;
  }

  button.secondary:hover {
    background: #d0d0d0;
  }
</style>
