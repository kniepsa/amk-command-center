/**
 * POST /api/extract-entry
 *
 * Extracts structured data from freeform text using Claude Sonnet 4.5
 */

import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import type { ExtractEntryRequest, ExtractEntryResponse } from "$lib/types";
import { ANTHROPIC_API_KEY } from "$env/static/private";

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = (await request.json()) as ExtractEntryRequest;
    const { date, text, existing } = body;

    // Validate request
    if (!date || !text) {
      throw error(400, "Missing required fields: date and text");
    }

    // Validate API key
    if (!ANTHROPIC_API_KEY) {
      throw error(500, "ANTHROPIC_API_KEY not configured");
    }

    // Extract with Claude
    const startTime = Date.now();
    const extracted = await extractWithClaude(text, date, existing);
    const processingTime = Date.now() - startTime;

    // Calculate confidence
    const confidence = calculateConfidence(extracted);

    // Generate suggestions for low confidence
    const suggestions =
      confidence < 0.5 ? generateSuggestions(text, extracted) : [];

    // NEW: Detect uncertain fields (GTD Clarify step)
    const uncertainFields = detectUncertainty(extracted, text);
    const needsClarification = uncertainFields.length > 0;

    const response: ExtractEntryResponse = {
      extracted: {
        ...extracted,
        _uncertain: uncertainFields,
        _needsClarification: needsClarification,
      } as any,
      confidence,
      suggestions,
    };

    console.log(
      `Extraction completed in ${processingTime}ms, confidence: ${confidence.toFixed(2)}, uncertain fields: ${uncertainFields.length}`,
    );

    return json(response);
  } catch (err) {
    console.error("Error in /api/extract-entry:", err);

    // Re-throw SvelteKit errors
    if (err && typeof err === "object" && "status" in err) {
      throw err;
    }

    throw error(500, {
      message:
        err instanceof Error ? err.message : "Failed to extract entry data",
    });
  }
};

// ============================================================================
// Claude API Extraction
// ============================================================================

async function extractWithClaude(
  text: string,
  date: string,
  existing?: ExtractEntryRequest["existing"],
): Promise<ExtractEntryResponse["extracted"]> {
  const prompt = buildExtractionPrompt(text, date);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 4096,
      temperature: 0, // Deterministic for extraction
      system: [
        {
          type: "text",
          text: "You are an expert at extracting structured data from German/English journal entries. Return ONLY valid JSON, no explanations.",
          cache_control: { type: "ephemeral" }, // Cache system prompt for 90% cost reduction
        },
      ],
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    if (response.status === 401) {
      throw error(401, "Invalid Anthropic API key");
    }
    if (response.status === 429) {
      throw error(429, "Rate limit exceeded. Please try again.");
    }

    throw error(
      response.status,
      errorData.error?.message || "Claude API request failed",
    );
  }

  const result = await response.json();

  // Parse JSON response
  const content = result.content[0];
  if (content.type !== "text") {
    throw error(500, "Unexpected response type from Claude");
  }

  let extractedData;
  try {
    // Strip markdown code blocks if present
    let jsonText = content.text.trim();
    if (jsonText.startsWith("```")) {
      // Remove ```json and ``` markers
      jsonText = jsonText
        .replace(/^```(?:json)?\n?/, "")
        .replace(/\n?```$/, "")
        .trim();
    }
    extractedData = JSON.parse(jsonText);
  } catch (parseError) {
    console.error("Failed to parse Claude response:", content.text);
    throw error(500, "Invalid JSON from Claude API");
  }

  // Merge with existing data (incremental extraction)
  if (existing) {
    return mergeExtractedData(existing, extractedData);
  }

  return extractedData;
}

// ============================================================================
// Extraction Prompt (from Journal API)
// ============================================================================

