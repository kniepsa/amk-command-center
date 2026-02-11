/**
 * File System Utilities for AMK Journal
 *
 * Handles reading/writing daily entries and weekly plans from the file system.
 */

import { readFile, writeFile, access } from "fs/promises";
import { join } from "path";
import type { HabitData } from "$lib/types";

// Base path to AMK journal repository
const JOURNAL_BASE =
  process.env.JOURNAL_PATH || "/Users/amk/Projects/amk-journal";

// ============================================================================
// Path Utilities
// ============================================================================

export function getDailyEntryPath(date: string): string {
  // date format: YYYY-MM-DD
  return join(JOURNAL_BASE, "users", "amk", "entries", `${date}.md`);
}

export function getWeeklyPlanPath(week: string): string {
  // week format: YYYY-WXX
  return join(JOURNAL_BASE, "users", "amk", "weekly-plans", `${week}.md`);
}

export function getCurrentWeekString(): string {
  const now = new Date();
  const year = now.getFullYear();

  // Calculate week number (ISO 8601)
  const firstDayOfYear = new Date(year, 0, 1);
  const pastDaysOfYear = (now.getTime() - firstDayOfYear.getTime()) / 86400000;
  const weekNumber = Math.ceil(
    (pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7,
  );

  return `${year}-W${weekNumber.toString().padStart(2, "0")}`;
}

// ============================================================================
// File Existence Check
// ============================================================================

export async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// YAML Frontmatter Parsing
// ============================================================================

export interface ParsedMarkdown {
  frontmatter: Record<string, unknown>;
  content: string;
}

export function parseMarkdown(markdown: string): ParsedMarkdown {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = markdown.match(frontmatterRegex);

  if (!match) {
    return {
      frontmatter: {},
      content: markdown,
    };
  }

  const [, frontmatterText, content] = match;
  const frontmatter = parseYAML(frontmatterText);

  return { frontmatter, content };
}

// Simple YAML parser for frontmatter (handles basic types)
function parseYAML(text: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const lines = text.split("\n");
  let currentKey: string | null = null;
  let currentArray: unknown[] | null = null;
  let currentObject: Record<string, unknown> | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Array item
    if (trimmed.startsWith("- ")) {
      const value = trimmed.substring(2).trim();
      if (currentArray) {
        currentArray.push(parseValue(value));
      } else if (currentKey) {
        currentArray = [parseValue(value)];
        result[currentKey] = currentArray;
      }
      continue;
    }

    // Key-value pair
    const colonIndex = trimmed.indexOf(":");
    if (colonIndex > 0) {
      const key = trimmed.substring(0, colonIndex).trim();
      const value = trimmed.substring(colonIndex + 1).trim();

      if (value) {
        result[key] = parseValue(value);
        currentArray = null;
        currentKey = null;
      } else {
        // Empty value means object or array follows
        currentKey = key;
        currentArray = null;
      }
    }
  }

  return result;
}

function parseValue(value: string): unknown {
  // Boolean
  if (value === "true") return true;
  if (value === "false") return false;

  // Number
  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return parseFloat(value);
  }

  // String (remove quotes if present)
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1);
  }
  if (value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1);
  }

  return value;
}

export function stringifyYAML(
  obj: Record<string, unknown>,
  indent = 0,
): string {
  const spaces = "  ".repeat(indent);
  let result = "";

  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;

    if (Array.isArray(value)) {
      result += `${spaces}${key}:\n`;
      for (const item of value) {
        if (typeof item === "object" && item !== null) {
          result += `${spaces}  - ${JSON.stringify(item)}\n`;
        } else {
          result += `${spaces}  - ${item}\n`;
        }
      }
    } else if (typeof value === "object" && value !== null) {
      result += `${spaces}${key}:\n`;
      result += stringifyYAML(value as Record<string, unknown>, indent + 1);
    } else {
      result += `${spaces}${key}: ${value}\n`;
    }
  }

  return result;
}

// ============================================================================
// Daily Entry Operations
// ============================================================================

export async function readDailyEntry(date: string): Promise<HabitData | null> {
  const path = getDailyEntryPath(date);

  if (!(await fileExists(path))) {
    return null;
  }

  const content = await readFile(path, "utf-8");
  const { frontmatter } = parseMarkdown(content);

  // Map frontmatter to HabitData structure
  return frontmatter as HabitData;
}

export async function writeDailyEntry(
  date: string,
  data: Partial<HabitData>,
  content?: string,
): Promise<void> {
  const path = getDailyEntryPath(date);

  // Read existing entry if it exists
  let existingContent = "";
  if (await fileExists(path)) {
    const existing = await readFile(path, "utf-8");
    const parsed = parseMarkdown(existing);
    existingContent = parsed.content;

    // Merge with existing frontmatter
    data = { ...parsed.frontmatter, ...data } as Partial<HabitData>;
  }

  // Build markdown file
  const frontmatterYAML = stringifyYAML(data as Record<string, unknown>);
  const markdown = `---\n${frontmatterYAML}---\n\n${content || existingContent}`;

  await writeFile(path, markdown, "utf-8");
}

// ============================================================================
// Weekly Plan Operations
// ============================================================================

export async function readWeeklyPlan(
  week: string,
): Promise<ParsedMarkdown | null> {
  const path = getWeeklyPlanPath(week);

  if (!(await fileExists(path))) {
    return null;
  }

  const content = await readFile(path, "utf-8");
  return parseMarkdown(content);
}

export async function getCurrentWeeklyPlan(): Promise<ParsedMarkdown | null> {
  const currentWeek = getCurrentWeekString();
  return readWeeklyPlan(currentWeek);
}

// ============================================================================
// TODO: Add more utilities as needed
// - extractPrioritiesFromWeeklyPlan()
// - updateWeeklyProgress()
// - linkDailyIntentionToWeeklyPriority()
// ============================================================================
