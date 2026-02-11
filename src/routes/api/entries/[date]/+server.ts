import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import yaml from "js-yaml";

// Path to journal repository
const JOURNAL_BASE = "/Users/amk/Projects/amk-journal/users/amk/entries";

/**
 * POST /api/entries/[date]
 * Saves a daily entry to the journal repository
 *
 * Body: { frontmatter: object, body: string }
 * Returns: { success: boolean, filePath: string }
 */
export const POST: RequestHandler = async ({ params, request }) => {
  try {
    const { date } = params;

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return json(
        { error: "Invalid date format. Expected YYYY-MM-DD" },
        { status: 400 },
      );
    }

    const { frontmatter, body } = await request.json();

    if (!frontmatter || typeof body !== "string") {
      return json(
        { error: "Missing required fields: frontmatter, body" },
        { status: 400 },
      );
    }

    // Normalize date in frontmatter
    const normalizedFrontmatter = { ...frontmatter };
    if (normalizedFrontmatter.date) {
      if (normalizedFrontmatter.date instanceof Date) {
        normalizedFrontmatter.date = normalizedFrontmatter.date
          .toISOString()
          .split("T")[0];
      } else if (
        typeof normalizedFrontmatter.date === "string" &&
        normalizedFrontmatter.date.includes("T")
      ) {
        normalizedFrontmatter.date = normalizedFrontmatter.date.split("T")[0];
      }
    } else {
      normalizedFrontmatter.date = date;
    }

    // Ensure schema_version is set
    if (!normalizedFrontmatter.schema_version) {
      normalizedFrontmatter.schema_version = 2;
    }

    // Build file content
    const yamlContent = yaml.dump(normalizedFrontmatter, {
      lineWidth: -1, // No line wrapping
      noRefs: true,
      quotingType: '"',
      forceQuotes: false,
    });

    const content = `---\n${yamlContent}---\n${body}`;

    // Ensure directory exists
    if (!existsSync(JOURNAL_BASE)) {
      mkdirSync(JOURNAL_BASE, { recursive: true });
    }

    // Write file
    const filePath = join(JOURNAL_BASE, `${date}.md`);
    writeFileSync(filePath, content, "utf8");

    return json({
      success: true,
      filePath,
      message: `Entry saved: ${date}`,
    });
  } catch (error) {
    console.error("Error saving entry:", error);
    return json(
      {
        error: "Failed to save entry",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
};

/**
 * GET /api/entries/[date]
 * Retrieves a daily entry from the journal repository
 *
 * Returns: { frontmatter: object, body: string, exists: boolean }
 */
export const GET: RequestHandler = async ({ params }) => {
  try {
    const { date } = params;

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return json(
        { error: "Invalid date format. Expected YYYY-MM-DD" },
        { status: 400 },
      );
    }

    const filePath = join(JOURNAL_BASE, `${date}.md`);

    // Check if file exists
    if (!existsSync(filePath)) {
      return json({
        exists: false,
        frontmatter: null,
        body: "",
      });
    }

    // Read and parse file
    const { readFileSync } = await import("fs");
    const content = readFileSync(filePath, "utf8");

    // Split frontmatter and body
    const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

    if (!match) {
      return json({
        exists: true,
        frontmatter: {},
        body: content,
      });
    }

    const frontmatter = yaml.load(match[1]);
    const body = match[2];

    return json({
      exists: true,
      frontmatter,
      body,
    });
  } catch (error) {
    console.error("Error reading entry:", error);
    return json(
      {
        error: "Failed to read entry",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
};