function buildExtractionPrompt(transcription: string, date: string): string {
  return `You are extracting structured entities from a German/English daily journal entry for a busy entrepreneur.

**Date**: ${date}
**Transcription**:
${transcription}

---

**EXTRACTION RULES**

1. **Energy Level**:
   - Keywords: "viel Energie" → high, "gute Energie" → medium, "müde" → low, "erschöpft" → drained
   - Default: null (if not mentioned)

2. **Sleep**:
   - Pattern: "ins Bett um 22:00", "aufgewacht um 7:00", "8h geschlafen"
   - Extract: bedtime, wake_time, duration, quality, blue_blockers, screen_curfew
   - Quality: excellent (>8h, restful), good (7-8h), fair (6-7h), poor (<6h)

3. **Habits (Bryan Johnson Blueprint)**:
   - running, sauna, sales_learning, journaling, three_daily_happiness
   - vampire_shot (morning supplement stack), morning_electrolytes
   - supplements, plan_tomorrow, plan_next_week
   - Mark true if explicitly mentioned as done

4. **Intentions**:
   - Pattern: "Heute fokussiere ich...", "Priorities today...", "Focus areas..."
   - Extract 2-3 focus areas max
   - Examples: ["Focus on M&A calls", "Review Q1 roadmap"]

5. **Gratitude**:
   - Pattern: "dankbar für...", "froh dass...", "grateful for..."
   - Extract thing + why (if given)
   - Example: {"thing": "Linus learning to read", "why": "Saw him sound out words independently"}

6. **Food**:
   - Pattern: time + meal description + optional portion
   - Examples: "8:00 300g Joghurt", "12:30 Salmon mit Gemüse"
   - Extract: time (HH:MM), meal, portion_grams (if mentioned)

7. **People (@mentions)**:
   - Pattern: @firstname or "Meeting mit [Name]" or "Call mit [Name]"
   - Extract: handle (lowercase, no @), context (2-3 sentences), sentiment
   - Sentiment: positive (productive/friendly), neutral (factual), negative (conflict/frustration)
   - Example: {"handle": "nikola", "context": "Had brainstorming session about Q1 priorities", "sentiment": "positive"}

8. **Tasks**:
   - Pattern: [OPEN], [WAITING], [RESOLVED] or action items mentioned
   - Extract: content, area (#printulu, #parenting), context (@calls, @office)
   - If [WAITING]: extract waiting_for person
   - If [REMINDER:YYYY-MM-DD]: extract reminder_date
   - Examples:
     - {"content": "Follow up with Francis", "area": "printulu", "context": "calls", "status": "open"}
     - {"content": "Design review", "status": "waiting", "waiting_for": "Kyla"}

9. **Frameworks**:
   - Pattern: [[framework-name]]
   - Examples: [[bill-campbell]], [[gtd]], [[bryan-johnson-blueprint]]
   - Return as array: ["bill-campbell", "gtd"]

10. **Tags**:
    - Pattern: #tag
    - Examples: #printulu, #parenting, #leadership
    - Return as array: ["printulu", "parenting"]

11. **Meetings** (auto-detect):
    - Pattern: "Meeting mit @person um 10:00", "Call mit @person"
    - Extract: title, start_time, duration, attendees (handles without @)
    - Example: {"title": "Morning sync with Nikola", "start_time": "10:00", "duration": "30m", "attendees": ["nikola"]}

---

**OUTPUT FORMAT**

Return ONLY valid JSON matching this structure (omit fields if not present):

\`\`\`json
{
  "energy": "medium",
  "sleep": {
    "bedtime": "22:00",
    "wake_time": "07:00",
    "duration": 9,
    "quality": "good",
    "blue_blockers": true,
    "screen_curfew": true
  },
  "habits": {
    "running": false,
    "vampire_shot": true,
    "morning_electrolytes": true,
    "sales_learning": false
  },
  "intentions": ["Focus on client calls", "Review Q1 roadmap"],
  "gratitude": [
    {"thing": "Strong team", "why": "Nikola proposed brilliant solution"}
  ],
  "food": [
    {"time": "08:00", "meal": "300g Greek yogurt with berries", "portion_grams": 300}
  ],
  "people": ["nikola"],
  "tasks": [
    {"content": "Follow up with Francis", "area": "printulu", "context": "calls", "status": "open"}
  ],
  "frameworks": ["bill-campbell"],
  "tags": ["printulu", "leadership"]
}
\`\`\`

**CRITICAL**: Return ONLY the JSON. No explanations, no markdown formatting, just pure JSON.`;
}

// ============================================================================
// Confidence Calculation (from Journal API)
// ============================================================================

