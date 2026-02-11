<script lang="ts">
  import { onMount } from 'svelte';
  import type { CoachConfig, CoachesConfig, ChallengeLevel } from '$lib/types/coach';
  import { getCoach } from '$lib/coaches';

  let coachesConfig: CoachesConfig | null = null;
  let loading = true;
  let saving = false;
  let saveMessage = '';

  onMount(async () => {
    await loadCoachesConfig();
  });

  async function loadCoachesConfig() {
    try {
      // In production, this would load from /Users/amk/.config/command-center/coaches.json
      // For now, we'll use a placeholder that could be replaced with an API call
      const response = await fetch('/api/coaches/config');
      if (response.ok) {
        coachesConfig = await response.json();
      } else {
        // Fallback to default config
        coachesConfig = getDefaultConfig();
      }
    } catch (error) {
      console.error('Failed to load coaches config:', error);
      coachesConfig = getDefaultConfig();
    } finally {
      loading = false;
    }
  }

  function getDefaultConfig(): CoachesConfig {
    return {
      active_coaches: [
        {
          id: 'bill-campbell',
          name: 'Bill Campbell',
          enabled: true,
          challenge_level: 'medium',
          triggers: ['@team', '#leadership', 'conflict', 'management'],
          auto_activate: true
        },
        {
          id: 'machiavelli',
          name: 'Machiavelli',
          enabled: true,
          challenge_level: 'low',
          triggers: ['M&A', 'negotiation', 'Leon', 'Jerome'],
          auto_activate: false
        },
        {
          id: 'peter-drucker',
          name: 'Peter Drucker',
          enabled: true,
          challenge_level: 'medium',
          triggers: ['strategy', 'investment', 'big decision'],
          auto_activate: true
        },
        {
          id: 'stoic-advisor',
          name: 'Stoic Advisor',
          enabled: true,
          challenge_level: 'low',
          triggers: ['frustration', 'anxiety', 'stressed'],
          auto_activate: true
        },
        {
          id: 'parenting-guru',
          name: 'Parenting Guru',
          enabled: true,
          challenge_level: 'low',
          triggers: ['@kinder', '@linus', '#parenting'],
          auto_activate: true
        },
        {
          id: 'sales-coach',
          name: 'Sales Coach (SPIN)',
          enabled: true,
          challenge_level: 'medium',
          triggers: ['pitch', 'sales', '#sales', 'discovery'],
          auto_activate: true
        },
        {
          id: 'ma-advisor',
          name: 'M&A Advisor',
          enabled: true,
          challenge_level: 'medium',
          triggers: ['exit', 'valuation', 'deal structure'],
          auto_activate: true
        }
      ],
      settings: {
        show_immediately: true,
        allow_debates: false,
        max_coaches_per_response: 2
      }
    };
  }

  function toggleCoach(coachId: string) {
    if (!coachesConfig) return;
    const coach = coachesConfig.active_coaches.find((c) => c.id === coachId);
    if (coach) {
      coach.enabled = !coach.enabled;
      coachesConfig = coachesConfig; // Trigger reactivity
    }
  }

  function updateChallengeLevel(coachId: string, level: ChallengeLevel) {
    if (!coachesConfig) return;
    const coach = coachesConfig.active_coaches.find((c) => c.id === coachId);
    if (coach) {
      coach.challenge_level = level;
      coachesConfig = coachesConfig; // Trigger reactivity
    }
  }

  function toggleAutoActivate(coachId: string) {
    if (!coachesConfig) return;
    const coach = coachesConfig.active_coaches.find((c) => c.id === coachId);
    if (coach) {
      coach.auto_activate = !coach.auto_activate;
      coachesConfig = coachesConfig; // Trigger reactivity
    }
  }

  async function saveConfig() {
    if (!coachesConfig) return;
    saving = true;
    saveMessage = '';

    try {
      const response = await fetch('/api/coaches/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coachesConfig)
      });

      if (response.ok) {
        saveMessage = 'Preferences saved successfully!';
        setTimeout(() => (saveMessage = ''), 3000);
      } else {
        saveMessage = 'Failed to save preferences. Please try again.';
      }
    } catch (error) {
      console.error('Save error:', error);
      saveMessage = 'Error saving preferences. Check console for details.';
    } finally {
      saving = false;
    }
  }

  function getCoachIcon(coachId: string): string {
    const coach = getCoach(coachId);
    return coach?.icon || '🎯';
  }

  function getCoachDescription(coachId: string): string {
    const descriptions: Record<string, string> = {
      'bill-campbell': 'Direct but caring leadership advice',
      machiavelli: 'Ruthless pragmatism on power dynamics',
      'peter-drucker': 'First principles strategic thinking',
      'stoic-advisor': 'Calm, rational perspective on anxiety',
      'parenting-guru': 'Montessori-based child development guidance',
      'sales-coach': 'SPIN Selling discovery methodology',
      'ma-advisor': 'Valuation and deal structure expertise'
    };
    return descriptions[coachId] || '';
  }

  function getCategoryTitle(index: number): string | null {
    if (index === 0) return '🎯 Leadership & Management';
    if (index === 2) return '📊 Strategy & Decisions';
    if (index === 3) return '🧘 Personal Well-being';
    if (index === 5) return '💼 Business & Sales';
    return null;
  }
