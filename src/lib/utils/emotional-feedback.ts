/**
 * Emotional Design Layer
 * Makes the app feel human, not robotic (Joe Gebbia UX principle)
 */

import { speak } from "./tts";
import { showToast } from "./toast";

export interface UserContext {
  sleepHours?: number;
  energy?: "high" | "medium" | "low" | "drained";
  currentStreak?: number;
  missedHabits?: number;
  timeOfDay?: "morning" | "afternoon" | "evening" | "night";
}

/**
 * Welcome ritual - personalized greeting based on context
 */
export function welcomeRitual(userName: string, context: UserContext): void {
  const { sleepHours, energy, timeOfDay } = context;

  let greeting = "";
  let energyComment = "";

  // Time-based greeting
  switch (timeOfDay) {
    case "morning":
      greeting = `Morning ${userName}, ready to crush today?`;
      break;
    case "afternoon":
      greeting = `Hey ${userName}, how's the day going?`;
      break;
    case "evening":
      greeting = `Evening ${userName}, let's wrap up strong!`;
      break;
    case "night":
      greeting = `Late night, ${userName}?`;
      break;
    default:
      greeting = `Hey ${userName}!`;
  }

  // Energy-based comment
  if (sleepHours !== undefined) {
    if (sleepHours >= 8) {
      energyComment = ` You slept ${sleepHours}h - energy should be high!`;
    } else if (sleepHours >= 6) {
      energyComment = ` You slept ${sleepHours}h - not bad!`;
    } else {
      energyComment = ` Only ${sleepHours}h sleep - take it easy today.`;
    }
  } else if (energy) {
    switch (energy) {
      case "high":
        energyComment = " You're feeling energized!";
        break;
      case "medium":
        energyComment = " Solid energy today.";
        break;
      case "low":
        energyComment = " Low energy? Let's keep it simple.";
        break;
      case "drained":
        energyComment = " Feeling drained? Just pick ONE thing to win today.";
        break;
    }
  }

  const message = greeting + energyComment;
  speak(message, "medium");
  showToast(message, "info", { duration: 4000 });
}

/**
 * Celebration moment - triggered on milestones
 */
export function celebrateMilestone(milestone: string, streak?: number): void {
  const celebrations: Record<string, { message: string; emoji: string }> = {
    "7-day-streak": {
      message: `7 days! You're unstoppable! 🔥`,
      emoji: "🔥",
    },
    "30-day-streak": {
      message: `30 days! You're a habit machine! ⚡`,
      emoji: "⚡",
    },
    "100-tasks": {
      message: `100 tasks completed! Productivity beast! 💪`,
      emoji: "💪",
    },
    "first-review": {
      message: `First weekly review done! Strategic thinker! 🧠`,
      emoji: "🧠",
    },
    "profile-complete": {
      message: `Profile 100% complete! The AI knows you well! 🌟`,
      emoji: "🌟",
    },
  };

  const celebration = celebrations[milestone];
  if (!celebration) return;

  // Visual celebration
  showToast(celebration.message, "success", {
    duration: 5000,
    position: "top-center",
  });

  // Audio celebration
  speak(celebration.message, "high");

  // Confetti animation
  triggerCelebrationConfetti();
}

/**
 * Empathy on hard days - supportive messages
 */
export function showEmpathy(context: UserContext): void {
  const { energy, missedHabits, sleepHours } = context;

  // Low energy + missed habits
  if (energy === "drained" || energy === "low") {
    if (missedHabits && missedHabits > 3) {
      const message =
        "Tough day? Let's just pick ONE thing to win today. Small wins count.";
      speak(message, "medium", { rate: 0.9 });
      showToast(message, "info", { duration: 5000 });
      return;
    }
  }

  // Poor sleep
  if (sleepHours !== undefined && sleepHours < 5) {
    const message = `${sleepHours}h sleep is rough. Be kind to yourself today - survival mode is okay.`;
    speak(message, "medium", { rate: 0.9 });
    showToast(message, "warning", { duration: 5000 });
    return;
  }

  // Missed multiple days
  if (missedHabits && missedHabits > 7) {
    const message = "Welcome back! No judgment - every day is a fresh start.";
    speak(message, "medium");
    showToast(message, "info", { duration: 4000 });
  }
}

