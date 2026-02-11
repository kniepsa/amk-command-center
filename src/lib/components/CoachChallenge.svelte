<script lang="ts">
  import type { CoachChallenge } from '$lib/types/coach';

  export let challenge: CoachChallenge;
  export let onTellMeMore: (() => void) | undefined = undefined;
  export let onIgnore: (() => void) | undefined = undefined;

  let expanded = false;

  function handleTellMeMore() {
    expanded = true;
    onTellMeMore?.();
  }

  function handleIgnore() {
    onIgnore?.();
  }
</script>

<div class="coach-challenge" data-coach-id={challenge.coach_id}>
  <div class="coach-header">
    <span class="coach-icon">{challenge.icon}</span>
    <span class="coach-name">{challenge.coach_name}</span>
    <span class="challenge-level-badge">Challenge</span>
  </div>

  <div class="coach-message">
    {challenge.message}
  </div>

  {#if challenge.quote}
    <div class="coach-quote">
      <span class="quote-icon">📖</span>
      <span class="quote-text">{challenge.quote}</span>
    </div>
  {/if}

  {#if challenge.confidence && challenge.confidence < 0.7}
    <div class="confidence-notice">
      <span class="confidence-icon">⚠️</span>
      <span>Confidence: {Math.round(challenge.confidence * 100)}%</span>
    </div>
  {/if}

  <div class="coach-actions">
    <button class="btn-tell-more" on:click={handleTellMeMore} disabled={expanded}>
      💡 Tell me more
    </button>
    <button class="btn-ignore" on:click={handleIgnore}>🙈 Ignore this time</button>
  </div>

  {#if expanded}
    <div class="coach-expanded">
      <p class="expanded-prompt">
        This coach can provide additional context based on your situation. Ask follow-up questions
        to dive deeper.
      </p>
    </div>
  {/if}
</div>

<style>
  .coach-challenge {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    padding: 1.5rem;
    margin: 1rem 0;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    color: white;
    position: relative;
    overflow: hidden;
  }

  .coach-challenge::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #ffd700 0%, #ffa500 100%);
  }

  .coach-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .coach-icon {
    font-size: 2rem;
    line-height: 1;
  }

  .coach-name {
    font-size: 1.25rem;
    font-weight: 600;
    flex: 1;
  }

  .challenge-level-badge {
    background: rgba(255, 255, 255, 0.2);
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .coach-message {
    font-size: 1rem;
    line-height: 1.6;
    margin-bottom: 1rem;
    white-space: pre-wrap;
  }

  .coach-quote {
    background: rgba(0, 0, 0, 0.2);
    padding: 1rem;
    border-radius: 8px;
    margin: 1rem 0;
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
    border-left: 3px solid rgba(255, 215, 0, 0.6);
  }

  .quote-icon {
    font-size: 1.25rem;
    flex-shrink: 0;
  }

  .quote-text {
    font-style: italic;
    font-size: 0.95rem;
    line-height: 1.5;
  }

  .confidence-notice {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    opacity: 0.8;
    margin-bottom: 1rem;
  }

  .confidence-icon {
    font-size: 1rem;
  }

  .coach-actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 1.5rem;
  }

  .coach-actions button {
    padding: 0.625rem 1.25rem;
    border: none;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .btn-tell-more {
    background: rgba(255, 255, 255, 0.9);
    color: #667eea;
    flex: 1;
  }

  .btn-tell-more:hover:not(:disabled) {
    background: white;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .btn-tell-more:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-ignore {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.4);
  }

  .btn-ignore:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  .coach-expanded {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
  }

  .expanded-prompt {
    font-size: 0.9rem;
    opacity: 0.9;
    margin: 0;
  }

  /* Dark mode considerations */
  @media (prefers-color-scheme: dark) {
    .coach-challenge {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    }
  }
</style>
