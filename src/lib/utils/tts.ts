/**
 * Text-to-Speech utility using Web Speech API
 * Provides audio feedback for voice-first interface
 */

export type SpeechPriority = "low" | "medium" | "high";

interface SpeechOptions {
  priority?: SpeechPriority;
  rate?: number; // 0.1 to 10
  pitch?: number; // 0 to 2
  volume?: number; // 0 to 1
}

let speechEnabled = true;

/**
 * Speak text using Web Speech API
 */
export function speak(
  text: string,
  priority: SpeechPriority = "medium",
  options: SpeechOptions = {},
): void {
  if (
    !speechEnabled ||
    typeof window === "undefined" ||
    !window.speechSynthesis
  ) {
    return;
  }

  // Cancel lower priority speech if speaking
  if (window.speechSynthesis.speaking) {
    if (priority === "high") {
      window.speechSynthesis.cancel();
    } else {
      return; // Don't interrupt current speech
    }
  }

  const utterance = new SpeechSynthesisUtterance(text);

  // Apply options
  utterance.rate = options.rate ?? 1.0;
  utterance.pitch = options.pitch ?? 1.0;
  utterance.volume = options.volume ?? 1.0;

  // Priority affects rate
  if (priority === "high") {
    utterance.rate = 1.1;
  } else if (priority === "low") {
    utterance.rate = 0.9;
  }

  window.speechSynthesis.speak(utterance);
}

/**
 * Stop current speech
 */
export function stopSpeaking(): void {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Enable/disable speech globally
 */
export function setSpeechEnabled(enabled: boolean): void {
  speechEnabled = enabled;
  if (!enabled) {
    stopSpeaking();
  }
}

/**
 * Check if speech is available
 */
export function isSpeechAvailable(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}
