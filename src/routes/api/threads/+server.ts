/**
 * API endpoint to load thread files from journal
 */

import { json } from "@sveltejs/kit";
import { readdir, readFile, stat } from "fs/promises";
import { join } from "path";
import type { RequestHandler } from "./$types";

const THREADS_PATH = "/Users/amk/Projects/amk-journal/users/amk/threads/active";

export const GET: RequestHandler = async () => {
  try {
    // Read all markdown files from threads directory
    const files = await readdir(THREADS_PATH);
    const markdownFiles = files.filter((f) => f.endsWith(".md"));

    // Load file content and metadata
    const threads = await Promise.all(
      markdownFiles.map(async (filename) => {
        const filepath = join(THREADS_PATH, filename);
        const content = await readFile(filepath, "utf-8");
        const stats = await stat(filepath);

        return {
          filename,
          content,
          lastModified: stats.mtime.toISOString(),
        };
      }),
    );

    return json({ threads });
  } catch (error) {
    console.error("Error loading threads:", error);
    return json(
      { error: "Failed to load threads", threads: [] },
      { status: 500 },
    );
  }
};
