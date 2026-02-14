<script lang="ts">
  /**
   * TeachTheAIModal - Investment mechanic for Hook Model
   * Users teach AI their preferences → increases switching cost
   */
  import { userPreferences } from '$lib/stores/user-preferences';
  import { showToast } from '$lib/utils/toast';
  import { speak } from '$lib/utils/tts';

  let {
    isOpen = $bindable(false),
    onComplete = () => {}
  } = $props();

  let promptData = $state<ReturnType<typeof userPreferences.getNextTeachingPrompt>>(null);
  let selectedOption = $state<string | null>(null);

  $effect(() => {
    if (isOpen) {
      promptData = userPreferences.getNextTeachingPrompt();
      selectedOption = null;

      // Audio announcement
      if (promptData) {
        speak(promptData.message, 'medium');
      }
    }
  });

  function handleOptionSelect(option: string): void {
    selectedOption = option;
  }

  function handleSave(): void {
    if (!promptData || !selectedOption) return;

    // Process based on prompt type
    switch (promptData.type) {
      case 'person':
        // Extract person handle from selection
        if (selectedOption.includes('=')) {
          const match = selectedOption.match(/@(\w+)\s*=\s*@([\w-]+)/);
          if (match) {
            userPreferences.addPersonMapping(match[1], match[2]);
            showToast(`✅ I'll remember: @${match[1]} = @${match[2]}`, 'success');
            speak(`Got it - I'll remember that`, 'high');
          }
        }
        break;

      case 'phrase':
        // Add voice command shortcut
        const phrase = promptData.message.match(/"([^"]+)"/)?.[1];
        if (phrase) {
          if (selectedOption.includes('urgent')) {
            userPreferences.addVoiceCommand(phrase, 'add-to-urgent');
            showToast('✅ Shortcut created: "${phrase}" → Add to urgent', 'success');
          } else if (selectedOption.includes('morning')) {
            userPreferences.addVoiceCommand(phrase, 'start-morning-ritual');
            showToast('✅ Shortcut created: "${phrase}" → Start morning ritual', 'success');
          }
          speak('Shortcut created!', 'high');
        }
        break;

      case 'profile':
        // Navigate to appropriate section based on selection
        if (selectedOption.includes('Top 5')) {
          // Navigate to Warren Buffett Top 5
          onComplete({ action: 'navigate', target: '/weekly-review' });
        } else if (selectedOption.includes('Hours')) {
          // Navigate to settings
          onComplete({ action: 'navigate', target: '/settings' });
        } else if (selectedOption.includes('Coach')) {
          // Navigate to coach selection
          onComplete({ action: 'navigate', target: '/coaches' });
        }
        break;
    }

    isOpen = false;
    onComplete({ action: 'saved' });
  }

  function handleSkip(): void {
    isOpen = false;
    onComplete({ action: 'skipped' });
  }
</script>

{#if isOpen && promptData}
  <div class="modal-overlay" onclick={handleSkip}>
    <div class="modal-container" onclick={(e) => e.stopPropagation()}>
      <div class="modal-header">
        <div class="icon-wrapper">
          <svg class="w-8 h-8 text-electric-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h2 class="modal-title">Teach the AI</h2>
        <p class="modal-subtitle">{promptData.message}</p>
      </div>

      <div class="options-container">
        {#each promptData.options as option, i}
          <button
            class="option-button"
            class:selected={selectedOption === option}
            onclick={() => handleOptionSelect(option)}
          >
            <div class="option-content">
              <span class="option-number">{i + 1}</span>
              <span class="option-text">{option}</span>
            </div>
            {#if selectedOption === option}
              <svg class="check-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            {/if}
          </button>
        {/each}
      </div>

      <div class="modal-actions">
        <button class="button-secondary" onclick={handleSkip}>
          Skip for now
        </button>
        <button
          class="button-primary"
          onclick={handleSave}
          disabled={!selectedOption}
        >
          Save Preference
        </button>
      </div>

      <div class="profile-progress">
        <div class="progress-bar">
          <div
            class="progress-fill"
            style="width: {userPreferences.current.profile.completionPercentage}%"
          ></div>
        </div>
        <p class="progress-text">
          Profile {userPreferences.current.profile.completionPercentage}% complete
        </p>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9998;
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .modal-container {
    background: #0a0e27;
    border: 1px solid rgba(0, 217, 255, 0.2);
    border-radius: 1rem;
    padding: 2rem;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
    animation: slideUp 0.3s ease;
  }

  @keyframes slideUp {
    from {
      transform: translateY(2rem);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .modal-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .icon-wrapper {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
  }

  .modal-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
    margin-bottom: 0.5rem;
  }

  .modal-subtitle {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.5;
  }

  .options-container {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 2rem;
  }

  .option-button {
    background: #1a1f3a;
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.75rem;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 60px;
  }

  .option-button:hover {
    border-color: rgba(0, 217, 255, 0.4);
    background: #1f2545;
  }

  .option-button.selected {
    border-color: #00d9ff;
    background: rgba(0, 217, 255, 0.1);
  }

  .option-content {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
  }

  .option-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    font-weight: 600;
    font-size: 0.875rem;
  }

  .option-button.selected .option-number {
    background: #00d9ff;
    color: #0a0e27;
  }

  .option-text {
    color: white;
    font-size: 0.9375rem;
    text-align: left;
  }

  .check-icon {
    width: 1.5rem;
    height: 1.5rem;
    color: #00d9ff;
  }

  .modal-actions {
    display: flex;
    gap: 1rem;
  }

  .button-secondary,
  .button-primary {
    flex: 1;
    padding: 0.875rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 600;
    font-size: 0.9375rem;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
  }

  .button-secondary {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  .button-secondary:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  .button-primary {
    background: #00d9ff;
    color: #0a0e27;
  }

  .button-primary:hover:not(:disabled) {
    background: #00c4e6;
  }

  .button-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .profile-progress {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .progress-bar {
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 0.5rem;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #00d9ff, #00ff87);
    transition: width 0.5s ease;
  }

  .progress-text {
    text-align: center;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.875rem;
  }
</style>