</script>

<div class="settings-page">
  <div class="header">
    <h1>⚙️ AI Coaches & Challengers</h1>
    <p class="subtitle">Configure which expert advisors challenge your thinking</p>
  </div>

  {#if loading}
    <div class="loading">Loading coach preferences...</div>
  {:else if coachesConfig}
    <div class="coaches-list">
      {#each coachesConfig.active_coaches as coach, index}
        {@const categoryTitle = getCategoryTitle(index)}
        {#if categoryTitle}
          <h2 class="category-title">{categoryTitle}</h2>
        {/if}

        <div class="coach-card">
          <div class="coach-main">
            <div class="coach-info">
              <span class="coach-icon">{getCoachIcon(coach.id)}</span>
              <div class="coach-details">
                <div class="coach-title">
                  <span class="coach-name">{coach.name}</span>
                  <label class="toggle-switch">
                    <input
                      type="checkbox"
                      checked={coach.enabled}
                      on:change={() => toggleCoach(coach.id)}
                    />
                    <span class="slider"></span>
                  </label>
                </div>
                <p class="coach-description">{getCoachDescription(coach.id)}</p>
                <div class="coach-triggers">
                  <span class="triggers-label">Triggers:</span>
                  {#each coach.triggers.slice(0, 4) as trigger}
                    <span class="trigger-tag">{trigger}</span>
                  {/each}
                  {#if coach.triggers.length > 4}
                    <span class="trigger-tag more">+{coach.triggers.length - 4} more</span>
                  {/if}
                </div>
              </div>
            </div>

            {#if coach.enabled}
              <div class="coach-settings">
                <div class="setting-group">
                  <label class="setting-label">Challenge Level:</label>
                  <div class="challenge-level-buttons">
                    <button
                      class="level-btn"
                      class:active={coach.challenge_level === 'low'}
                      on:click={() => updateChallengeLevel(coach.id, 'low')}
                    >
                      Low
                    </button>
                    <button
                      class="level-btn"
                      class:active={coach.challenge_level === 'medium'}
                      on:click={() => updateChallengeLevel(coach.id, 'medium')}
                    >
                      Medium
                    </button>
                    <button
                      class="level-btn"
                      class:active={coach.challenge_level === 'high'}
                      on:click={() => updateChallengeLevel(coach.id, 'high')}
                    >
                      High
                    </button>
                  </div>
                </div>

                <div class="setting-group">
                  <label class="checkbox-label">
                    <input
                      type="checkbox"
                      checked={coach.auto_activate}
                      on:change={() => toggleAutoActivate(coach.id)}
                    />
                    Auto-activate based on context
                  </label>
                </div>
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>

    <div class="advanced-settings">
      <h2>Advanced Options</h2>
      <div class="setting-group">
        <label class="checkbox-label">
          <input
            type="checkbox"
            bind:checked={coachesConfig.settings.show_immediately}
          />
          Show coach feedback immediately (vs on request)
        </label>
      </div>
      <div class="setting-group">
        <label class="checkbox-label">
          <input type="checkbox" bind:checked={coachesConfig.settings.allow_debates} />
          Allow coaches to debate each other (experimental)
        </label>
      </div>
      <div class="setting-group">
        <label class="setting-label">
          Max coaches per response:
          <input
            type="number"
            min="1"
            max="5"
            bind:value={coachesConfig.settings.max_coaches_per_response}
            class="number-input"
          />
        </label>
      </div>
    </div>

    <div class="actions">
      <button class="btn-save" on:click={saveConfig} disabled={saving}>
        {#if saving}
          💾 Saving...
        {:else}
          💾 Save Preferences
        {/if}
      </button>
      {#if saveMessage}
        <div class="save-message" class:success={saveMessage.includes('success')}>
          {saveMessage}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .settings-page {
    max-width: 1000px;
    margin: 0 auto;
    padding: 2rem;
  }

  .header {
    margin-bottom: 2rem;
  }

  h1 {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: #1a1a1a;
  }

  .subtitle {
    color: #666;
    font-size: 1rem;
  }

  .loading {
    text-align: center;
    padding: 3rem;
    color: #666;
  }

  .category-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 2rem 0 1rem;
    color: #333;
  }

  .coaches-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .coach-card {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    padding: 1.5rem;
    transition: box-shadow 0.2s ease;
  }

  .coach-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .coach-main {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .coach-info {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
  }

  .coach-icon {
    font-size: 2.5rem;
    line-height: 1;
  }

  .coach-details {
    flex: 1;
  }

  .coach-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .coach-name {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1a1a1a;
  }

  .coach-description {
    color: #666;
    margin-bottom: 0.75rem;
  }

  .coach-triggers {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
  }

  .triggers-label {
    font-size: 0.85rem;
    color: #999;
    font-weight: 500;
  }

  .trigger-tag {
    background: #f0f0f0;
    padding: 0.25rem 0.625rem;
    border-radius: 12px;
    font-size: 0.8rem;
    color: #555;
  }

  .trigger-tag.more {
    background: #667eea;
    color: white;
  }

  .toggle-switch {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 24px;
  }

  .toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: 0.3s;
    border-radius: 24px;
  }

  .slider:before {
    position: absolute;
    content: '';
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
  }

  input:checked + .slider {
    background-color: #667eea;
  }

  input:checked + .slider:before {
    transform: translateX(26px);
  }

  .coach-settings {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #f0f0f0;
  }

  .setting-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .setting-label {
    font-size: 0.9rem;
    font-weight: 500;
    color: #555;
  }

  .challenge-level-buttons {
    display: flex;
    gap: 0.5rem;
  }

  .level-btn {
    padding: 0.5rem 1rem;
    border: 1px solid #ddd;
    background: white;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s ease;
  }

  .level-btn:hover {
    border-color: #667eea;
    color: #667eea;
  }

  .level-btn.active {
    background: #667eea;
    color: white;
    border-color: #667eea;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: #555;
    cursor: pointer;
  }

  .checkbox-label input {
    cursor: pointer;
  }

  .number-input {
    width: 60px;
    padding: 0.375rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    margin-left: 0.5rem;
  }

  .advanced-settings {
    margin-top: 2rem;
    padding: 1.5rem;
    background: #f9f9f9;
    border-radius: 12px;
  }

  .advanced-settings h2 {
    font-size: 1.125rem;
    margin-bottom: 1rem;
    color: #333;
  }

  .actions {
    margin-top: 2rem;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .btn-save {
    padding: 0.875rem 2rem;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-save:hover:not(:disabled) {
    background: #5568d3;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  .btn-save:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .save-message {
    padding: 0.75rem 1.25rem;
    border-radius: 8px;
    font-size: 0.9rem;
    background: #fef3c7;
    color: #92400e;
  }

  .save-message.success {
    background: #d1fae5;
    color: #065f46;
  }

  @media (prefers-color-scheme: dark) {
    h1,
    .coach-name,
    .category-title {
      color: #f0f0f0;
    }

    .subtitle,
    .coach-description,
    .setting-label,
    .checkbox-label {
      color: #aaa;
    }

    .coach-card {
      background: #2a2a2a;
      border-color: #444;
    }

    .trigger-tag {
      background: #3a3a3a;
      color: #ccc;
    }

    .level-btn {
      background: #2a2a2a;
      border-color: #444;
      color: #ccc;
    }

    .advanced-settings {
      background: #2a2a2a;
    }
  }
</style>
