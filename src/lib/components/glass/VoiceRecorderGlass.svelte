<script>
  /**
   * VoiceRecorderGlass - Clean voice button (Resend minimalism)
   */
  let {
    recording = $bindable(false),
    onStart = () => {},
    onStop = () => {},
    class: className = "",
  } = $props();

  function toggleRecording() {
    if (recording) {
      onStop();
    } else {
      onStart();
    }
    recording = !recording;
  }
</script>

<div class="flex flex-col items-center gap-4 {className}">
  <button
    onclick={toggleRecording}
    class="relative w-32 h-32 rounded-full transition-colors duration-150
      {recording ? 'bg-red-500' : 'bg-electric-500 hover:bg-electric-600'}"
    aria-label={recording ? "Stop recording" : "Start recording"}
  >
    {#if recording}
      <!-- Pulse animation while recording -->
      <div class="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></div>

      <!-- Stop icon -->
      <div class="relative z-10 flex items-center justify-center h-full">
        <div class="w-8 h-8 bg-white rounded"></div>
      </div>
    {:else}
      <!-- Microphone icon -->
      <div class="flex items-center justify-center h-full">
        <svg class="w-12 h-12 text-midnight-950" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
    {/if}
  </button>

  <p class="text-sm font-medium text-white/60">
    {recording ? "Recording... Tap to stop" : "Tap to record"}
  </p>
</div>
