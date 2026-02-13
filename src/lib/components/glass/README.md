# Glass Component Library

Dark-first UI components with glassmorphism effects for AMK Command Center.

## Quick Start

```javascript
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
```

## Components

### GlassCard

3 variants: `default`, `elevated`, `flat`

```svelte
<GlassCard variant="elevated">
  <h3>Title</h3>
  <p>Content...</p>
</GlassCard>
```

### GlassButton

Primary/secondary/ghost variants with loading states

```svelte
<GlassButton variant="primary" bind:loading onclick={handleClick}>
  Save
</GlassButton>
```

### HabitsBar

Always-visible habits tracker with confetti animation

```svelte
<HabitsBar bind:habits onToggle={(id, done) => {...}} />
```

### GlassInput

Form input with label and error support

```svelte
<GlassInput
  label="Username"
  bind:value={username}
  error={errorMsg}
/>
```

### TabNavigation

Animated tab navigation with badges

```svelte
<TabNavigation
  tabs={[{ id: "home", label: "Home", icon: "🏠" }]}
  bind:activeTab
/>
```

### VoiceRecorderGlass

Voice recording button with pulse animation

```svelte
<VoiceRecorderGlass
  bind:recording
  onStart={...}
  onStop={...}
/>
```

### StatusBadge

Status indicators (success/warning/error/info)

```svelte
<StatusBadge status="success" text="Complete" />
```

### BottomSheet

Mobile swipeable drawer

```svelte
<BottomSheet bind:open title="Settings">
  <p>Content...</p>
</BottomSheet>
```

## Demo

Visit `/demo-glass` to see all components in action.

## Design Tokens

- **Midnight**: `950` (deepest) → `700` (borders)
- **Electric**: `500` (#00D9FF) → `600` (#00B8D4)
- **Glass**: `border`, `surface`, `hover`

## Browser Support

Modern browsers with `backdrop-filter` support (Chrome 90+, Firefox 88+, Safari 14+)
