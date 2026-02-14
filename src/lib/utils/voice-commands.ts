/**
 * Voice Command System
 * Provides 90%+ coverage of app functionality via voice
 *
 * Usage:
 * ```typescript
 * import { processVoiceCommand, startVoiceListening } from '$lib/utils/voice-commands';
 *
 * const result = await processVoiceCommand("mark running complete");
 * if (result.success) {
 *   console.log(result.action, result.params);
 * }
 * ```
 */

import {
  handleUndoCommand,
  handleRepeatConfirmation,
  handleCancelCommand,
} from "./voice-undo-handler";

export interface VoiceCommand {
  regex: RegExp;
  action: string;
  description: string;
  category:
    | "habit"
    | "navigation"
    | "task"
    | "context"
    | "error-recovery"
    | "weekly-review"
    | "entry"
    | "settings"
    | "help";
  examples: string[];
  handler?: (
    match: RegExpMatchArray,
    context: VoiceContext,
  ) => Promise<CommandResult> | CommandResult;
}

export interface VoiceContext {
  currentPage?: string;
  currentDate?: string;
  habits?: any[];
  tasks?: any[];
  lastAction?: Action;
  user?: {
    name?: string;
    timezone?: string;
  };
}

export interface CommandResult {
  success: boolean;
  action: string;
  params?: any;
  message?: string;
  error?: string;
  needsConfirmation?: boolean;
  confirmationMessage?: string;
}

export interface Action {
  id: string;
  type: string;
  timestamp: Date;
  description: string;
  data: any;
}

/**
 * Complete voice command registry with 90%+ app coverage
 */
