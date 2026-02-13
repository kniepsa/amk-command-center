import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { readFile } from "fs/promises";
import { join } from "path";

const JOURNAL_PATH = "/Users/amk/Projects/amk-journal";

export const GET: RequestHandler = async () => {
  try {
    // Read NEXT.md to get urgent items
    const nextPath = join(JOURNAL_PATH, "users/amk/next.md");
    const nextContent = await readFile(nextPath, "utf-8");

    // Extract open items (lines starting with "- [ ]")
    const urgentItems = extractUrgentItems(nextContent);

    return json({ urgent_items: urgentItems });
  } catch (err) {
    console.error("Error reading journal files:", err);

    // Fallback to empty array if files not accessible
    return json({ urgent_items: [] });
  }
};

function extractUrgentItems(content: string) {
  const lines = content.split("\n");
  const items: Array<{
    id: string;
    text: string;
    context: string;
    priority: string;
    due_date?: string;
  }> = [];

  let currentContext = "";
  let itemIndex = 0;

  for (const line of lines) {
    // Track context (area headers like "### #printulu")
    if (line.startsWith("###")) {
      const match = line.match(/###\s+#?(\w+)/);
      if (match) {
        currentContext = match[1];
      }
    }

    // Extract open items "- [ ]"
    if (line.trim().startsWith("- [ ]")) {
      const text = line.replace(/^-\s*\[\s*\]\s*/, "").trim();

      // Skip if empty or just a tag
      if (!text || text.startsWith("@")) continue;

      // Extract priority from markers
      let priority = "medium";
      if (text.includes("**URGENT") || text.includes("IMMEDIATE")) {
        priority = "high";
      }

      // Extract due date if present
      let dueDate;
      const dateMatch = text.match(/(\d{4}-\d{2}-\d{2})/);
      if (dateMatch) {
        dueDate = dateMatch[1];
      } else if (text.toLowerCase().includes("today")) {
        dueDate = "today";
      } else if (
        text.toLowerCase().includes("saturday") ||
        text.toLowerCase().includes("monday") ||
        text.toLowerCase().includes("weekend")
      ) {
        dueDate = "this-week";
      }

      // Clean up text (remove markdown bold, dates, tags)
      const cleanText = text
        .replace(/\*\*/g, "")
        .replace(/\s+@\w+/g, "")
        .replace(/\s+-\s+DONE.*$/i, "")
        .replace(/✅/g, "")
        .trim();

      items.push({
        id: `u${++itemIndex}`,
        text: cleanText,
        context: currentContext || "General",
        priority,
        due_date: dueDate,
      });

      // Limit to 15 most urgent items
      if (items.length >= 15) break;
    }
  }

  return items;
}
