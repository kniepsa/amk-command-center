/**
 * Voice Undo Handler
 * Integrates action-history system with voice-commands
 */

import { undoLast, getLastAction } from "$lib/stores/action-history.svelte";
import type { CommandResult, VoiceContext } from "./voice-commands";

/**
 * Handle "undo" voice command
 */
export async function handleUndoCommand(
  match: RegExpMatchArray,
  context: VoiceContext,
): Promise<CommandResult> {
  const result = await undoLast();

  return {
    success: result.success,
    action: "undo-last",
    message: result.message,
    error: result.success ? undefined : result.message,
  };
}

/**
 * Handle "repeat that" / "what did I just do" voice command
 */
export function handleRepeatConfirmation(
  match: RegExpMatchArray,
  context: VoiceContext,
): CommandResult {
  const lastAction = getLastAction();

  if (lastAction) {
    return {
      success: true,
      action: "repeat-last-confirmation",
      message: lastAction.description,
      params: {
        timestamp: lastAction.timestamp,
        type: lastAction.type,
      },
    };
  } else {
    return {
      success: false,
      action: "repeat-last-confirmation",
      error: "No recent actions",
    };
  }
}

/**
 * Handle "cancel" / "never mind" voice command
 * (Placeholder for future multi-step cancellation)
 */
export function handleCancelCommand(
  match: RegExpMatchArray,
  context: VoiceContext,
): CommandResult {
  // Future: Cancel current multi-step operation
  // For now, just acknowledge
  return {
    success: true,
    action: "cancel-current-action",
    message: "Operation cancelled",
  };
}
