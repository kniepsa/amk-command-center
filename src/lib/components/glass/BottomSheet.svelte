<script>
  /**
   * BottomSheet - Clean swipeable drawer (Resend minimalism)
   */
  let {
    open = $bindable(false),
    onClose = () => {},
    title = "",
    children,
  } = $props();

  let startY = $state(0);
  let currentY = $state(0);
  let isDragging = $state(false);

  function handleTouchStart(e) {
    startY = e.touches[0].clientY;
    isDragging = true;
  }

  function handleTouchMove(e) {
    if (!isDragging) return;
    currentY = e.touches[0].clientY;
  }

  function handleTouchEnd() {
    if (!isDragging) return;
    isDragging = false;

    const deltaY = currentY - startY;
    if (deltaY > 100) {
      close();
    }
    currentY = 0;
    startY = 0;
  }

  function close() {
    open = false;
    onClose();
  }

  let translateY = $derived(isDragging ? Math.max(0, currentY - startY) : 0);
</script>

{#if open}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 bg-black/60 z-40 transition-opacity duration-200"
    onclick={close}
    role="presentation"
  ></div>

  <!-- Bottom Sheet -->
  <div
    class="fixed bottom-0 left-0 right-0 z-50 bg-midnight-900 rounded-t-lg border-t border-midnight-700
      max-h-[85vh] transition-transform duration-200"
    style="transform: translateY({translateY}px)"
    ontouchstart={handleTouchStart}
    ontouchmove={handleTouchMove}
    ontouchend={handleTouchEnd}
    role="dialog"
    aria-modal="true"
  >
    <!-- Handle -->
    <div class="flex justify-center pt-4 pb-2">
      <div class="w-12 h-1 bg-white/20 rounded"></div>
    </div>

    <!-- Header -->
    {#if title}
      <div class="flex items-center justify-between px-6 py-4 border-b border-midnight-700">
        <h2 class="text-xl font-semibold text-white">{title}</h2>
        <button
          onclick={close}
          class="p-2 rounded-lg hover:bg-midnight-800 transition-colors"
          aria-label="Close"
        >
          <svg class="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    {/if}

    <!-- Content -->
    <div class="px-6 py-6 overflow-y-auto max-h-[calc(85vh-120px)]">
      {@render children()}
    </div>
  </div>
{/if}