/**
 * Coach personality - friendly, not robotic
 */
export function coachMessage(
  type: "pattern" | "suggestion" | "insight",
  message: string,
): string {
  // Add personality to messages
  const intros = [
    "Hey, I noticed something! ",
    "Quick observation: ",
    "Interesting pattern here: ",
    "Check this out: ",
  ];

  const outros = [
    " Coincidence? 🤔",
    " Worth exploring?",
    " What do you think?",
    " Just saying! 😊",
  ];

  const intro = intros[Math.floor(Math.random() * intros.length)];

  switch (type) {
    case "pattern":
      return intro + message + outros[0];
    case "suggestion":
      return intro + message + outros[1];
    case "insight":
      return intro + message + outros[2];
    default:
      return message;
  }
}

/**
 * Personalized prediction
 */
export function showPrediction(context: UserContext): void {
  const { sleepHours, energy, timeOfDay } = context;

  let prediction = "";

  if (sleepHours !== undefined) {
    if (sleepHours < 6) {
      prediction = `Based on your sleep (${sleepHours}h), I predict low-medium energy today. Let's plan accordingly.`;
    } else if (sleepHours >= 8) {
      prediction = `Based on your sleep (${sleepHours}h), I predict high energy today. Time to tackle hard tasks!`;
    }
  } else if (energy) {
    if (energy === "high" && timeOfDay === "morning") {
      prediction =
        "High energy morning! Perfect for deep work. Block 90 minutes for your top priority.";
    } else if (energy === "low" && timeOfDay === "afternoon") {
      prediction =
        "Low energy afternoon. Good time for admin tasks and meetings, not deep work.";
    }
  }

  if (prediction) {
    speak(prediction, "medium");
    showToast(prediction, "info", { duration: 5000 });
  }
}

/**
 * Context-aware encouragement
 */
export function encourage(action: string): void {
  const encouragements: Record<string, string[]> = {
    "habit-complete": [
      "Nice! One step closer.",
      "Boom! Keep it rolling.",
      "Yes! That's how it's done.",
      "Crushing it! 💪",
    ],
    "task-complete": [
      "Done! Moving the needle.",
      "Progress! 📈",
      "Another one down!",
      "Productivity beast! 🔥",
    ],
    "entry-saved": [
      "Saved! Your future self will thank you.",
      "Captured! Brain can relax now.",
      "Logged! Data is power.",
      "Nice work! 📝",
    ],
  };

  const messages = encouragements[action];
  if (messages) {
    const message = messages[Math.floor(Math.random() * messages.length)];
    showToast(message, "success", { duration: 2000 });

    // 50% chance of audio (not every time)
    if (Math.random() < 0.5) {
      speak(message, "medium");
    }
  }
}

/**
 * Confetti animation for celebrations
 */
function triggerCelebrationConfetti(): void {
  const colors = [
    "#00D9FF",
    "#FF6B6B",
    "#4ECDC4",
    "#FFE66D",
    "#A8E6CF",
    "#FF69B4",
  ];
  const confettiCount = 100;

  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement("div");
    confetti.style.position = "fixed";
    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.top = "-10px";
    confetti.style.width = "10px";
    confetti.style.height = "10px";
    confetti.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
    confetti.style.zIndex = "10000";
    confetti.style.pointerEvents = "none";
    confetti.style.animation = `confetti-fall ${2 + Math.random() * 2}s ease-out ${Math.random() * 0.5}s`;

    document.body.appendChild(confetti);

    setTimeout(() => confetti.remove(), 5000);
  }

  // Add animation keyframes if not present
  if (!document.getElementById("confetti-animation")) {
    const style = document.createElement("style");
    style.id = "confetti-animation";
    style.textContent = `
      @keyframes confetti-fall {
        0% {
          transform: translateY(-10px) rotate(0deg);
          opacity: 1;
        }
        100% {
          transform: translateY(100vh) rotate(720deg);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * Get time of day
 */
export function getTimeOfDay(): "morning" | "afternoon" | "evening" | "night" {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}
