/**
 * Achievements System - Unpredictable Unlockables
 * Trigger based on BEHAVIOR, not time (Nir Eyal Hook Model)
 */

import { browser } from "$app/environment";
import { celebrateMilestone } from "$lib/utils/emotional-feedback";
import { showToast } from "$lib/utils/toast";
import { speak } from "$lib/utils/tts";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
  trigger: {
    type: "behavior" | "milestone";
    condition: string;
    threshold?: number;
  };
  reward?: {
    type: "feature" | "badge" | "insight";
    value: string;
  };
}

const STORAGE_KEY = "amk-command-center-achievements";

// Achievement definitions
const achievementDefinitions: Achievement[] = [
  {
    id: "productivity-insights",
    title: "Productivity Insights Unlocked!",
    description: "Completed 10 urgent tasks",
    icon: "📊",
    unlocked: false,
    trigger: {
      type: "behavior",
      condition: "urgent-tasks-completed",
      threshold: 10,
    },
    reward: {
      type: "feature",
      value: "productivity-dashboard",
    },
  },
  {
    id: "energy-coach-badge",
    title: "Energy Coach Badge!",
    description: "Logged sleep for 5 consecutive days",
    icon: "⚡",
    unlocked: false,
    trigger: {
      type: "behavior",
      condition: "sleep-logged-days",
      threshold: 5,
    },
    reward: {
      type: "insight",
      value: "energy-patterns",
    },
  },
  {
    id: "strategic-dashboard",
    title: "Strategic Dashboard!",
    description: "Completed first weekly review",
    icon: "🎯",
    unlocked: false,
    trigger: {
      type: "milestone",
      condition: "first-weekly-review",
    },
    reward: {
      type: "feature",
      value: "strategic-tab",
    },
  },
  {
    id: "habit-master",
    title: "Habit Master!",
    description: "Maintained 7-day streak",
    icon: "🔥",
    unlocked: false,
    trigger: {
      type: "milestone",
      condition: "7-day-streak",
    },
    reward: {
      type: "badge",
      value: "habit-master",
    },
  },
  {
    id: "voice-wizard",
    title: "Voice Wizard!",
    description: "Used voice commands 25 times",
    icon: "🎤",
    unlocked: false,
    trigger: {
      type: "behavior",
      condition: "voice-commands-used",
      threshold: 25,
    },
    reward: {
      type: "feature",
      value: "advanced-voice-shortcuts",
    },
  },
  {
    id: "people-networker",
    title: "People Networker!",
    description: "Added 5 people to CRM",
    icon: "🤝",
    unlocked: false,
    trigger: {
      type: "behavior",
      condition: "people-added",
      threshold: 5,
    },
    reward: {
      type: "feature",
      value: "people-intelligence",
    },
  },
  {
    id: "century-club",
    title: "Century Club!",
    description: "Completed 100 tasks total",
    icon: "💯",
    unlocked: false,
    trigger: {
      type: "milestone",
      condition: "100-tasks-completed",
    },
    reward: {
      type: "badge",
      value: "century-club",
    },
  },
  {
    id: "ai-teacher",
    title: "AI Teacher!",
    description: "Taught AI 5 preferences",
    icon: "🧠",
    unlocked: false,
    trigger: {
      type: "behavior",
      condition: "preferences-taught",
      threshold: 5,
    },
    reward: {
      type: "insight",
      value: "personalized-predictions",
    },
  },
  {
    id: "morning-warrior",
    title: "Morning Warrior!",
    description: "Completed morning ritual 10 times",
    icon: "🌅",
    unlocked: false,
    trigger: {
      type: "behavior",
      condition: "morning-rituals-completed",
      threshold: 10,
    },
    reward: {
      type: "insight",
      value: "morning-patterns",
    },
  },
  {
    id: "decision-maker",
    title: "Decision Maker!",
    description: "Logged 5 decisions in decision journal",
    icon: "🎲",
    unlocked: false,
    trigger: {
      type: "behavior",
      condition: "decisions-logged",
      threshold: 5,
    },
    reward: {
      type: "feature",
      value: "decision-analytics",
    },
  },
];

