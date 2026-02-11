/**
 * POST /api/extract-entry
 *
 * Extracts structured data from freeform text (voice transcripts or typed input).
 *
 * Phase 1: Returns mock data for frontend development
 * Phase 2: Will integrate with Claude API for real extraction
 */

import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import type { ExtractEntryRequest, ExtractEntryResponse } from "$lib/types";

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = (await request.json()) as ExtractEntryRequest;
    const { date, text, existing } = body;

    // Validate request
    if (!date || !text) {
      return json(
        { error: "Missing required fields: date and text" },
        { status: 400 },
      );
    }

    // TODO: Phase 2 - Replace with real Claude API call
    // const extracted = await extractWithClaude(text, existing);

    // ========================================================================
    // MOCK IMPLEMENTATION (Phase 1)
    // ========================================================================

    const extracted = extractMockData(text, existing);

    const response: ExtractEntryResponse = {
      extracted,
      confidence: 0.85, // Mock confidence score
      suggestions: generateSuggestions(text, extracted),
    };

    return json(response);
  } catch (error) {
    console.error("Error in /api/extract-entry:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
};

// ============================================================================
// Mock Extraction Logic (Phase 1)
// ============================================================================

function extractMockData(
  text: string,
  existing?: ExtractEntryRequest["existing"],
): ExtractEntryResponse["extracted"] {
  const lower = text.toLowerCase();
  const extracted: ExtractEntryResponse["extracted"] = {};

  // Merge with existing data
  if (existing) {
    Object.assign(extracted, existing);
  }

  // Extract sleep patterns
  const sleepMatch = lower.match(/ins bett um (\d{1,2}):?(\d{2})?/i);
  const wakeMatch = lower.match(/aufgewacht um (\d{1,2}):?(\d{2})?/i);
  const durationMatch = lower.match(
    /(\d+(\.\d+)?)\s*h(our)?s?\s*(geschlafen|sleep)/i,
  );

  if (sleepMatch || wakeMatch || durationMatch) {
    extracted.sleep = {
      ...(existing?.sleep || {}),
      ...(sleepMatch && {
        bedtime: `${sleepMatch[1].padStart(2, "0")}:${(sleepMatch[2] || "00").padStart(2, "0")}`,
      }),
      ...(wakeMatch && {
        wake_time: `${wakeMatch[1].padStart(2, "0")}:${(wakeMatch[2] || "00").padStart(2, "0")}`,
      }),
      ...(durationMatch && { duration: durationMatch[1] }),
    };

    // Infer quality
    if (lower.includes("gut geschlafen") || lower.includes("gute qualität")) {
      extracted.sleep.quality = "good";
    } else if (lower.includes("excellent") || lower.includes("sehr gut")) {
      extracted.sleep.quality = "excellent";
    }
  }

  // Extract energy level
  if (lower.includes("high energy") || lower.includes("viel energie")) {
    extracted.energy = "high";
  } else if (lower.includes("medium energy") || lower.includes("ok energie")) {
    extracted.energy = "medium";
  } else if (lower.includes("low energy") || lower.includes("wenig energie")) {
    extracted.energy = "low";
  } else if (lower.includes("drained") || lower.includes("erschöpft")) {
    extracted.energy = "drained";
  }

  // Extract habits
  const habits: Record<string, boolean> = {};
  if (lower.includes("laufen") || lower.includes("running"))
    habits.running = true;
  if (lower.includes("sauna")) habits.sauna = true;
  if (lower.includes("sales learning") || lower.includes("vertriebstraining"))
    habits.sales_learning = true;
  if (lower.includes("journaling") || lower.includes("tagebuch"))
    habits.journaling = true;
  if (lower.includes("elektrolyte") || lower.includes("electrolytes"))
    habits.morning_electrolytes = true;
  if (lower.includes("vampire shot") || lower.includes("vampir shot"))
    habits.vampire_shot = true;
  if (lower.includes("supplements") || lower.includes("nahrungsergänzung"))
    habits.supplements = true;

  if (Object.keys(habits).length > 0) {
    extracted.habits = { ...(existing?.habits || {}), ...habits };
  }

  // Extract intentions
  const intentionPatterns = [
    /intention[:\s]+(.+?)(?:\.|$)/gi,
    /heute will ich\s+(.+?)(?:\.|$)/gi,
    /focus[:\s]+(.+?)(?:\.|$)/gi,
  ];

  const intentions: string[] = [];
  for (const pattern of intentionPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      intentions.push(match[1].trim());
    }
  }

  if (intentions.length > 0) {
    extracted.intentions = intentions;
  }

  // Extract gratitude
  const gratitudePatterns = [
    /dankbar für\s+(.+?)(?:\s*[-–.]\s*(.+?))?(?:\.|$)/gi,
    /grateful for\s+(.+?)(?:\s*[-–.]\s*(.+?))?(?:\.|$)/gi,
  ];

  const gratitude: Array<{ thing: string; why: string }> = [];
  for (const pattern of gratitudePatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      gratitude.push({
        thing: match[1].trim(),
        why: match[2]?.trim() || "",
      });
    }
  }

  if (gratitude.length > 0) {
    extracted.gratitude = gratitude;
  }

  // Extract food entries
  const foodPatterns = [
    /gegessen um (\d{1,2}):(\d{2})\s+(.+?)(?:\.|$)/gi,
    /ate at (\d{1,2}):(\d{2})\s+(.+?)(?:\.|$)/gi,
    /(\d{1,2}):(\d{2})\s+(?:uhr\s+)?(.+?)\s+gegessen/gi,
  ];

  const food: Array<{ time: string; meal: string; portion_grams?: number[] }> =
    [];
  for (const pattern of foodPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const meal = match[3].trim();
      const portionMatch = meal.match(/(\d+)\s*g/);

      food.push({
        time: `${match[1].padStart(2, "0")}:${match[2]}`,
        meal: portionMatch ? meal.replace(/\d+\s*g/g, "").trim() : meal,
        ...(portionMatch && { portion_grams: [parseInt(portionMatch[1])] }),
      });
    }
  }

  if (food.length > 0) {
    extracted.food = food;
  }

  return extracted;
}

