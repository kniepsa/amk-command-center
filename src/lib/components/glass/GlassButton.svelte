<script>
  /**
   * GlassButton - Clean button component (Resend minimalism)
   * Primary and secondary variants only
   */
  let {
    variant = "primary",
    loading = $bindable(false),
    disabled = false,
    type = "button",
    onclick = () => {},
    class: className = "",
    children,
  } = $props();

  const variantStyles = {
    primary: "bg-electric-500 hover:bg-electric-600 text-midnight-950 font-semibold",
    secondary: "bg-midnight-900 border border-midnight-700 hover:border-midnight-600 text-white",
  };
</script>

<button
  {type}
  {disabled}
  onclick={onclick}
  class="min-h-[44px] px-6 py-3 rounded-lg transition-colors duration-150 font-medium
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-electric-500
    {variantStyles[variant]} {className}"
>
  {#if loading}
    <div class="flex items-center justify-center gap-2">
      <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span>Loading...</span>
    </div>
  {:else}
    {@render children()}
  {/if}
</button>
