/**
 * User Preferences Store
 * Investment mechanic for Hook Model - users teach the AI their preferences
 * Increases switching cost over time
 */

import { browser } from "$app/environment";

export interface UserPreferences {
  // People mapping (@peter → @peter-lawprint)
  peopleMapping: Record<string, string>;

  // Custom voice command shortcuts
  voiceCommands: Array<{
    phrase: string;
    action: string;
    target?: string;
  }>;

  // Profile completion
  profile: {
    warrenBuffettTop5?: string[];
    peakEnergyHours?: { start: number; end: number };
    preferredCoach?: string;
    completionPercentage: number;
  };

  // Activity tracking (for triggering "Teach the AI" prompts)
  activityCounts: {
    entriesCreated: number;
    voiceCommandsUsed: number;
    habitsCompleted: number;
    urgentTasksAdded: number;
  };

  // Learned patterns
  patterns: {
    commonPeople: string[];
    frequentPhrases: string[];
    preferredContexts: string[];
  };
}

const STORAGE_KEY = "amk-command-center-preferences";

// Default preferences
const defaultPreferences: UserPreferences = {
  peopleMapping: {},
  voiceCommands: [],
  profile: {
    completionPercentage: 0,
  },
  activityCounts: {
    entriesCreated: 0,
    voiceCommandsUsed: 0,
    habitsCompleted: 0,
    urgentTasksAdded: 0,
  },
  patterns: {
    commonPeople: [],
    frequentPhrases: [],
    preferredContexts: [],
  },
};

class UserPreferencesStore {
  private preferences = $state<UserPreferences>(defaultPreferences);

  constructor() {
    if (browser) {
      this.load();
    }
  }

  get current(): UserPreferences {
    return this.preferences;
  }

  /**
   * Load preferences from localStorage
   */
  load(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.preferences = { ...defaultPreferences, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error("Failed to load user preferences:", error);
    }
  }

  /**
   * Save preferences to localStorage
   */
  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.preferences));
    } catch (error) {
      console.error("Failed to save user preferences:", error);
    }
  }

  /**
   * Add person mapping
   */
  addPersonMapping(nickname: string, fullHandle: string): void {
    this.preferences.peopleMapping[nickname] = fullHandle;
    this.updateProfileCompletion();
    this.save();
  }

  /**
   * Add custom voice command
   */
  addVoiceCommand(phrase: string, action: string, target?: string): void {
    this.preferences.voiceCommands.push({ phrase, action, target });
    this.updateProfileCompletion();
    this.save();
  }

  /**
   * Set Warren Buffett Top 5
   */
  setWarrenBuffettTop5(tasks: string[]): void {
    this.preferences.profile.warrenBuffettTop5 = tasks.slice(0, 5);
    this.updateProfileCompletion();
    this.save();
  }

  /**
   * Set peak energy hours
   */
  setPeakEnergyHours(start: number, end: number): void {
    this.preferences.profile.peakEnergyHours = { start, end };
    this.updateProfileCompletion();
    this.save();
  }

  /**
   * Set preferred coach
   */
  setPreferredCoach(coach: string): void {
    this.preferences.profile.preferredCoach = coach;
    this.updateProfileCompletion();
    this.save();
  }

  /**
   * Increment activity counter
   */
  incrementActivity(activity: keyof UserPreferences["activityCounts"]): void {
    this.preferences.activityCounts[activity]++;
    this.save();
  }

  /**
   * Add pattern observation
   */
  addPattern(type: "people" | "phrase" | "context", value: string): void {
    const key =
      type === "people"
        ? "commonPeople"
        : type === "phrase"
          ? "frequentPhrases"
          : "preferredContexts";

    if (!this.preferences.patterns[key].includes(value)) {
      this.preferences.patterns[key].push(value);
      this.save();
    }
  }

  /**
   * Calculate profile completion percentage
   */
  private updateProfileCompletion(): void {
    let completed = 0;
    let total = 7;

    if (Object.keys(this.preferences.peopleMapping).length > 0) completed++;
    if (this.preferences.voiceCommands.length > 0) completed++;
    if (this.preferences.profile.warrenBuffettTop5) completed++;
    if (this.preferences.profile.peakEnergyHours) completed++;
    if (this.preferences.profile.preferredCoach) completed++;
    if (this.preferences.activityCounts.entriesCreated >= 3) completed++;
    if (this.preferences.activityCounts.habitsCompleted >= 10) completed++;

    this.preferences.profile.completionPercentage = Math.round(
      (completed / total) * 100,
    );
  }

  /**
   * Check if should show "Teach the AI" prompt
   */
  shouldShowTeachPrompt(type: "person" | "phrase" | "profile"): boolean {
    switch (type) {
      case "person":
        // After 3rd entry and common person detected
        return (
          this.preferences.activityCounts.entriesCreated >= 3 &&
          this.preferences.patterns.commonPeople.length > 0 &&
          Object.keys(this.preferences.peopleMapping).length <
            this.preferences.patterns.commonPeople.length
        );

      case "phrase":
        // After 10th voice command and frequent phrase detected
        return (
          this.preferences.activityCounts.voiceCommandsUsed >= 10 &&
          this.preferences.patterns.frequentPhrases.length > 0 &&
          this.preferences.voiceCommands.length < 3
        );

      case "profile":
        // Show at 50%, 70%, 90% completion milestones
        const percentage = this.preferences.profile.completionPercentage;
        return percentage === 50 || percentage === 70 || percentage === 90;

      default:
        return false;
    }
  }

  /**
   * Get next teaching opportunity
   */
  getNextTeachingPrompt(): {
    type: string;
    message: string;
    options: string[];
  } | null {
    // Check for person mapping opportunity
    if (this.shouldShowTeachPrompt("person")) {
      const person = this.preferences.patterns.commonPeople.find(
        (p) => !this.preferences.peopleMapping[p],
      );
      if (person) {
        return {
          type: "person",
          message: `I notice you mention @${person} often. Help me learn:`,
          options: [
            `@${person} = @${person}-lawprint?`,
            `@${person} = Different person?`,
          ],
        };
      }
    }

    // Check for phrase shortcut opportunity
    if (this.shouldShowTeachPrompt("phrase")) {
      const phrase = this.preferences.patterns.frequentPhrases[0];
      if (phrase) {
        return {
          type: "phrase",
          message: `You say "${phrase}" a lot. Should I treat that as a shortcut?`,
          options: [
            "Yes, add to urgent tasks",
            "Yes, start morning ritual",
            "No, just capture it",
          ],
        };
      }
    }

    // Check for profile completion prompts
    if (this.shouldShowTeachPrompt("profile")) {
      const percentage = this.preferences.profile.completionPercentage;

      if (percentage === 50 && !this.preferences.profile.warrenBuffettTop5) {
        return {
          type: "profile",
          message:
            "50% complete! Add your Warren Buffett Top 5 for personalized insights.",
          options: ["Set Top 5 Now", "Remind me later"],
        };
      }

      if (percentage === 70 && !this.preferences.profile.peakEnergyHours) {
        return {
          type: "profile",
          message:
            "70% complete! Set your peak energy hours for smart reminders.",
          options: ["Set Hours Now", "Remind me later"],
        };
      }

      if (percentage === 90 && !this.preferences.profile.preferredCoach) {
        return {
          type: "profile",
          message:
            "90% complete! Choose your preferred coach for better guidance.",
          options: ["Choose Coach Now", "Remind me later"],
        };
      }
    }

    return null;
  }
}

export const userPreferences = new UserPreferencesStore();
