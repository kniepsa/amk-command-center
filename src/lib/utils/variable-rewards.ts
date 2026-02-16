/**
 * Variable Reward System (Nir Eyal Hook Model)
 *
 * Rotating completion messages to prevent habituation.
 * Random selection creates dopamine spike (variable reward).
 * Milestone celebrations amplify reward.
 */

export interface RewardMessage {
  content: string;
  emoji?: string;
}

/**
 * Base completion messages (rotate randomly)
 */
const COMPLETION_MESSAGES: RewardMessage[] = [
  { content: "Beautiful start! Today's going to be great.", emoji: "✨" },
  { content: "You're on fire! Keep that momentum going.", emoji: "🔥" },
  { content: "Love your focus. Let's make it count.", emoji: "🎯" },
  { content: "Powerful priorities. You know what matters.", emoji: "💪" },
  { content: "That's the energy! Let's build on this.", emoji: "⚡" },
  { content: "Strong start. You're setting the tone.", emoji: "🚀" },
  { content: "Intentional and clear. Exactly right.", emoji: "🎨" }
];

/**
 * Milestone celebrations (override random selection)
 */
const MILESTONE_REWARDS: Record<number, RewardMessage> = {
  7: { content: "🎉 7-DAY STREAK! You're building a real habit here.", emoji: "🏆" },
  14: { content: "🔥 TWO WEEKS! Most people quit by now. Not you.", emoji: "💎" },
  30: { content: "⭐ 30 DAYS! You've transformed your mornings.", emoji: "👑" },
  50: { content: "🚀 50 DAYS! This is legendary consistency.", emoji: "🦅" },
  100: { content: "💯 CENTURY CLUB! You're in the top 1% now.", emoji: "🏅" },
  365: { content: "🎊 ONE FULL YEAR! Habits don't get stronger than this.", emoji: "🌟" }
};

/**
 * Encouragement for broken streaks ("Never miss twice" - James Clear)
 */
const RECOVERY_MESSAGES: RewardMessage[] = [
  { content: "You had a 44-day streak. One miss doesn't erase that. Let's go.", emoji: "💪" },
  { content: "Missing once is life. Missing twice is a choice. You're back.", emoji: "🔄" },
  { content: "The comeback is always stronger than the setback.", emoji: "⚡" },
  { content: "Champions don't quit after one miss. Restart mode: ON.", emoji: "🎯" }
];

/**
 * Get variable reward message
 *
 * Priority order:
 * 1. Milestone celebration (if streak matches milestone)
 * 2. Recovery message (if streak was broken)
 * 3. Random completion message
 *
 * @param currentStreak - Current consecutive days
 * @param previousStreak - Previous streak before break (0 if no break)
 * @returns Reward message
 */
export function getRewardMessage(
  currentStreak: number = 1,
  previousStreak: number = 0
): RewardMessage {
  // Check for milestone
  if (MILESTONE_REWARDS[currentStreak]) {
    return MILESTONE_REWARDS[currentStreak];
  }

  // Check for recovery (broken streak)
  if (previousStreak > 7 && currentStreak <= 2) {
    const randomIndex = Math.floor(Math.random() * RECOVERY_MESSAGES.length);
    return RECOVERY_MESSAGES[randomIndex];
  }

  // Default: Random completion message (variable reward)
  const randomIndex = Math.floor(Math.random() * COMPLETION_MESSAGES.length);
  return COMPLETION_MESSAGES[randomIndex];
}

/**
 * Get next milestone and days until it
 */
export function getNextMilestone(currentStreak: number): { days: number; milestone: number } {
  const milestones = Object.keys(MILESTONE_REWARDS).map(Number).sort((a, b) => a - b);

  for (const milestone of milestones) {
    if (currentStreak < milestone) {
      return {
        days: milestone - currentStreak,
        milestone
      };
    }
  }

  // If past all milestones, return next century
  const nextCentury = Math.ceil(currentStreak / 100) * 100;
  return {
    days: nextCentury - currentStreak,
    milestone: nextCentury
  };
}
