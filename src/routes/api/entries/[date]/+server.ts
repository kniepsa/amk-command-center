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
 * Body: { frontmatter: object, body: string, append?: boolean }
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

    const { frontmatter, body, append = false } = await request.json();

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

    // Ensure directory exists
    if (!existsSync(JOURNAL_BASE)) {
      mkdirSync(JOURNAL_BASE, { recursive: true });
    }

    const filePath = join(JOURNAL_BASE, `${date}.md`);

    // APPEND MODE: Add to existing file
    if (append && existsSync(filePath)) {
      const { readFileSync } = await import("fs");
      const { appendFileSync } = await import("fs");

      const existingContent = readFileSync(filePath, "utf8");

      // Check if existing file has frontmatter
      const hasFrontmatter = existingContent.trim().startsWith("---");

      if (hasFrontmatter) {
        // Parse existing frontmatter
        const match = existingContent.match(
          /^---\n([\s\S]*?)\n---\n([\s\S]*)$/,
        );

        if (match) {
          const existingFrontmatter = yaml.load(match[1]) as Record<
            string,
            any
          >;
          const existingBody = match[2];

          // Merge frontmatter (new values extend existing arrays/objects)
          const mergedFrontmatter = { ...existingFrontmatter };

          // Merge arrays (deduplicate)
          const arrayFields = [
            "intentions",
            "gratitude",
            "food",
            "tags",
            "people",
            "frameworks",
            "contexts",
          ];
          arrayFields.forEach((field) => {
            if (
              normalizedFrontmatter[field] &&
              Array.isArray(normalizedFrontmatter[field])
            ) {
              const existing = (existingFrontmatter[field] || []) as any[];
              const newItems = normalizedFrontmatter[field] as any[];
              mergedFrontmatter[field] = [...existing, ...newItems];
            }
          });

          // Merge objects (habits, sleep - keep latest values)
          const objectFields = ["habits", "sleep"];
          objectFields.forEach((field) => {
            if (normalizedFrontmatter[field]) {
              mergedFrontmatter[field] = {
                ...(existingFrontmatter[field] || {}),
                ...normalizedFrontmatter[field],
              };
            }
          });

          // Single values - keep latest
          if (normalizedFrontmatter.energy) {
            mergedFrontmatter.energy = normalizedFrontmatter.energy;
          }

          // Build new content with merged frontmatter
          const yamlContent = yaml.dump(mergedFrontmatter, {
            lineWidth: -1,
            noRefs: true,
            quotingType: '"',
            forceQuotes: false,
          });

          // Add timestamp separator to body
          const timestamp = new Date().toISOString();
          const newBody = `\n\n---\n\n**Entry added at ${timestamp}**\n\n${body}`;

          const content = `---\n${yamlContent}---\n${existingBody}${newBody}`;
          writeFileSync(filePath, content, "utf8");

          return json({
            success: true,
            filePath,
            message: `Entry appended: ${date}`,
            appended: true,
          });
        }
      }

      // Fallback: If no frontmatter or parsing failed, just append
      const timestamp = new Date().toISOString();
      const separator = `\n\n---\n\n**Entry added at ${timestamp}**\n\n`;
      appendFileSync(filePath, `${separator}${body}`, "utf8");

      return json({
        success: true,
        filePath,
        message: `Entry appended (no frontmatter merge): ${date}`,
        appended: true,
      });
    }

    // OVERWRITE MODE (default): Create new file or replace existing
    const yamlContent = yaml.dump(normalizedFrontmatter, {
      lineWidth: -1, // No line wrapping
      noRefs: true,
      quotingType: '"',
      forceQuotes: false,
    });

    const content = `---\n${yamlContent}---\n${body}`;
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