class AchievementsStore {
  private achievements = $state<Achievement[]>(achievementDefinitions);

  constructor() {
    if (browser) {
      this.load();
    }
  }

  get all(): Achievement[] {
    return this.achievements;
  }

  get unlocked(): Achievement[] {
    return this.achievements.filter((a) => a.unlocked);
  }

  get locked(): Achievement[] {
    return this.achievements.filter((a) => !a.unlocked);
  }

  /**
   * Load achievements from localStorage
   */
  load(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const savedAchievements = JSON.parse(stored);
        this.achievements = this.achievements.map((achievement) => {
          const saved = savedAchievements.find(
            (s: Achievement) => s.id === achievement.id,
          );
          return saved ? { ...achievement, ...saved } : achievement;
        });
      }
    } catch (error) {
      console.error("Failed to load achievements:", error);
    }
  }

  /**
   * Save achievements to localStorage
   */
  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.achievements));
    } catch (error) {
      console.error("Failed to save achievements:", error);
    }
  }

  /**
   * Check if achievement should unlock
   */
  checkUnlock(condition: string, value: number): void {
    const achievement = this.achievements.find(
      (a) =>
        !a.unlocked &&
        a.trigger.condition === condition &&
        (a.trigger.threshold ?? 0) <= value,
    );

    if (achievement) {
      this.unlock(achievement.id);
    }
  }

  /**
   * Check milestone achievement
   */
  checkMilestone(milestone: string): void {
    const achievement = this.achievements.find(
      (a) => !a.unlocked && a.trigger.condition === milestone,
    );

    if (achievement) {
      this.unlock(achievement.id);
    }
  }

  /**
   * Unlock achievement
   */
  private unlock(achievementId: string): void {
    const achievement = this.achievements.find((a) => a.id === achievementId);
    if (!achievement || achievement.unlocked) return;

    achievement.unlocked = true;
    achievement.unlockedAt = new Date();

    // Save to localStorage
    this.save();

    // Trigger celebration
    this.celebrate(achievement);
  }

  /**
   * Celebrate unlocked achievement
   */
  private celebrate(achievement: Achievement): void {
    // Visual toast
    showToast(`${achievement.icon} ${achievement.title}`, "success", {
      duration: 5000,
      position: "top-center",
    });

    // Audio announcement
    speak(achievement.title, "high");

    // Milestone celebration (confetti)
    if (achievement.trigger.type === "milestone") {
      celebrateMilestone(achievement.id);
    }

    // Show reward message
    if (achievement.reward) {
      setTimeout(() => {
        const rewardMessage = this.getRewardMessage(achievement.reward);
        showToast(rewardMessage, "info", { duration: 4000 });
        speak(rewardMessage, "medium");
      }, 2000);
    }
  }

  /**
   * Get reward message
   */
  private getRewardMessage(reward: Achievement["reward"]): string {
    if (!reward) return "";

    switch (reward.type) {
      case "feature":
        return `New feature unlocked: ${this.formatFeatureName(reward.value)}`;
      case "badge":
        return `You earned the ${this.formatFeatureName(reward.value)} badge!`;
      case "insight":
        return `New insight available: ${this.formatFeatureName(reward.value)}`;
      default:
        return "Achievement unlocked!";
    }
  }

  /**
   * Format feature name for display
   */
  private formatFeatureName(value: string): string {
    return value
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  /**
   * Get achievement progress
   */
  getProgress(achievementId: string, currentValue: number): number {
    const achievement = this.achievements.find((a) => a.id === achievementId);
    if (!achievement || !achievement.trigger.threshold) return 0;

    return Math.min(
      100,
      Math.round((currentValue / achievement.trigger.threshold) * 100),
    );
  }

  /**
   * Get unlocked features
   */
  getUnlockedFeatures(): string[] {
    return this.unlocked
      .filter((a) => a.reward?.type === "feature")
      .map((a) => a.reward!.value);
  }

  /**
   * Check if feature is unlocked
   */
  isFeatureUnlocked(featureId: string): boolean {
    return this.getUnlockedFeatures().includes(featureId);
  }
}

export const achievements = new AchievementsStore();
