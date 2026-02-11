/**
 * GET /api/coaches/config
 * POST /api/coaches/config
 *
 * Manages user's coach preferences (which coaches are enabled, challenge levels, etc.)
 *
 * Config stored at: ~/.config/command-center/coaches.json
 */

import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import type {
  CoachesConfig,
  CoachConfig,
  CoachSettings,
} from "$lib/types/coach";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

const CONFIG_DIR = join(homedir(), ".config", "command-center");
const CONFIG_FILE = join(CONFIG_DIR, "coaches.json");

// Default configuration
const DEFAULT_CONFIG: CoachesConfig = {
  active_coaches: [
    {
      id: "bill-campbell",
      name: "Bill Campbell",
      enabled: true,
      challenge_level: "medium",
      triggers: [
        "@team",
        "#leadership",
        "conflict",
        "management",
        "people issues",
      ],
      auto_activate: true,
    },
    {
      id: "machiavelli",
      name: "Machiavelli",
      enabled: true,
      challenge_level: "low",
      triggers: [
        "M&A",
        "negotiation",
        "Leon",
        "Jerome",
        "power",
        "deal",
        "buyer",
      ],
      auto_activate: false,
    },
    {
      id: "peter-drucker",
      name: "Peter Drucker",
      enabled: true,
      challenge_level: "medium",
      triggers: [
        "strategy",
        "investment",
        "big decision",
        "assumption",
        "first principles",
      ],
      auto_activate: true,
    },
    {
      id: "stoic-advisor",
      name: "Stoic Advisor",
      enabled: true,
      challenge_level: "low",
      triggers: ["frustration", "anxiety", "stressed", "worried", "control"],
      auto_activate: true,
    },
    {
      id: "parenting-guru",
      name: "Parenting Guru",
      enabled: true,
      challenge_level: "low",
      triggers: [
        "@kinder",
        "@linus",
        "@anton",
        "@cari",
        "#parenting",
        "kids",
        "children",
      ],
      auto_activate: true,
    },
    {
      id: "sales-coach",
      name: "Sales Coach (SPIN)",
      enabled: true,
      challenge_level: "medium",
      triggers: [
        "pitch",
        "sales",
        "#sales",
        "discovery",
        "client",
        "buyer meeting",
      ],
      auto_activate: true,
    },
    {
      id: "ma-advisor",
      name: "M&A Advisor",
      enabled: true,
      challenge_level: "medium",
      triggers: [
        "exit",
        "valuation",
        "deal structure",
        "EBITDA",
        "platform sale",
      ],
      auto_activate: true,
    },
  ],
  settings: {
    show_immediately: true,
    allow_debates: false,
    max_coaches_per_response: 2,
  },
};

// ============================================================================
// GET - Load user's coach configuration
// ============================================================================

export const GET: RequestHandler = async () => {
  try {
    // Try to read existing config
    let config: CoachesConfig;

    try {
      const fileContent = await readFile(CONFIG_FILE, "utf-8");
      config = JSON.parse(fileContent);
    } catch (error) {
      // File doesn't exist, use default config
      config = DEFAULT_CONFIG;

      // Create config directory and save default config
      await mkdir(CONFIG_DIR, { recursive: true });
      await writeFile(
        CONFIG_FILE,
        JSON.stringify(DEFAULT_CONFIG, null, 2),
        "utf-8",
      );
    }

    return json(config);
  } catch (error) {
    console.error("Error in GET /api/coaches/config:", error);
    return json(
      { error: "Failed to load coach configuration" },
      { status: 500 },
    );
  }
};

// ============================================================================
// POST - Save user's coach configuration
// ============================================================================

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = (await request.json()) as Partial<CoachesConfig>;

    // Validate that we have at least one coach
    if (!body.active_coaches || body.active_coaches.length === 0) {
      return json(
        { error: "At least one coach must be configured" },
        { status: 400 },
      );
    }

    // Validate coach structure
    for (const coach of body.active_coaches) {
      if (!coach.id || !coach.name) {
        return json(
          { error: "Each coach must have id and name" },
          { status: 400 },
        );
      }

      if (!["low", "medium", "high"].includes(coach.challenge_level)) {
        return json(
          { error: `Invalid challenge_level for coach ${coach.id}` },
          { status: 400 },
        );
      }
    }

    // Merge with existing config to preserve any fields not in request
    let existingConfig: CoachesConfig;
    try {
      const fileContent = await readFile(CONFIG_FILE, "utf-8");
      existingConfig = JSON.parse(fileContent);
    } catch {
      existingConfig = DEFAULT_CONFIG;
    }

    const updatedConfig: CoachesConfig = {
      active_coaches: body.active_coaches || existingConfig.active_coaches,
      settings: body.settings || existingConfig.settings,
    };

    // Ensure config directory exists
    await mkdir(CONFIG_DIR, { recursive: true });

    // Write updated config
    await writeFile(
      CONFIG_FILE,
      JSON.stringify(updatedConfig, null, 2),
      "utf-8",
    );

    return json({ success: true, config: updatedConfig });
  } catch (error) {
    console.error("Error in POST /api/coaches/config:", error);
    return json(
      { error: "Failed to save coach configuration" },
      { status: 500 },
    );
  }
};
