<script>
  /**
   * TabNavigation - Clean tab navigation (Resend minimalism)
   */
  let { tabs = [], activeTab = $bindable(""), onTabChange = () => {} } = $props();

  function handleTabClick(tabId) {
    activeTab = tabId;
    onTabChange(tabId);
  }

  let activeIndex = $derived(tabs.findIndex((tab) => tab.id === activeTab));
</script>

<nav class="relative bg-midnight-900 border-b border-midnight-700">
  <div class="container mx-auto px-4">
    <div class="flex items-center gap-1 relative">
      {#each tabs as tab, index (tab.id)}
        <button
          onclick={() => handleTabClick(tab.id)}
          class="relative flex items-center gap-2 px-6 py-4 min-h-[44px] transition-colors duration-150
            {activeTab === tab.id ? 'text-electric-500' : 'text-white/60 hover:text-white'}"
        >
          {#if tab.icon}
            <span class="text-xl">{tab.icon}</span>
          {/if}
          <span class="font-medium">{tab.label}</span>
          {#if tab.badge}
            <span class="px-2 py-0.5 text-xs font-semibold rounded bg-electric-500 text-midnight-950">
              {tab.badge}
            </span>
          {/if}
        </button>
      {/each}

      <!-- Active indicator -->
      <div
        class="absolute bottom-0 left-0 h-0.5 bg-electric-500 transition-all duration-200"
        style="transform: translateX({activeIndex * 100}%); width: {100 / tabs.length}%"
      ></div>
    </div>
  </div>
</nav>
