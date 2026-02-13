<script>
  /**
   * StatusBadge - Clean status indicators (Resend minimalism)
   */
  let { status = "default", text = "", class: className = "" } = $props();

  const statusStyles = {
    success: "bg-green-900 text-green-400 border-green-700",
    warning: "bg-yellow-900 text-yellow-400 border-yellow-700",
    error: "bg-red-900 text-red-400 border-red-700",
    info: "bg-midnight-800 text-electric-500 border-midnight-700",
    default: "bg-midnight-900 text-white/80 border-midnight-700",
  };

  const icons = {
    success: "✓",
    warning: "⚠",
    error: "✕",
    info: "ℹ",
    default: "",
  };
</script>

<span
  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold border
    {statusStyles[status]} {className}"
>
  {#if icons[status]}
    <span class="text-sm">{icons[status]}</span>
  {/if}
  {text}
</span>
