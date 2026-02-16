import { browser } from "$app/environment";

interface Shortcut {
  key: string;
  description: string;
  category: string;
}

class ShortcutsStore {
  private modalOpen = $state(false);

  private shortcuts: Shortcut[] = [
    // Global
    {
      key: "⌘K or ?",
      description: "Show keyboard shortcuts",
      category: "Global",
    },
    { key: "Esc", description: "Close modals/dialogs", category: "Global" },
    { key: "⌘⇧Z", description: "Undo last action", category: "Global" },

    // Tasks
    {
      key: "Space",
      description: "Toggle task completion (when focused)",
      category: "Tasks",
    },
    { key: "P", description: "Pause task (when focused)", category: "Tasks" },
    { key: "N", description: "New task", category: "Tasks" },
    { key: "E", description: "Edit task (when focused)", category: "Tasks" },
    { key: "D", description: "Delete task (when focused)", category: "Tasks" },

    // Navigation
    { key: "⌘1-5", description: "Switch between tabs", category: "Navigation" },
    {
      key: "↑/↓",
      description: "Navigate through tasks",
      category: "Navigation",
    },

    // Voice
    { key: "⌘Enter", description: "Start voice recording", category: "Voice" },
    { key: "Esc", description: "Cancel voice recording", category: "Voice" },

    // Search
    { key: "⌘F", description: "Focus search box", category: "Search" },
    { key: "⌘⇧F", description: "Open global search", category: "Search" },

    // Modal
    { key: "⌘↵", description: "Save/Submit", category: "Modal" },
    { key: "Esc", description: "Cancel/Close", category: "Modal" },

    // Audio
    { key: "⌘M", description: "Toggle audio feedback", category: "Audio" },
  ];

  get isOpen(): boolean {
    return this.modalOpen;
  }

  get allShortcuts(): Shortcut[] {
    return this.shortcuts;
  }

  get categorized(): Record<string, Shortcut[]> {
    const grouped: Record<string, Shortcut[]> = {};
    for (const shortcut of this.shortcuts) {
      if (!grouped[shortcut.category]) {
        grouped[shortcut.category] = [];
      }
      grouped[shortcut.category].push(shortcut);
    }
    return grouped;
  }

  open(): void {
    this.modalOpen = true;
  }

  close(): void {
    this.modalOpen = false;
  }

  toggle(): void {
    this.modalOpen = !this.modalOpen;
  }
}

export const shortcuts = new ShortcutsStore();

// Global keyboard listener
if (browser) {
  window.addEventListener("keydown", (e) => {
    // ⌘K or Ctrl+K
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      shortcuts.toggle();
    }
    // ? key (only if not in input field)
    else if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
      const target = e.target as HTMLElement;
      if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
        e.preventDefault();
        shortcuts.toggle();
      }
    }
    // Escape to close
    else if (e.key === "Escape" && shortcuts.isOpen) {
      e.preventDefault();
      shortcuts.close();
    }
  });
}
