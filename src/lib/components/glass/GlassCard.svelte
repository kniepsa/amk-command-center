<script>
  /**
   * GlassCard - Clean card component (Resend minimalism)
   */
  let {
    class: className = "",
    children,
  } = $props();
</script>

<div class="bg-midnight-900 border border-midnight-700 rounded-lg p-6 {className}">
  {@render children()}
</div>
