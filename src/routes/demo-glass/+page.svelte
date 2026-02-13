<script>
  import {
    GlassCard,
    GlassButton,
    HabitsBar,
    GlassInput,
    TabNavigation,
    VoiceRecorderGlass,
    StatusBadge,
    BottomSheet,
  } from "$lib/components/glass";

  // Habits data
  let habits = $state([
    { id: "running", name: "Running", icon: "🏃", completed: false },
    { id: "sauna", name: "Sauna", icon: "🧖", completed: false },
    { id: "journaling", name: "Journaling", icon: "📝", completed: true },
    { id: "meditation", name: "Meditation", icon: "🧘", completed: false },
    { id: "reading", name: "Reading", icon: "📚", completed: false },
  ]);

  // Tab navigation data
  let tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "habits", label: "Habits", icon: "✓", badge: 3 },
    { id: "voice", label: "Voice", icon: "🎤" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  let activeTab = $state("overview");

  // Button states
  let primaryLoading = $state(false);
  let recording = $state(false);

  // Input values
  let inputValue = $state("");
  let inputError = $state("");

  // Bottom sheet
  let sheetOpen = $state(false);

  function handlePrimaryClick() {
    primaryLoading = true;
    setTimeout(() => {
      primaryLoading = false;
    }, 2000);
  }

  function handleVoiceStart() {
    console.log("Voice recording started");
  }

  function handleVoiceStop() {
    console.log("Voice recording stopped");
  }

  function validateInput() {
    if (inputValue.length < 3) {
      inputError = "Input must be at least 3 characters";
    } else {
      inputError = "";
    }
  }
</script>

<svelte:head>
  <title>Glass Components Demo - AMK Command Center</title>
</svelte:head>

<!-- Habits Bar (always visible at top) -->
<HabitsBar bind:habits onToggle={(id, completed) => console.log(`${id}: ${completed}`)} />

<!-- Main content with top padding to account for fixed habits bar -->
<div class="min-h-screen pt-24 pb-12">
  <div class="container mx-auto px-4 max-w-6xl">
    <!-- Header -->
    <div class="text-center mb-12">
      <h1 class="text-5xl font-bold mb-4 bg-gradient-to-r from-electric-500 to-blue-500 bg-clip-text text-transparent">
        Glass Component Library
      </h1>
      <p class="text-white/60 text-lg">Dark-first UI foundation with glassmorphism</p>
    </div>

    <!-- Tab Navigation -->
    <TabNavigation {tabs} bind:activeTab onTabChange={(id) => console.log(`Tab: ${id}`)} />

    <!-- Main Content Area -->
    <div class="mt-8 space-y-8">
      {#if activeTab === "overview"}
        <!-- GlassCard Variants -->
        <section>
          <h2 class="text-2xl font-semibold mb-6 text-white">Card Variants</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard variant="default">
              <h3 class="text-lg font-semibold mb-2">Default Card</h3>
              <p class="text-white/60">
                Standard glassmorphic card with subtle background blur and border.
              </p>
            </GlassCard>

            <GlassCard variant="elevated">
              <h3 class="text-lg font-semibold mb-2">Elevated Card</h3>
              <p class="text-white/60">
                Enhanced shadow and stronger blur for important content.
              </p>
            </GlassCard>

            <GlassCard variant="flat">
              <h3 class="text-lg font-semibold mb-2">Flat Card</h3>
              <p class="text-white/60">Solid background without blur effect.</p>
            </GlassCard>
          </div>
        </section>

        <!-- Buttons -->
        <section>
          <GlassCard>
            <h2 class="text-2xl font-semibold mb-6 text-white">Button Variants</h2>
            <div class="flex flex-wrap gap-4">
              <GlassButton
                variant="primary"
                bind:loading={primaryLoading}
                onclick={handlePrimaryClick}
              >
                Primary Button
              </GlassButton>

              <GlassButton variant="secondary">Secondary Button</GlassButton>

              <GlassButton variant="ghost">Ghost Button</GlassButton>

              <GlassButton variant="primary" disabled>Disabled Button</GlassButton>
            </div>
          </GlassCard>
        </section>

        <!-- Status Badges -->
        <section>
          <GlassCard>
            <h2 class="text-2xl font-semibold mb-6 text-white">Status Badges</h2>
            <div class="flex flex-wrap gap-3">
              <StatusBadge status="success" text="Success" />
              <StatusBadge status="warning" text="Warning" />
              <StatusBadge status="error" text="Error" />
              <StatusBadge status="info" text="Info" />
              <StatusBadge status="default" text="Default" />
            </div>
          </GlassCard>
        </section>

        <!-- Input Fields -->
        <section>
          <GlassCard>
            <h2 class="text-2xl font-semibold mb-6 text-white">Input Fields</h2>
            <div class="space-y-4 max-w-md">
              <GlassInput
                label="Username"
                placeholder="Enter your username"
                bind:value={inputValue}
                error={inputError}
              />

              <GlassButton variant="secondary" onclick={validateInput}>
                Validate Input
              </GlassButton>

              <GlassInput
                type="password"
                label="Password"
                placeholder="Enter your password"
              />

              <GlassInput
                label="Disabled Input"
                placeholder="This is disabled"
                disabled={true}
              />
            </div>
          </GlassCard>
        </section>

      {:else if activeTab === "voice"}
        <!-- Voice Recorder -->
        <section>
          <GlassCard class="flex flex-col items-center py-12">
            <h2 class="text-2xl font-semibold mb-8 text-white">Voice Recorder</h2>
            <VoiceRecorderGlass
              bind:recording
              onStart={handleVoiceStart}
              onStop={handleVoiceStop}
            />
            <p class="mt-6 text-white/60 text-center max-w-md">
              Tap the microphone to start recording your thoughts. The pulse animation
              indicates active recording.
            </p>
          </GlassCard>
        </section>

      {:else if activeTab === "settings"}
        <!-- Bottom Sheet Demo -->
        <section>
          <GlassCard>
            <h2 class="text-2xl font-semibold mb-6 text-white">Bottom Sheet</h2>
            <p class="text-white/60 mb-6">
              Mobile-friendly swipeable drawer component. Tap to open, swipe down or
              tap backdrop to close.
            </p>
            <GlassButton variant="primary" onclick={() => (sheetOpen = true)}>
              Open Bottom Sheet
            </GlassButton>
          </GlassCard>
        </section>
      {/if}

      <!-- Integration Guide -->
      <section>
        <GlassCard variant="elevated">
          <h2 class="text-2xl font-semibold mb-4 text-white">Integration Guide</h2>
          <div class="space-y-4 text-white/80">
            <div>
              <h3 class="font-semibold text-lg mb-2 text-white">Import Components:</h3>
              <pre class="bg-midnight-950 p-4 rounded-lg overflow-x-auto text-sm"><code
                >import &#123;
  GlassCard,
  GlassButton,
  HabitsBar,
  GlassInput,
  TabNavigation,
  VoiceRecorderGlass,
  StatusBadge,
  BottomSheet,
&#125; from "$lib/components/glass";</code></pre>
            </div>

            <div>
              <h3 class="font-semibold text-lg mb-2 text-white">Key Features:</h3>
              <ul class="list-disc list-inside space-y-2 text-white/60">
                <li>Dark-first design with midnight color palette</li>
                <li>Glassmorphism effects with backdrop blur</li>
                <li>44px minimum touch targets for mobile accessibility</li>
                <li>Confetti animation on habit completion</li>
                <li>Smooth animations and transitions</li>
                <li>Svelte 5 runes for reactive state management</li>
              </ul>
            </div>
          </div>
        </GlassCard>
      </section>
    </div>
  </div>
</div>

<!-- Bottom Sheet Component -->
<BottomSheet bind:open={sheetOpen} title="Example Bottom Sheet" onClose={() => console.log("Sheet closed")}>
  <div class="space-y-4">
    <p class="text-white/80">
      This is a mobile-friendly bottom sheet component. You can swipe down to close it,
      or tap the X button in the header.
    </p>

    <div class="space-y-3">
      <GlassInput label="Your Name" placeholder="Enter your name" />
      <GlassInput label="Email" type="email" placeholder="Enter your email" />
    </div>

    <div class="flex gap-3 pt-4">
      <GlassButton variant="primary" class="flex-1">Save</GlassButton>
      <GlassButton variant="secondary" class="flex-1" onclick={() => (sheetOpen = false)}>
        Cancel
      </GlassButton>
    </div>
  </div>
</BottomSheet>
