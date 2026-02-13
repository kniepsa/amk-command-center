/**
 * Missing Data Analyzer
 *
 * Analyzes extracted journal data and identifies missing fields,
 * providing real-time feedback and suggestions to users.
 */

import type { ExtractedData } from "$lib/types";

export interface MissingDataAnalysis {
  captured: FieldStatus[];
  missing: FieldStatus[];
  suggestions: string[];
}

export interface FieldStatus {
  field: string;
  label: string;
  category: "required" | "optional";
  icon: string;
}

// Field definitions with metadata
const FIELD_DEFINITIONS: Record<
  string,
  { label: string; category: "required" | "optional"; icon: string }
> = {
  sleep: {
    label: "Sleep",
    category: "required",
    icon: "😴",
  },
  energy: {
    label: "Energy Level",
    category: "required",
    icon: "⚡",
  },
  intentions: {
    label: "Daily Intentions",
    category: "required",
    icon: "🎯",
  },
  gratitude: {
    label: "Gratitude",
    category: "required",
    icon: "🙏",
  },
  habits: {
    label: "Habits",
    category: "optional",
    icon: "✅",
  },
  food: {
    label: "Food Log",
    category: "optional",
    icon: "🍽️",
  },
};

/**
 * Analyzes extracted data and returns detailed feedback
 */
export function analyzeMissingData(
  extracted: ExtractedData,
): MissingDataAnalysis {
  const captured: FieldStatus[] = [];
  const missing: FieldStatus[] = [];
  const suggestions: string[] = [];

  // Check each field
  for (const [field, definition] of Object.entries(FIELD_DEFINITIONS)) {
    const fieldStatus: FieldStatus = {
      field,
      label: definition.label,
      category: definition.category,
      icon: definition.icon,
    };

    if (isFieldCaptured(field, extracted)) {
      captured.push(fieldStatus);
    } else {
      missing.push(fieldStatus);

      // Add suggestions for missing fields
      if (definition.category === "required") {
        suggestions.push(generateSuggestion(field));
      }
    }
  }

  return { captured, missing, suggestions };
}

/**
 * Checks if a field has meaningful data
 */
function isFieldCaptured(field: string, data: ExtractedData): boolean {
  switch (field) {
    case "sleep":
      return !!(
        data.sleep &&
        (data.sleep.duration || data.sleep.bedtime || data.sleep.wake_time)
      );

    case "energy":
      return !!data.energy;

    case "intentions":
      return !!(data.intentions && data.intentions.length > 0);

    case "gratitude":
      return !!(data.gratitude && data.gratitude.length > 0);

    case "habits":
      return !!(data.habits && Object.keys(data.habits).length > 0);

    case "food":
      return !!(data.food && data.food.length > 0);

    default:
      return false;
  }
}

/**
 * Generates contextual suggestions for missing fields
 */
function generateSuggestion(field: string): string {
  const suggestions: Record<string, string> = {
    sleep: 'Add sleep info: "Ins Bett um 22:00, 8h geschlafen, gute Qualität"',
    energy:
      'Rate your energy: "High energy" / "Medium energy" / "Low energy" / "Drained"',
    intentions:
      'Set daily intentions: "Heute will ich... " or "Focus: [your goals]"',
    gratitude:
      'Share gratitude: "Dankbar für [thing] - [reason]" (add 3 things)',
    habits:
      'Track habits: "Laufen", "Sauna", "Sales Learning", "Elektrolyte", etc.',
    food: 'Log meals: "Gegessen um 12:00 300g Joghurt mit Blaubeeren"',
  };

  return suggestions[field] || `Add ${field} information`;
}

/**
 * Formats field list for display
 */
export function formatFieldList(fields: FieldStatus[]): string {
  return fields.map((f) => `${f.icon} ${f.label}`).join(", ");
}

/**
 * Calculates completion percentage
 */
export function calculateCompleteness(analysis: MissingDataAnalysis): {
  percentage: number;
  requiredComplete: boolean;
} {
  const requiredFields = Object.values(FIELD_DEFINITIONS).filter(
    (f) => f.category === "required",
  ).length;

  const requiredCaptured = analysis.captured.filter(
    (f) => f.category === "required",
  ).length;

  const percentage = Math.round(
    (analysis.captured.length / Object.keys(FIELD_DEFINITIONS).length) * 100,
  );

  const requiredComplete = requiredCaptured === requiredFields;

  return { percentage, requiredComplete };
}
