/**
 * AMK Command Center - Brand Identity
 *
 * P&G-Inspired Premium Brand Strategy:
 * - Personality: Your trusted AI partner who understands you
 * - Promise: Effortless productivity through intelligent AI
 * - Positioning: Premium AI-first command center for entrepreneurs
 */

export const BRAND = {
  // Core Brand Identity
  name: "Nexus AI",
  tagline: "Your AI Productivity Partner",
  promise: "Speak naturally. AI does the rest.",

  // Brand Personality (P&G Framework)
  personality: {
    intelligent: "Understands German & English naturally",
    proactive: "Anticipates your needs before you ask",
    trustworthy: "Your private AI - data never leaves your control",
    empowering: "Amplifies your capabilities, doesn't replace you",
    warm: "Supportive partner, not cold robot",
  },

  // Voice & Tone Guidelines
  voice: {
    doVoice: [
      "Use conversational, warm language",
      "Emphasize AI intelligence ('AI understood', 'AI extracted')",
      "Frame AI as partner/assistant, not tool",
      "Celebrate small wins (confetti, positive feedback)",
      "Be specific about what AI does ('AI detected gratitude in German')",
    ],
    dontVoice: [
      "Avoid robotic/technical jargon unless necessary",
      "Never say 'error' - say 'AI needs clarification'",
      "Don't use passive voice ('data was extracted')",
      "Avoid generic tech terms ('processing', 'loading')",
    ],
  },

  // AI-Centric Messaging
  aiAngle: {
    hero: "AI that speaks your language—literally",
    voiceRecording: "AI is listening and learning",
    extraction: "AI intelligence at work",
    confidence: {
      high: "AI is highly confident",
      medium: "AI understood most of it",
      low: "AI needs your help to clarify",
    },
    emptyStates: {
      noData: "Start talking—AI will capture everything automatically",
      noHabits: "Tell AI what you did today",
      noGratitude: "Share what you're grateful for—AI will remember",
    },
  },

  // Premium Product Copy (P&G Standard)
  copy: {
    header: {
      title: "Nexus AI",
      subtitle: "AI-powered command center for ambitious entrepreneurs",
    },
    tabs: {
      today: {
        label: "Daily AI",
        description: "Your AI partner for today's priorities",
      },
      crm: {
        label: "People Intelligence",
        description: "AI tracks every relationship automatically",
      },
      weekly: {
        label: "Weekly Strategy",
        description: "AI-guided planning & priorities",
      },
      strategic: {
        label: "Strategic AI",
        description: "Long-term intelligence & insights",
      },
    },
    voice: {
      idle: "Tap to talk—AI understands German & English",
      recording: "AI is listening...",
      transcribing: "AI is transcribing your voice...",
      extracting: "AI is extracting insights...",
      success: "AI captured everything!",
      error: "AI needs you to try again",
    },
    autoSave: {
      saving: "AI is saving...",
      saved: "AI saved your work",
      lastSaved: "Last saved by AI",
    },
    habits: {
      title: "Daily Wins",
      subtitle: "AI tracks your Blueprint habits automatically",
      completed: "AI celebrates with you! 🎉",
    },
    extraction: {
      title: "AI Intelligence Dashboard",
      subtitle: "What AI understood from your conversation",
      confidence: {
        high: "AI is {percent}% confident—looks great!",
        medium: "AI is {percent}% confident—review the details",
        low: "AI is only {percent}% confident—please verify",
      },
    },
  },

  // Visual Brand Elements
  visual: {
    aiIndicators: {
      listening: "🎤 AI Listening",
      thinking: "🧠 AI Thinking",
      extracting: "✨ AI Extracting",
      confident: "✓ AI Confident",
      learning: "📚 AI Learning",
    },
    animations: {
      pulse: "Breathing AI pulse during recording",
      confetti: "Celebration when habits completed",
      shimmer: "Subtle shimmer on AI-extracted content",
    },
  },

  // Onboarding & First-Time Experience
  onboarding: {
    step1: {
      title: "Meet Your AI Partner",
      description:
        "Nexus AI understands German and English naturally—just speak as you normally would.",
    },
    step2: {
      title: "AI Does the Heavy Lifting",
      description:
        "AI automatically extracts habits, gratitude, tasks, people, and insights from your voice.",
    },
    step3: {
      title: "Your Data, Your Control",
      description:
        "All AI processing happens securely. Your journal never leaves your control.",
    },
  },
} as const;

// Utility Functions
export function getAIConfidenceMessage(confidence: number): string {
  if (confidence >= 0.8) {
    return BRAND.copy.extraction.confidence.high.replace(
      "{percent}",
      Math.round(confidence * 100).toString(),
    );
  } else if (confidence >= 0.5) {
    return BRAND.copy.extraction.confidence.medium.replace(
      "{percent}",
      Math.round(confidence * 100).toString(),
    );
  } else {
    return BRAND.copy.extraction.confidence.low.replace(
      "{percent}",
      Math.round(confidence * 100).toString(),
    );
  }
}

export function getVoiceStateMessage(
  state:
    | "idle"
    | "recording"
    | "transcribing"
    | "extracting"
    | "success"
    | "error",
): string {
  return BRAND.copy.voice[state];
}

export function getAIIndicator(
  state: keyof typeof BRAND.visual.aiIndicators,
): string {
  return BRAND.visual.aiIndicators[state];
}