export const voiceCommands: VoiceCommand[] = [
  // ============ HABIT TRACKING ============
  {
    regex: /^mark (.*?) (complete|done)$/i,
    action: "toggle-habit",
    description: "Mark a single habit as complete",
    category: "habit",
    examples: ["mark running complete", "mark sauna done"],
  },
  {
    regex: /^mark (.*?),\s*(.*?),?\s*and (.*?) (complete|done)$/i,
    action: "toggle-multiple-habits",
    description: "Mark multiple habits as complete in one command",
    category: "habit",
    examples: ["mark running, sauna, and journaling complete"],
  },
  {
    regex: /^mark all habits (complete|done)$/i,
    action: "toggle-all-habits",
    description: "Mark all habits as complete",
    category: "habit",
    examples: ["mark all habits complete", "mark all habits done"],
  },
  {
    regex: /^clear (.*?)$/i,
    action: "clear-habit",
    description: "Clear/unmark a habit",
    category: "habit",
    examples: ["clear running", "clear sauna"],
  },

  // ============ NAVIGATION ============
  {
    regex:
      /^(show|go to|open) (daily|today|urgent|people|crm|metrics|settings|weekly|strategic) (tab|page)?$/i,
    action: "navigate-tab",
    description: "Navigate to different tabs",
    category: "navigation",
    examples: ["show daily tab", "go to urgent", "open people"],
  },
  {
    regex: /^go to yesterday$/i,
    action: "navigate-previous",
    description: "Go to previous day",
    category: "navigation",
    examples: ["go to yesterday"],
  },
  {
    regex: /^(next day|tomorrow)$/i,
    action: "navigate-next",
    description: "Go to next day",
    category: "navigation",
    examples: ["next day", "tomorrow"],
  },
  {
    regex: /^go to (today|now)$/i,
    action: "navigate-today",
    description: "Return to today",
    category: "navigation",
    examples: ["go to today", "go to now"],
  },
  {
    regex:
      /^go to (monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/i,
    action: "navigate-day",
    description: "Navigate to specific day of week",
    category: "navigation",
    examples: ["go to monday", "go to friday"],
  },

  // ============ CONTEXT SWITCHING (GTD) ============
  {
    regex:
      /^(show|filter by) (calls|online|office|home|errands|anywhere|waiting) (context|tasks)?$/i,
    action: "filter-context",
    description: "Filter tasks by GTD context",
    category: "context",
    examples: ["show calls context", "filter by office", "show home tasks"],
  },
  {
    regex: /^(show all|clear filter)( tasks)?$/i,
    action: "clear-filter",
    description: "Show all tasks (clear context filter)",
    category: "context",
    examples: ["show all tasks", "clear filter"],
  },

  // ============ TASK MANAGEMENT ============
  {
    regex: /^complete (first|next|last) task$/i,
    action: "complete-task-ordinal",
    description: "Complete task by position",
    category: "task",
    examples: [
      "complete first task",
      "complete next task",
      "complete last task",
    ],
  },
  {
    regex: /^complete (.*?) task$/i,
    action: "complete-task-by-name",
    description: "Complete task by name",
    category: "task",
    examples: ["complete call peter task"],
  },
  {
    regex: /^add (.*?) (to urgent|as urgent|as high priority)$/i,
    action: "add-urgent-task",
    description: "Add new urgent task",
    category: "task",
    examples: ["add call leon to urgent", "add review deck as urgent"],
  },
  {
    regex: /^add (.*?) as (high|medium|low) priority$/i,
    action: "add-task-with-priority",
    description: "Add task with specific priority",
    category: "task",
    examples: ["add send email as medium priority"],
  },
  {
    regex: /^(show|what are) my top (three|five|3|5)( priorities)?$/i,
    action: "show-priority-picker",
    description: "Show priority picker for Warren Buffett 25/5",
    category: "task",
    examples: ["show my top three", "what are my top 5 priorities"],
  },
  {
    regex: /^delete (.*?) task$/i,
    action: "delete-task",
    description: "Delete a task",
    category: "task",
    examples: ["delete call peter task"],
  },

  // ============ ERROR RECOVERY ============
  {
    regex: /^(undo|that was wrong|oops|mistake)$/i,
    action: "undo-last",
    description: "Undo the last action",
    category: "error-recovery",
    examples: ["undo", "that was wrong", "oops"],
    handler: handleUndoCommand,
  },
  {
    regex: /^(repeat that|what did i just do|what happened)$/i,
    action: "repeat-last-confirmation",
    description: "Repeat the last confirmation message",
    category: "error-recovery",
    examples: ["repeat that", "what did i just do"],
    handler: handleRepeatConfirmation,
  },
  {
    regex: /^(start over|cancel|never mind)$/i,
    action: "cancel-current-action",
    description: "Cancel current multi-step action",
    category: "error-recovery",
    examples: ["start over", "cancel", "never mind"],
    handler: handleCancelCommand,
  },

  // ============ CONTEXT-AWARE FOLLOW-UPS ============
  {
    regex: /^and (.*?)$/i,
    action: "continue-last-action",
    description:
      'Continue previous action with new item (e.g., "mark running" → "and sauna")',
    category: "habit",
    examples: ["and sauna", "and journaling"],
  },
  {
    regex: /^another one$/i,
    action: "repeat-last-action-pattern",
    description: "Repeat the same action pattern",
    category: "task",
    examples: ["another one"],
  },
  {
    regex: /^same for (.*)$/i,
    action: "apply-to-different-item",
    description: "Apply last action to different item",
    category: "task",
    examples: ["same for call leon"],
  },

  // ============ WEEKLY REVIEW ============
  {
    regex: /^start weekly review$/i,
    action: "start-weekly-review",
    description: "Start the weekly review ritual",
    category: "weekly-review",
    examples: ["start weekly review"],
  },
  {
    regex: /^(this week|delegate|someday|parking lot|drop) for (.+)$/i,
    action: "categorize-inbox-item",
    description: "Categorize inbox item during weekly review",
    category: "weekly-review",
    examples: [
      "this week for call peter",
      "delegate for review contracts",
      "drop for old task",
    ],
  },
  {
    regex: /^skip( this one| task)?$/i,
    action: "skip-inbox-item",
    description: "Skip current inbox item in review",
    category: "weekly-review",
    examples: ["skip", "skip this one", "skip task"],
  },
  {
    regex: /^(next step|continue|move on)$/i,
    action: "next-review-step",
    description: "Move to next step in weekly review",
    category: "weekly-review",
    examples: ["next step", "continue", "move on"],
  },

  // ============ ENTRY CREATION ============
  {
    regex: /^start (morning|evening) (ritual|routine)$/i,
    action: "start-ritual",
    description: "Start morning or evening ritual",
    category: "entry",
    examples: ["start morning ritual", "start evening routine"],
  },
  {
    regex: /^my energy is (high|medium|low|drained)$/i,
    action: "set-energy",
    description: "Set energy level for today",
    category: "entry",
    examples: ["my energy is high", "my energy is low"],
  },
  {
    regex: /^i slept (.*?) hours?$/i,
    action: "set-sleep-duration",
    description: "Log sleep duration",
    category: "entry",
    examples: ["i slept 8 hours", "i slept 7.5 hours"],
  },
  {
    regex: /^add intention[:\s]+(.*)$/i,
    action: "add-intention",
    description: "Add daily intention",
    category: "entry",
    examples: [
      "add intention: focus on sales calls",
      "add intention close leon deal",
    ],
  },
  {
    regex: /^i('m| am) grateful for (.*)$/i,
    action: "add-gratitude",
    description: "Add gratitude entry",
    category: "entry",
    examples: ["i'm grateful for family time", "i am grateful for good sleep"],
  },

  // ============ SETTINGS ============
  {
    regex: /^turn (on|off) (audio feedback|voice feedback|sound)$/i,
    action: "toggle-audio",
    description: "Toggle audio feedback on/off",
    category: "settings",
    examples: ["turn on audio feedback", "turn off sound"],
  },
  {
    regex: /^turn (on|off) notifications$/i,
    action: "toggle-notifications",
    description: "Toggle notifications on/off",
    category: "settings",
    examples: ["turn on notifications", "turn off notifications"],
  },
  {
    regex: /^(show|open) settings$/i,
    action: "navigate-settings",
    description: "Open settings page",
    category: "settings",
    examples: ["show settings", "open settings"],
  },

  // ============ HELP ============
  {
    regex: /^(what can i say|help|commands|show commands)$/i,
    action: "show-voice-help",
    description: "Show voice help modal with all commands",
    category: "help",
    examples: ["what can i say", "help", "commands"],
  },
  {
    regex: /^how do i (.*)$/i,
    action: "voice-help-for-task",
    description: "Get help for specific task",
    category: "help",
    examples: ["how do i add a task", "how do i complete habits"],
  },
];

/**
 * Process a voice command and return action to perform
 */
export async function processVoiceCommand(
  transcript: string,
  context: VoiceContext = {},
): Promise<CommandResult> {
  const normalized = transcript.trim().toLowerCase();

  // Try each command pattern
  for (const command of voiceCommands) {
    const match = normalized.match(command.regex);
    if (match) {
      // If command has custom handler, use it
      if (command.handler) {
        return await command.handler(match, context);
      }

      // Default handler: extract parameters
      return {
        success: true,
        action: command.action,
        params: extractParams(command.action, match, context),
        message: `Executing: ${command.description}`,
      };
    }
  }

  // No match found
  return {
    success: false,
    action: "unknown",
    error: `I didn't understand "${transcript}". Say "help" to see available commands.`,
  };
}

/**
 * Extract parameters from regex match based on action type
 */
function extractParams(
  action: string,
  match: RegExpMatchArray,
  context: VoiceContext,
): any {
  switch (action) {
    case "toggle-habit":
      return { habitName: match[1].trim() };

    case "toggle-multiple-habits":
      return {
        habitNames: [match[1].trim(), match[2].trim(), match[3].trim()],
      };

    case "navigate-tab":
      return { tab: match[2].trim() };

    case "navigate-day":
      return { day: match[1].trim() };

    case "filter-context":
      return { context: match[2].trim() };

    case "complete-task-ordinal":
      return { position: match[1].trim() };

    case "complete-task-by-name":
      return { taskName: match[1].trim() };

    case "add-urgent-task":
      return { taskTitle: match[1].trim() };

    case "add-task-with-priority":
      return { taskTitle: match[1].trim(), priority: match[2].trim() };

    case "categorize-inbox-item":
      return { category: match[1].trim(), itemName: match[2].trim() };

    case "start-ritual":
      return { ritualType: match[1].trim() };

    case "set-energy":
      return { energy: match[1].trim() };

    case "set-sleep-duration":
      return { duration: parseFloat(match[1]) };

    case "add-intention":
      return { intention: match[1].trim() };

    case "add-gratitude":
      return { gratitude: match[2].trim() };

    case "toggle-audio":
    case "toggle-notifications":
      return { enabled: match[1].trim() === "on" };

    case "voice-help-for-task":
      return { task: match[1].trim() };

    case "continue-last-action":
      return {
        item: match[1].trim(),
        lastAction: context.lastAction,
      };

    default:
      return {};
  }
}

/**
 * Get commands by category for help system
 */
export function getCommandsByCategory(): Record<string, VoiceCommand[]> {
  const categories: Record<string, VoiceCommand[]> = {};

  for (const command of voiceCommands) {
    if (!categories[command.category]) {
      categories[command.category] = [];
    }
    categories[command.category].push(command);
  }

  return categories;
}

/**
 * Get category display names
 */
export function getCategoryDisplayName(category: string): string {
  const names: Record<string, string> = {
    habit: "Habit Tracking",
    navigation: "Navigation",
    task: "Task Management",
    context: "Context Filters (GTD)",
    "error-recovery": "Error Recovery",
    "weekly-review": "Weekly Review",
    entry: "Daily Entries",
    settings: "Settings",
    help: "Help",
  };

  return names[category] || category;
}

/**
 * Calculate voice coverage percentage
 */
export function calculateVoiceCoverage(): number {
  // Core features in the app
  const coreFeatures = [
    "habit-tracking",
    "task-management",
    "navigation",
    "context-filtering",
    "weekly-review",
    "entry-creation",
    "settings",
    "help",
    "error-recovery",
    "priority-picking",
  ];

  // Categories covered by voice commands
  const coveredCategories = new Set(voiceCommands.map((c) => c.category));

  // Map coverage
  const categoryToFeature: Record<string, string> = {
    habit: "habit-tracking",
    task: "task-management",
    navigation: "navigation",
    context: "context-filtering",
    "weekly-review": "weekly-review",
    entry: "entry-creation",
    settings: "settings",
    help: "help",
    "error-recovery": "error-recovery",
  };

  const coveredFeatures = new Set(
    Array.from(coveredCategories)
      .map((cat) => categoryToFeature[cat])
      .filter(Boolean),
  );

  return (coveredFeatures.size / coreFeatures.length) * 100;
}

/**
 * Text-to-Speech wrapper with priority levels
 */
export function speak(
  text: string,
  priority: "low" | "medium" | "high" = "medium",
): void {
  if (!("speechSynthesis" in window)) {
    console.warn("Text-to-speech not supported");
    return;
  }

  // Cancel low/medium priority if high priority comes in
  if (priority === "high") {
    window.speechSynthesis.cancel();
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.1; // Slightly faster for efficiency
  utterance.pitch = 1.0;

  // Set voice (prefer female voice for warmth)
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(
    (v) => v.name.includes("Samantha") || v.name.includes("Female"),
  );
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  window.speechSynthesis.speak(utterance);
}

/**
 * Speech recognition wrapper with error handling
 */
export async function listenForResponse(
  expectedResponses: string[],
  timeoutMs: number = 5000,
): Promise<string | null> {
  return new Promise((resolve, reject) => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      reject(new Error("Speech recognition not supported"));
      return;
    }

    // @ts-ignore
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    let resolved = false;

    // Timeout
    const timeout = setTimeout(() => {
      if (!resolved) {
        recognition.stop();
        resolve(null);
      }
    }, timeoutMs);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase().trim();

      // Check if matches expected responses
      for (const expected of expectedResponses) {
        if (transcript.includes(expected.toLowerCase())) {
          resolved = true;
          clearTimeout(timeout);
          recognition.stop();
          resolve(expected);
          return;
        }
      }

      // No match
      resolved = true;
      clearTimeout(timeout);
      recognition.stop();
      resolve(transcript);
    };

    recognition.onerror = (event: any) => {
      clearTimeout(timeout);
      reject(new Error(event.error));
    };

    recognition.start();
  });
}

/**
 * Continuous voice listening mode
 */
export class VoiceListener {
  private recognition: any;
  private isListening = false;
  private onCommand: (result: CommandResult) => void;
  private context: VoiceContext;

  constructor(
    onCommand: (result: CommandResult) => void,
    context: VoiceContext = {},
  ) {
    this.onCommand = onCommand;
    this.context = context;

    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      throw new Error("Speech recognition not supported");
    }

    // @ts-ignore
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = false;
    this.recognition.lang = "en-US";

    this.recognition.onresult = async (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      const result = await processVoiceCommand(transcript, this.context);
      this.onCommand(result);
    };

    this.recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
    };
  }

  start() {
    if (!this.isListening) {
      this.recognition.start();
      this.isListening = true;
    }
  }

  stop() {
    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  updateContext(context: VoiceContext) {
    this.context = { ...this.context, ...context };
  }
}
