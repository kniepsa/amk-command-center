<script>
  /**
   * HabitsBar - Clean horizontal habits bar (Resend minimalism)
   * Features: Confetti on completion + Micro-rewards (60% trigger rate)
   */
  import { showToast } from '$lib/utils/toast';
  import { speak } from '$lib/utils/tts';

  let { habits = $bindable([]), onToggle = () => {} } = $props();

  // Micro-reward system (Nir Eyal Hook Model)
  const celebrationEmojis = ['🎉', '🔥', '⚡', '💪', '🌟'];
  const celebrationPhrases = ['Boom!', 'Nice!', 'Crushing it!', 'On fire!', 'Beast mode!'];

  function toggleHabit(habitId) {
    const habit = habits.find((h) => h.id === habitId);
    if (habit) {
      habit.completed = !habit.completed;
      if (habit.completed) {
        triggerMicroReward();
      }
      onToggle(habitId, habit.completed);
    }
  }

  /**
   * Trigger micro-reward with 60% probability (variable reward = dopamine hit)
   * Random timing creates unpredictability = stronger habit formation
   */
  function triggerMicroReward() {
    // 60% trigger rate (NOT 100% - unpredictability is key)
    if (Math.random() < 0.6) {
      const emoji = celebrationEmojis[Math.floor(Math.random() * celebrationEmojis.length)];
      const phrase = celebrationPhrases[Math.floor(Math.random() * celebrationPhrases.length)];

      // Variable timing (sometimes instant, sometimes delayed)
      const delay = Math.random() < 0.7 ? 0 : 1000;

      setTimeout(() => {
        // Visual toast
        showToast(`${emoji} ${phrase}`, 'success');

        // Audio feedback (if TTS available)
        if (typeof speak === 'function') {
          speak(phrase, 'high');
        }

        // Confetti animation
        triggerConfetti();
      }, delay);
    } else {
      // Silent success (no celebration)
      // This unpredictability makes the rewards more powerful
    }
  }

  function triggerConfetti() {
    const colors = ["#00D9FF", "#FF6B6B", "#4ECDC4", "#FFE66D", "#A8E6CF"];
    const confettiCount = 30;

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement("div");
      confetti.className = "confetti";
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = `${Math.random() * 0.3}s`;
      confetti.style.animationDuration = `${2 + Math.random()}s`;
      document.body.appendChild(confetti);

      setTimeout(() => confetti.remove(), 3000);
    }
  }
</script>

<div class="fixed top-0 left-0 right-0 z-50 bg-midnight-900 border-b border-midnight-700">
  <div class="container mx-auto px-4">
    <div class="flex items-center gap-3 py-3 overflow-x-auto scrollbar-thin">
      {#each habits as habit (habit.id)}
        <button
          onclick={() => toggleHabit(habit.id)}
          class="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-150 whitespace-nowrap min-h-[44px]
            {habit.completed
            ? 'bg-electric-500 text-midnight-950 font-semibold'
            : 'bg-midnight-800 border border-midnight-700 text-white hover:border-midnight-600'}"
        >
          <span class="text-xl">{habit.icon}</span>
          <span class="text-sm font-medium">{habit.name}</span>
          {#if habit.completed}
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          {/if}
        </button>
      {/each}
    </div>
  </div>
</div>

<style>
  .scrollbar-thin {
    scrollbar-width: thin;
  }

  .scrollbar-thin::-webkit-scrollbar {
    height: 4px;
  }

  .scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
  }

  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
  }
</style>
