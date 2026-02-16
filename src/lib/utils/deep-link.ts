/**
 * Deep Link Navigation Utility
 * Handles navigation to specific entities with optional highlight flash
 */

import { goto } from "$app/navigation";

export interface DeepLinkOptions {
  highlight?: boolean;
  scrollIntoView?: boolean;
}

/**
 * Navigate to an entity and optionally highlight it
 *
 * @param url - Target URL
 * @param elementId - Optional element ID to highlight
 * @param options - Navigation options
 */
export async function navigateToEntity(
  url: string,
  elementId?: string,
  options: DeepLinkOptions = {},
): Promise<void> {
  const { highlight = true, scrollIntoView = true } = options;

  // Navigate to the URL
  await goto(url);

  // If element ID provided, handle highlight and scroll
  if (elementId && typeof window !== "undefined") {
    // Wait for DOM to settle
    setTimeout(() => {
      const element = document.getElementById(elementId);
      if (!element) return;

      // Scroll into view
      if (scrollIntoView) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      // Add highlight flash
      if (highlight) {
        element.classList.add("highlight-flash");
        setTimeout(() => {
          element.classList.remove("highlight-flash");
        }, 2000);
      }
    }, 100);
  }
}

/**
 * Parse "Show me X" voice commands
 *
 * @param text - Voice command text
 * @returns Parsed entity type and query, or null if not a show command
 */
export function parseShowCommand(text: string): {
  type: "buyer" | "person" | "task" | "entry";
  query: string;
} | null {
  const lower = text.toLowerCase().trim();

  // "Show me buyer X" or "Show me X" (buyer context)
  if (lower.startsWith("show me buyer ")) {
    return { type: "buyer", query: lower.replace("show me buyer ", "") };
  }

  // "Show me person X" or "Show me @X"
  if (lower.startsWith("show me person ") || lower.startsWith("show me @")) {
    const query = lower.replace("show me person ", "").replace("show me @", "");
    return { type: "person", query };
  }

  // "Show me task X"
  if (lower.startsWith("show me task ")) {
    return { type: "task", query: lower.replace("show me task ", "") };
  }

  // "Show me entry X" or "Show me YYYY-MM-DD"
  if (
    lower.startsWith("show me entry ") ||
    /show me \d{4}-\d{2}-\d{2}/.test(lower)
  ) {
    const query = lower.replace("show me entry ", "").replace("show me ", "");
    return { type: "entry", query };
  }

  // Generic "Show me X" - treat as buyer in M&A context
  if (lower.startsWith("show me ")) {
    return { type: "buyer", query: lower.replace("show me ", "") };
  }

  return null;
}
