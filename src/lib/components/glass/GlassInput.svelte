<script>
  /**
   * GlassInput - Clean input field (Resend minimalism)
   */
  let {
    type = "text",
    value = $bindable(""),
    placeholder = "",
    disabled = false,
    label = "",
    error = "",
    class: className = "",
  } = $props();
</script>

<div class="flex flex-col gap-2 {className}">
  {#if label}
    <label class="text-sm font-medium text-white/80">{label}</label>
  {/if}
  <input
    {type}
    {placeholder}
    {disabled}
    bind:value
    class="w-full min-h-[44px] px-4 py-3 rounded-lg
      bg-midnight-900 border border-midnight-700
      text-white placeholder-white/40
      focus:border-electric-500 focus:outline-none
      transition-colors duration-150
      disabled:opacity-50 disabled:cursor-not-allowed
      {error ? 'border-red-500 focus:border-red-500' : ''}"
  />
  {#if error}
    <p class="text-sm text-red-400">{error}</p>
  {/if}
</div>