// ============================================================================
// Suggestion Generation
// ============================================================================

function generateSuggestions(
  text: string,
  extracted: ExtractEntryResponse["extracted"],
): string[] {
  const suggestions: string[] = [];

  // Check for potential food entries
  if (
    text.toLowerCase().includes("gegessen") ||
    text.toLowerCase().includes("frühstück") ||
    text.toLowerCase().includes("mittag")
  ) {
    if (!extracted.food || extracted.food.length === 0) {
      suggestions.push(
        'Did you want to log a food entry? Include time like "gegessen um 12:00 300g Joghurt"',
      );
    }
  }

  // Check for gratitude keywords without extraction
  if (
    (text.toLowerCase().includes("froh") ||
      text.toLowerCase().includes("glücklich")) &&
    (!extracted.gratitude || extracted.gratitude.length === 0)
  ) {
    suggestions.push(
      'Consider adding to gratitude: "Dankbar für [person/thing] - [reason]"',
    );
  }

  // Check for sleep keywords without full extraction
  if (
    text.toLowerCase().includes("geschlafen") &&
    (!extracted.sleep || !extracted.sleep.duration)
  ) {
    suggestions.push(
      'For better sleep tracking, include: "8h geschlafen, gute Qualität"',
    );
  }

  return suggestions;
}

// ============================================================================
// TODO: Phase 2 - Claude API Integration
// ============================================================================

/*
async function extractWithClaude(
  text: string,
  existing?: ExtractEntryRequest['existing']
): Promise<ExtractEntryResponse['extracted']> {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

  if (!ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const prompt = `
You are an expert at extracting structured data from journal entries.

Given the following text (may be German or English voice transcript):

"${text}"

Extract the following information in JSON format:

{
  "sleep": { "bedtime": "HH:MM", "wake_time": "HH:MM", "duration": "X.X", "quality": "good|fair|poor|excellent" },
  "energy": "high|medium|low|drained",
  "habits": { "running": true/false, "sauna": true/false, ... },
  "intentions": ["intention 1", "intention 2"],
  "gratitude": [{ "thing": "...", "why": "..." }],
  "food": [{ "time": "HH:MM", "meal": "...", "portion_grams": [X] }]
}

Only include fields that are present in the text. Return valid JSON only.
`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  });

  const data = await response.json();
  const extracted = JSON.parse(data.content[0].text);

  // Merge with existing data
  return { ...existing, ...extracted };
}
*/