function calculateConfidence(data: ExtractEntryResponse["extracted"]): number {
  let score = 0;
  let total = 0;

  // Energy level (10%)
  total += 0.1;
  if (data.energy) score += 0.1;

  // Intentions (20%)
  total += 0.2;
  if (data.intentions && data.intentions.length > 0) score += 0.2;

  // People (20%)
  total += 0.2;
  if (data.people && data.people.length > 0) {
    score += 0.2;
  }

  // Tasks (30%)
  total += 0.3;
  if (data.work_log && data.work_log.length > 0) {
    score += 0.3;
  }

  // Tags (20%)
  total += 0.2;
  if (data.tags && data.tags.length > 0) score += 0.2;

  return Math.min(1.0, score / total);
}

// ============================================================================
// Suggestion Generation
// ============================================================================

function generateSuggestions(
  text: string,
  extracted: ExtractEntryResponse["extracted"],
): string[] {
  const suggestions: string[] = [];
  const lower = text.toLowerCase();

  // Check for potential food entries
  if (
    lower.includes("gegessen") ||
    lower.includes("frühstück") ||
    lower.includes("mittag")
  ) {
    if (!extracted.food || extracted.food.length === 0) {
      suggestions.push(
        'Tip: For food tracking, include time like "gegessen um 12:00 300g Joghurt"',
      );
    }
  }

  // Check for gratitude keywords without extraction
  if (
    (lower.includes("froh") || lower.includes("glücklich")) &&
    (!extracted.gratitude || extracted.gratitude.length === 0)
  ) {
    suggestions.push(
      'Tip: Add gratitude with "Dankbar für [person/thing] - [reason]"',
    );
  }

  // Check for sleep keywords without full extraction
  if (
    lower.includes("geschlafen") &&
    (!extracted.sleep || !extracted.sleep.duration)
  ) {
    suggestions.push(
      'Tip: For sleep tracking, include "8h geschlafen, gute Qualität"',
    );
  }

  // Check for energy keywords without extraction
  if (
    (lower.includes("energie") || lower.includes("energy")) &&
    !extracted.energy
  ) {
    suggestions.push(
      'Tip: Mention energy level: "high energy", "medium energy", "low energy", or "drained"',
    );
  }

  // Confidence warning
  if (suggestions.length > 2) {
    suggestions.unshift(
      "⚠️ Low confidence extraction. Consider being more specific.",
    );
  }

  return suggestions;
}

// ============================================================================
// Uncertainty Detection (GTD Clarify Step)
// ============================================================================

interface UncertainField {
  field: string;
  value: any;
  question: string;
  confidence: number;
  type?: "choice" | "text";
  options?: string[];
}

function detectUncertainty(
  extracted: ExtractEntryResponse["extracted"],
  transcript: string,
): UncertainField[] {
  const uncertain: UncertainField[] = [];
  const transcriptLower = transcript.toLowerCase();

  // 1. Low confidence food portions (300g vs 30g)
  if (extracted.food && Array.isArray(extracted.food)) {
    extracted.food.forEach((meal, index) => {
      if (
        meal.portion_grams &&
        Array.isArray(meal.portion_grams) &&
        meal.portion_grams[0]
      ) {
        const portionStr = meal.portion_grams[0].toString();
        // Check if transcript doesn't explicitly mention the exact portion
        if (!transcriptLower.includes(`${portionStr}g`)) {
          // Could be 300g or 30g?
          const alternativeGrams = Math.floor(meal.portion_grams[0] / 10);
          uncertain.push({
            field: `food.${index}.portion_grams`,
            value: meal.portion_grams[0],
            question: `You mentioned ${meal.meal}. Did you mean ${meal.portion_grams[0]}g or ${alternativeGrams}g?`,
            confidence: 0.6,
            type: "choice",
            options: [`${meal.portion_grams[0]}g`, `${alternativeGrams}g`],
          });
        }
      }
    });
  }

  // 2. Ambiguous person mentions (multiple @peter possibilities)
  if (extracted.people && Array.isArray(extracted.people)) {
    extracted.people.forEach((person, index) => {
      // If person doesn't have a suffix (like @peter instead of @peter-lawprint)
      if (typeof person === "string" && !person.includes("-")) {
        // Check if this is a common name that could have multiple matches
        const commonNames = [
          "peter",
          "john",
          "alex",
          "chris",
          "michael",
          "david",
        ];
        if (commonNames.includes(person.toLowerCase())) {
          uncertain.push({
            field: `people.${index}`,
            value: person,
            question: `You mentioned @${person}. Which one: @${person}-lawprint, @${person}-bsc, or someone else?`,
            confidence: 0.7,
            type: "choice",
            options: [
              `@${person}-lawprint`,
              `@${person}-bsc`,
              `@${person} (other)`,
            ],
          });
        }
      }
    });
  }

  // 3. Sleep duration ambiguity (if duration doesn't match bedtime/wake_time)
  if (extracted.sleep) {
    const sleep = extracted.sleep;
    if (
      sleep.bedtime &&
      sleep.wake_time &&
      sleep.duration &&
      typeof sleep.bedtime === "string" &&
      typeof sleep.wake_time === "string"
    ) {
      // Calculate expected duration from times
      const bedtimeParts = sleep.bedtime.split(":");
      const waketimeParts = sleep.wake_time.split(":");

      if (bedtimeParts.length === 2 && waketimeParts.length === 2) {
        const bedHours = parseInt(bedtimeParts[0]);
        const bedMins = parseInt(bedtimeParts[1]);
        const wakeHours = parseInt(waketimeParts[0]);
        const wakeMins = parseInt(waketimeParts[1]);

        let calculatedDuration = wakeHours - bedHours;
        if (wakeHours < bedHours) {
          // Crossed midnight
          calculatedDuration = 24 - bedHours + wakeHours;
        }

        // Add minute adjustment
        calculatedDuration += (wakeMins - bedMins) / 60;

        // If stated duration differs by more than 1 hour
        if (
          Math.abs(calculatedDuration - sleep.duration) > 1 &&
          sleep.duration
        ) {
          uncertain.push({
            field: "sleep.duration",
            value: sleep.duration,
            question: `Your sleep times (${sleep.bedtime} - ${sleep.wake_time}) suggest ${Math.round(calculatedDuration)}h, but you said ${sleep.duration}h. Which is correct?`,
            confidence: 0.7,
            type: "choice",
            options: [
              `${Math.round(calculatedDuration)}h (from times)`,
              `${sleep.duration}h (as stated)`,
            ],
          });
        }
      }
    }
  }

  // 4. Energy level mentioned but not explicitly stated
  if (!extracted.energy) {
    if (
      transcriptLower.includes("müde") ||
      transcriptLower.includes("tired") ||
      transcriptLower.includes("erschöpft") ||
      transcriptLower.includes("exhausted")
    ) {
      uncertain.push({
        field: "energy",
        value: "low",
        question:
          'You mentioned feeling tired. Would you say your energy is "low" or "drained"?',
        confidence: 0.6,
        type: "choice",
        options: ["low", "drained"],
      });
    }
  }

  return uncertain;
}

// ============================================================================
// Data Merging (Incremental Extraction)
// ============================================================================

function mergeExtractedData(
  existing: ExtractEntryRequest["existing"],
  extracted: ExtractEntryResponse["extracted"],
): ExtractEntryResponse["extracted"] {
  return {
    // Merge sleep
    sleep: {
      ...existing?.sleep,
      ...extracted.sleep,
    },

    // Override energy if extracted
    energy: extracted.energy || existing?.energy,

    // Merge habits
    habits: {
      ...existing?.habits,
      ...extracted.habits,
    },

    // Append intentions
    intentions: [
      ...(existing?.intentions || []),
      ...(extracted.intentions || []),
    ],

    // Append gratitude
    gratitude: [...(existing?.gratitude || []), ...(extracted.gratitude || [])],

    // Append food
    food: [...(existing?.food || []), ...(extracted.food || [])],

    // Append work_log
    work_log: [...(existing?.work_log || []), ...(extracted.work_log || [])],

    // Merge tags (unique)
    tags: [...new Set([...(existing?.tags || []), ...(extracted.tags || [])])],

    // Merge people (unique)
    people: [
      ...new Set([...(existing?.people || []), ...(extracted.people || [])]),
    ],

    // Merge frameworks (unique)
    frameworks: [
      ...new Set([
        ...(existing?.frameworks || []),
        ...(extracted.frameworks || []),
      ]),
    ],

    // Merge contexts (unique)
    contexts: [
      ...new Set([
        ...(existing?.contexts || []),
        ...(extracted.contexts || []),
      ]),
    ] as ExtractEntryResponse["extracted"]["contexts"],
  };
}
